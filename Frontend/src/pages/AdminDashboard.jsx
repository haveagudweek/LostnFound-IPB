import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, Camera, CheckCircle2, Clock3, FileText, MoreVertical, PackageCheck, RotateCcw, ShieldCheck } from 'lucide-react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import './Admin.css';

const statusLabel = {
  pending_verification: 'Pending',
  verified: 'Verified',
  rejected: 'Rejected',
  pending: 'Pending',
  approved: 'Approved',
};

const statusTone = {
  pending_verification: 'red',
  pending: 'red',
  verified: 'green',
  approved: 'green',
  rejected: 'gray',
  found: 'green',
  lost: 'red',
};

function parseLooseDate(value, baseTime = 0) {
  if (!value) return 0;

  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) return parsed;

  const normalized = String(value)
    .replace('Hari ini', new Date(baseTime).toLocaleDateString('id-ID'))
    .replace('Kemarin', new Date(baseTime - 86400000).toLocaleDateString('id-ID'));

  const retry = Date.parse(normalized);
  return Number.isNaN(retry) ? 0 : retry;
}

function formatActivityTime(value, baseTime) {
  const timestamp = parseLooseDate(value, baseTime);
  if (!timestamp) return value || '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const [stats, setStats] = useState({
    totalReports: 0,
    verifiedReports: 0,
    pendingReports: 0,
    claimedItems: 0,
    pendingClaims: 0,
  });
  const [categoryRows, setCategoryRows] = useState([{ label: 'Belum ada data', count: 0, value: 0 }]);
  const [chartBars, setChartBars] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }

    let cancelled = false;
    async function fetchDashboard() {
      try {
        const data = await api.getDashboardStats();
        if (cancelled) return;

        setStats({
          totalReports: data.total_laporan || 0,
          verifiedReports: data.total_diverifikasi || 0,
          pendingReports: data.total_pending || 0,
          claimedItems: data.total_klaim_masuk || 0, // Disesuaikan dari klaim disetujui jika ada
          pendingClaims: data.total_klaim_masuk || 0,
        });

        // 1. Map Kategori
        if (data.distribusi_kategori && data.distribusi_kategori.length > 0) {
          const totalCat = data.distribusi_kategori.reduce((acc, cat) => acc + cat.count, 0);
          setCategoryRows(
            data.distribusi_kategori.map((cat) => ({
              label: cat.kategori,
              count: cat.count,
              value: totalCat > 0 ? Math.round((cat.count / totalCat) * 100) : 0,
            }))
          );
        } else {
          setCategoryRows([{ label: 'Belum ada data', count: 0, value: 0 }]);
        }

        // 2. Map Traffic (7 hari terakhir)
        const counts = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return {
             date: new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(d),
             count: 0
          };
        });
        
        if (data.traffic_laporan && data.traffic_laporan.length > 0) {
          const now = Date.now();
          data.traffic_laporan.forEach((t) => {
            const timestamp = new Date(t.tanggal).getTime();
            const age = Math.floor((now - timestamp) / 86400000);
            if (age >= 0 && age < 7) {
              counts[6 - age].count += t.laporan_masuk;
            }
          });
        }
        
        const maxTraffic = Math.max(...counts.map(c => c.count), 1);
        setChartBars(
          counts.map((item) => ({
            ...item,
            height: Math.max(12, Math.round((item.count / maxTraffic) * 100)),
          }))
        );

        // 3. Map Recent Activities
        if (data.recent_activities) {
          setRecentActivities(
            data.recent_activities.map((act) => ({
              id: `act-${act.id}-${Math.random()}`,
              icon: act.tipe === 'Klaim' ? ShieldCheck : FileText,
              text: act.pesan,
              meta: `${act.waktu}`,
              badge: act.tipe,
              tone: statusTone[act.status] || 'neutral',
              link: act.tipe === 'Klaim' ? `/admin/claims/${act.id}` : `/admin/verification/${act.id}`,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      }
    }

    fetchDashboard();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, navigate]);

  const emptyActivities = recentActivities.length === 0;

  if (!isAdmin) return null;

  return (
    <AdminLayout>
      <div className="admin-page admin-page--dashboard">
        <section className="admin-hero">
          <h1>Dashboard</h1>
          <p>Real-time metrics and central command for IPB Lost & Found operations.</p>
        </section>

        <section className="admin-metrics" aria-label="Ringkasan admin">
          <MetricCard label="TOTAL LAPORAN" value={stats.totalReports.toLocaleString('id-ID')} note={`Laporan masuk di sistem`} icon={Archive} tone="green" />
          <MetricCard label="DIVERIFIKASI" value={stats.verifiedReports.toLocaleString('id-ID')} note="Laporan disetujui admin" icon={ShieldCheck} tone="neutral" />
          <MetricCard label="PENDING" value={stats.pendingReports.toLocaleString('id-ID')} note="Menunggu verifikasi laporan" icon={Clock3} tone="red" />
          <MetricCard label="KLAIM MASUK" value={stats.claimedItems.toLocaleString('id-ID')} note={`${stats.pendingClaims} menunggu verifikasi`} icon={Camera} tone="neutral" />
        </section>

        <section className="admin-dashboard-grid">
          <div className="admin-panel admin-panel--traffic">
            <div className="admin-panel__header">
              <div>
                <h2>Traffic Analytics: Laporan per Hari</h2>
                <p>Volume of incoming vs. resolved reports over the last 7 days.</p>
              </div>
              <button aria-label="Opsi traffic">
                <MoreVertical size={20} />
              </button>
            </div>
            <div className="admin-chart" aria-label="Grafik laporan per hari">
              {chartBars.map((bar, index) => (
                <div key={index} className="admin-chart__bar-wrapper">
                  <span 
                    className="admin-chart__bar" 
                    style={{ '--bar-height': `${bar.height}%` }}
                  >
                    <div className="admin-chart__tooltip">
                      <strong>{bar.count} Laporan</strong>
                      <small>{bar.date}</small>
                    </div>
                  </span>
                  <span className="admin-chart__label">{bar.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-panel admin-panel--category">
            <h2>Kategori Barang</h2>
            <p>Distribution of reported items.</p>
            <div className="admin-category-list">
              {categoryRows.map((category) => (
                <div className="admin-category-row" key={category.label}>
                  <div>
                    <span>{category.label}</span>
                    <strong>{category.count ? `${category.count} item` : '-'}</strong>
                  </div>
                  <div className="admin-progress">
                    <span style={{ width: `${category.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="admin-panel admin-activity">
          <div className="admin-activity__header">
            <h2>Recent Activity</h2>
            <button onClick={() => navigate('/admin/verification')}>View All</button>
          </div>
          {emptyActivities ? (
            <div className="admin-empty">Belum ada aktivitas.</div>
          ) : (
            recentActivities.map((activity) => (
              <ActivityRow
                key={activity.id}
                icon={activity.icon}
                text={activity.text}
                meta={activity.meta}
                badge={activity.badge}
                tone={activity.tone}
                onClick={() => navigate(activity.link)}
              />
            ))
          )}
        </section>
      </div>
    </AdminLayout>
  );
}

function MetricCard({ label, value, note, icon: Icon, tone }) {
  return (
    <article className={`admin-metric admin-metric--${tone}`}>
      <div className="admin-metric__top">
        <span>{label}</span>
        <Icon size={22} />
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function ActivityRow({ icon: Icon, text, meta, badge, tone, onClick }) {
  return (
    <button type="button" className="admin-activity__row" onClick={onClick}>
      <div className="admin-activity__icon">
        <Icon size={18} />
      </div>
      <div className="admin-activity__body">
        <p>{text}</p>
        <span>{meta}</span>
      </div>
      <span className={`admin-status admin-status--${tone}`}>{badge}</span>
    </button>
  );
}

export default AdminDashboard;
