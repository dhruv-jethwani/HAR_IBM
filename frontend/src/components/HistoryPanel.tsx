interface HistoryItem {
  id: string;
  image: string;
  prediction: string;
  timestamp: Date;
  confidence?: number;
}

interface HistoryPanelProps {
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
}

export const HistoryPanel = ({ selectedId, onSelectId }: HistoryPanelProps) => {

  // Static data for history with SVG placeholder images
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

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflow: 'hidden', flex: 1 }}>
      <p style={{ padding: '0 0.75rem', marginBottom: '0.5rem', fontSize: '0.625rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgb(180 175 168)' }}>
        Recent Activity
      </p>

      <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
        {historyItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectId(item.id)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: selectedId === item.id ? 'rgb(240 239 255)' : 'rgb(250 249 247)',
              border: selectedId === item.id ? '1px solid rgb(99 91 255)' : '1px solid rgb(220 216 210)',
              borderRadius: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
              transition: 'all 0.2s ease',
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={(e) => {
              if (selectedId !== item.id) {
                e.currentTarget.style.background = 'rgb(245 242 237)';
                e.currentTarget.style.borderColor = 'rgb(200 190 180)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedId !== item.id) {
                e.currentTarget.style.background = 'rgb(250 249 247)';
                e.currentTarget.style.borderColor = 'rgb(220 216 210)';
              }
            }}
          >
            {/* Thumbnail */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '0.625rem',
                background: 'rgb(230 227 220)',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <img
                src={item.image}
                alt={item.prediction}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>

            {/* Info */}
            <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgb(20 18 16)', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.prediction}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgb(140 135 128)', whiteSpace: 'nowrap' }}>
                {formatTime(item.timestamp)}
              </div>
            </div>

            {/* Confidence Badge */}
            {item.confidence && (
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.5rem',
                  background: 'rgba(99, 91, 255, 0.1)',
                  color: 'rgb(99 91 255)',
                  borderRadius: '0.5rem',
                  flexShrink: 0,
                }}
              >
                {Math.round(item.confidence * 100)}%
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
