import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../Sidebar';

interface Report {
  ticket_id: number;
  description: string;
  image_urls: string[];
  status: string;
  admin_reply: string | null;
  timestamp: string;
}

export const SupportPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const userEmail = localStorage.getItem('user_email');

  const API_BASE = import.meta.env.VITE_API_URL || 'https://har-backend-10x1.onrender.com';

  useEffect(() => {
    if (!userEmail) {
      navigate('/login');
      return;
    }
    fetchReports();
  }, [userEmail, navigate]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/user-reports/${userEmail}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setReports(data);
        } else {
          console.error('Expected array of reports, got:', data);
          setReports([]);
        }
      } else {
        console.error('Server returned error:', response.status);
        setReports([]);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append('email', userEmail!);
    formData.append('description', description);
    
    // Append multiple images individually
    images.forEach(img => {
      formData.append('images', img);
    });

    try {
      const response = await fetch(`${API_BASE}/api/report-problem`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setDescription('');
        setImages([]);
        fetchReports();
        alert('Problem reported successfully!');
      } else {
        alert('Failed to report problem.');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      background: 'rgb(250 249 247)',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <Sidebar activePage="Support" />

      {/* Main Content */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '2rem 4rem',
      }}>
        <header style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
            Support <span style={{ color: '#635BFF' }}>& Reports</span>
          </h1>
          <p style={{ color: '#6B7280', fontSize: '1.1rem' }}>Report technical issues or provide feedback to our team.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Report Form */}
          <section style={{ background: 'white', padding: '2rem', borderRadius: '1.5rem', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#111827' }}>Submit a New Report</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #D1D5DB',
                    minHeight: '120px',
                    fontFamily: 'inherit',
                    fontSize: '0.95rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Upload Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#6B7280',
                    marginBottom: '1rem'
                  }}
                />
                
                {images.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
                    {images.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '60px', height: '60px' }}>
                        <img 
                          src={URL.createObjectURL(img)} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E5E7EB' }} 
                        />
                        <button 
                          onClick={() => removeImage(idx)}
                          style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: '#635BFF',
                  color: 'white',
                  padding: '0.875rem',
                  borderRadius: '0.75rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  transition: 'background 0.2s',
                  fontSize: '1rem'
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </section>

          {/* Reports History - LIST VIEW */}
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#111827' }}>Your Reports</h2>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>Loading reports...</div>
            ) : reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: '#F3F4F6', borderRadius: '1.5rem', color: '#6B7280' }}>
                <p>No reports found.</p>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                {reports.map((report) => (
                  <div 
                    key={report.ticket_id} 
                    onClick={() => setSelectedReport(report)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1rem 1.5rem',
                      borderBottom: '1px solid #F3F4F6',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF' }}>#{report.ticket_id}</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {report.description}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        {new Date(report.timestamp).toLocaleDateString()} • {(report.image_urls || (report as any).image_url ? [1] : []).length} images
                      </div>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '2rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: report.status === 'Resolved' ? '#DEF7EC' : report.status === 'In Progress' ? '#E1EFFE' : '#F3F4F6',
                      color: report.status === 'Resolved' ? '#03543F' : report.status === 'In Progress' ? '#1E429F' : '#374151'
                    }}>
                      {report.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* DETAIL MODAL */}
      {selectedReport && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }} onClick={() => setSelectedReport(null)}>
          <div style={{
            background: 'white',
            width: '100%',
            maxWidth: '600px',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedReport(null)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9CA3AF' }}
            >
              &times;
            </button>

            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#635BFF', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Ticket Reference</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginTop: '0.25rem', letterSpacing: '-0.02em' }}>Report #{selectedReport.ticket_id}</h3>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9CA3AF', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</p>
                  <p style={{ fontSize: '1rem', color: '#374151', lineHeight: 1.6, margin: 0 }}>{selectedReport.description}</p>
                </div>

                {(selectedReport.image_urls || (selectedReport as any).image_url) && (
                  <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9CA3AF', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attachments ({(selectedReport.image_urls || (selectedReport as any).image_url ? [1] : []).length})</p>
                    <div style={{ 
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      {(selectedReport.image_urls || [(selectedReport as any).image_url]).map((url, i) => (
                        url && (
                          <div key={i} style={{ 
                            width: '120px', 
                            height: '120px', 
                            borderRadius: '0.75rem', 
                            border: '1px solid #E5E7EB', 
                            overflow: 'hidden',
                            background: '#F9FAFB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                          }} 
                          onClick={() => window.open(url, '_blank')}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <img 
                              src={url} 
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                              alt={`Attachment ${i + 1}`} 
                            />
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {selectedReport.admin_reply && (
                  <div style={{ background: '#F5F3FF', padding: '1.25rem', borderRadius: '1rem', borderLeft: '4px solid #635BFF', marginTop: '0.5rem' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#635BFF', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Admin Response</p>
                    <p style={{ fontSize: '0.95rem', color: '#4B5563', fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>{selectedReport.admin_reply}</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F3F4F6', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedReport.status === 'Resolved' ? '#10B981' : '#F59E0B' }}></div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{selectedReport.status}</span>
                <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>•</span>
                <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>{new Date(selectedReport.timestamp).toLocaleString()}</span>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                style={{ background: '#F3F4F6', color: '#374151', padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
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
