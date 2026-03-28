import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadSection } from './UploadSection';
import { HistoryPanel } from '../HistoryPanel';

interface HistoryItem {
  ticket_id: string;
  image_url: string;
  prediction: string;
  timestamp: Date;
}

declare global {
  interface Window { chatbase: any; }
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const userEmail = localStorage.getItem('user_email');

  const fetchHistory = useCallback(async () => {
    if (!userEmail) {
      navigate('/login');
      return;
    }
    try {
      setIsLoadingHistory(true);
      const response = await fetch(`http://localhost:5000/api/history/${userEmail}`);
      if (response.ok) {
        const data = await response.json();
        const formattedData = data.map((item: any) => ({
          ticket_id: item.id,
          image_url: item.image,
          prediction: item.prediction,
          timestamp: new Date(item.timestamp),
        }));
        setHistoryItems(formattedData);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [userEmail, navigate]);

  const selectedItem = historyItems.find(item => item.ticket_id === selectedHistoryId);

  useEffect(() => {
    setMounted(true);
    fetchHistory();

    const loadChatbot = async () => {
      if (!userEmail) return;
      try {
        const response = await fetch('http://localhost:5000/api/chatbot-token', {
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
  }, [fetchHistory, userEmail]);

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden', 
      background: 'rgb(250 249 247)',
      fontFamily: "'DM Sans', sans-serif" 
    }}>
      
      {/* Sidebar - Fixed height and internal scrolling */}
      <aside style={{ 
  width: '280px', 
  display: 'flex', 
  flexDirection: 'column', 
  padding: '1.5rem', 
  borderRight: '1px solid rgb(220 216 210)', 
  background: '#ffffff',
  height: '100vh',
  flexShrink: 0 
}}>
  {/* 1. Logo Section (Fixed) */}
  <div style={{ flexShrink: 0, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div style={{ width: '32px', height: '32px', background: '#635BFF', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>H</div>
    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>HAR-Cloud</span>
  </div>

  {/* 2. Platform Section (Fixed - Added back) */}
  <div style={{ flexShrink: 0, marginBottom: '1.5rem' }}>
    <p style={{ padding: '0 0.75rem', marginBottom: '0.5rem', fontSize: '0.625rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgb(180 175 168)' }}>
      Platform
    </p>
    <button style={{ 
      width: '100%', 
      padding: '0.75rem', 
      background: 'rgb(240 239 255)', 
      color: 'rgb(99 91 255)', 
      border: 'none', 
      borderRadius: '12px', 
      textAlign: 'left', 
      fontWeight: 600,
      cursor: 'pointer'
    }}>
      Analysis
    </button>
  </div>

  {/* 3. History Area (Scrollable) */}
  {/* 3. History Area (Scrollable) */}
<div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
  {/* THIS IS THE SECOND INSTANCE: Using the variable for conditional rendering */}
  {isLoadingHistory ? (
    <div style={{ padding: '1.5rem', textAlign: 'center' }}>
      <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#635BFF', letterSpacing: '0.1em' }}>
        SYNCING RECORDS...
      </p>
    </div>
  ) : (
    <HistoryPanel 
      items={historyItems} 
      selectedId={selectedHistoryId} 
      onSelectId={setSelectedHistoryId} 
    />
  )}
</div>

  {/* 4. Sign Out (Fixed & Styled) */}
<div style={{ flexShrink: 0, marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgb(220 216 210)' }}>
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
      color: '#DC2626', // Professional Red
      cursor: 'pointer', 
      borderRadius: '12px',
      fontWeight: 600,
      fontSize: '0.9rem',
      transition: 'all 0.2s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgba(220, 38, 38, 0.05)';
      e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.borderColor = 'transparent';
    }}
  >
    {/* Logout Icon */}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
    Logout
  </button>
</div>
</aside>

      {/* Main Content - No justifyContent: center here */}
      <main style={{ 
        flex: 1, 
        height: '100vh', 
        overflowY: 'auto', 
        padding: '2rem 4rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ width: '100%', maxWidth: selectedItem ? '1000px' : '600px' }}>
          
          {selectedItem ? (
            /* --- History Detail View --- */
            <div className={mounted ? 'animate-fade-up' : ''}>
              {/* BACK BUTTON - Explicitly at the top */}
              <button 
                onClick={() => setSelectedHistoryId(null)}
                style={{ 
                  marginBottom: '2rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  background: 'white', 
                  border: '1px solid #ddd', 
                  padding: '0.6rem 1.2rem', 
                  borderRadius: '12px', 
                  cursor: 'pointer',
                  fontWeight: 600,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back to Analysis
              </button>

              <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #eee', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <img src={selectedItem.image_url} alt="Result" style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', background: '#f9f9f9' }} />
                <div style={{ padding: '2.5rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#635BFF', letterSpacing: '0.1em' }}>TICKET: {selectedItem.ticket_id}</span>
                  <h1 style={{ fontSize: '3rem', margin: '0.5rem 0', textTransform: 'capitalize' }}>{selectedItem.prediction}</h1>
                  <p style={{ color: '#888' }}>Detected on {selectedItem.timestamp.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ) : (
            /* --- Default Upload View --- */
            <div style={{ marginTop: '10vh', textAlign: 'center' }} className={mounted ? 'animate-fade-up' : ''}>
              <h1 style={{ fontSize: '3.5rem', fontFamily: "'DM Serif Display', serif", marginBottom: '1rem' }}>
                Activity <span style={{ color: '#635BFF' }}>Analyzer</span>
              </h1>
              <p style={{ color: '#666', marginBottom: '3rem' }}>Deploy high-fidelity vision to detect activity sequences.</p>
              
              <div style={{ background: 'white', padding: '2rem', borderRadius: '2rem', border: '1px solid #eee', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
                <UploadSection onUploadSuccess={fetchHistory} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};