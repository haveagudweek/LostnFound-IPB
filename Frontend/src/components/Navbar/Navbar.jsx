import { Search, Bell, HelpCircle, Plus, Menu, Package, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { navLinks } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const addToast = useUIStore((state) => state.addToast);

  const handleLogout = () => {
    logout();
    addToast('Anda telah keluar.', 'info');
    navigate('/login');
  };

  return (
    <nav className="navbar" id="navbar">
      <div className="navbar__container">
        {/* Logo */}
        <Link to="/" className="navbar__logo" id="navbar-logo">
          <div className="navbar__logo-icon">
            <Package size={20} />
          </div>
          <span className="navbar__logo-text">SEEKEM</span>
        </Link>

        {/* Navigation Links */}
        <div className="navbar__nav" id="navbar-nav">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`navbar__link ${link.active ? 'navbar__link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" className="navbar__link">Admin Dashboard</Link>
          )}
        </div>

        {/* Search Bar */}
        <div className="navbar__search" id="navbar-search">
          <Search size={16} className="navbar__search-icon" />
          <input
            type="text"
            className="navbar__search-input"
            placeholder="Temukan apapun..."
            aria-label="Cari barang"
          />
        </div>

        {/* Action Buttons */}
        <div className="navbar__actions">
          {isAuthenticated ? (
            <>
              <button className="navbar__icon-btn" id="btn-notifications" aria-label="Notifikasi">
                <Bell size={20} />
                <span className="notification-dot"></span>
              </button>

              <button className="navbar__icon-btn" id="btn-help" aria-label="Bantuan">
                <HelpCircle size={20} />
              </button>

              <button className="navbar__cta" id="btn-report" onClick={() => navigate('/report')}>
                <span>Lapor Barang</span>
                <div className="navbar__cta-badge">
                  <Plus size={12} />
                </div>
              </button>

              <div className="navbar__avatar" id="user-avatar" title={user.name}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              
              <button className="navbar__icon-btn" onClick={handleLogout} title="Keluar">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <div className="navbar__auth-links">
              <Link to="/login" className="navbar__link">Masuk</Link>
              <Link to="/register" className="navbar__cta" style={{ textDecoration: 'none' }}>Daftar</Link>
            </div>
          )}

          <button className="navbar__mobile-toggle navbar__icon-btn" id="btn-mobile-menu" aria-label="Menu">
            <Menu size={22} />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
