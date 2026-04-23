import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../Sidebar';

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

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      background: 'rgb(250 249 247)',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <Sidebar activePage="History" />

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '2.5rem 4rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontFamily: "'DM Serif Display', serif", color: 'rgb(20 18 16)', margin: 0 }}>
              Analysis <span style={{ color: '#635BFF' }}>History</span>
            </h1>
            <p style={{ color: '#8C8780', marginTop: '0.5rem' }}>Review your past activity classifications.</p>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#635BFF', background: 'rgba(99,91,255,0.08)', padding: '0.3rem 0.75rem', borderRadius: '100px' }}>
            {filtered.length} RECORDS
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input 
              style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', border: '1px solid #DCD8D2', borderRadius: '12px', outline: 'none', background: 'white', fontSize: '0.875rem' }} 
              placeholder="Search history..." 
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

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#635BFF', fontWeight: 700 }}>SYNCING RECORDS...</div>
        ) : (
          <div style={viewMode === 'grid' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' } : { display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map(item => (
              <div 
                key={item.ticket_id} 
                style={{
                  background: 'white',
                  border: '1px solid #DCD8D2',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: viewMode === 'list' ? 'flex' : 'block',
                  alignItems: viewMode === 'list' ? 'center' : 'stretch',
                  gap: viewMode === 'list' ? '1.5rem' : '0',
                  padding: viewMode === 'list' ? '1rem' : '0'
                }}
                onClick={() => setSelectedItem(item)}
              >
                <img src={item.image_url} style={viewMode === 'grid' ? { width: '100%', height: '180px', objectFit: 'cover' } : { width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                <div style={{ padding: viewMode === 'grid' ? '1.25rem' : '0' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#141210', textTransform: 'capitalize' }}>{item.prediction}</div>
                  <div style={{ fontSize: '0.8rem', color: '#8C8780', marginTop: '4px' }}>{formatTime(item.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

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