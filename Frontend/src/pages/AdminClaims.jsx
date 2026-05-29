import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { api } from '../services/api';
import './Admin.css';

function AdminClaims() {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const addToast = useUIStore((state) => state.addToast);
  const requestConfirmation = useUIStore((state) => state.requestConfirmation);
  const [claims, setClaims] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [openStatusMenu, setOpenStatusMenu] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }

    let cancelled = false;
    async function fetchClaims() {
      setLoading(true);
      const [claimData, itemData] = await Promise.all([
        api.getClaims(),
        api.getPostedItems(),
      ]);
      if (!cancelled) {
        setClaims(claimData);
        setItems(itemData);
        setLoading(false);
      }
    }

    fetchClaims();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, navigate]);

  const pendingClaims = useMemo(() =>
    claims.filter((claim) => claim.status === 'pending'),
  [claims]);

  const processedClaims = useMemo(() => {
    const verifiedClaims = claims
      .filter((claim) => claim.status === 'approved' || claim.status === 'rejected')
      .map((claim) => ({ ...claim, source: 'claim' }));

    const reporterConfirmedLostItems = items
      .filter((item) => item.status === 'lost' && item.claimStatus === 'claimed' && item.claimedByReporter)
      .map((item) => ({
        id: `SELF-${item.id}`,
        source: 'lost_report_confirmation',
        itemId: item.id,
        itemName: item.name,
        ownerName: item.claimantName || item.reporterName || 'Pelapor',
        claimDate: item.claimedAt || '-',
        status: 'approved',
        image: item.image,
      }));

    return [...verifiedClaims, ...reporterConfirmedLostItems];
  }, [claims, items]);

  const refreshClaims = async () => {
    const [claimData, itemData] = await Promise.all([
      api.getClaims(),
      api.getPostedItems(),
    ]);
    setClaims(claimData);
    setItems(itemData);
  };

  const handleUpdateStatus = async (claim, action) => {
    setOpenStatusMenu(null);

    const confirmed = await requestConfirmation({
      title: action === 'approve' ? 'Ubah Status Klaim' : 'Reject Klaim',
      message: action === 'approve'
        ? 'Status klaim akan diubah menjadi approved.'
        : 'Status klaim akan diubah menjadi rejected.',
      confirmLabel: action === 'approve' ? 'Approved' : 'Rejected',
      tone: action === 'approve' ? 'default' : 'danger',
    });

    if (!confirmed) {
      return;
    }

    setActionLoading(`${action}-${claim.id}`);
    try {
      if (claim.source === 'lost_report_confirmation') {
        if (action === 'approve') {
          addToast('Barang ini sudah dikonfirmasi sebagai approved oleh pelapor.', 'info');
          return;
        }

        await api.managePostedItem(claim.itemId, 'cancel_claim');
        addToast('Konfirmasi barang hilang dibatalkan. Status claimed dihapus.', 'success');
      } else {
        await api.verifyClaim(claim.id, action);
        addToast(action === 'approve' ? 'Status klaim diubah menjadi approved.' : 'Status klaim diubah menjadi rejected.', 'success');
      }
      await refreshClaims();
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAdmin) return null;

  return (
    <AdminLayout>
      <div className="admin-page">
        <section className="admin-claim-list-header">
          <h1>KONFIRMASI KLAIM</h1>
          <p>Klaim yang sudah disetujui tidak lagi ditampilkan di antrean ini.</p>
        </section>

        {loading ? (
          <div className="admin-loading">
            <Loader2 className="spin" size={42} />
          </div>
        ) : (
          pendingClaims.length ? (
            <section className="admin-claim-list">
              {pendingClaims.map((claim) => (
                <button className="admin-claim-card" key={claim.id} onClick={() => navigate(`/admin/claims/${claim.id}`)}>
                  <span className="admin-claim-card__ref">#{claim.id}</span>
                  <div className="admin-claim-card__body">
                    <img src={claim.image} alt={claim.itemName} />
                    <div>
                      <strong>{claim.itemName}</strong>
                      <span>{claim.ownerName}</span>
                      <small>{claim.foundDate} - {claim.foundTime}</small>
                    </div>
                  </div>
                  <span className={`admin-status ${statusClass(claim.status)}`}>{statusLabel(claim.status)}</span>
                </button>
              ))}
            </section>
          ) : (
            <div className="admin-empty">Tidak ada klaim yang perlu dikonfirmasi.</div>
          )
        )}

        <section className="admin-processed-claims">
          <div className="admin-claim-list-header admin-claim-list-header--compact">
            <h1>STATUS KLAIM TERPROSES</h1>
            <p>Daftar klaim yang sudah disetujui, ditolak, atau dikonfirmasi langsung oleh pelapor barang hilang.</p>
          </div>

          {processedClaims.length ? (
            <div className="admin-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>CLAIM ID</th>
                    <th>BARANG</th>
                    <th>PEMILIK</th>
                    <th>TANGGAL</th>
                    <th>STATUS</th>
                    <th>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {processedClaims.map((claim) => (
                    <tr
                      key={claim.id}
                      onClick={() => {
                        if (claim.source === 'lost_report_confirmation') {
                          navigate(`/item/${claim.itemId}`);
                        } else {
                          navigate(`/admin/claims/${claim.id}`);
                        }
                      }}
                    >
                      <td>#{claim.id}</td>
                      <td>
                        <div className="admin-item-cell">
                          <span>{claim.itemName?.charAt(0).toUpperCase() || 'B'}</span>
                          <strong>{claim.itemName}</strong>
                        </div>
                      </td>
                      <td>{claim.ownerName}</td>
                      <td>{claim.claimDate}</td>
                      <td><span className={`admin-status ${statusClass(claim.status)}`}>{statusLabel(claim.status)}</span></td>
                      <td>
                        <div className="admin-table-actions" onClick={(event) => event.stopPropagation()}>
                          <button
                            type="button"
                            className="admin-mini-action admin-mini-action--dropdown"
                            disabled={Boolean(actionLoading)}
                            onClick={() => setOpenStatusMenu((current) => (current === claim.id ? null : claim.id))}
                          >
                            {actionLoading?.endsWith(`-${claim.id}`) ? <Loader2 className="spin" size={14} /> : 'Ubah'}
                          </button>
                          {openStatusMenu === claim.id && (
                            <div className="admin-status-menu">
                              <button
                                type="button"
                                disabled={claim.status === 'approved'}
                                onClick={() => handleUpdateStatus(claim, 'approve')}
                              >
                                <CheckCircle2 size={14} />
                                Approved
                              </button>
                              <button
                                type="button"
                                disabled={claim.status === 'rejected'}
                                onClick={() => handleUpdateStatus(claim, 'reject')}
                              >
                                <XCircle size={14} />
                                Rejected
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty">Belum ada klaim approved atau rejected.</div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}

function statusLabel(status) {
  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Rejected';
  return 'Pending';
}

function statusClass(status) {
  if (status === 'approved') return 'admin-status--green';
  if (status === 'rejected') return 'admin-status--gray';
  return 'admin-status--red';
}

export default AdminClaims;
