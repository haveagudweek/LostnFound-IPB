import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const addToast = useUIStore((state) => state.addToast);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await api.login({ email, password });
      login(user);
      addToast(`Selamat datang kembali, ${user.name}!`, 'success');
      if (user.role === 'admin') {
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
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Package size={24} />
          </div>
          <h2>Masuk ke SEEKEM</h2>
          <p>Sistem Informasi Kehilangan Barang IPB</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label>Email IPB</label>
            <input 
              type="email" 
              placeholder="contoh@apps.ipb.ac.id" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="auth-form-group">
            <label>Kata Sandi</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <Loader2 className="spin" size={20} /> : 'Masuk'}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <p className="auth-footer">
          Belum punya akun? <Link to="/register">Daftar sekarang</Link>
        </p>
        <div className="auth-demo-hint">
          <small>Demo: admin@apps.ipb.ac.id / admin123 | rizky@apps.ipb.ac.id / user123</small>
        </div>
      </div>
    </main>
  );
}

export default Login;
