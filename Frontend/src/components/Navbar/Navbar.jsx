import { useState, useEffect, useRef } from 'react';
import { Search, Bell, HelpCircle, Plus, Menu, LogOut, User, LogIn, UserPlus, ChevronDown, History, LayoutDashboard, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import './Navbar.css';

const navLinks = [
  { label: 'Beranda', href: '/' },
  { label: 'Barang Hilang', href: '/lost' },
  { label: 'Barang Ditemukan', href: '/found' },
];

const notificationIcons = {
  success: CheckCircle2,
  error: XCircle,
  info: Clock3,
};

function formatNotificationTime(value) {
  if (!value) return '';

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, logout } = useAuthStore();
  const addToast = useUIStore((state) => state.addToast);
  const notifications = useUIStore((state) => state.notifications);
  const markNotificationRead = useUIStore((state) => state.markNotificationRead);
  const userNotifications = notifications.filter((notification) =>
    !notification.userId || notification.userId === user?.id
  );
  const latestNotifications = userNotifications.slice(0, 3);
  const unreadNotifications = userNotifications.filter((notification) => !notification.read).length;

  /* ── Profile dropdown state ── */
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  /* ── Search state synced with URL ── */
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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

  const closeMobileMenu = () => setMobileOpen(false);

  const handleNotificationClick = (notification) => {
    markNotificationRead(notification.id);
    setNotificationsOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
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
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="navbar">
      <div className="navbar__container">
        {/* Logo */}
        <Link to="/" className="navbar__logo" id="navbar-logo">
          <div className="navbar__logo-icon">
            <img src="/seekem-logo.png" alt="" className="navbar__logo-img" />
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
              <div className="navbar__notifications" ref={notificationsRef}>
                <button
                  className="navbar__icon-btn"
                  id="btn-notifications"
                  aria-label="Notifikasi"
                  aria-expanded={notificationsOpen}
                  aria-haspopup="true"
                  onClick={() => {
                    setNotificationsOpen((prev) => !prev);
                    setProfileOpen(false);
                  }}
                >
                  <Bell size={20} />
                  {unreadNotifications > 0 && <span className="notification-dot"></span>}
                </button>

                {notificationsOpen && (
                  <div className="navbar__notification-popover">
                    <div className="navbar__notification-header">
                      <strong>Notifikasi</strong>
                      {unreadNotifications > 0 && <span>{unreadNotifications} baru</span>}
                    </div>

                    {latestNotifications.length ? (
                      <div className="navbar__notification-list">
                        {latestNotifications.map((notification) => {
                          const NotificationIcon = notificationIcons[notification.type] || Bell;
                          return (
                            <button
                              key={notification.id}
                              type="button"
                              className={`navbar__notification-item ${notification.read ? '' : 'is-unread'}`}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <span className={`navbar__notification-icon navbar__notification-icon--${notification.type}`}>
                                <NotificationIcon size={16} />
                              </span>
                              <span className="navbar__notification-body">
                                <strong>{notification.title}</strong>
                                <span>{notification.message}</span>
                                <time>{formatNotificationTime(notification.createdAt)}</time>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="navbar__notification-empty">Belum ada notifikasi.</div>
                    )}

                    <button
                      type="button"
                      className="navbar__notification-all"
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate('/notifications');
                      }}
                    >
                      Lihat Semua Notifikasi
                    </button>
                  </div>
                )}
              </div>

              <button
                className="navbar__icon-btn"
                id="btn-help"
                aria-label="Bantuan"
                onClick={() => addToast('Gunakan pencarian atau menu Lapor Barang untuk memulai.', 'info')}
              >
                <HelpCircle size={20} />
              </button>

              {user?.role !== 'admin' && (
                <button className="navbar__cta" id="btn-report" onClick={() => navigate('/report')}>
                  <span>Lapor Barang</span>
                  <div className="navbar__cta-badge">
                    <Plus size={12} />
                  </div>
                </button>
              )}

              {/* Authenticated profile dropdown */}
              <div className="navbar__profile" ref={profileRef}>
                <button
                  className="navbar__avatar"
                  id="user-avatar"
                  title={user.name}
                  onClick={() => {
                    setProfileOpen((prev) => !prev);
                    setNotificationsOpen(false);
                  }}
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
                    <Link to="/profile" className="navbar__dropdown-item" onClick={() => setProfileOpen(false)}>
                      <User size={16} />
                      <span>Profil Saya</span>
                    </Link>
                    <Link to="/history" className="navbar__dropdown-item" onClick={() => setProfileOpen(false)}>
                      <History size={16} />
                      <span>Riwayat Saya</span>
                    </Link>
                    <Link to="/notifications" className="navbar__dropdown-item" onClick={() => setProfileOpen(false)}>
                      <Bell size={16} />
                      <span>Notifikasi</span>
                      {unreadNotifications > 0 && (
                        <span className="navbar__dropdown-count">{unreadNotifications}</span>
                      )}
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="navbar__dropdown-item" onClick={() => setProfileOpen(false)}>
                        <LayoutDashboard size={16} />
                        <span>Dashboard Admin</span>
                      </Link>
                    )}
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
                onClick={() => {
                  setProfileOpen((prev) => !prev);
                  setNotificationsOpen(false);
                }}
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

          <button
            className="navbar__mobile-toggle navbar__icon-btn"
            id="btn-mobile-menu"
            aria-label="Menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="navbar__mobile-panel" id="navbar-mobile-panel">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`navbar__mobile-link ${isLinkActive(link.href) ? 'navbar__mobile-link--active' : ''}`}
              onClick={closeMobileMenu}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && user?.role !== 'admin' && (
            <button
              className="navbar__mobile-report"
              onClick={() => {
                closeMobileMenu();
                navigate('/report');
              }}
            >
              Lapor Barang
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
