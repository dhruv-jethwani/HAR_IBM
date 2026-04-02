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
      const response = await fetch(`http://localhost:5000/api/history/${userEmail}`);
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
      flexShrink: 0,
    },

    title: {
      flex: 1,
      fontSize: '1rem',
      fontWeight: 700,
      color: 'rgb(20 18 16)',
    },

    content: {
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '2.5rem 2.5rem',
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0)' : 'translateY(12px)',
      transition: 'all 0.4s ease',
    },

    header: {
      marginBottom: '2rem',
    },

    headingRow: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: '1.5rem',
      gap: '1rem',
      flexWrap: 'wrap' as const,
    },

    h1: {
      fontSize: '2.5rem',
      fontFamily: "'DM Serif Display', serif",
      color: 'rgb(20 18 16)',
      margin: 0,
      lineHeight: 1.1,
    },

    count: {
      fontSize: '0.75rem',
      fontWeight: 800,
      color: 'rgb(99 91 255)',
      letterSpacing: '0.1em',
      background: 'rgba(99,91,255,0.08)',
      padding: '0.3rem 0.75rem',
      borderRadius: '100px',
    },

    controls: {
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'center',
      flexWrap: 'wrap' as const,
    },

    searchWrap: {
      position: 'relative' as const,
      flex: 1,
      minWidth: '200px',
    },

    searchInput: {
      width: '100%',
      padding: '0.65rem 1rem 0.65rem 2.5rem',
      border: '1px solid rgb(220 216 210)',
      borderRadius: '12px',
      background: 'white',
      fontSize: '0.875rem',
      color: 'rgb(20 18 16)',
      fontFamily: "'DM Sans', sans-serif",
      outline: 'none',
      boxSizing: 'border-box' as const,
    },

    searchIcon: {
      position: 'absolute' as const,
      left: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'rgb(160 155 148)',
      pointerEvents: 'none' as const,
    },

    select: {
      padding: '0.65rem 1rem',
      border: '1px solid rgb(220 216 210)',
      borderRadius: '12px',
      background: 'white',
      fontSize: '0.85rem',
      color: 'rgb(60 55 50)',
      fontFamily: "'DM Sans', sans-serif",
      cursor: 'pointer',
      outline: 'none',
    },

    viewToggle: {
      display: 'flex',
      border: '1px solid rgb(220 216 210)',
      borderRadius: '12px',
      overflow: 'hidden',
      background: 'white',
    },

    viewBtn: (active: boolean) => ({
      padding: '0.6rem 0.85rem',
      border: 'none',
      background: active ? 'rgb(99 91 255)' : 'transparent',
      color: active ? 'white' : 'rgb(140 135 128)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.15s',
    }),

    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
      gap: '1.25rem',
    },

    gridCard: (selected: boolean) => ({
      background: 'white',
      border: selected ? '2px solid rgb(99 91 255)' : '1px solid rgb(220 216 210)',
      borderRadius: '20px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: selected ? '0 0 0 4px rgba(99,91,255,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
    }),

    gridImg: {
      width: '100%',
      height: '160px',
      objectFit: 'cover' as const,
      background: 'rgb(240 238 235)',
      display: 'block',
    },

    gridBody: {
      padding: '1rem 1.1rem',
    },

    gridPrediction: {
      fontSize: '0.95rem',
      fontWeight: 700,
      color: 'rgb(20 18 16)',
      marginBottom: '0.3rem',
      textTransform: 'capitalize' as const,
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },

    gridMeta: {
      fontSize: '0.75rem',
      color: 'rgb(140 135 128)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    badge: {
      fontSize: '0.7rem',
      fontWeight: 700,
      padding: '0.2rem 0.5rem',
      background: 'rgba(99,91,255,0.1)',
      color: 'rgb(99 91 255)',
      borderRadius: '6px',
    },

    listRow: (selected: boolean) => ({
      background: 'white',
      border: selected ? '2px solid rgb(99 91 255)' : '1px solid rgb(220 216 210)',
      borderRadius: '16px',
      padding: '0.85rem 1.1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginBottom: '0.6rem',
      boxShadow: selected ? '0 0 0 4px rgba(99,91,255,0.1)' : 'none',
    }),

    listThumb: {
      width: '52px',
      height: '52px',
      borderRadius: '10px',
      objectFit: 'cover' as const,
      background: 'rgb(240 238 235)',
      flexShrink: 0,
    },

    listInfo: {
      flex: 1,
      minWidth: 0,
    },

    listPrediction: {
      fontSize: '0.9rem',
      fontWeight: 700,
      color: 'rgb(20 18 16)',
      textTransform: 'capitalize' as const,
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      marginBottom: '0.2rem',
    },

    listTicket: {
      fontSize: '0.7rem',
      color: 'rgb(160 155 148)',
      fontWeight: 600,
      letterSpacing: '0.05em',
    },

    emptyState: {
      textAlign: 'center' as const,
      padding: '5rem 2rem',
      color: 'rgb(140 135 128)',
    },

    // Detail modal overlay
    overlay: {
      position: 'fixed' as const,
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    },

    modal: {
      background: 'white',
      borderRadius: '24px',
      overflow: 'hidden',
      width: '100%',
      maxWidth: '640px',
      maxHeight: '90vh',
      overflowY: 'auto' as const,
      boxShadow: '0 30px 80px rgba(0,0,0,0.2)',
    },
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
        <span style={styles.title}>Activity History</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: '#635BFF', borderRadius: '7px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>H</div>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'rgb(20 18 16)' }}>HAR-Cloud</span>
        </div>
      </div>

      {/* Main content */}
      <div style={styles.content}>
        <div style={styles.header}>
          <div style={styles.headingRow}>
            <div>
              <h1 style={styles.h1}>Analysis <span style={{ color: '#635BFF' }}>History</span></h1>
            </div>
            <span style={styles.count}>{filtered.length} RECORD{filtered.length !== 1 ? 'S' : ''}</span>
          </div>

          {/* Controls */}
          <div style={styles.controls}>
            <div style={styles.searchWrap}>
              <span style={styles.searchIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </span>
              <input
                style={styles.searchInput}
                placeholder="Search by activity or ticket ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <select style={styles.select} value={sortMode} onChange={e => setSortMode(e.target.value as SortMode)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="prediction">A → Z</option>
            </select>

            <div style={styles.viewToggle}>
              <button style={styles.viewBtn(viewMode === 'grid')} onClick={() => setViewMode('grid')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </button>
              <button style={styles.viewBtn(viewMode === 'list')} onClick={() => setViewMode('list')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#635BFF', fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.75rem' }}>
            SYNCING RECORDS...
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgb(200 195 188)" strokeWidth="1.5" style={{ marginBottom: '1rem' }}>
              <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h6M9 12h6M9 15h4"/>
            </svg>
            <p style={{ fontWeight: 600, color: 'rgb(100 95 88)', marginBottom: '0.5rem' }}>
              {searchQuery ? 'No results found' : 'No history yet'}
            </p>
            <p style={{ fontSize: '0.85rem' }}>
              {searchQuery ? 'Try a different search term.' : 'Upload an image on the dashboard to get started.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div style={styles.grid}>
            {filtered.map(item => (
              <div
                key={item.ticket_id}
                style={styles.gridCard(selectedItem?.ticket_id === item.ticket_id)}
                onClick={() => setSelectedItem(item)}
              >
                <img src={item.image_url} alt={item.prediction} style={styles.gridImg} />
                <div style={styles.gridBody}>
                  <div style={styles.gridPrediction}>{item.prediction}</div>
                  <div style={styles.gridMeta}>
                    <span>{formatTime(item.timestamp)}</span>
                    {item.confidence && (
                      <span style={styles.badge}>{Math.round(item.confidence * 100)}%</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {filtered.map(item => (
              <div
                key={item.ticket_id}
                style={styles.listRow(selectedItem?.ticket_id === item.ticket_id)}
                onClick={() => setSelectedItem(item)}
              >
                <img src={item.image_url} alt={item.prediction} style={styles.listThumb} />
                <div style={styles.listInfo}>
                  <div style={styles.listPrediction}>{item.prediction}</div>
                  <div style={styles.listTicket}>#{item.ticket_id}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.75rem', color: 'rgb(140 135 128)', marginBottom: '0.3rem' }}>
                    {formatTime(item.timestamp)}
                  </div>
                  {item.confidence && (
                    <span style={styles.badge}>{Math.round(item.confidence * 100)}%</span>
                  )}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(180 175 168)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div style={styles.overlay} onClick={() => setSelectedItem(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <img
              src={selectedItem.image_url}
              alt={selectedItem.prediction}
              style={{ width: '100%', maxHeight: '360px', objectFit: 'contain', background: 'rgb(245 243 240)', display: 'block' }}
            />
            <div style={{ padding: '2rem 2.5rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#635BFF', letterSpacing: '0.1em' }}>
                TICKET: {selectedItem.ticket_id}
              </span>
              <h2 style={{ fontSize: '2rem', fontFamily: "'DM Serif Display', serif", margin: '0.5rem 0 0.3rem', textTransform: 'capitalize' }}>
                {selectedItem.prediction}
              </h2>
              <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Detected on {selectedItem.timestamp.toLocaleString()}
              </p>
              {selectedItem.confidence && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,91,255,0.08)', padding: '0.5rem 1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#635BFF', letterSpacing: '0.08em' }}>CONFIDENCE</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#635BFF' }}>{Math.round(selectedItem.confidence * 100)}%</span>
                </div>
              )}
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '0.85rem',
                  background: 'rgb(99 91 255)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};