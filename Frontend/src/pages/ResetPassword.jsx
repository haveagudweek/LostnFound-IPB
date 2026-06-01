import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Landmark, KeyRound, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useUIStore } from '../store/uiStore';
import './Auth.css';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const addToast = useUIStore((state) => state.addToast);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      addToast('Token tidak valid atau tidak ditemukan.', 'error');
      navigate('/login');
    }
  }, [token, navigate, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      addToast('Konfirmasi password tidak cocok.', 'error');
      return;
    }

    if (password.length < 8) {
      addToast('Password minimal 8 karakter.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.resetPassword({ token, new_password: password });
      addToast(response.message || 'Password berhasil diubah. Silakan login.', 'success');
      navigate('/login');
    } catch (error) {
      addToast(error.message || 'Gagal mengatur ulang password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-hero">
        <h1 className="auth-hero__welcome">Atur Ulang Password</h1>
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
          <h3 className="auth-card__title">Password Baru</h3>
          <p className="auth-card__subtitle">Masukkan password baru untuk akun Anda</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-form-group__label" htmlFor="new-password">PASSWORD BARU <span style={{ color: 'red' }}>*</span></label>
            <div className="auth-input-wrapper">
              <KeyRound size={18} className="auth-input-icon" />
              <input
                type="password"
                id="new-password"
                placeholder="Masukkan Password Baru"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
          </div>

          <div className="auth-form-group">
            <label className="auth-form-group__label" htmlFor="confirm-password">KONFIRMASI PASSWORD <span style={{ color: 'red' }}>*</span></label>
            <div className="auth-input-wrapper">
              <KeyRound size={18} className="auth-input-icon" />
              <input
                type="password"
                id="confirm-password"
                placeholder="Masukkan Ulang Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
          </div>

          <button type="submit" className="auth-submit" disabled={loading || !token}>
            {loading ? (
              <Loader2 className="spin" size={20} />
            ) : (
              <>
                Simpan Password <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="auth-card__footer">
          Batal mengatur ulang? <Link to="/login">Kembali ke Login</Link>
        </p>
      </div>
    </main>
  );
}

export default ResetPassword;
