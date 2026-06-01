import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, CheckCircle2, Loader2, ShieldAlert, X } from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import './ClaimItem.css';

function ClaimItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const addToast = useUIStore((state) => state.addToast);
  const addNotification = useUIStore((state) => state.addNotification);
  const requestConfirmation = useUIStore((state) => state.requestConfirmation);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    ownerName: user?.name || '',
    nim: user?.nim || '',
    faculty: '',
    contact: '',
    description: '',
    evidenceImage: null,
  });
  const [evidencePreview, setEvidencePreview] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchItem() {
      setLoading(true);
      try {
        const data = await api.getItemById(id);
        if (data.status !== 'found') {
          throw new Error('Klaim hanya tersedia untuk barang yang ditemukan.');
        }
        if (data.postingStatus === 'held') {
          throw new Error('Barang ini sedang ditahan admin dan belum bisa diklaim.');
        }
        if (data.claimStatus === 'claimed') {
          throw new Error('Barang ini sudah diklaim dan disetujui admin.');
        }
        if (!cancelled) setItem(data);
      } catch (error) {
        addToast(error.message, 'error');
        navigate(-1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchItem();

    return () => {
      cancelled = true;
    };
  }, [id, addToast, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEvidenceChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, evidenceImage: file }));
    setEvidencePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.description.trim()) {
      addToast('Deskripsi bukti kepemilikan wajib diisi.', 'error');
      return;
    }

    if (!formData.evidenceImage) {
      addToast('Unggah bukti kepemilikan barang terlebih dahulu.', 'error');
      return;
    }

    const confirmed = await requestConfirmation({
      title: 'Kirim Klaim Barang',
      message: 'Klaim dan bukti serah terima akan dikirim untuk diverifikasi admin.',
      confirmLabel: 'Kirim Klaim',
    });

    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    try {
      const claim = await api.createClaim({
        itemId: item.id,
        userId: user?.id,
        ownerName: formData.ownerName,
        nim: formData.nim,
        faculty: formData.faculty,
        contact: formData.contact,
        description: formData.description,
        evidenceImage: formData.evidenceImage,
      });
      addToast(`Klaim untuk ${claim.itemName} berhasil dikirim dan menunggu verifikasi admin.`, 'success');
      navigate(`/item/${item.id}`);
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !item) {
    return (
      <div className="claim-loading">
        <Loader2 className="spin" size={44} />
      </div>
    );
  }

  return (
    <main className="claim-page">
      <div className="claim-page__container">
        <button className="claim-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          Kembali ke detail
        </button>

        <header className="claim-header">
          <span>Klaim Barang</span>
          <h1>{item.name}</h1>
          <p>Isi deskripsi dan unggah bukti bahwa barang sudah diterima.</p>
        </header>

        <form className="claim-card" onSubmit={handleSubmit}>
          <div className="claim-warning">
            <ShieldAlert size={30} />
            <p>
              Berikan tanda bukti barang sudah anda terima dari pelapor. Bukti dapat berupa foto serah terima barang.
            </p>
          </div>

          <div className="claim-form-grid">
            <label className="claim-field">
              <span>Nama Lengkap <span style={{ color: 'red' }}>*</span></span>
              <input name="ownerName" value={formData.ownerName} onChange={handleChange} required />
            </label>

            <label className="claim-field">
              <span>NIM / NIP <span style={{ color: 'red' }}>*</span></span>
              <input name="nim" value={formData.nim} onChange={handleChange} required />
            </label>

            <label className="claim-field">
              <span>Fakultas / Unit</span>
              <input name="faculty" value={formData.faculty} onChange={handleChange} placeholder="Contoh: FMIPA" />
            </label>

            <label className="claim-field">
              <span>Kontak</span>
              <input name="contact" value={formData.contact} onChange={handleChange} placeholder="Email atau WhatsApp" />
            </label>
          </div>

          <label className="claim-field">
            <span>Deskripsi Bukti Pengembalian <span style={{ color: 'red' }}>*</span></span>
            <textarea
              name="description"
              rows="6"
              value={formData.description}
              onChange={handleChange}
              placeholder="Jelaskan proses singkat serah terima barang..."
              required
            />
          </label>

          <div className="claim-field">
            <span>Bukti Serah Terima Barang <span style={{ color: 'red' }}>*</span></span>
            {formData.evidenceImage ? (
              <div className="claim-evidence-preview">
                <img src={evidencePreview} alt="Bukti kepemilikan" />
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, evidenceImage: null }));
                    setEvidencePreview('');
                  }}
                  aria-label="Hapus bukti"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="claim-upload">
                <Camera size={26} />
                <strong>Unggah Foto Bukti</strong>
                <small>Format JPG atau PNG</small>
                <input type="file" accept="image/jpeg,image/png" onChange={handleEvidenceChange} />
              </label>
            )}
          </div>

          <div className="claim-actions">
            <button type="button" className="claim-cancel" onClick={() => navigate(-1)}>
              Batalkan
            </button>
            <button type="submit" className="claim-submit" disabled={submitting}>
              {submitting ? <Loader2 className="spin" size={18} /> : <CheckCircle2 size={18} />}
              {submitting ? 'Mengirim...' : 'Kirim Klaim'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default ClaimItem;
