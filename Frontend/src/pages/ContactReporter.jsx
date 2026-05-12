import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useUIStore } from '../store/uiStore';
import './ContactReporter.css';

function ContactReporter() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useUIStore((state) => state.addToast);
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchItem() {
      try {
        const data = await api.getItemById(id);
        setItem(data);
      } catch {
        addToast('Barang tidak ditemukan.', 'error');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    }

    fetchItem();
  }, [id, addToast, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      addToast('Pesan tidak boleh kosong.', 'error');
      return;
    }
    setSubmitting(true);
    
    // Simulate API call for sending message
    setTimeout(() => {
      setSubmitting(false);
      addToast('Pesan berhasil terkirim. Anda akan dihubungi melalui email.', 'success');
      navigate(`/item/${id}`);
    }, 1500);
  };

  if (loading || !item) {
    return (
      <div className="contact-loading">
        <Loader2 className="spin" size={48} />
      </div>
    );
  }

  const isClaiming = item.status === 'found';
  const title = isClaiming ? 'Klaim Barang' : 'Hubungi Pelapor';

  return (
    <main className="contact-page">
      <div className="contact-card">
        <button onClick={() => navigate(-1)} className="btn-back-link">
          <ArrowLeft size={16} /> Kembali ke detail
        </button>

        <div className="contact-header">
          <h2>{title}</h2>
          <p>Anda akan mengirimkan pesan kepada pelapor <strong>{item.name}</strong>.</p>
        </div>

        <div className="contact-warning">
          <ShieldAlert size={24} className="warning-icon" />
          <p>
            <strong>Peringatan Keamanan:</strong> Berikan deskripsi mendetail atau bukti kepemilikan 
            (seperti foto atau ciri khusus) agar proses verifikasi lebih cepat. Jangan pernah memberikan
            informasi sensitif seperti PIN atau password.
          </p>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Pesan Anda</label>
            <textarea 
              rows="6" 
              placeholder={isClaiming 
                ? "Ceritakan ciri-ciri khusus barang yang Anda ingat..." 
                : "Tuliskan kapan dan di mana Anda melihat/menemukan barang ini..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>
          </div>

          <button type="submit" className="btn-send" disabled={submitting}>
            {submitting ? <Loader2 className="spin" size={20} /> : <Send size={20} />}
            {submitting ? 'Mengirim...' : 'Kirim Pesan'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default ContactReporter;
