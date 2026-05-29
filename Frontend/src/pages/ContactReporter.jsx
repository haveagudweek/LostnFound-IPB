import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Info, Loader2, Send } from 'lucide-react';
import { api } from '../services/api';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import './ContactReporter.css';

function ContactReporter() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useUIStore((state) => state.addToast);
  const addNotification = useUIStore((state) => state.addNotification);
  const requestConfirmation = useUIStore((state) => state.requestConfirmation);
  const user = useAuthStore((state) => state.user);
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState(user?.name || '');
  const [whatsapp, setWhatsapp] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchItem() {
      try {
        const data = await api.getItemById(id);
        if (data.postingStatus === 'held') {
          throw new Error('Barang ini sedang ditahan admin dan belum tampil untuk publik.');
        }
        if (data.claimStatus === 'claimed') {
          throw new Error('Barang ini sudah diklaim dan tidak menerima pesan baru.');
        }
        setItem(data);
      } catch (error) {
        addToast(error.message || 'Barang tidak ditemukan.', 'error');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    }

    fetchItem();
  }, [id, addToast, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const isPhoneValid = /^08[0-9]{8,12}$/.test(whatsapp.trim());

    if (!fullName.trim()) {
      addToast('Nama lengkap wajib diisi.', 'error');
      return;
    }

    if (!isPhoneValid) {
      addToast('Nomor WhatsApp tidak valid. Gunakan format 08xx.', 'error');
      return;
    }

    const confirmed = await requestConfirmation({
      title: 'Kirim Pesan',
      message: 'Informasi kontak dan pesan Anda akan diteruskan ke pelapor barang.',
      confirmLabel: 'Kirim',
    });

    if (!confirmed) {
      return;
    }

    setSubmitting(true);

    try {
      await api.sendMessage(id, { 
        whatsapp: whatsapp.trim(), 
        pesan: message.trim() 
      });
      setSubmitting(false);
      addNotification({
        title: 'Pesan berhasil dikirim',
        message: `Pesan terkait ${item.name} sudah diteruskan ke pelapor.`,
        type: 'success',
        category: 'message',
        userId: user?.id,
        link: `/item/${id}`,
      });
      navigate(`/item/${id}`);
    } catch (error) {
      addToast(error.message, 'error');
      setSubmitting(false);
    }
  };

  if (loading || !item) {
    return (
      <div className="contact-loading">
        <Loader2 className="spin" size={48} />
      </div>
    );
  }

  const isPhoneInvalid = submitted && !/^08[0-9]{8,12}$/.test(whatsapp.trim());

  return (
    <main className="contact-page">
      <div className="contact-page__container">
        <button onClick={() => navigate(-1)} className="contact-back">
          <ArrowLeft size={16} /> Kembali
        </button>

        <header className="contact-header">
          <h1>Hubungi Pelapor</h1>
          <p>
            Tukarkan informasi kontak dengan aman untuk mengoordinasikan pengembalian barang
            yang ditemukan. Informasi Anda akan dikirim langsung kepada pelapor barang tersebut.
          </p>
        </header>

        <section className="contact-card" aria-label="Form kirim pesan">
          <div className="contact-info-box contact-info-box--top">
            <Info size={20} />
            <div>
              <strong>Protokol Komunikasi</strong>
              <p>
                Dengan memberikan nomor WhatsApp Anda, Anda memberikan izin kepada sistem untuk meneruskan
                permintaan kontak Anda kepada individu yang melaporkan barang ini. Pastikan nomor Anda aktif
                agar dapat menerima pembaruan informasi secara tepat waktu.
              </p>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form__row">
              <div className="contact-field">
                <label htmlFor="contact-name">Nama Lengkap <span>*</span></label>
                <input
                  id="contact-name"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div className="contact-field">
                <label htmlFor="contact-whatsapp">Kontak (Whatsapp) <span>*</span></label>
                <div className={`contact-input-shell ${isPhoneInvalid ? 'contact-input-shell--error' : ''}`}>
                  <input
                    id="contact-whatsapp"
                    type="tel"
                    inputMode="numeric"
                    value={whatsapp}
                    onChange={(event) => setWhatsapp(event.target.value)}
                    placeholder="08xxxxxxxxxx"
                    required
                  />
                  {isPhoneInvalid && <AlertCircle size={18} />}
                </div>
                {isPhoneInvalid && (
                  <p className="contact-field__error">
                    <AlertCircle size={14} />
                    Nomor tidak valid. Gunakan format angka (08xx)
                  </p>
                )}
              </div>
            </div>

            <div className="contact-field">
              <label htmlFor="contact-message">Pesan Untuk Pelapor (Optional)</label>
              <textarea
                id="contact-message"
                rows="5"
                placeholder="Tuliskan detail mengenai barang yang bersangkutan, waktu, dan pertanyaan anda..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>

            <div className="contact-info-box">
              <Info size={20} />
              <p>
                Sistem akan secara otomatis memformat pesan Anda menjadi email profesional yang dikirimkan
                ke pihak terkait. Kontak langsung Anda akan disertakan agar mereka dapat membalas.
              </p>
            </div>

            <div className="contact-actions">
              <button type="button" className="contact-cancel" onClick={() => navigate(-1)}>
                Batalkan
              </button>
              <button type="submit" className="contact-submit" disabled={submitting}>
                {submitting ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
                {submitting ? 'Mengirim...' : 'Kirim Pesan'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default ContactReporter;
