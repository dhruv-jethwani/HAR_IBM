import React, { useState } from 'react';

export const UploadSection: React.FC = () => {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://127.0.0.1:5000/upload_image', { method: 'POST', body: formData });
      const data = await res.json();
      setResult(data.label);
    } catch (err) {
      setResult("Server Error"); // This shows if the backend is down
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[400px] bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl flex flex-col gap-6">
      <label htmlFor="file-input" className="text-xl font-bold">Analyze Image</label>
      <input 
        id="file-input"
        type="file" 
        title="Upload activity photo"
        aria-label="Upload activity photo"
        onChange={handleFile}
        className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-blue-600 file:text-white cursor-pointer" 
      />
      {result && (
        <div className="p-4 bg-blue-600/20 border border-blue-500 rounded-lg">
          <p className="text-blue-400 text-xs font-bold uppercase">Result</p>
          <p className="text-2xl font-black">{loading ? "Analyzing..." : result.toUpperCase()}</p>
        </div>
      )}
    </div>
  );
};