import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, History, Loader2, MapPin, ShieldCheck, XCircle } from 'lucide-react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { api } from '../services/api';
import './Admin.css';

function AdminClaimDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const addToast = useUIStore((state) => state.addToast);
  const addNotification = useUIStore((state) => state.addNotification);
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }

    let cancelled = false;
    async function fetchClaim() {
      setLoading(true);
      try {
        const data = await api.getClaimById(id);
        if (!cancelled) setClaim(data);
      } catch (error) {
        addToast(error.message, 'error');
        navigate('/admin/claims');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchClaim();
    return () => {
      cancelled = true;
    };
  }, [id, isAdmin, navigate, addToast]);

  const handleVerify = async (action) => {
    setActionLoading(action);
    try {
      const updated = await api.verifyClaim(claim.id, action);
      const approved = action === 'approve';
      addToast(approved ? 'Klaim berhasil disetujui.' : 'Klaim berhasil ditolak.', 'success');
      addNotification({
        title: approved ? 'Klaim sudah diverifikasi' : 'Klaim ditolak admin',
        message: `Klaim untuk ${updated.itemName} ${approved ? 'sudah disetujui admin.' : 'tidak lolos verifikasi admin.'}`,
        type: approved ? 'success' : 'error',
        category: 'claim',
        userId: updated.userId,
        link: '/history',
        showToast: false,
      });
      navigate('/admin/claims');
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
        {loading || !claim ? (
          <div className="admin-loading">
            <Loader2 className="spin" size={42} />
          </div>
        ) : (
          <>
            <section className="admin-detail-title">
              <div>
                <span>CLAIM PROTOCOL</span>
                <code>ID: {claim.id}</code>
              </div>
              <h1>{claim.itemName}</h1>
              <p>
                <MapPin size={16} />
                Found at {claim.location} - {claim.foundDate}
              </p>
              <Link to={`/admin/verification/${claim.reportId}`}>Lihat Detail Laporan</Link>
            </section>

            <section className="admin-claim-detail-grid">
              <div className="admin-claim-left">
                <article className="admin-panel admin-detail-meta">
                  <h2>DATA PELAPOR</h2>
                  <dl>
                    <dt>FULL NAME</dt>
                    <dd>{claim.ownerName}</dd>
                    <dt>NIM / ID</dt>
                    <dd>{claim.nim}</dd>
                    <dt>FACULTY</dt>
                    <dd>{claim.faculty}</dd>
                    <dt>CONTACT</dt>
                    <dd>{claim.contact}</dd>
                    <dt>CLAIM DATE</dt>
                    <dd>{claim.claimDate}</dd>
                  </dl>
                </article>

                <article className="admin-history-box">
                  <h3><History size={15} /> HISTORY</h3>
                  <p>{claim.history}</p>
                </article>
              </div>

              <div className="admin-claim-right">
                <article className="admin-panel admin-detail-card">
                  <div className="admin-panel__header">
                    <h2>BUKTI KEPEMILIKAN</h2>
                    <span className="admin-pill">IMG - ATTACHED</span>
                  </div>
                  <img src={claim.image} alt={claim.itemName} className="admin-report-image" />
                </article>

                <article className="admin-panel admin-detail-card">
                  <h2>DESKRIPSI KLAIM</h2>
                  <blockquote className="admin-description-box">"{claim.description}"</blockquote>
                  <div className="admin-note">
                    <ShieldCheck size={24} />
                    <div>
                      <strong>Admin Note</strong>
                      <p>{claim.adminNote}</p>
                    </div>
                  </div>
                </article>

                <article className="admin-panel admin-claim-actions">
                  <button className="admin-action admin-action--reject" disabled={!!actionLoading} onClick={() => handleVerify('reject')}>
                    {actionLoading === 'reject' ? <Loader2 className="spin" size={18} /> : <XCircle size={18} />}
                    Reject Claim
                  </button>
                  <button className="admin-action admin-action--approve" disabled={!!actionLoading} onClick={() => handleVerify('approve')}>
                    {actionLoading === 'approve' ? <Loader2 className="spin" size={18} /> : <CheckCircle2 size={18} />}
                    Approve Claim
                  </button>
                </article>
              </div>
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminClaimDetail;
