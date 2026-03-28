import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadSection } from './UploadSection';
import { HistoryPanel } from '../HistoryPanel';

interface HistoryItem {
  id: string;
  image: string;
  prediction: string;
  timestamp: Date;
  confidence?: number;
}

declare global {
  interface Window { chatbase: any; }
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  // Static history data with SVG placeholder images
  const historyItems: HistoryItem[] = [
    {
      id: '1',
      image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23635BFF" width="400" height="300"/%3E%3Ctext x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="48" fill="white" font-weight="bold"%3EStanding%3C/text%3E%3Ccircle cx="200" cy="100" r="30" fill="rgba(255,255,255,0.3)"/%3E%3Crect x="170" y="140" width="60" height="80" fill="rgba(255,255,255,0.3)"/%3E%3Crect x="160" y="220" width="20" height="60" fill="rgba(255,255,255,0.3)"/%3E%3Crect x="220" y="220" width="20" height="60" fill="rgba(255,255,255,0.3)"/%3E%3C/svg%3E',
      prediction: 'Standing',
      timestamp: new Date(Date.now() - 5 * 60000),
      confidence: 0.95,
    },
    {
      id: '2',
      image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23A855F7" width="400" height="300"/%3E%3Ctext x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="48" fill="white" font-weight="bold"%3EWalking%3C/text%3E%3Ccircle cx="160" cy="80" r="25" fill="rgba(255,255,255,0.3)"/%3E%3Crect x="140" y="120" width="50" height="70" fill="rgba(255,255,255,0.3)"/%3E%3Crect x="125" y="190" width="20" height="60" fill="rgba(255,255,255,0.3)" transform="rotate(-20 135 190)"/%3E%3Crect x="195" y="190" width="20" height="60" fill="rgba(255,255,255,0.3)" transform="rotate(20 205 190)"/%3E%3C/svg%3E',
      prediction: 'Walking',
      timestamp: new Date(Date.now() - 15 * 60000),
      confidence: 0.92,
    },
    {
      id: '3',
      image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%2308B981" width="400" height="300"/%3E%3Ctext x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="48" fill="white" font-weight="bold"%3ESitting%3C/text%3E%3Ccircle cx="200" cy="90" r="28" fill="rgba(255,255,255,0.3)"/%3E%3Crect x="170" y="130" width="60" height="60" fill="rgba(255,255,255,0.3)"/%3E%3Crect x="155" y="190" width="25" height="50" fill="rgba(255,255,255,0.3)"/%3E%3Crect x="220" y="190" width="25" height="50" fill="rgba(255,255,255,0.3)"/%3E%3C/svg%3E',
      prediction: 'Sitting',
      timestamp: new Date(Date.now() - 45 * 60000),
      confidence: 0.98,
    },
    {
      id: '4',
      image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23F59E0B" width="400" height="300"/%3E%3Ctext x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="48" fill="white" font-weight="bold"%3ERunning%3C/text%3E%3Ccircle cx="140" cy="70" r="24" fill="rgba(255,255,255,0.3)"/%3E%3Crect x="120" y="110" width="45" height="65" fill="rgba(255,255,255,0.3)"/%3E%3Crect x="100" y="175" width="18" height="50" fill="rgba(255,255,255,0.3)" transform="rotate(-35 109 175)"/%3E%3Crect x="180" y="175" width="18" height="50" fill="rgba(255,255,255,0.3)" transform="rotate(35 189 175)"/%3E%3C/svg%3E',
      prediction: 'Running',
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      confidence: 0.88,
    },
  ];

  const selectedItem = historyItems.find(item => item.id === selectedHistoryId);

  useEffect(() => {
    setMounted(true);

    if (!window.chatbase || window.chatbase("getState") !== "initialized") {
      window.chatbase = (...args: any[]) => {
        if (!window.chatbase.q) { window.chatbase.q = []; }
        window.chatbase.q.push(args);
      };
      window.chatbase = new Proxy(window.chatbase, {
        get(target, prop) {
          if (prop === "q") return target.q;
          return (...args: any[]) => target(prop, ...args);
        }
      });
    }

    const loadChatbot = async () => {
    const userEmail = localStorage.getItem('user_email');
    
    // Stop if no user is logged in
    if (!userEmail) {
      console.warn("No user email found, skipping chatbot identification.");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/chatbot-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }) // Use actual email
      });

      if (response.ok) {
        const { token } = await response.json();
        // Identify user to Chatbase
        window.chatbase('identify', { token });
      } else {
        console.error("Chatbot token request failed with status:", response.status);
      }

      // Load the script regardless of token success
      const script = document.createElement("script");
      script.src = "https://www.chatbase.co/embed.min.js";
      script.id = "FBtkGNOjyE4Ww59qXSX5o";
      script.setAttribute("domain", "www.chatbase.co");
      script.async = true;
      document.body.appendChild(script);

    } catch (error) {
      console.error("Failed to initialize Chatbot identity:", error);
    }
  };

    loadChatbot();

    return () => {
      const script = document.getElementById("FBtkGNOjyE4Ww59qXSX5o");
      if (script) document.body.removeChild(script);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    navigate('/login');
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        background: 'rgb(250 249 247)',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Sidebar */}
      <aside
        className={`hidden md:flex ${mounted ? 'animate-fade-up' : 'opacity-0'}`}
        style={{
          width: '240px',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.75rem 1.25rem',
          borderRight: '1px solid rgb(220 216 210)',
          background: '#ffffff',
          boxShadow: '1px 0 12px rgba(0,0,0,0.04)',
          zIndex: 20,
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {/* Top */}
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.25rem 0.5rem', marginBottom: '2rem' }}>
            <div className="logo-mark" style={{ width: '36px', height: '36px', fontSize: '0.8rem', borderRadius: '10px' }}>H</div>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.125rem', fontWeight: 400, color: 'rgb(20 18 16)', letterSpacing: '-0.02em' }}>
              HAR-Cloud
            </span>
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.5rem' }}>
            <p style={{ padding: '0 0.75rem', marginBottom: '0.5rem', fontSize: '0.625rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgb(180 175 168)' }}>
              Platform
            </p>

            <button className="nav-item active">
              <svg style={{ width: '16px', height: '16px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analysis
            </button>
          </nav>
        </div>

        {/* History Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, marginBottom: '1.5rem' }}>
          <HistoryPanel selectedId={selectedHistoryId} onSelectId={setSelectedHistoryId} />
        </div>

        {/* Logout */}
        <div>
          <div className="divider" style={{ marginBottom: '1.25rem' }} />
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.875rem',
              borderRadius: '0.75rem',
              width: '100%',
              background: 'none',
              border: '1px solid transparent',
              cursor: 'pointer',
              color: 'rgb(100 95 88)',
              fontSize: '0.875rem',
              fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'rgb(190 50 70)';
              e.currentTarget.style.background = 'rgba(244,63,94,0.05)';
              e.currentTarget.style.borderColor = 'rgba(244,63,94,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgb(100 95 88)';
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid rgb(220 216 210)', background: 'rgb(250 249 247)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
              <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ position: 'absolute', inset: 0 }}>
          <div className="orb orb-violet" style={{ width: '800px', height: '800px', top: '-200px', left: '50%', transform: 'translateX(-50%)' }} />
          <div className="grid-texture" style={{ position: 'absolute', inset: 0 }} />
        </div>

        <div className={`relative z-10 w-full ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ maxWidth: selectedItem ? '900px' : '600px' }}>
          {selectedItem ? (
            // Expanded History View
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <button
                  onClick={() => setSelectedHistoryId(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(220,216,210,0.8)',
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                    color: 'rgb(100 95 88)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                    e.currentTarget.style.borderColor = 'rgba(200,190,180,0.8)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.7)';
                    e.currentTarget.style.borderColor = 'rgba(220,216,210,0.8)';
                  }}
                >
                  <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Upload
                </button>
              </div>

              <div
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(220,216,210,0.8)',
                  borderRadius: '2rem',
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.04)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }}
              >
                {/* Image Section */}
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '16/10',
                    background: 'rgb(230 227 220)',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.prediction}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>

                {/* Details Section */}
                <div style={{ padding: '2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    {/* Prediction */}
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgb(180 175 168)', marginBottom: '0.75rem' }}>
                        Activity Detected
                      </div>
                      <div style={{ fontSize: '1.875rem', fontWeight: 600, color: 'rgb(20 18 16)' }}>
                        {selectedItem.prediction}
                      </div>
                    </div>

                    {/* Confidence */}
                    {selectedItem.confidence && (
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgb(180 175 168)', marginBottom: '0.75rem' }}>
                          Confidence Score
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                          <div style={{ fontSize: '1.875rem', fontWeight: 600, color: 'rgb(99 91 255)' }}>
                            {Math.round(selectedItem.confidence * 100)}%
                          </div>
                          <div
                            style={{
                              flex: 1,
                              height: '8px',
                              background: 'rgb(230 227 220)',
                              borderRadius: '4px',
                              overflow: 'hidden',
                              marginBottom: '0.5rem',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${selectedItem.confidence * 100}%`,
                                background: 'linear-gradient(90deg, rgb(99 91 255), rgb(168 85 247))',
                                transition: 'width 0.3s ease',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div style={{ paddingTop: '1.5rem', borderTop: '1px solid rgb(220 216 210)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgb(180 175 168)', marginBottom: '0.75rem' }}>
                      Detection Time
                    </div>
                    <div style={{ fontSize: '1rem', color: 'rgb(100 95 88)', lineHeight: 1.6 }}>
                      {selectedItem.timestamp.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Default Upload View
            <>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div className="status-badge" style={{ marginBottom: '1.25rem' }}>
                  <span className="status-dot">
                    <span className="status-dot-ping" />
                    <span className="status-dot-inner" />
                  </span>
                  Neural System Active
                </div>

                <h2
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
                    fontWeight: 400,
                    color: 'rgb(20 18 16)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                    margin: '0 0 1rem',
                  }}
                >
                  Activity{' '}
                  <span className="heading-gradient">Analyzer</span>
                </h2>

                <p style={{ color: 'rgb(120 115 108)', fontSize: '1.0625rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
                  Deploy high-fidelity computer vision to detect human activity sequences in real-time.
                </p>
              </div>

              {/* Main card */}
              <div
                className="animate-fade-up delay-200"
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(220,216,210,0.8)',
                  borderRadius: '2rem',
                  padding: '2rem',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.04)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 28px 80px rgba(99,91,255,0.12), 0 8px 28px rgba(0,0,0,0.05)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 60px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.04)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                }}
              >
                <UploadSection />
              </div>

              <p className="animate-fade-in delay-400" style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgb(180 175 168)' }}>
                Secure Cloud Processing · Powered by HAR
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
};