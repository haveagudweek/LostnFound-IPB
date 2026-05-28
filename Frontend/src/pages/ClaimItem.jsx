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
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    ownerName: user?.name || '',
    nim: user?.nim || '',
    faculty: '',
    contact: '',
    description: '',
    evidenceImage: '',
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchItem() {
      setLoading(true);
      try {
        const data = await api.getItemById(id);
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

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, evidenceImage: reader.result }));
    };
    reader.readAsDataURL(file);
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
      addNotification({
        title: 'Klaim berhasil dikirim',
        message: `Klaim untuk ${claim.itemName} sudah masuk dan menunggu verifikasi admin.`,
        type: 'success',
        category: 'claim',
        userId: user?.id,
        link: '/history',
      });
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
          <p>Isi deskripsi dan unggah bukti bahwa barang ini memang milik Anda.</p>
        </header>

        <form className="claim-card" onSubmit={handleSubmit}>
          <div className="claim-warning">
            <ShieldAlert size={22} />
            <p>
              Berikan ciri khusus yang hanya diketahui pemilik asli. Bukti dapat berupa foto barang serupa,
              kartu identitas yang sesuai, struk pembelian, atau dokumentasi lain yang relevan.
            </p>
          </div>

          <div className="claim-form-grid">
            <label className="claim-field">
              <span>Nama Lengkap *</span>
              <input name="ownerName" value={formData.ownerName} onChange={handleChange} required />
            </label>

            <label className="claim-field">
              <span>NIM / NIP *</span>
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
            <span>Deskripsi Bukti Kepemilikan *</span>
            <textarea
              name="description"
              rows="6"
              value={formData.description}
              onChange={handleChange}
              placeholder="Jelaskan ciri khusus, isi barang, warna, merek, stiker, lokasi kehilangan, atau bukti lain..."
              required
            />
          </label>

          <div className="claim-field">
            <span>Bukti Kepemilikan *</span>
            {formData.evidenceImage ? (
              <div className="claim-evidence-preview">
                <img src={formData.evidenceImage} alt="Bukti kepemilikan" />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, evidenceImage: '' }))}
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
