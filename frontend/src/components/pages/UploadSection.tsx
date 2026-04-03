import React, { useState, useEffect} from 'react';

interface UploadSectionProps {
  onUploadSuccess?: () => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onUploadSuccess }) => {
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const userEmail = localStorage.getItem('user_email');

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const processUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError("Please upload a valid image file"); return; }
    if (file.size > 16 * 1024 * 1024) { setError("File size must be less than 16MB"); return; }
    if (!userEmail) { setError("User session not found. Please log in again."); return; }

    setResult("");
    setError("");
    setPreviewUrl(URL.createObjectURL(file));
    setLoading(true);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('email', userEmail);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://har-backend-10x1.onrender.com';
      const res = await fetch(`${API_BASE}/upload_image`, { method: 'POST', body: formData });
      const data = await res.json();
      
      if (res.ok) {
        setResult(data.label || "No Label Detected");
        if (onUploadSuccess) onUploadSuccess();
      } else {
        setError(data.error || "Upload failed. Please try again.");
      }
    } catch (err) { 
      setError("Network error. Is the backend server running?");
      console.error(err);
    } finally { 
      setLoading(false); 
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processUpload(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: dragOver ? 'rgba(99,91,255,0.03)' : 'rgb(250 249 247)',
          transition: 'all 0.3s ease',
          borderRadius: '1.5rem',
          border: dragOver ? '2px dashed rgb(99 91 255)' : '2px dashed rgb(220 216 210)'
        }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div style={{ aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          {previewUrl ? (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <img src={previewUrl} alt="Target" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '1rem' }} />
              <button 
                onClick={() => {setPreviewUrl(null); setResult(""); setError("");}} 
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', border: '1px solid #ccc', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            </div>
          ) : (
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', width: '100%' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'white', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              </div>
              <p style={{ fontWeight: 600, margin: '0 0 4px' }}>Click or drop image</p>
              <p style={{ fontSize: '0.8rem', color: '#888' }}>PNG, JPG up to 16MB</p>
              <input type="file" onChange={(e) => e.target.files?.[0] && processUpload(e.target.files[0])} style={{ display: 'none' }} accept="image/*" />
            </label>
          )}

          {/* Restored Neural Scan Loading Overlay */}
          {loading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
              <div className="spinner" />
              <p style={{ marginTop: '1rem', fontSize: '0.7rem', fontWeight: 800, color: 'rgb(99 91 255)', letterSpacing: '0.1em' }}>NEURAL SCAN IN PROGRESS</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '0.75rem', color: '#b91c1c', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {result && !loading && (
        <div style={{ padding: '1.25rem', background: 'rgb(240 239 255)', border: '1px solid rgb(224 220 255)', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.6rem', fontWeight: 900, color: 'rgb(99 91 255)', textTransform: 'uppercase', marginBottom: '4px' }}>Classification Complete</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'rgb(20 18 16)' }}>{result}</h3>
          </div>
        </div>
      )}
    </div>
  );
};