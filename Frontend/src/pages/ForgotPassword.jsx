import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Landmark, Mail, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useUIStore } from '../store/uiStore';
import './Auth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const addToast = useUIStore((state) => state.addToast);
  const navigate = useNavigate();

  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
  // Ambil state awal dari localStorage jika ada
  const [resendCooldown, setResendCooldown] = useState(() => {
    const saved = localStorage.getItem('forgot_pwd_cooldown');
    if (saved) {
      const remaining = Math.ceil((parseInt(saved) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });

  useEffect(() => {
    // Jika timer masih berjalan, kita asumsikan showResend harus true
    if (resendCooldown > 0) {
      setShowResend(true);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (resendCooldown <= 0) {
      localStorage.removeItem('forgot_pwd_cooldown');
      return;
    }
    
    // Simpan ke local storage agar persisten
    const expireTime = Date.now() + (resendCooldown * 1000);
    // Hanya simpan di awal atau jika belum tersimpan dengan benar
    const saved = localStorage.getItem('forgot_pwd_cooldown');
    if (!saved || Math.abs(parseInt(saved) - expireTime) > 2000) {
       localStorage.setItem('forgot_pwd_cooldown', expireTime.toString());
    }

    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      addToast('Email wajib diisi.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.forgotPassword(email);
      addToast(response.message || 'Tautan reset password telah dikirim ke email Anda.', 'success');
      setShowResend(true);
      setResendCooldown(60);
      localStorage.setItem('forgot_pwd_cooldown', (Date.now() + 60000).toString());
    } catch (error) {
      addToast(error.message || 'Gagal mengirim tautan reset password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || resendLoading) return;

    setResendLoading(true);
    try {
      await api.forgotPassword(email);
      addToast('Tautan reset password telah dikirim ulang. Cek kotak masuk Anda.', 'success');
      setResendCooldown(60);
      localStorage.setItem('forgot_pwd_cooldown', (Date.now() + 60000).toString());
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setResendLoading(false);
    }
  }, [email, resendCooldown, resendLoading, addToast]);

  return (
    <main className="auth-page">
      <div className="auth-hero">
        <h1 className="auth-hero__welcome">Lupa Password</h1>
        <div className="auth-hero__brand-lockup">
          <img src="/seekem-logo.png" alt="Logo SEEKEM" className="auth-hero__logo" />
          <h2 className="auth-hero__brand">SEEKEM</h2>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-card__header">
          <div className="auth-card__icon">
            <Landmark size={28} />
          </div>
          <h3 className="auth-card__title">Atur Ulang</h3>
          <p className="auth-card__subtitle">Masukkan email Anda untuk menerima tautan reset password</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-form-group__label" htmlFor="forgot-email">EMAIL <span style={{ color: 'red' }}>*</span></label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-input-icon" />
              <input
                type="email"
                id="forgot-email"
                placeholder="Masukkan Email Institusi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <button type="submit" className="auth-submit" disabled={loading || resendCooldown > 0}>
            {loading ? (
              <Loader2 className="spin" size={20} />
            ) : (
              <>
                Kirim Tautan <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {showResend && (
          <div className="auth-resend-banner">
            <p className="auth-resend-banner__text">
              Belum menerima email? Kirim ulang tautan reset password.
            </p>
            <button
              type="button"
              className="auth-resend-banner__btn"
              onClick={handleResend}
              disabled={resendLoading || resendCooldown > 0}
            >
              {resendLoading ? (
                <Loader2 className="spin" size={16} />
              ) : (
                <>
                  <RefreshCw size={14} />
                  {resendCooldown > 0 ? `Tunggu ${resendCooldown}s` : 'Kirim Ulang'}
                </>
              )}
            </button>
          </div>
        )}

        <p className="auth-card__footer">
          Kembali ke <Link to="/login">halaman Login</Link>
        </p>
      </div>
    </main>
  );
}

export default ForgotPassword;
