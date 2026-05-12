import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Clock, ArrowLeft, ShieldCheck, User, MessageSquare, Loader2, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import './ItemDetail.css';

function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchItem() {
      setLoading(true);
      try {
        const data = await api.getItemById(id);
        setItem(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchItem();
  }, [id]);

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

  return (
    <main className="item-detail-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="btn-back-link">
          <ArrowLeft size={16} /> Kembali ke daftar
        </button>

        <div className="item-detail-content">
          <div className="item-detail-image-section">
            <div className="item-detail-image-wrapper">
              <img src={item.image} alt={item.name} onError={(e) => { e.target.src = 'https://via.placeholder.com/600?text=No+Image'; }} />
              <div className={`item-detail-badge ${isFound ? 'found' : 'lost'}`}>
                {isFound ? 'BARANG DITEMUKAN' : 'BARANG HILANG'}
              </div>
            </div>
            
            <div className="item-security-card">
              <ShieldCheck size={24} className="security-icon" />
              <div>
                <h4>Sistem Terverifikasi</h4>
                <p>Laporan ini telah diverifikasi oleh tim admin SEEKEM IPB.</p>
              </div>
            </div>
          </div>

          <div className="item-detail-info-section">
            <div className="item-header">
              <h1>{item.name}</h1>
              <span className="category-tag">{item.category}</span>
            </div>

            <div className="item-meta-list">
              <div className="meta-item">
                <MapPin size={20} className="meta-icon" />
                <div>
                  <span className="meta-label">Lokasi</span>
                  <span className="meta-value">{item.location}</span>
                </div>
              </div>
              <div className="meta-item">
                <Clock size={20} className="meta-icon" />
                <div>
                  <span className="meta-label">Waktu Dilaporkan</span>
                  <span className="meta-value">{item.time}</span>
                </div>
              </div>
            </div>

            <div className="item-description">
              <h3>Deskripsi Barang</h3>
              <p>{item.description || 'Tidak ada deskripsi tambahan yang diberikan oleh pelapor.'}</p>
            </div>

            <div className="reporter-info">
              <h3>Informasi Pelapor</h3>
              <div className="reporter-card">
                <div className="reporter-avatar">
                  <User size={24} />
                </div>
                <div className="reporter-details">
                  <span className="reporter-name">Disamarkan demi privasi</span>
                  <span className="reporter-role">Mahasiswa IPB</span>
                </div>
              </div>
            </div>

            <div className="item-actions">
              <Link to={`/contact/${item.id}`} className="btn-contact-primary">
                <MessageSquare size={20} />
                {isFound ? 'Klaim Barang Ini' : 'Saya Menemukan Barang Ini'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ItemDetail;
