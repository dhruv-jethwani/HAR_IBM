// src/components/Dashboard.tsx
export const Dashboard = () => {
    return (
      <div className="flex h-screen bg-slate-950 text-white">
        {/* Sidebar - Admin/User Management */}
        <aside className="w-64 border-r border-slate-800 p-6 flex flex-col gap-4">
          <h1 className="text-xl font-bold text-blue-500">HAR-Cloud</h1>
          <nav className="flex flex-col gap-2">
            <button className="text-left p-2 hover:bg-slate-800 rounded">Live Feed</button>
            <button className="text-left p-2 hover:bg-slate-800 rounded">History</button>
            <button className="text-left p-2 hover:bg-slate-800 rounded">Alerts</button>
          </nav>
        </aside>
  
        {/* Main Content Area - Camera & Results */}
        <main className="flex-1 p-8 flex flex-col items-center">
          <div className="w-full max-w-4xl bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden relative">
            {/* Camera placeholder */}
            <div className="aspect-video bg-black flex items-center justify-center">
               <span className="text-slate-500">Camera Feed Loading...</span>
            </div>
            
            {/* Real-time Activity Label Overlay */}
            <div className="absolute bottom-6 left-6 bg-blue-600/90 px-4 py-2 rounded-lg">
              <p className="text-xs uppercase tracking-widest font-bold">Detected Activity</p>
              <h2 className="text-2xl font-black">WALKING</h2>
            </div>
          </div>
        </main>
      </div>
    );
  };