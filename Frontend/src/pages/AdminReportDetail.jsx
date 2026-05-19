import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, MapPin, XCircle } from 'lucide-react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { api } from '../services/api';
import './Admin.css';

function AdminReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const addToast = useUIStore((state) => state.addToast);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }

    let cancelled = false;
    async function fetchReport() {
      setLoading(true);
      try {
        const data = await api.getVerificationReportById(id);
        if (!cancelled) setReport(data);
      } catch (error) {
        addToast(error.message, 'error');
        navigate('/admin/verification');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchReport();
    return () => {
      cancelled = true;
    };
  }, [id, isAdmin, navigate, addToast]);

  const handleVerify = async (action) => {
    setActionLoading(action);
    try {
      const updated = await api.verifyReport(report.id, action);
      setReport(updated);
      addToast(action === 'approve' ? 'Laporan berhasil diverifikasi.' : 'Laporan berhasil ditolak.', 'success');
      navigate('/admin/verification');
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAdmin) return null;

  return (
    <AdminLayout>
      <div className="admin-page admin-page--detail">
        {loading || !report ? (
          <div className="admin-loading">
            <Loader2 className="spin" size={42} />
          </div>
        ) : (
          <>
            <section className="admin-detail-title">
              <div>
                <span>DETAIL LAPORAN</span>
                <code>REF ID: {report.id}</code>
              </div>
              <h1>{report.name}</h1>
              <p>
                <MapPin size={16} />
                Found at {report.location} - {report.time}
              </p>
            </section>

            <section className="admin-report-layout">
              <div className="admin-report-main">
                <article className="admin-panel admin-detail-card">
                  <h2>FOTO BARANG</h2>
                  <img src={report.image} alt={report.name} className="admin-report-image" />
                </article>

                <article className="admin-panel admin-detail-card">
                  <h2>DESKRIPSI BARANG</h2>
                  <div className="admin-description-box">
                    {report.description || 'Tidak ada deskripsi tambahan.'}
                  </div>
                </article>
              </div>

              <aside className="admin-report-side">
                <article className="admin-panel admin-detail-meta">
                  <h2>DETAIL BARANG</h2>
                  <dl>
                    <dt>NAMA</dt>
                    <dd>{report.reporterName}</dd>
                    <dt>TAG</dt>
                    <dd><span className="admin-pill">{report.tag === 'Temuan' ? 'Ditemukan' : report.tag}</span></dd>
                    <dt>KATEGORI</dt>
                    <dd>{report.category}</dd>
                    <dt>TEMPAT</dt>
                    <dd>{report.detailLocation || report.location}</dd>
                    <dt>WAKTU DITEMUKAN</dt>
                    <dd>{report.time} WIB</dd>
                    <dt>WAKTU LAPORAN</dt>
                    <dd>{report.reportTime}</dd>
                  </dl>
                </article>

                <article className="admin-panel admin-detail-actions">
                  <button className="admin-action admin-action--reject" disabled={!!actionLoading} onClick={() => handleVerify('reject')}>
                    {actionLoading === 'reject' ? <Loader2 className="spin" size={18} /> : <XCircle size={18} />}
                    Tolak Laporan
                  </button>
                  <button className="admin-action admin-action--approve" disabled={!!actionLoading} onClick={() => handleVerify('approve')}>
                    {actionLoading === 'approve' ? <Loader2 className="spin" size={18} /> : <CheckCircle2 size={18} />}
                    Verifikasi Laporan
                  </button>
                </article>
              </aside>
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminReportDetail;
