import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

interface SidebarProps {
  activePage: 'Analysis' | 'History' | 'Support' | 'Admin';
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage }) => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('user_role');

  const navItems: NavItem[] = [
    {
      label: 'Analysis',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
      ),
      active: activePage === 'Analysis',
      onClick: () => navigate('/home'),
    },
    {
      label: 'History',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
          <path d="M12 7v5l4 2" />
        </svg>
      ),
      active: activePage === 'History',
      onClick: () => navigate('/history'),
    },
    {
      label: 'Support',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      ),
      active: activePage === 'Support',
      onClick: () => navigate('/support'),
    },
    ...(userRole === 'admin' ? [{
      label: 'Admin Panel',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      active: activePage === 'Admin',
      onClick: () => navigate('/admin'),
    }] : []),
  ].filter(item => {
    // If we are on Admin page, only show Admin link
    if (activePage === 'Admin') return item.label === 'Admin Panel';
    return true;
  });

  return (
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
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
};
