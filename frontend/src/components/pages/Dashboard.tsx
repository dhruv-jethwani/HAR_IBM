import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadSection } from './UploadSection';

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

  const navItems = [
    {
      label: 'Analysis',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      ),
      active: true,
      onClick: () => {},
    },
    {
      label: 'History',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/>
          <path d="M12 7v5l4 2"/>
        </svg>
      ),
      active: false,
      onClick: () => navigate('/history'),
    },
  ];

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: 'rgb(250 249 247)',
      fontFamily: "'DM Sans', sans-serif"
    }}>

      {/* Sidebar - Restored Original Design */}
      <aside style={{
        width: '240px',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        borderRight: '1px solid rgb(220 216 210)',
        background: '#ffffff',
        height: '100vh',
        flexShrink: 0
      }}>
        <div style={{ flexShrink: 0, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', background: '#635BFF', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>H</div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>HAR-Cloud</span>
        </div>

        <div style={{ flexShrink: 0, flex: 1 }}>
          <p style={{ padding: '0 0.75rem', marginBottom: '0.5rem', fontSize: '0.625rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgb(180 175 168)' }}>
            Platform
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: item.active ? 'rgb(240 239 255)' : 'transparent',
                  color: item.active ? 'rgb(99 91 255)' : 'rgb(80 75 70)',
                  border: 'none',
                  borderRadius: '12px',
                  textAlign: 'left',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  if (!item.active) e.currentTarget.style.background = 'rgb(245 244 242)';
                }}
                onMouseLeave={e => {
                  if (!item.active) e.currentTarget.style.background = 'transparent';
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flexShrink: 0, paddingTop: '1rem', borderTop: '1px solid rgb(220 216 210)' }}>
          <button
            onClick={() => { localStorage.clear(); navigate('/login'); }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '0.75rem 1rem',
              border: '1px solid transparent',
              background: 'transparent',
              color: '#DC2626',
              cursor: 'pointer',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(220, 38, 38, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

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