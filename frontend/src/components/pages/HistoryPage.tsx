import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface HistoryItem {
  ticket_id: string;
  image_url: string;
  prediction: string;
  timestamp: Date;
  confidence?: number;
}

type ViewMode = 'grid' | 'list';
type SortMode = 'newest' | 'oldest' | 'prediction';

export const HistoryPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [mounted, setMounted] = useState(false);

  const userEmail = localStorage.getItem('user_email');

  const fetchHistory = useCallback(async () => {
    if (!userEmail) { navigate('/login'); return; }
    try {
      setIsLoading(true);
      const API_BASE = import.meta.env.VITE_API_URL || 'https://har-backend-10x1.onrender.com';
      
      const response = await fetch(`${API_BASE}/api/history/${userEmail}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.map((item: any) => ({
          ticket_id: item.id,
          image_url: item.image,
          prediction: item.prediction,
          timestamp: new Date(item.timestamp),
          confidence: item.confidence,
        })));
      }
    } catch (e) {
      console.error('Failed to fetch history:', e);
    } finally {
      setIsLoading(false);
    }
  }, [userEmail, navigate]);

  useEffect(() => {
    setMounted(true);
    fetchHistory();
  }, [fetchHistory]);

  const formatTime = (date: Date): string => {
    const diff = Date.now() - date.getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (d < 7) return `${d}d ago`;
    return date.toLocaleDateString();
  };

  const filtered = items
    .filter(i => i.prediction.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 i.ticket_id.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortMode === 'newest') return b.timestamp.getTime() - a.timestamp.getTime();
      if (sortMode === 'oldest') return a.timestamp.getTime() - b.timestamp.getTime();
      return a.prediction.localeCompare(b.prediction);
    });

  const styles = {
    page: {
      minHeight: '100vh',
      background: 'rgb(250 249 247)',
      fontFamily: "'DM Sans', sans-serif",
    } as React.CSSProperties,

    topbar: {
      position: 'sticky' as const,
      top: 0,
      zIndex: 10,
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgb(220 216 210)',
      padding: '0 2.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      height: '64px',
    },

    backBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '0.5rem 1rem',
      background: 'white',
      border: '1px solid rgb(220 216 210)',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '0.85rem',
      color: 'rgb(60 55 50)',
      fontFamily: "'DM Sans', sans-serif",
    },

    content: {
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '2.5rem 2.5rem',
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0)' : 'translateY(12px)',
      transition: 'all 0.4s ease',
    },

    h1: {
      fontSize: '2.5rem',
      fontFamily: "'DM Serif Display', serif",
      color: 'rgb(20 18 16)',
      margin: 0,
    },

    countBadge: {
      fontSize: '0.75rem',
      fontWeight: 800,
      color: 'rgb(99 91 255)',
      letterSpacing: '0.1em',
      background: 'rgba(99,91,255,0.08)',
      padding: '0.3rem 0.75rem',
      borderRadius: '100px',
    },

    searchInput: {
      width: '100%',
      padding: '0.65rem 1rem 0.65rem 2.5rem',
      border: '1px solid rgb(220 216 210)',
      borderRadius: '12px',
      background: 'white',
      fontSize: '0.875rem',
      outline: 'none',
    },

    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '1.5rem',
    },

    card: (selected: boolean) => ({
      background: 'white',
      border: selected ? '2px solid rgb(99 91 255)' : '1px solid rgb(220 216 210)',
      borderRadius: '20px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: selected ? '0 0 0 4px rgba(99,91,255,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
    }),

    cardImg: {
      width: '100%',
      height: '180px',
      objectFit: 'cover' as const,
      background: 'rgb(240 238 235)',
    }
  };

  return (
    <div style={styles.page}>
      {/* Topbar */}
      <div style={styles.topbar}>
        <button style={styles.backBtn} onClick={() => navigate('/home')}>

          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">

            <path d="M19 12H5M12 19l-7-7 7-7"/>

          </svg>

          Dashboard

        </button>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: '#635BFF', borderRadius: '7px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>H</div>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>HAR-Cloud</span>
        </div>
      </div>

      <div style={styles.content}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h1 style={styles.h1}>Analysis <span style={{ color: '#635BFF' }}>History</span></h1>
            <span style={styles.countBadge}>{filtered.length} RECORDS</span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
               <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A09B94' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
               <input 
                style={styles.searchInput} 
                placeholder="Search..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
               />
            </div>
            
            <select 
              style={{ padding: '0.65rem 1rem', border: '1px solid #DCD8D2', borderRadius: '12px', outline: 'none', background: 'white', fontSize: '0.85rem' }}
              value={sortMode}
              onChange={e => setSortMode(e.target.value as SortMode)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>

            <div style={{ display: 'flex', border: '1px solid #DCD8D2', borderRadius: '12px', overflow: 'hidden' }}>
              <button onClick={() => setViewMode('grid')} style={{ padding: '0.6rem 1rem', border: 'none', background: viewMode === 'grid' ? '#635BFF' : 'white', color: viewMode === 'grid' ? 'white' : '#8C8780', cursor: 'pointer' }}>Grid</button>
              <button onClick={() => setViewMode('list')} style={{ padding: '0.6rem 1rem', border: 'none', background: viewMode === 'list' ? '#635BFF' : 'white', color: viewMode === 'list' ? 'white' : '#8C8780', cursor: 'pointer' }}>List</button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#635BFF', fontWeight: 700 }}>SYNCING RECORDS...</div>
        ) : (
          <div style={viewMode === 'grid' ? styles.grid : { display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map(item => (
              <div 
                key={item.ticket_id} 
                style={viewMode === 'grid' ? styles.card(selectedItem?.ticket_id === item.ticket_id) : { background: 'white', border: '1px solid #DCD8D2', borderRadius: '16px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer' }}
                onClick={() => setSelectedItem(item)}
              >
                <img src={item.image_url} style={viewMode === 'grid' ? styles.cardImg : { width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                <div style={{ flex: 1, padding: viewMode === 'grid' ? '1.25rem' : '0' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#141210', textTransform: 'capitalize' }}>{item.prediction}</div>
                  <div style={{ fontSize: '0.8rem', color: '#8C8780', marginTop: '4px' }}>{formatTime(item.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedItem && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
          onClick={() => setSelectedItem(null)}
        >
          <div style={{ background: 'white', borderRadius: '28px', overflow: 'hidden', width: '100%', maxWidth: '500px', boxShadow: '0 30px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <img src={selectedItem.image_url} style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', background: '#F5F3F0' }} />
            <div style={{ padding: '2.5rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#635BFF', letterSpacing: '0.1em' }}>TICKET: {selectedItem.ticket_id}</span>
              <h2 style={{ fontSize: '2.25rem', fontFamily: "'DM Serif Display', serif", margin: '0.5rem 0 1.5rem', textTransform: 'capitalize' }}>{selectedItem.prediction}</h2>
              <button 
                onClick={() => setSelectedItem(null)}
                style={{ width: '100%', padding: '1rem', background: '#635BFF', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 700, cursor: 'pointer' }}
              >Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};