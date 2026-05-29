import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Clock, Tag, ClipboardList, MessageSquareText, UserCheck, Loader2, AlertTriangle, ArrowLeft, Eye, QrCode, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import './ItemDetail.css';

function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const addToast = useUIStore((state) => state.addToast);
  const addNotification = useUIStore((state) => state.addNotification);
  const requestConfirmation = useUIStore((state) => state.requestConfirmation);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmingClaimed, setConfirmingClaimed] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    async function fetchItem() {
      setLoading(true);
      try {
        const data = await api.getItemById(id);
        if (data.postingStatus === 'held' && !isAdmin) {
          throw new Error('Barang ini sedang ditahan admin dan belum tampil untuk publik.');
        }
        setItem(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchItem();
  }, [id, isAdmin]);

  if (loading) {
    return (
      <div className="item-detail-loading">
        <Loader2 className="spin" size={48} />
        <p>Memuat detail barang...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="item-detail-error">
        <AlertTriangle size={64} className="item-detail-error-icon" />
        <h2>Barang Tidak Ditemukan</h2>
        <p>{error || 'Barang yang Anda cari mungkin sudah dihapus atau tidak ada.'}</p>
        <button onClick={() => navigate(-1)} className="btn-back">
          <ArrowLeft size={16} /> Kembali
        </button>
      </div>
    );
  }

  const isFound = item.status === 'found';
  const isClaimed = item.claimStatus === 'claimed';
  const normalizedReporter = item.reporterName?.trim().toLowerCase();
  const normalizedUser = user?.name?.trim().toLowerCase();
  const isOwnReport = Boolean(
    (item.reporterId && item.reporterId === user?.id)
    || (normalizedReporter && normalizedUser && normalizedReporter === normalizedUser)
  );
  const canClaim = isFound && !isClaimed && !isOwnReport;
  const canConfirmClaimed = !isFound && isOwnReport && !isClaimed;
  const canContactReporter = !isOwnReport;
  const isSingleAction = (canConfirmClaimed && !canContactReporter) || (!canContactReporter && !canClaim);
  const statusLabel = isFound ? 'DITEMUKAN' : 'HILANG';
  const statusClass = isFound ? 'found' : 'lost';
  const parentPage = isFound ? 'Barang ditemukan' : 'Barang hilang';
  const parentPath = isFound ? '/found' : '/lost';

  // Build image gallery (mock: use same image for thumbnails)
  const images = [item.image, item.image];

  // Generate a ref code from id
  const refCode = `IPB-${id.replace(/\D/g, '').padStart(3, '0') || '001'}`;

  // Format time label
  const timeLabel = isFound ? 'WAKTU DITEMUKAN' : 'WAKTU HILANG';

  const handleConfirmClaimed = async () => {
    const confirmed = await requestConfirmation({
      title: 'Konfirmasi Pengambilan',
      message: 'Barang akan ditandai sudah diambil atau diklaim pada sistem.',
      confirmLabel: 'Konfirmasi',
    });

    if (!confirmed) {
      return;
    }

    setConfirmingClaimed(true);
    try {
      const result = await api.confirmLostItemClaimed(item.id, user);
      setItem(result.item);
      addToast('Barang berhasil dikonfirmasi sudah diklaim/diambil.', 'success');
      addNotification({
        title: 'Barang sudah dikonfirmasi',
        message: `${result.item.name} sudah ditandai sebagai claimed.`,
        type: 'success',
        category: 'claim',
        userId: user?.id,
        link: '/history',
      });
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setConfirmingClaimed(false);
    }
  };

  return (
    <main className="item-detail-page">
      <div className="container">
        <div className="item-detail-layout">
          {/* ── LEFT: Image Gallery ── */}
          <div className="item-detail-gallery">
            <div className="item-detail-main-image">
              <div className="item-detail-ref-badge">
                <QrCode size={14} />
                <span>REF: {refCode}</span>
              </div>
              <img
                src={images[selectedImage]}
                alt={item.name}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/600x450?text=No+Image'; }}
              />
            </div>
            <div className="item-detail-thumbnails">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`item-detail-thumb ${selectedImage === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img
                    src={img}
                    alt={`${item.name} thumbnail ${idx + 1}`}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=No+Image'; }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Item Info ── */}
          <div className="item-detail-info">
            {/* Breadcrumb */}
            <nav className="item-detail-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Dashboard</Link>
              <span className="breadcrumb-sep">&gt;</span>
              <Link to={parentPath}>{parentPage}</Link>
              <span className="breadcrumb-sep">&gt;</span>
              <span className="breadcrumb-current">{item.name}</span>
            </nav>

            {/* Status Badge + Views */}
            <div className="item-detail-status-row">
              <span className={`item-detail-status-badge ${statusClass}`}>
                <span className="status-dot"></span>
                {isClaimed ? 'SUDAH DIKLAIM' : statusLabel}
              </span>
              <span className="item-detail-views">
                <Eye size={16} />
                24 Views
              </span>
            </div>

            {/* Item Name */}
            <h1 className="item-detail-title">{item.name}</h1>

            {/* Info Cards Row */}
            <div className="item-detail-info-cards">
              <div className="info-card">
                <div className="info-card-icon location">
                  <MapPin size={20} />
                </div>
                <div className="info-card-content">
                  <span className="info-card-label">LOKASI</span>
                  <span className="info-card-value">{item.location}</span>
                </div>
              </div>
              <div className="info-card">
                <div className="info-card-icon time">
                  <Clock size={20} />
                </div>
                <div className="info-card-content">
                  <span className="info-card-label">{timeLabel}</span>
                  <span className="info-card-value">{item.time}</span>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="item-detail-category-card">
              <div className="info-card-icon category">
                <Tag size={20} />
              </div>
              <div className="info-card-content">
                <span className="info-card-label">KATEGORI</span>
                <span className="info-card-value">{item.category}</span>
              </div>
            </div>

            {/* Detail Barang */}
            <div className="item-detail-description-card">
              <div className="detail-card-header">
                <ClipboardList size={20} />
                <h3>Detail Barang</h3>
              </div>
              <p className="detail-card-text">
                {item.description || 'Tidak ada deskripsi tambahan yang diberikan oleh pelapor.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className={`item-detail-actions ${isSingleAction ? 'item-detail-actions--single' : ''}`}>
              {canContactReporter && (
                <Link to={`/laporan/${item.id}/hubungi`} className="btn-action-primary">
                  <MessageSquareText size={20} />
                  <span>Kirim pesan</span>
                </Link>
              )}
              {canConfirmClaimed ? (
                <button className="btn-action-primary" onClick={handleConfirmClaimed} disabled={confirmingClaimed}>
                  {confirmingClaimed ? <Loader2 className="spin" size={20} /> : <CheckCircle2 size={20} />}
                  <span>{confirmingClaimed ? 'Mengonfirmasi...' : 'Konfirmasi Sudah Diambil'}</span>
                </button>
              ) : canClaim ? (
                <button className="btn-action-secondary" onClick={() => navigate(`/claim/${item.id}`)}>
                  <UserCheck size={20} />
                  <span>Klaim Barang</span>
                </button>
              ) : (
                <button className="btn-action-secondary" type="button" disabled>
                  <UserCheck size={20} />
                  <span>{isClaimed ? 'Sudah Diklaim' : isFound ? 'Tidak Bisa Diklaim' : 'Hubungi Pelapor'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ItemDetail;
