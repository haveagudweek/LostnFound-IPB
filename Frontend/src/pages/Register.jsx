import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import './Auth.css';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const addToast = useUIStore((state) => state.addToast);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !nim.trim() || !password.trim()) {
      addToast('Semua kolom wajib diisi.', 'error');
      return;
    }

    if (!email.endsWith('@apps.ipb.ac.id')) {
      addToast('Gunakan email institusi IPB (@apps.ipb.ac.id).', 'error');
      return;
    }

    if (password.length < 8) {
      addToast('Kata sandi minimal 8 karakter.', 'error');
      return;
    }

    if (!agreeTerms) {
      addToast('Anda harus menyetujui Syarat dan Ketentuan.', 'error');
      return;
    }

    setLoading(true);
    try {
      const user = await api.register({ name, email, nim, password });
      login(user);
      addToast('Registrasi berhasil! Selamat datang.', 'success');
      navigate('/');
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page" id="register-page">
      {/* ── Hero heading above the card ── */}
      <div className="auth-hero">
        <h1 className="auth-hero__welcome">Selamat Datang di</h1>
        <div className="auth-hero__brand-lockup">
          <img src="/seekem-logo.png" alt="Logo SEEKEM" className="auth-hero__logo" />
          <h2 className="auth-hero__brand">SEEKEM</h2>
        </div>
      </div>

      {/* ── Card ── */}
      <div className="auth-card auth-card--register" id="register-card">
        {/* Card header */}
        <div className="auth-card__header">
          <h3 className="auth-card__title auth-card__title--italic">Registrasi Akun Baru</h3>
          <p className="auth-card__subtitle">
            Masuk ke dalam sistem pengarsipan barang hilang IPB Institutional Property Bureau.
          </p>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} id="register-form">
          {/* Nama Lengkap */}
          <div className="auth-form-group">
            <label className="auth-form-group__label" htmlFor="reg-name">NAMA LENGKAP</label>
            <div className="auth-input-wrapper">
              <input
                type="text"
                id="reg-name"
                placeholder="Sesuai kartu identitas"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email Institusi */}
          <div className="auth-form-group">
            <label className="auth-form-group__label" htmlFor="reg-email">EMAIL INSTITUSI</label>
            <div className="auth-input-wrapper">
              <input
                type="email"
                id="reg-email"
                placeholder="nama@apps.ipb.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* NIM / NIP */}
          <div className="auth-form-group">
            <label className="auth-form-group__label" htmlFor="reg-nim">NIM / NIP</label>
            <div className="auth-input-wrapper">
              <input
                type="text"
                id="reg-nim"
                placeholder="Nomor Induk"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                required
                autoComplete="off"
              />
            </div>
          </div>

          {/* Kata Sandi */}
          <div className="auth-form-group">
            <label className="auth-form-group__label" htmlFor="reg-password">KATA SANDI</label>
            <div className="auth-input-wrapper">
              <input
                type="password"
                id="reg-password"
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="auth-terms">
            <label className="auth-remember" htmlFor="agree-terms">
              <input
                type="checkbox"
                id="agree-terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span className="auth-remember__box" />
              <span className="auth-remember__text">
                Saya setuju dengan{' '}
                <a href="#" className="auth-terms__link">Syarat dan Ketentuan</a> serta{' '}
                <a href="#" className="auth-terms__link">Kebijakan Privasi</a> Institusi.
              </span>
            </label>
          </div>

          {/* Submit */}
          <button type="submit" className="auth-submit" id="btn-register" disabled={loading}>
            {loading ? (
              <Loader2 className="spin" size={20} />
            ) : (
              <>
                Daftar Akun <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer link */}
        <p className="auth-card__footer">
          Sudah punya akun? <Link to="/login">Masuk</Link>
        </p>
      </div>
    </main>
  );
}

export default Register;
