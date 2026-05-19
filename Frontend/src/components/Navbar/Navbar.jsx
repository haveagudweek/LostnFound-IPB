import { useState, useEffect, useRef } from 'react';
import { Search, Bell, HelpCircle, Plus, Menu, Package, LogOut, User, LogIn, UserPlus, ChevronDown } from 'lucide-react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { navLinks } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, logout } = useAuthStore();
  const addToast = useUIStore((state) => state.addToast);

  /* ── Profile dropdown state ── */
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  /* ── Search state synced with URL ── */
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  const handleLogout = () => {
    logout();
    addToast('Anda telah keluar.', 'info');
    navigate('/login');
  };

  /* ── Determine active link based on current pathname ── */
  const isLinkActive = (href) => {
    if (href === '/') return location.pathname === '/';
    // Direct match
    if (location.pathname.startsWith(href)) return true;
    // Item detail pages: /item/F* → /found, /item/L* → /lost
    if (location.pathname.startsWith('/item/')) {
      const itemId = location.pathname.split('/item/')[1];
      if (href === '/found' && itemId?.startsWith('F')) return true;
      if (href === '/lost' && itemId?.startsWith('L')) return true;
    }
    // Contact pages: /contact/F* → /found, /contact/L* → /lost
    if (location.pathname.startsWith('/contact/')) {
      const contactId = location.pathname.split('/contact/')[1];
      if (href === '/found' && contactId?.startsWith('F')) return true;
      if (href === '/lost' && contactId?.startsWith('L')) return true;
    }
    return false;
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
              className={`navbar__link ${isLinkActive(link.href) ? 'navbar__link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`navbar__link ${isLinkActive('/admin') ? 'navbar__link--active' : ''}`}
            >
              Admin Dashboard
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <form className="navbar__search" id="navbar-search" onSubmit={handleSearch} role="search">
          <Search size={16} className="navbar__search-icon" />
          <input
            type="text"
            className="navbar__search-input"
            placeholder="Temukan apapun..."
            aria-label="Cari barang"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

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

              {/* Authenticated profile dropdown */}
              <div className="navbar__profile" ref={profileRef}>
                <button
                  className="navbar__avatar"
                  id="user-avatar"
                  title={user.name}
                  onClick={() => setProfileOpen((prev) => !prev)}
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>

                {profileOpen && (
                  <div className="navbar__dropdown">
                    <div className="navbar__dropdown-header">
                      <div className="navbar__dropdown-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="navbar__dropdown-info">
                        <span className="navbar__dropdown-name">{user.name}</span>
                        <span className="navbar__dropdown-email">{user.email}</span>
                      </div>
                    </div>
                    <div className="navbar__dropdown-divider"></div>
                    <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={handleLogout}>
                      <LogOut size={16} />
                      <span>Keluar</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Guest profile dropdown */
            <div className="navbar__profile" ref={profileRef}>
              <button
                className="navbar__avatar navbar__avatar--guest"
                id="guest-avatar"
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-expanded={profileOpen}
                aria-haspopup="true"
                aria-label="Akun"
              >
                <User size={18} />
                <ChevronDown size={14} className={`navbar__avatar-chevron ${profileOpen ? 'navbar__avatar-chevron--open' : ''}`} />
              </button>

              {profileOpen && (
                <div className="navbar__dropdown">
                  <div className="navbar__dropdown-header navbar__dropdown-header--guest">
                    <User size={24} />
                    <span className="navbar__dropdown-name">Selamat Datang!</span>
                    <span className="navbar__dropdown-email">Masuk atau daftar untuk melaporkan barang</span>
                  </div>
                  <div className="navbar__dropdown-divider"></div>
                  <Link to="/login" className="navbar__dropdown-item" onClick={() => setProfileOpen(false)}>
                    <LogIn size={16} />
                    <span>Masuk</span>
                  </Link>
                  <Link to="/register" className="navbar__dropdown-item navbar__dropdown-item--highlight" onClick={() => setProfileOpen(false)}>
                    <UserPlus size={16} />
                    <span>Daftar Akun Baru</span>
                  </Link>
                </div>
              )}
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
