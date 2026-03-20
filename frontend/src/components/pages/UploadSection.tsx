import React, { useState, useEffect, useRef } from 'react';

export const UploadSection: React.FC = () => {
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file");
      return;
    }
    
    if (file.size > 16 * 1024 * 1024) {
      setError("File size must be less than 16MB");
      return;
    }
    
    setResult("");
    setError("");
    setPreviewUrl(URL.createObjectURL(file));
    setLoading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://localhost:5000/upload_image', { method: 'POST', body: formData });
      const data = await res.json();
      
      if (res.ok) {
        setResult(data.label || "No Label Detected");
      } else {
        setError(data.error || "Upload failed. Please try again.");
      }
    } catch (err) { 
      setError("Network error. Please check your connection.");
      console.error(err);
    }
    finally { setLoading(false); }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file");
      return;
    }
    
    // Validate file size (max 16MB)
    if (file.size > 16 * 1024 * 1024) {
      setError("File size must be less than 16MB");
      return;
    }
    
    setResult("");
    setError("");
    setPreviewUrl(URL.createObjectURL(file));
    setLoading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://localhost:5000/upload_image', { method: 'POST', body: formData });
      const data = await res.json();
      
      if (res.ok) {
        setResult(data.label || "No Label Detected");
      } else {
        setError(data.error || "Upload failed. Please try again.");
      }
    } catch (err) { 
      setError("Network error. Please check your connection.");
      console.error(err);
    }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Drop Zone */}
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: dragOver ? 'rgba(99,91,255,0.03)' : 'rgb(250 249 247)',
          transition: 'all 0.3s ease',
        }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div style={{ aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          {previewUrl ? (
            <div className="relative w-full h-full group/preview">
              <img src={previewUrl} alt="Target" className="w-full h-full object-contain rounded-xl" />
              <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover/preview:opacity-100 flex items-center justify-center gap-4 transition-all rounded-xl backdrop-blur-sm">
                <button onClick={() => {setPreviewUrl(null); setResult(""); setError("");}} className="px-5 py-2 bg-zinc-100 text-zinc-950 rounded-full text-xs font-bold">Discard</button>
              </div>
            </div>
          ) : (
            /* Upload prompt */
            <label
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', cursor: 'pointer', padding: '2rem' }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: dragOver ? 'rgba(99,91,255,0.08)' : 'white',
                  border: '1px solid rgb(220 216 210)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  transition: 'all 0.3s ease',
                  color: dragOver ? 'rgb(99 91 255)' : 'rgb(140 135 128)',
                }}
              >
                <svg style={{ width: '26px', height: '26px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'rgb(40 38 35)', margin: '0 0 0.25rem' }}>
                {dragOver ? "Drop to analyze" : "Drop photo here"}
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'rgb(160 155 148)', margin: 0 }}>
                or{' '}
                <span style={{ color: 'rgb(99 91 255)', fontWeight: 600 }}>browse files</span>
                {' '}· PNG, JPG up to 16MB
              </p>

              <input ref={inputRef} type="file" onChange={handleFile} style={{ display: 'none' }} accept="image/*" />
            </label>
          )}

          {/* Loading overlay */}
          {loading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(250,249,247,0.88)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '1.125rem',
                zIndex: 10,
              }}
            >
              <div className="spinner" style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'rgb(99 91 255)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
                Neural Scan In Progress
              </p>
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '4px' }}>
                {[0, 1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    style={{
                      width: '4px',
                      height: '16px',
                      borderRadius: '2px',
                      background: 'rgb(99 91 255)',
                      opacity: 0.3,
                      animation: `ping 1s ease-in-out ${i * 0.15}s infinite`,
                      transformOrigin: 'center',
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {error && !loading && (
        <div className="animate-in fade-in slide-in-from-top-4 p-4 rounded-xl border border-red-500/30 bg-red-500/10">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      {result && !loading && !error && (
        <div className="animate-in fade-in slide-in-from-top-4 p-6 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Classification Complete</p>
            <h3 className="text-3xl font-bold italic capitalize text-purple-300">{result}</h3>
          </div>
        </div>
      )}
    </div>
  );
};