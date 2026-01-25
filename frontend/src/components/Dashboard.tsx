import { UploadSection } from './UploadSection';

export const Dashboard = () => {
  return (
    <div className="flex h-screen bg-slate-950 text-white">
      <aside className="w-64 border-r border-slate-800 p-6 flex flex-col gap-4">
        <h1 className="text-xl font-bold text-indigo-500">HAR-Cloud</h1>
        <nav className="flex flex-col gap-2 mt-4">
          <button className="text-left p-2 bg-slate-800 rounded">Analysis</button>
          <button className="text-left p-2 hover:bg-slate-800 rounded text-slate-400">History</button>
        </nav>
      </aside>

      <main className="flex-1 p-8 flex flex-col items-center justify-center">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">Activity Analyzer</h2>
          <p className="text-slate-400 mt-2">Upload an image to detect human activity</p>
        </div>

        {/* Upload functionality integrated here */}
        <UploadSection />
        
        <div className="mt-8 text-slate-500 text-sm">
          Supported: JPG, PNG • Max: 5MB
        </div>
      </main>
    </div>
  );
};