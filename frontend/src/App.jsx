import { useEffect, useState } from 'react'

function App() {
  const [actions, setActions] = useState([])

  // Fetch data from the Flask Backend
  const fetchActions = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL
      const response = await fetch(`${API_BASE}/api/actions-list`)
      const data = await response.json()
      setActions(data)
    } catch (err) {
      console.error("Connection error:", err)
    }
  }

  useEffect(() => {
    fetchActions()
    // Poll the MongoDB database every 15 seconds as required
    const interval = setInterval(fetchActions, 15000) 
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex justify-center py-16 px-6 font-sans antialiased">
      <div className="w-full max-w-xl">
        
        {/* Header Section with Live Indicator */}
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight lowercase">Activity</h1>
            <p className="text-slate-500 text-sm mt-1">Updates every 15 seconds</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Live</span>
          </div>
        </header>

        {/* Timeline Container */}
        <div className="relative border-l-2 border-slate-200 ml-4 space-y-10">
          {actions.length > 0 ? (
            actions.map((item, index) => (
              <div key={item.request_id || index} className="relative pl-10 group">
                {/* Visual Dot Indicator */}
                <div className={`absolute -left-[11px] top-1.5 h-5 w-5 rounded-full border-4 border-[#F8FAFC] shadow-sm transition-transform group-hover:scale-125 ${
                  item.action === 'PUSH' ? 'bg-indigo-500' : 
                  item.action === 'MERGE' ? 'bg-fuchsia-500' : 'bg-emerald-500'
                }`} />
                
                {/* Content Card */}
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
                  <div className="flex items-baseline gap-1.5 text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900 text-lg tracking-tight lowercase">
                      @{item.author}
                    </span>
                    <ActionSentence item={item} />
                  </div>
                  
                  {/* Timestamp and ID Footer */}
                  <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {item.timestamp}
                    </span>
                    <span className="text-[9px] font-mono text-slate-300 bg-slate-50 px-2 py-0.5 rounded italic">
                      ID: {item.request_id?.slice(0, 7)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="ml-10 py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-400 font-medium animate-pulse">Waiting for GitHub events...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Component to handle specific action text and coloring
 */
const ActionSentence = ({ item }) => {
  const branchStyle = "px-1.5 py-0.5 bg-slate-100 rounded text-slate-900 font-mono text-sm font-semibold border border-slate-200"
  
  if (item.action === 'PUSH') {
    return (
      <span className="text-sm">
        <span className="font-bold text-indigo-600">pushed</span> to <span className={branchStyle}>{item.to_branch}</span>
      </span>
    )
  }
  if (item.action === 'PULL_REQUEST') {
    return (
      <span className="text-sm">
        submitted a <span className="font-bold text-emerald-600">pull request</span> from <span className={branchStyle}>{item.from_branch}</span> to <span className={branchStyle}>{item.to_branch}</span>
      </span>
    )
  }
  if (item.action === 'MERGE') {
    return (
      <span className="text-sm">
        <span className="font-bold text-fuchsia-600">merged</span> branch <span className={branchStyle}>{item.from_branch}</span> to <span className={branchStyle}>{item.to_branch}</span>
      </span>
    )
  }
  return null
}

export default App