import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../Sidebar';

interface Report {
  ticket_id: number;
  description: string;
  image_url: string | null;
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
        setReports(data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCollage = (files: File[]): Promise<Blob> => {
    return new Promise((resolve) => {
      const loadedImages: HTMLImageElement[] = [];
      let loadedCount = 0;

      files.forEach((file) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          loadedImages.push(img);
          loadedCount++;
          if (loadedCount === files.length) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            
            // Calculate dimensions
            const maxWidth = Math.max(...loadedImages.map(i => i.width));
            const totalHeight = loadedImages.reduce((sum, i) => sum + i.height, 0);
            
            canvas.width = maxWidth;
            canvas.height = totalHeight;

            let currentY = 0;
            loadedImages.forEach((i) => {
              ctx.drawImage(i, 0, currentY);
              currentY += i.height;
              URL.revokeObjectURL(i.src);
            });

            canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
          }
        };
      });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append('email', userEmail!);
    formData.append('description', description);
    
    if (images.length > 0) {
      if (images.length === 1) {
        formData.append('image', images[0]);
      } else {
        const collageBlob = await createCollage(images);
        formData.append('image', collageBlob, 'report_collage.jpg');
      }
    }

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
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Upload Images (Cumulative)</label>
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

          {/* Reports History */}
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#111827' }}>Your Reports</h2>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>Loading reports...</div>
            ) : reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: '#F3F4F6', borderRadius: '1.5rem', color: '#6B7280' }}>
                <p>No reports found.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reports.map((report) => (
                  <div key={report.ticket_id} style={{
                    background: 'white',
                    padding: '1.25rem',
                    borderRadius: '1.25rem',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Ticket #{report.ticket_id}</span>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '2rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: report.status === 'Resolved' ? '#DEF7EC' : report.status === 'In Progress' ? '#E1EFFE' : '#F3F4F6',
                        color: report.status === 'Resolved' ? '#03543F' : report.status === 'In Progress' ? '#1E429F' : '#374151'
                      }}>
                        {report.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.95rem', color: '#374151', marginBottom: '1rem', lineHeight: 1.5 }}>{report.description}</p>
                    
                    {report.image_url && (
                      <div style={{ marginBottom: '1rem' }}>
                        <img src={report.image_url} alt="Report attachment" style={{ maxWidth: '100px', borderRadius: '0.5rem', border: '1px solid #E5E7EB' }} />
                      </div>
                    )}

                    {report.admin_reply && (
                      <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '0.75rem', borderLeft: '4px solid #635BFF' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#635BFF', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Admin Response</p>
                        <p style={{ fontSize: '0.9rem', color: '#4B5563', fontStyle: 'italic' }}>{report.admin_reply}</p>
                      </div>
                    )}
                    
                    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#9CA3AF' }}>
                      {new Date(report.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
