import React, { useState, useEffect } from 'react';

export const UploadSection: React.FC = () => {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => { return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }; }, [previewUrl]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult("");
    setPreviewUrl(URL.createObjectURL(file));
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('http://127.0.0.1:5000/upload_image', { method: 'POST', body: formData });
      const data = await res.json();
      setResult(data.label || "No Label Detected");
    } catch (err) { setResult("Server Error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="relative group overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm transition-all hover:border-indigo-500/50">
        <div className="aspect-video flex items-center justify-center p-4">
          {previewUrl ? (
            <div className="relative w-full h-full group/preview">
              <img src={previewUrl} alt="Target" className="w-full h-full object-contain rounded-xl" />
              <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover/preview:opacity-100 flex items-center justify-center gap-4 transition-all rounded-xl backdrop-blur-sm">
                <button onClick={() => {setPreviewUrl(null); setResult("");}} className="px-5 py-2 bg-zinc-100 text-zinc-950 rounded-full text-xs font-bold">Discard</button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer border-2 border-dashed border-zinc-800 rounded-3xl group-hover:border-indigo-500/30">
              <div className="mb-4 h-14 w-14 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-500 group-hover:text-indigo-400 transition-all">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
              <p className="text-sm font-semibold text-zinc-200">Drop photo here</p>
              <input type="file" onChange={handleFile} className="hidden" accept="image/*" />
            </label>
          )}
          {loading && (
            <div className="absolute inset-0 z-20 bg-zinc-950/40 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
              <p className="mt-4 text-[10px] font-bold text-indigo-400 uppercase tracking-widest animate-pulse">Neural Scan In Progress</p>
            </div>
          )}
        </div>
      </div>
      {result && !loading && (
        <div className="animate-in fade-in slide-in-from-top-4 p-6 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Classification Complete</p>
            <h3 className="text-3xl font-bold text-white italic">{result}</h3>
          </div>
        </div>
      )}
    </div>
  );
};