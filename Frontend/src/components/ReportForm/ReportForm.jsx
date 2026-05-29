import { useState } from 'react';
import { Camera, MapPin, Calendar, ChevronDown, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { ITEM_CATEGORIES } from '../../data/catalog';
import './ReportForm.css';

function toDatetimeLocalValue(date = new Date()) {
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function formatReportDateTime(value) {
  if (!value) return '';

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function ReportForm({ type }) {
  const isFound = type === 'found';
  const navigate = useNavigate();
  const addToast = useUIStore((state) => state.addToast);
  const addNotification = useUIStore((state) => state.addNotification);
  const user = useAuthStore((state) => state.user);
  
  const title = isFound ? 'Laporkan Barang Temuan' : 'Laporkan Barang Hilang';
  const locationLabel = isFound ? 'TEMPAT DITEMUKAN' : 'TERAKHIR DILIHAT SEKITAR';
  const timeLabel = isFound ? 'TANGGAL & WAKTU DITEMUKAN' : 'PERKIRAAN TANGGAL & WAKTU';
  const maxDateTime = toDatetimeLocalValue();

  const [formData, setFormData] = useState({
    name: '',
    category: ITEM_CATEGORIES[0].label,
    location: '',
    time: '',
    description: '',
    image: null
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 5 * 1024 * 1024) {
        addToast('Ukuran foto maksimal 5MB.', 'error');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.onerror = () => {
        addToast('Gagal membaca file foto.', 'error');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const report = await api.reportItem({
        ...formData,
        time: formatReportDateTime(formData.time),
        reporterId: user?.id,
        reporterName: user?.name,
        reporterNim: user?.nim,
      }, type);
      addNotification({
        title: 'Laporan berhasil dibuat',
        message: `${report.name} sudah dikirim dan menunggu verifikasi admin.`,
        type: 'success',
        category: 'report',
        userId: user?.id,
        link: '/history',
      });
      navigate('/history');
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="report-form-page">
      <div className="report-form-page__badge">
        <span className="badge-dot"></span>
        SISTEM TERPERCAYA
      </div>
      
      <h1 className="report-form-page__title">{title}</h1>

      <div className="report-form-container">
        <form className="report-form" onSubmit={handleSubmit}>
          
          <div className="report-form__row">
            <div className="report-form__group">
              <label className="report-form__label">NAMA BARANG *</label>
              <input 
                type="text" 
                name="name"
                className="report-form__input" 
                placeholder="Contoh: Dompet Kulit Hitam" 
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </div>
            
            <div className="report-form__group">
              <label className="report-form__label">KATEGORI BARANG *</label>
              <div className="report-form__select-wrapper">
                <select 
                  name="category"
                  className="report-form__select" 
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {ITEM_CATEGORIES.map((category) => (
                    <option key={category.id} value={category.label}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="report-form__select-icon" />
              </div>
            </div>
          </div>

          <div className="report-form__row">
            <div className="report-form__group">
              <label className="report-form__label">{locationLabel} *</label>
              <div className="report-form__input-wrapper">
                <MapPin size={18} className="report-form__input-icon" />
                <input 
                  type="text" 
                  name="location"
                  className="report-form__input report-form__input--with-icon" 
                  placeholder="Gedung, Fakultas, atau Area" 
                  value={formData.location}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>
            
            <div className="report-form__group">
              <label className="report-form__label">{timeLabel} *</label>
              <div className="report-form__input-wrapper">
                <Calendar size={18} className="report-form__input-icon" />
                <input 
                  type="datetime-local" 
                  name="time"
                  className="report-form__input report-form__input--with-icon" 
                  value={formData.time}
                  max={maxDateTime}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>
          </div>

          <div className="report-form__group">
            <label className="report-form__label">DESKRIPSI TAMBAHAN</label>
            <textarea 
              name="description"
              className="report-form__textarea" 
              placeholder="Ciri-ciri khusus, warna, merk, atau detail spesifik lainnya..."
              rows="4"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="report-form__group">
            <label className="report-form__label">UNGGAH FOTO/BUKTI</label>
            <div className="report-form__upload-area">
              {formData.image ? (
                <div style={{ position: 'relative', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={formData.image} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({...prev, image: null}))}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '4px 8px', borderRadius: '4px' }}
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <>
                  <div className="report-form__upload-icon-wrapper">
                    <Camera size={24} className="report-form__upload-icon" />
                  </div>
                  <p className="report-form__upload-text">Klik untuk mengunggah foto</p>
                  <p className="report-form__upload-hint">Format JPG, PNG max 5MB</p>
                  <input type="file" className="report-form__file-input" accept="image/jpeg, image/png" onChange={handleImageChange} />
                </>
              )}
            </div>
          </div>

          <div className="report-form__submit-wrapper">
            <button type="submit" className="report-form__submit-btn" disabled={loading}>
              {loading ? <Loader2 className="spin" size={20} /> : 'Submit Laporan'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}

export default ReportForm;
