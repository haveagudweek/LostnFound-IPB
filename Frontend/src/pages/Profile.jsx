import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BadgeCheck, FileText, IdCard, Mail, UserRound } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const addToast = useUIStore((state) => state.addToast);

  useEffect(() => {
    if (!isAuthenticated) {
      addToast('Silakan masuk terlebih dahulu untuk melihat profil.', 'info');
      navigate('/login');
    }
  }, [addToast, isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const initial = user.name?.charAt(0).toUpperCase() || 'U';

  const profileFields = [
    {
      label: 'Nama Lengkap',
      value: user.name,
      icon: UserRound,
    },
    {
      label: 'Email Institusi',
      value: user.email,
      icon: Mail,
    },
    {
      label: 'NIM / NIP',
      value: user.nim || '-',
      icon: IdCard,
    },
    {
      label: 'Jenis Akun',
      value: user.role === 'admin' ? 'Administrator' : 'Pengguna',
      icon: BadgeCheck,
    },
  ];

  return (
    <main className="profile-page" id="profile-page">
      <div className="container">
        <section className="profile-hero" aria-labelledby="profile-title">
          <div className="profile-hero__avatar">{initial}</div>
          <div>
            <p className="profile-hero__eyebrow">Profil Pengguna</p>
            <h1 id="profile-title">{user.name}</h1>
            <p className="profile-hero__subtitle">
              Data akun ini mengikuti informasi yang dimasukkan saat registrasi.
            </p>
          </div>
        </section>

        <section className="profile-card" aria-label="Detail profil">
          <div className="profile-card__header">
            <div>
              <h2>Informasi Akun</h2>
              <p>Gunakan data ini saat melaporkan atau mengklaim barang.</p>
            </div>
            <span className="profile-card__status">Terverifikasi IPB</span>
          </div>

          <div className="profile-details">
            {profileFields.map(({ label, value, icon: Icon }) => (
              <div className="profile-detail" key={label}>
                <div className="profile-detail__icon">
                  <Icon size={20} />
                </div>
                <div>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="profile-actions">
            <Link to="/report" className="profile-actions__primary">
              <FileText size={18} />
              <span>Lapor Barang</span>
            </Link>
            <Link to="/" className="profile-actions__secondary">
              Kembali ke Beranda
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Profile;
