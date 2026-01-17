import {UploadSection} from './components/UploadSection';

const App: React.FC = () => {

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      {/* 1. Header Section */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-black tracking-tighter">
            HAR-<span className="text-blue-500">CLOUD</span>
          </h1>
          <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
            <button className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all bg-blue-600 shadow-lg`}>
              Upload Image
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col items-center">
            <div className="w-full animate-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold">Static Analysis</h2>
                <p className="text-slate-400 mt-2">Upload a photo to detect sitting, standing, or waving</p>
              </div>
              <UploadSection />
            </div>
        </div>
      </main>

      {/* 3. System Footer */}
      <footer className="mt-auto border-t border-slate-900 py-6 text-center text-slate-600 text-xs">
        <p>Model: MediaPipe Pose + Flask LSTM</p>
        <p className="mt-1">Encrypted Stream | Privacy Preserved</p>
      </footer>
    </div>
  );
};

export default App;