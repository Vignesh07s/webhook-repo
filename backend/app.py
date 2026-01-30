"""
    Flask application to handle GitHub webhooks for push and pull request events. It stores event details in a MongoDB database and provides an API endpoint
    to retrieve the list of stored actions.

    Dependencies:
    - Flask: Web framework for creating the APIs.
    - Flask-CORS: To handle Cross-Origin Resource Sharing.  
    - PyMongo: MongoDB driver for Python to interact with the database.
    - datetime: To handle and format timestamps.
    - os: To manage environment variables.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timezone
import os
from dotenv import load_dotenv
    
load_dotenv()

# Initialize Flask application and configure CORS
app = Flask(__name__)
CORS(app)


"""
Database Configuration:
- MONGO_URI: Connection string for MongoDB Atlas cloud cluster.
- client: MongoDB client instance.
- db/events: Selecting specific database and collection for storing webhook events.
"""
MONGO_URI = os.getenv('MONGO_URI')
if not MONGO_URI:
    raise RuntimeError("MONGO_URI not found")
client = MongoClient(MONGO_URI)
db = client['webhook_db']
collection = db['actions']


# Returns the ordinal suffix for a numeric day of the month
def get_date_suffix(day):
    if 11<=day<=13:
        return 'th'
    else:
        return {1:'st', 2:'nd', 3:'rd'}.get(day%10, 'th')
    
    
#Endpoint to receive, parse, and store GitHub Push and Pull Request events.
@app.route('/webhook/receiver', methods=['POST'])
def github_webhook():
    event_type = request.headers.get('X-GitHub-Event') # Get event type from headers
    data = request.get_json() # Parse JSON payload
    
    if not data:
        return jsonify({"error": "No data"}), 400
    
    # Metadata extraction
    author = data.get('sender', {}).get('login')
    action, to_branch, from_branch, request_id, timestamp = None, None, None, None, None
    
    # Handle Push Event
    if event_type=="push":
        action="PUSH"
        request_id = data.get('after')
        to_branch= data.get('ref', '').split('/')[-1]
        timestamp= data.get('head_commit', {}).get('timestamp')
        
    # Handle Pull Request Events (Open and Merge)
    elif event_type=="pull_request":
        pr = data.get('pull_request', {})
        is_merged = pr.get('merged', False)
        action = "MERGE" if is_merged else "PULL_REQUEST"
        request_id = str(pr.get('id'))
        from_branch=pr.get('head', {}).get('ref')
        to_branch=pr.get('base', {}).get('ref')
        timestamp= pr.get('updated_at')
        
    # Format timestamp into required UTC datetime string
    date_obj = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
    utc_date=date_obj.astimezone(timezone.utc)
    day=utc_date.day
    suffix=get_date_suffix(day)
    formatted_timestamp = f"{day}{suffix} {utc_date.strftime('%B %Y - %I:%M %p UTC')}"
    
    # Deduplication: Avoid storing the same event twice
    if collection.find_one({"request_id": request_id, "action": action}):
        return jsonify({"status": "duplicate"}), 200
    
    # Prepare payload for database insertion
    db_payload = {
        "request_id": request_id,
        "author": author,
        "action": action,
        "to_branch": to_branch,
        "from_branch": from_branch,
        "timestamp": formatted_timestamp
    }
    
    # Insert event into MongoDB
    collection.insert_one(db_payload)
    return jsonify({"status": "success"}), 200


# Endpoint to retrieve the list of stored actions from the database
@app.route('/api/actions-list', methods=['GET'])
def get_actions_list():
    # Fetch all documents from the collection, excluding the MongoDB internal '_id' field
    data = list(collection.find({}, {'_id': 0}).sort("_id", -1))
    return jsonify(data), 200


if __name__=='__main__':
    app.run()