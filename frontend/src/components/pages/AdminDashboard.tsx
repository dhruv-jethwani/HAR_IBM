import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../Sidebar';

interface Ticket {
  ticket_id: number;
  user_email: string;
  user_name: string;
  description: string;
  image_url: string | null;
  status: string;
  admin_reply: string | null;
  timestamp: string;
}

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const userEmail = localStorage.getItem('user_email');
  const userRole = localStorage.getItem('user_role');
  const userName = localStorage.getItem('user_name') || 'Admin'; // Retrieve Admin Name

  const API_BASE = import.meta.env.VITE_API_URL || 'https://har-backend-10x1.onrender.com';

  useEffect(() => {
    if (!userEmail || userRole !== 'admin') {
      navigate('/home');
      return;
    }
    fetchTickets();
  }, [userEmail, userRole, navigate]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin-dashboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });
      
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets);
      } else {
        navigate('/home');
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setUpdating(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/update-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_email: userEmail,
          ticket_id: selectedTicket.ticket_id,
          status: status,
          admin_reply: reply
        }),
      });

      if (response.ok) {
        alert('Ticket updated successfully!');
        setReply('');
        setSelectedTicket(null);
        fetchTickets(); // Reload list to see changes
      } else {
        alert('Failed to update ticket.');
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      background: 'rgb(250 249 247)',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <Sidebar activePage="Admin" />

      <main style={{ flex: 1, overflowY: 'auto', padding: '2.5rem 4rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontFamily: "'DM Serif Display', serif", color: 'rgb(20 18 16)', margin: 0 }}>
              Report <span style={{ color: '#635BFF' }}>Management</span>
            </h1>
            <p style={{ color: '#8C8780', marginTop: '0.5rem' }}>Oversee and respond to user-submitted issues.</p>
          </div>
          <div style={{ background: 'white', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgb(220 216 210)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgb(80 75 70)' }}>{userName}</span>
            <div style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%' }}></div>
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#635BFF', fontWeight: 700 }}>SYNCING REPORTS...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '1fr 400px' : '1fr', gap: '2rem' }}>
            <div style={{ background: 'white', borderRadius: '24px', border: '1px solid rgb(220 216 210)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'rgb(250 249 247)', borderBottom: '1px solid rgb(220 216 210)' }}>
                  <tr>
                    <th style={{ padding: '1.25rem 1rem', fontSize: '0.65rem', fontWeight: 800, color: 'rgb(160 155 148)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>User</th>
                    <th style={{ padding: '1.25rem 1rem', fontSize: '0.65rem', fontWeight: 800, color: 'rgb(160 155 148)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Description</th>
                    <th style={{ padding: '1.25rem 1rem', fontSize: '0.65rem', fontWeight: 800, color: 'rgb(160 155 148)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</th>
                    <th style={{ padding: '1.25rem 1rem', fontSize: '0.65rem', fontWeight: 800, color: 'rgb(160 155 148)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Date</th>
                    <th style={{ padding: '1.25rem 1rem', fontSize: '0.65rem', fontWeight: 800, color: 'rgb(160 155 148)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.ticket_id} style={{ borderBottom: '1px solid rgb(240 238 235)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 700, color: 'rgb(20 18 16)', fontSize: '0.9rem' }}>{ticket.user_name}</div>
                        <div style={{ color: 'rgb(140 135 128)', fontSize: '0.8rem' }}>{ticket.user_email}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ color: 'rgb(80 75 70)', fontSize: '0.9rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ticket.description}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.3rem 0.75rem',
                          borderRadius: '100px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: ticket.status === 'Resolved' ? '#DEF7EC' : ticket.status === 'In Progress' ? '#E1EFFE' : 'rgb(240 238 235)',
                          color: ticket.status === 'Resolved' ? '#03543F' : ticket.status === 'In Progress' ? '#1E429F' : 'rgb(80 75 70)'
                        }}>
                          {ticket.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: 'rgb(140 135 128)', fontSize: '0.85rem' }}>
                        {new Date(ticket.timestamp).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button 
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setStatus(ticket.status);
                            setReply(ticket.admin_reply || '');
                          }}
                          style={{ background: 'white', border: '1px solid rgb(220 216 210)', padding: '0.5rem 0.875rem', borderRadius: '10px', color: 'rgb(20 18 16)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedTicket && (
              <div style={{ background: 'white', borderRadius: '24px', border: '1px solid rgb(220 216 210)', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', alignSelf: 'start' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'rgb(20 18 16)' }}>Ticket Details</h2>
                  <button onClick={() => setSelectedTicket(null)} style={{ background: 'transparent', border: 'none', color: 'rgb(180 175 168)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgb(160 155 148)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>User Message</div>
                  <p style={{ fontSize: '0.95rem', color: 'rgb(80 75 70)', lineHeight: 1.6, background: 'rgb(250 249 247)', padding: '1rem', borderRadius: '16px', border: '1px solid rgb(240 238 235)' }}>
                    {selectedTicket.description}
                  </p>
                </div>

                {selectedTicket.image_url && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgb(160 155 148)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Attachment</div>
                    <img src={selectedTicket.image_url} alt="Issue" style={{ width: '100%', borderRadius: '16px', border: '1px solid rgb(240 238 235)' }} />
                  </div>
                )}

                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'rgb(80 75 70)', marginBottom: '0.5rem' }}>Update Status</label>
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgb(220 216 210)', background: 'white', outline: 'none' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'rgb(80 75 70)', marginBottom: '0.5rem' }}>Admin Reply</label>
                    <textarea 
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Write your response here..."
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgb(220 216 210)', minHeight: '120px', fontFamily: 'inherit', outline: 'none' }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={updating}
                    style={{ width: '100%', background: '#635BFF', color: 'white', padding: '1rem', borderRadius: '16px', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};