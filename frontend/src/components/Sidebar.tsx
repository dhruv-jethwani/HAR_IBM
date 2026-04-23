import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  role: 'user' | 'admin';
}

interface SidebarProps {
  activePage: 'Analysis' | 'History' | 'Support' | 'Admin';
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage }) => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('user_role') as 'user' | 'admin';

  const navItems: NavItem[] = [
    {
      label: 'Analysis',
      role: 'user',
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
      role: 'user',
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
      label: 'Admin Panel',
      role: 'admin',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      active: activePage === 'Admin',
      onClick: () => navigate('/admin'),
    },
  ];

  const filteredItems = navItems.filter(item => item.role === userRole);

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

      <div style={{ flex: 1 }}>
        <p style={{ padding: '0 0.75rem', marginBottom: '0.5rem', fontSize: '0.625rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgb(180 175 168)' }}>
          {userRole === 'admin' ? 'Administration' : 'Platform'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {filteredItems.map((item) => (
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
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flexShrink: 0 }}>
        {userRole === 'user' && (
          <button
            onClick={() => navigate('/support')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '0.75rem 1rem',
              background: activePage === 'Support' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
              color: activePage === 'Support' ? '#D97706' : 'rgb(80 75 70)',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '0.5rem',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.9rem',
            }}
          >
            {/* The Yellow Triangle Exclamation Icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={activePage === 'Support' ? '#D97706' : '#F59E0B'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Report Problem
          </button>
        )}

        <div style={{ paddingTop: '1rem', borderTop: '1px solid rgb(220 216 210)' }}>
          <button
            onClick={() => { localStorage.clear(); navigate('/login'); }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'transparent',
              color: '#DC2626',
              cursor: 'pointer',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.9rem',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};