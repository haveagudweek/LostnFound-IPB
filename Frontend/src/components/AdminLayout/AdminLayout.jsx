import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Bell, FileText, Grid2X2, Home, LogOut, Search, Settings, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

function AdminLayout({ children, searchPlaceholder = 'Search claims...' }) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const addToast = useUIStore((state) => state.addToast);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    addToast('Anda telah keluar.', 'info');
    navigate('/login');
  };

  return (
    <main className="admin-shell">
      <aside className="admin-shell__sidebar">
        <div className="admin-shell__brand">
          <div className="admin-shell__brand-mark">
            <Search size={22} />
          </div>
          <div>
            <strong>Seekem</strong>
            <span>Admin Terminal</span>
          </div>
        </div>

        <nav className="admin-shell__nav" aria-label="Admin navigation">
          <NavLink to="/admin" end className={({ isActive }) => `admin-shell__nav-item ${isActive ? 'is-active' : ''}`}>
            <Grid2X2 size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/verification" className={({ isActive }) => `admin-shell__nav-item ${isActive ? 'is-active' : ''}`}>
            <FileText size={20} />
            <span>Laporan Masuk</span>
          </NavLink>
          <NavLink to="/admin/claims" className={({ isActive }) => `admin-shell__nav-item ${isActive ? 'is-active' : ''}`}>
            <ShieldCheck size={20} />
            <span>Konfirmasi Klaim</span>
          </NavLink>
        </nav>

        <button className="admin-shell__logout" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </aside>

      <section className="admin-shell__workspace">
        <header className="admin-shell__topbar">
          <form className="admin-shell__search" onSubmit={(event) => event.preventDefault()}>
            <Search size={16} />
            <input type="search" placeholder={searchPlaceholder} aria-label="Pencarian admin" />
          </form>
          <div className="admin-shell__tools">
            <button aria-label="Notifikasi">
              <Bell size={20} />
            </button>
            <button aria-label="Pengaturan">
              <Settings size={20} />
            </button>
            <div className="admin-shell__profile" ref={profileRef}>
              <button
                className="admin-shell__avatar"
                aria-label={user?.name || 'Admin'}
                aria-expanded={profileOpen}
                aria-haspopup="true"
                onClick={() => setProfileOpen((prev) => !prev)}
              >
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </button>

              {profileOpen && (
                <div className="admin-shell__profile-menu">
                  <div className="admin-shell__profile-header">
                    <strong>{user?.name || 'Admin'}</strong>
                    <span>{user?.email || 'Administrator'}</span>
                  </div>
                  <button
                    type="button"
                    className="admin-shell__profile-item"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/');
                    }}
                  >
                    <Home size={16} />
                    <span>Kembali ke Dashboard</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="admin-shell__content">
          {children}
        </div>
      </section>
    </main>
  );
}

export default AdminLayout;
