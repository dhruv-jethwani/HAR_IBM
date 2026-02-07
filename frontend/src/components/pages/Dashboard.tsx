import { useNavigate } from 'react-router-dom';
import { UploadSection } from './UploadSection';

export const Dashboard = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full flex-col md:flex-row overflow-hidden bg-[#09090b] text-zinc-100 font-sans antialiased">
      
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-64 border-r border-zinc-800/60 p-6 flex-col justify-between bg-zinc-950 z-20">
        <div className="space-y-10">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg italic shadow-[0_0_20px_rgba(79,70,229,0.2)]">H</div>
            <h1 className="text-lg font-bold tracking-tighter">HAR-Cloud</h1>
          </div>
          
          <nav className="space-y-1">
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Platform</p>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-indigo-600/10 text-indigo-400 rounded-xl font-semibold text-sm border border-indigo-500/20 transition-all">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Analysis
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-xl font-medium text-sm transition-all group">
              <svg className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              History
            </button>
          </nav>
        </div>

        <div className="mt-auto border-t border-zinc-800/60 pt-6">
          <button onClick={handleLogout} className="group flex w-full items-center gap-3 px-3 py-2 text-zinc-500 hover:text-rose-400 transition-all">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 group-hover:border-rose-500/20 group-hover:bg-rose-500/10">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </div>
            <span className="text-sm font-semibold">Sign out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="relative flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
        
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] bg-indigo-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#09090b_100%)]"></div>
        </div>
        <div className="relative z-10 w-full max-w-2xl">

          {/* Header section with Badge */}
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Neural System Active
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
              Activity <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">Analyzer</span>
            </h2>
            <p className="text-zinc-400 text-base md:text-lg max-w-xl mx-auto font-medium">
              Deploy high-fidelity computer vision to detect human activity sequences in real-time.
            </p>
          </div>

          {/* Main Glass Container */}
          <div className="bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-xl rounded-[2.5rem] p-4 md:p-10 shadow-2xl shadow-black/50 overflow-hidden relative group">
            <div className="absolute -inset-px bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            
            <UploadSection />
          </div>

          <div className="mt-8 text-center">
            <p className="text-[11px] text-zinc-600 font-bold uppercase tracking-widest">
              Secure Cloud Processing • Powered by Harmony AI
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};