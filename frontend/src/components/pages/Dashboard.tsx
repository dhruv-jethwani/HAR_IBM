import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadSection } from './UploadSection';
import { Sidebar } from '../Sidebar';

declare global {
  interface Window { chatbase: any; }
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const userEmail = localStorage.getItem('user_email');

  useEffect(() => {
    if (!userEmail) { navigate('/login'); return; }
    setMounted(true);

    const loadChatbot = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'https://har-backend-10x1.onrender.com';
        const response = await fetch(`${API_BASE}/api/chatbot-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail })
        });
        if (response.ok) {
          const { token } = await response.json();
          if (window.chatbase) window.chatbase('identify', { token });
        }
        const script = document.createElement("script");
        script.src = "https://www.chatbase.co/embed.min.js";
        script.id = "FBtkGNOjyE4Ww59qXSX5o";
        script.setAttribute("domain", "www.chatbase.co");
        script.async = true;
        document.body.appendChild(script);
      } catch (e) { console.error(e); }
    };
    loadChatbot();

    return () => {
      const s = document.getElementById("FBtkGNOjyE4Ww59qXSX5o");
      if (s) document.body.removeChild(s);
    };
  }, [userEmail, navigate]);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: 'rgb(250 249 247)',
      fontFamily: "'DM Sans', sans-serif"
    }}>

      <Sidebar activePage="Analysis" />

      {/* Main Content */}
      <main style={{
        flex: 1,
        height: '100vh',
        overflowY: 'auto',
        padding: '2rem 4rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ width: '100%', maxWidth: '600px', marginTop: '10vh', textAlign: 'center' }}
          className={mounted ? 'animate-fade-up' : ''}>
          <h1 style={{ fontSize: '3.5rem', fontFamily: "'DM Serif Display', serif", marginBottom: '1rem' }}>
            Activity <span style={{ color: '#635BFF' }}>Analyzer</span>
          </h1>
          <p style={{ color: '#666', marginBottom: '3rem' }}>
            Deploy high-fidelity vision to detect activity sequences.
          </p>

          {/* Restored Card Styling */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '2rem', border: '1px solid #eee', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
            <UploadSection onUploadSuccess={() => {}} />
          </div>

          <button
            onClick={() => navigate('/history')}
            style={{
              marginTop: '1.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              color: 'rgb(99 91 255)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/>
            </svg>
            View analysis history
          </button>
        </div>
      </main>
    </div>
  );
};