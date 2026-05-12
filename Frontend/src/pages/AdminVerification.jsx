import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShieldCheck, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { api } from '../services/api';
import './Admin.css';

function AdminVerification() {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const addToast = useUIStore((state) => state.addToast);
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }

    async function fetchReports() {
      setLoading(true);
      try {
        const data = await api.getVerificationReports();
        setReports(data.filter(r => r.status === 'pending_verification'));
      } catch {
        addToast('Gagal memuat laporan.', 'error');
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [isAdmin, navigate, addToast]);

  const handleVerify = async (id, action) => {
    setActionLoading(id);
    try {
      await api.verifyReport(id, action);
      addToast(`Laporan berhasil ${action === 'approve' ? 'diverifikasi' : 'ditolak'}.`, 'success');
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAdmin) return null;

  return (
    <main className="admin-page">
      <div className="admin-sidebar">
        <div className="admin-brand">
          <Package size={24} /> SEEKEM Admin
        </div>
        <nav className="admin-nav">
          <button onClick={() => navigate('/admin')} className="admin-nav-item">
            <Package size={20} /> Dashboard
          </button>
          <a href="#" className="active">
            <ShieldCheck size={20} /> Verifikasi Laporan
            {reports.length > 0 && <span className="admin-badge">{reports.length}</span>}
          </a>
        </nav>
      </div>

      <div className="admin-content">
        <div className="admin-header">
          <h2>Verifikasi Laporan</h2>
          <p>Tinjau dan verifikasi laporan barang hilang atau ditemukan.</p>
        </div>

        {loading ? (
          <div className="admin-loading">
            <Loader2 className="spin" size={48} />
          </div>
        ) : reports.length === 0 ? (
          <div className="admin-empty">
            <ShieldCheck size={48} className="empty-icon" />
            <h3>Tidak ada laporan yang menunggu verifikasi</h3>
          </div>
        ) : (
          <div className="verification-list">
            {reports.map((report) => (
              <div key={report.id} className="verification-card">
                <div className="verification-image">
                  <img src={report.image || 'https://via.placeholder.com/150'} alt="Report" />
                </div>
                <div className="verification-details">
                  <div className="report-badge">
                    {report.reportType === 'found' ? 'LAPORAN TEMUAN' : 'LAPORAN KEHILANGAN'}
                  </div>
                  <h3>{report.name}</h3>
                  <p><strong>Lokasi:</strong> {report.location}</p>
                  <p><strong>Waktu:</strong> {report.time}</p>
                  <p><strong>Deskripsi:</strong> {report.description || '-'}</p>
                </div>
                <div className="verification-actions">
                  <button 
                    className="btn-approve" 
                    onClick={() => handleVerify(report.id, 'approve')}
                    disabled={actionLoading === report.id}
                  >
                    {actionLoading === report.id ? <Loader2 className="spin" size={16} /> : <CheckCircle size={16} />}
                    Setujui
                  </button>
                  <button 
                    className="btn-reject" 
                    onClick={() => handleVerify(report.id, 'reject')}
                    disabled={actionLoading === report.id}
                  >
                    {actionLoading === report.id ? <Loader2 className="spin" size={16} /> : <XCircle size={16} />}
                    Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminVerification;
