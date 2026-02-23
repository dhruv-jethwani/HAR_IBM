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

  const processFile = async (file: File) => {
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
      const res = await fetch('/upload_image', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        setResult(data.label || "No Label Detected");
      } else {
        setError(data.error || "Upload failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const handleDiscard = () => {
    setPreviewUrl(null);
    setResult("");
    setError("");
    if (inputRef.current) inputRef.current.value = '';
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
            /* Preview */
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <img
                src={previewUrl}
                alt="Target"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '1rem',
                  transition: 'filter 0.3s ease',
                }}
              />
              {/* Hover overlay */}
              <div
                className="preview-overlay"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(250,249,247,0.85)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '1rem',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  backdropFilter: 'blur(4px)',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
              >
                <button
                  onClick={handleDiscard}
                  style={{
                    padding: '0.625rem 1.5rem',
                    background: 'rgb(20 18 16)',
                    color: 'white',
                    borderRadius: '999px',
                    border: 'none',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgb(60 55 50)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgb(20 18 16)')}
                >
                  Discard image
                </button>
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

      {/* Error */}
      {error && !loading && (
        <div className="error-box">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
            <svg style={{ width: '16px', height: '16px', color: 'rgb(190 50 70)', flexShrink: 0, marginTop: '1px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ fontSize: '0.875rem', color: 'rgb(190 50 70)', margin: 0 }}>{error}</p>
          </div>
        </div>
      )}

      {/* Result */}
      {result && !loading && !error && (
        <div className="success-box animate-result">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'rgb(99 91 255)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 0.375rem' }}>
                Classification Complete
              </p>
              <h3
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: '2rem',
                  fontWeight: 400,
                  color: 'rgb(20 18 16)',
                  fontStyle: 'italic',
                  letterSpacing: '-0.02em',
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                {result}
              </h3>
            </div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(99,91,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgb(99 91 255)',
                flexShrink: 0,
              }}
            >
              <svg style={{ width: '22px', height: '22px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};