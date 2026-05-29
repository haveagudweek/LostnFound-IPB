import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  ClipboardList,
  Clock3,
  MailCheck,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import './Notifications.css';

const notificationMeta = {
  report: { label: 'Laporan', icon: ClipboardList },
  claim: { label: 'Klaim', icon: ShieldCheck },
  message: { label: 'Pesan', icon: MailCheck },
  verification: { label: 'Verifikasi', icon: CheckCircle2 },
  system: { label: 'Sistem', icon: Bell },
};

const typeIcon = {
  success: CheckCircle2,
  error: XCircle,
  info: Clock3,
};

function formatDate(value) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function Notifications() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const notifications = useUIStore((state) => state.notifications);
  const markNotificationRead = useUIStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = useUIStore((state) => state.markAllNotificationsRead);
  const requestConfirmation = useUIStore((state) => state.requestConfirmation);

  const userNotifications = notifications.filter((notification) =>
    !notification.userId || notification.userId === user?.id
  );
  const unreadCount = userNotifications.filter((notification) => !notification.read).length;

  const openNotification = (notification) => {
    markNotificationRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    const confirmed = await requestConfirmation({
      title: 'Tandai Dibaca',
      message: 'Semua notifikasi yang belum dibaca akan ditandai sebagai dibaca.',
      confirmLabel: 'Tandai Dibaca',
    });

    if (!confirmed) {
      return;
    }

    markAllNotificationsRead(user?.id);
  };

  return (
    <main className="notifications-page" id="notifications-page">
      <div className="container">
        <section className="notifications-hero">
          <div>
            <p className="notifications-hero__eyebrow">Pusat Notifikasi</p>
            <h1>Aktivitas terbaru</h1>
            <p>
              Lihat pembaruan laporan, klaim, verifikasi admin, dan pesan yang berhasil dikirim.
            </p>
          </div>
          <div className="notifications-actions">
            <button type="button" onClick={handleMarkAllRead} disabled={!unreadCount}>
              <CheckCheck size={18} />
              <span>Tandai Dibaca</span>
            </button>
          </div>
        </section>

        <section className="notifications-summary" aria-label="Ringkasan notifikasi">
          <div>
            <span>Total</span>
            <strong>{userNotifications.length}</strong>
          </div>
          <div>
            <span>Belum Dibaca</span>
            <strong>{unreadCount}</strong>
          </div>
          <div>
            <span>Status Penting</span>
            <strong>
              {userNotifications.filter((notification) =>
                ['verification', 'claim', 'report'].includes(notification.category)
              ).length}
            </strong>
          </div>
        </section>

        <section className="notifications-card" aria-label="Daftar notifikasi">
          {userNotifications.length ? (
            <div className="notifications-list">
              {userNotifications.map((notification) => {
                const categoryMeta = notificationMeta[notification.category] || notificationMeta.system;
                const CategoryIcon = categoryMeta.icon;
                const StatusIcon = typeIcon[notification.type] || Bell;

                const content = (
                  <>
                    <div className={`notifications-item__icon notifications-item__icon--${notification.type}`}>
                      <CategoryIcon size={20} />
                    </div>
                    <div className="notifications-item__body">
                      <div className="notifications-item__topline">
                        <span>{categoryMeta.label}</span>
                        <time>{formatDate(notification.createdAt)}</time>
                      </div>
                      <h2>{notification.title}</h2>
                      <p>{notification.message}</p>
                    </div>
                    <div className="notifications-item__status">
                      <StatusIcon size={17} />
                      {!notification.read && <span>Baru</span>}
                    </div>
                  </>
                );

                if (notification.link) {
                  return (
                    <button
                      key={notification.id}
                      type="button"
                      className={`notifications-item ${notification.read ? '' : 'is-unread'}`}
                      onClick={() => openNotification(notification)}
                    >
                      {content}
                    </button>
                  );
                }

                return (
                  <div
                    key={notification.id}
                    className={`notifications-item ${notification.read ? '' : 'is-unread'}`}
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="notifications-empty">
              <Bell size={44} />
              <h2>Belum ada notifikasi</h2>
              <p>Notifikasi baru akan muncul saat ada laporan, klaim, verifikasi, atau pesan terkirim.</p>
              <Link to="/report">Buat Laporan</Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Notifications;
