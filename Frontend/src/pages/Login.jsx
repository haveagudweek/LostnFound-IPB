import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Landmark, Mail, KeyRound, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const addToast = useUIStore((state) => state.addToast);
  const redirectFrom = location.state?.from;
  const redirectTo = redirectFrom ? `${redirectFrom.pathname}${redirectFrom.search || ''}` : null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      addToast('Email dan password wajib diisi.', 'error');
      return;
    }

    setLoading(true);
    try {
      const user = await api.login({ email, password });
      login(user);
      addToast(`Selamat datang kembali, ${user.name}!`, 'success');
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page" id="login-page">
      {/* ── Hero heading above the card ── */}
      <div className="auth-hero">
        <h1 className="auth-hero__welcome">Selamat Datang di</h1>
        <h2 className="auth-hero__brand">SEEKEM</h2>
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
            <label className="auth-form-group__label" htmlFor="login-email">EMAIL</label>
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
            <label className="auth-form-group__label" htmlFor="login-password">PASSWORD</label>
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
            <a href="#" className="auth-forgot">Lupa Password?</a>
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

        {/* Footer link */}
        <p className="auth-card__footer">
          Belum punya akun? <Link to="/register">Daftar sekarang</Link>
        </p>

        {/* Demo hint — hidden in production */}
        <div className="auth-demo-hint">
          <small>Demo: admin@apps.ipb.ac.id / admin123 | rizky@apps.ipb.ac.id / user123</small>
        </div>
      </div>
    </main>
  );
}

export default Login;
