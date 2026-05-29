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
  const [reports, setReports] = useState([]);
  const [claims, setClaims] = useState([]);
  const [items, setItems] = useState([]);
  const [dashboardNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }

    let cancelled = false;
    async function fetchDashboard() {
      const [reportData, claimData, itemData] = await Promise.all([
        api.getVerificationReports(),
        api.getClaims(),
        api.getPostedItems(),
      ]);

      if (!cancelled) {
        setReports(reportData);
        setClaims(claimData);
        setItems(itemData);
      }
    }

    fetchDashboard();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, navigate]);

  const stats = useMemo(() => {
    const verifiedReports = reports.filter((report) => report.status === 'verified').length;
    const pendingReports = reports.filter((report) => report.status === 'pending_verification').length;
    const claimedItems = new Set(claims
      .filter((claim) => claim.status === 'approved')
      .map((claim) => claim.itemId || claim.itemName)
    );
    items
      .filter((item) => item.claimStatus === 'claimed')
      .forEach((item) => claimedItems.add(item.id));
    const pendingClaims = claims.filter((claim) => claim.status === 'pending').length;

    return {
      totalReports: reports.length,
      verifiedReports,
      pendingReports,
      claimedItems: claimedItems.size,
      pendingClaims,
    };
  }, [reports, claims, items]);

  const categoryStats = useMemo(() => {
    const source = [...reports, ...items];
    const total = Math.max(source.length, 1);
    const counts = source.reduce((acc, item) => {
      const category = item.category || 'Lainnya';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, count]) => ({
        label,
        count,
        value: Math.round((count / total) * 100),
      }));
  }, [reports, items]);

  const chartBars = useMemo(() => {
    const source = [...reports, ...claims];
    const counts = Array.from({ length: 7 }, () => 0);

    source.forEach((entry) => {
      const timestamp = parseLooseDate(entry.reportTime || entry.claimDate || entry.time, dashboardNow);
      if (!timestamp) return;

      const age = Math.floor((dashboardNow - timestamp) / 86400000);
      if (age >= 0 && age < 7) {
        counts[6 - age] += 1;
      }
    });

    if (!counts.some(Boolean)) {
      source.slice(0, 7).forEach((_, index) => {
        counts[index] += 1;
      });
    }

    const max = Math.max(...counts, 1);
    return counts.map((count) => ({
      count,
      height: Math.max(12, Math.round((count / max) * 100)),
    }));
  }, [reports, claims, dashboardNow]);

  const recentActivities = useMemo(() => {
    const reportActivities = reports.map((report) => ({
      id: `report-${report.id}`,
      icon: FileText,
      timestamp: parseLooseDate(report.reportTime || report.time, dashboardNow),
      text: `${report.reporterName || 'Pelapor'} membuat laporan ${report.tag?.toLowerCase() || 'barang'}: ${report.name}.`,
      meta: `${formatActivityTime(report.reportTime || report.time, dashboardNow)} - Ref: ${report.id}`,
      badge: statusLabel[report.status] || report.tag || 'Laporan',
      tone: statusTone[report.status] || 'gray',
      link: `/admin/verification/${report.id}`,
    }));

    const claimActivities = claims.map((claim) => ({
      id: `claim-${claim.id}`,
      icon: claim.status === 'approved' ? CheckCircle2 : ShieldCheck,
      timestamp: parseLooseDate(claim.claimDate, dashboardNow),
      text: `${claim.ownerName || 'Pengguna'} mengirim klaim untuk ${claim.itemName}.`,
      meta: `${formatActivityTime(claim.claimDate, dashboardNow)} - Ref: ${claim.id}`,
      badge: statusLabel[claim.status] || 'Klaim',
      tone: statusTone[claim.status] || 'gray',
      link: `/admin/claims/${claim.id}`,
    }));

    const itemActivities = items.map((item) => ({
      id: `item-${item.id}`,
      icon: item.claimStatus === 'claimed' ? CheckCircle2 : (item.status === 'found' ? PackageCheck : RotateCcw),
      timestamp: parseLooseDate(item.time, dashboardNow),
      text: item.claimStatus === 'claimed'
        ? `${item.name} sudah diklaim oleh ${item.claimantName || 'pemilik'}.`
        : `${item.name} masuk katalog barang ${item.status === 'found' ? 'ditemukan' : 'hilang'}.`,
      meta: `${formatActivityTime(item.time, dashboardNow)} - Ref: ${item.id}`,
      badge: item.claimStatus === 'claimed' ? 'Claimed' : (item.status === 'found' ? 'Ditemukan' : 'Hilang'),
      tone: item.claimStatus === 'claimed' ? 'green' : (statusTone[item.status] || 'gray'),
      link: `/item/${item.id}`,
    }));

    return [...reportActivities, ...claimActivities, ...itemActivities]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 6);
  }, [reports, claims, items, dashboardNow]);

  const emptyCategories = categoryStats.length === 0;

  const categoryRows = emptyCategories
    ? [{ label: 'Belum ada kategori', count: 0, value: 0 }]
    : categoryStats;

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
          <MetricCard label="TOTAL LAPORAN" value={stats.totalReports.toLocaleString('id-ID')} note={`${items.length} barang tampil di katalog`} icon={Archive} tone="green" />
          <MetricCard label="DIVERIFIKASI" value={stats.verifiedReports.toLocaleString('id-ID')} note="Laporan disetujui admin" icon={ShieldCheck} tone="neutral" />
          <MetricCard label="PENDING" value={stats.pendingReports.toLocaleString('id-ID')} note="Menunggu verifikasi laporan" icon={Clock3} tone="red" />
          <MetricCard label="KLAIM MASUK" value={claims.length.toLocaleString('id-ID')} note={`${stats.pendingClaims} pending, ${stats.claimedItems} disetujui`} icon={Camera} tone="neutral" />
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
                <span key={index} title={`${bar.count} aktivitas`} style={{ '--bar-height': `${bar.height}%` }} />
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
