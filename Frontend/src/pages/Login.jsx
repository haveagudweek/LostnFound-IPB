import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Landmark, Mail, KeyRound, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // State untuk fitur resend verification
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
  // Ambil state awal dari localStorage jika ada
  const [resendCooldown, setResendCooldown] = useState(() => {
    const saved = localStorage.getItem('resend_verif_cooldown');
    if (saved) {
      const remaining = Math.ceil((parseInt(saved) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });

  useEffect(() => {
    if (resendCooldown > 0) {
      setShowResend(true);
    }
  }, [resendCooldown]);

  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const addToast = useUIStore((state) => state.addToast);
  const redirectFrom = location.state?.from;
  const redirectTo = redirectFrom ? `${redirectFrom.pathname}${redirectFrom.search || ''}` : null;

  // Countdown timer untuk cooldown resend
  useEffect(() => {
    if (resendCooldown <= 0) {
      localStorage.removeItem('resend_verif_cooldown');
      return;
    }
    
    // Simpan ke local storage agar persisten
    const expireTime = Date.now() + (resendCooldown * 1000);
    const saved = localStorage.getItem('resend_verif_cooldown');
    if (!saved || Math.abs(parseInt(saved) - expireTime) > 2000) {
       localStorage.setItem('resend_verif_cooldown', expireTime.toString());
    }

    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      addToast('Email dan password wajib diisi.', 'error');
      return;
    }

    setLoading(true);
    setShowResend(false);
    try {
      const user = await api.login({ email, password });
      login(user);
      addToast(`Selamat datang kembali, ${user.name}!`, 'success');
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (redirectTo) {
        navigate(redirectTo, { replace: true });
      } else {
        navigate('/');
      }
    } catch (error) {
      addToast(error.message, 'error');
      // Jika error 403 (belum verifikasi), tampilkan tombol resend
      if (error.message.includes('belum diverifikasi')) {
        setShowResend(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || resendLoading) return;

    setResendLoading(true);
    try {
      await api.resendVerification(email);
      addToast('Email verifikasi telah dikirim ulang. Cek kotak masuk atau folder Spam Anda.', 'success');
      setResendCooldown(60);
      localStorage.setItem('resend_verif_cooldown', (Date.now() + 60000).toString());
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setResendLoading(false);
    }
  }, [email, resendCooldown, resendLoading, addToast]);

  return (
    <main className="auth-page" id="login-page">
      {/* ── Hero heading above the card ── */}
      <div className="auth-hero">
        <h1 className="auth-hero__welcome">Selamat Datang di</h1>
        <div className="auth-hero__brand-lockup">
          <img src="/seekem-logo.png" alt="Logo SEEKEM" className="auth-hero__logo" />
          <h2 className="auth-hero__brand">SEEKEM</h2>
        </div>
      </div>

      {/* ── Card ── */}
      <div className="auth-card" id="login-card">
        {/* Card header */}
        <div className="auth-card__header">
          <div className="auth-card__icon">
            <Landmark size={28} />
          </div>
          <h3 className="auth-card__title">Login</h3>
          <p className="auth-card__subtitle">Autentikasi untuk masuk ke halaman beranda</p>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} id="login-form">
          {/* Email */}
          <div className="auth-form-group">
            <label className="auth-form-group__label" htmlFor="login-email">EMAIL <span style={{ color: 'red' }}>*</span></label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-input-icon" />
              <input
                type="email"
                id="login-email"
                placeholder="Masukkan Email Institusi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-form-group">
            <label className="auth-form-group__label" htmlFor="login-password">PASSWORD <span style={{ color: 'red' }}>*</span></label>
            <div className="auth-input-wrapper">
              <KeyRound size={18} className="auth-input-icon" />
              <input
                type="password"
                id="login-password"
                placeholder="Masukkan Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="auth-options">
            <label className="auth-remember" htmlFor="remember-me">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="auth-remember__box" />
              <span className="auth-remember__text">Ingat riwayat</span>
            </label>
            <Link to="/forgot-password" className="auth-forgot">Lupa Password?</Link>
          </div>

          {/* Submit */}
          <button type="submit" className="auth-submit" id="btn-login" disabled={loading}>
            {loading ? (
              <Loader2 className="spin" size={20} />
            ) : (
              <>
                Masuk <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Resend Verification Banner */}
        {showResend && (
          <div className="auth-resend-banner" id="resend-verification-banner">
            <p className="auth-resend-banner__text">
              Email belum diverifikasi? Kirim ulang email verifikasi.
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

        {/* Footer link */}
        <p className="auth-card__footer">
          Belum punya akun? <Link to="/register">Daftar sekarang</Link>
        </p>

      </div>
    </main>
  );
}

export default Login;
