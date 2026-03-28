// 1. Updated Interface to match your Backend 'History' Table
interface HistoryItem {
  ticket_id: string;  // Primary Key from DB
  image_url: string;  // URL from ImgBB
  prediction: string;
  timestamp: Date;
  confidence?: number;
}

// 2. Added 'items' to Props so Dashboard can pass real data
interface HistoryPanelProps {
  items: HistoryItem[]; 
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
}

export const HistoryPanel = ({ items, selectedId, onSelectId }: HistoryPanelProps) => {

  // Relative time formatter
  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return `Just now`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflow: 'hidden', flex: 1 }}>
      <p style={{ 
        padding: '0 0.75rem', 
        marginBottom: '0.5rem', 
        fontSize: '0.625rem', 
        fontWeight: 800, 
        letterSpacing: '0.15em', 
        textTransform: 'uppercase', 
        color: 'rgb(180 175 168)' 
      }}>
        Recent Activity
      </p>

      <div style={{ 
        overflowY: 'auto', 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.5rem', 
        paddingRight: '0.5rem' 
      }}>
        {/* 3. Render 'items' from props instead of static array */}
        {items.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#999', fontSize: '0.8rem' }}>
            No history yet. Upload an image to start.
          </div>
        ) : (
          items.map((item) => (
            <button
              key={item.ticket_id}
              onClick={() => onSelectId(item.ticket_id)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: selectedId === item.ticket_id ? 'rgb(240 239 255)' : 'rgb(250 249 247)',
                border: selectedId === item.ticket_id ? '1px solid rgb(99 91 255)' : '1px solid rgb(220 216 210)',
                borderRadius: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center',
                transition: 'all 0.2s ease',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {/* Thumbnail using URL from DB */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '0.625rem',
                background: 'rgb(230 227 220)',
                overflow: 'hidden',
                flexShrink: 0,
              }}>
                <img
                  src={item.image_url}
                  alt={item.prediction}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Activity Info */}
              <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                <div style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 600, 
                  color: 'rgb(20 18 16)', 
                  marginBottom: '0.25rem', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }}>
                  {item.prediction}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgb(140 135 128)', whiteSpace: 'nowrap' }}>
                  {formatTime(item.timestamp)}
                </div>
              </div>

              {/* Confidence Badge (Optional) */}
              {item.confidence && (
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.5rem',
                  background: 'rgba(99, 91, 255, 0.1)',
                  color: 'rgb(99 91 255)',
                  borderRadius: '0.5rem',
                  flexShrink: 0,
                }}>
                  {Math.round(item.confidence * 100)}%
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};