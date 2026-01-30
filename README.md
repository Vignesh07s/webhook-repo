# Dev Assessment - GitHub Webhook Receiver

A full-stack application that logs and displays GitHub repository activities (`PUSH`, `PULL_REQUEST`, and `MERGE`) on a real-time, auto-refreshing timeline.

## Project Overview

This project consists of a **Flask** backend to act as a webhook receiver and a **React** frontend to display live github events. The application is designed to listen for events from GitHub, store them in a **MongoDB Atlas** cluster, and provide real-time UI that updates every 15 seconds.

### Key Technical Features

* Custom logic to identify `PUSH`, `PULL_REQUEST`, and `MERGE` actions.
* Avoiding deduplication using `request_id` and the `event` to prevent redundant entries in the database.
* UTC timestamps formatted with ordinal date suffixes (e.g., 30th January 2026 12:54 AM UTC).
* A polling mechanism to automatically refresh the React frontend every 15 seconds to display live github events.


## Backend Setup

### 1. Navigate to `backend` folder

```bash
cd backend
```

### 2. Install virtualenv package

```bash
pip install virtualenv
```

### 3. Create virtual environment

```bash
virtualenv venv
```

### 4. Activate virtual environment

On Windows (CMD):

```bash
venv\Scripts\activate
```

On macOS/Linux:

```bash
source venv/bin/activate
```

### 5. Environment setup

Create a `.env` file inside the `backend` directory:

```env
MONGO_URI=<Connection String>
```

### 6. Install requirements

```bash
pip install -r requirements.txt
```

### 7. Run the flask application

* In development mode:

```bash
python app.py
```

* In production use gunicorn

```bash
gunicorn run:app
```

### 8. The endpoint is at

```bash
POST http://127.0.0.1:5000/webhook/receiver
```

## Frontend setup

### 1. Navigate to `frontend` folder

```bash
cd frontend
```

### 2. Environment setup

Create a `.env.local` file inside the `frontend` directory:

```bash
VITE_API_URL=http://localhost:5000
```
* Use deployed backend url in production

### 3. Install dependencies

```bash
pnpm install
```

### 4. Run React development server

```bash
pnpm run dev
```

### 5. Navigate to below url to access the UI

```bash
http://localhost:5173
```
