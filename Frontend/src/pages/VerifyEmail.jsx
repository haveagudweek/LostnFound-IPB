import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import './Auth.css';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('Sedang memverifikasi email Anda...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token verifikasi tidak ditemukan di URL.');
      return;
    }

    const verify = async () => {
      try {
        const response = await api.verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Email berhasil diverifikasi!');
      } catch (error) {
        setStatus('error');
        setMessage(error.message || 'Gagal memverifikasi email.');
      }
    };

    verify();
  }, [token]);

  return (
    <main className="auth-page" id="verify-email-page">
      <div className="auth-card" style={{ textAlign: 'center', padding: '40px 30px' }}>
        
        {status === 'loading' && (
          <>
            <Loader2 className="spin" size={64} style={{ color: 'var(--admin-green)', margin: '0 auto 20px' }} />
            <h3 className="auth-card__title">Memverifikasi...</h3>
            <p className="auth-card__subtitle">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 size={64} style={{ color: '#25D366', margin: '0 auto 20px' }} />
            <h3 className="auth-card__title" style={{ color: '#25D366' }}>Verifikasi Berhasil</h3>
            <p className="auth-card__subtitle" style={{ marginBottom: '30px' }}>{message}</p>
            <button 
              className="auth-submit" 
              onClick={() => navigate('/login')}
            >
              Ke Halaman Login <ArrowRight size={18} />
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={64} style={{ color: '#e74c3c', margin: '0 auto 20px' }} />
            <h3 className="auth-card__title" style={{ color: '#e74c3c' }}>Verifikasi Gagal</h3>
            <p className="auth-card__subtitle" style={{ marginBottom: '30px' }}>{message}</p>
            <button 
              className="auth-submit" 
              onClick={() => navigate('/login')}
              style={{ background: '#e74c3c' }}
            >
              Kembali ke Login
            </button>
          </>
        )}

      </div>
    </main>
  );
}

export default VerifyEmail;
