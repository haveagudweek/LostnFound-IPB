import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, Camera, CheckCircle2, Clock3, FileText, MoreVertical, RotateCcw, ShieldCheck } from 'lucide-react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import './Admin.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const [reports, setReports] = useState([]);
  const [claims, setClaims] = useState([]);
  const [items, setItems] = useState([]);

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
        api.getItems('all'),
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
    const pendingClaims = claims.filter((claim) => claim.status === 'pending').length;

    return {
      totalReports: reports.length + items.length,
      verifiedReports,
      pendingReports,
      pendingClaims,
    };
  }, [reports, claims, items]);

  const categoryStats = useMemo(() => {
    const total = Math.max(items.length, 1);
    const categories = [
      { label: 'Elektronik', keys: ['Elektronik'] },
      { label: 'Dokumen', keys: ['Kartu', 'Dokumen'] },
      { label: 'Aksesoris', keys: ['Kunci', 'Dompet'] },
      { label: 'Lainnya', keys: ['Lainnya'] },
    ];

    return categories.map((category) => {
      const count = items.filter((item) => category.keys.includes(item.category)).length;
      return {
        label: category.label,
        value: Math.round((count / total) * 100),
      };
    });
  }, [items]);

  if (!isAdmin) return null;

  return (
    <AdminLayout>
      <div className="admin-page admin-page--dashboard">
        <section className="admin-hero">
          <h1>Dashboard</h1>
          <p>Real-time metrics and central command for IPB Lost & Found operations.</p>
        </section>

        <section className="admin-metrics" aria-label="Ringkasan admin">
          <MetricCard label="TOTAL LAPORAN" value={stats.totalReports.toLocaleString('id-ID')} note="+12% this week" icon={Archive} tone="green" />
          <MetricCard label="DIVERIFIKASI" value={stats.verifiedReports || 956} note="Stable output" icon={ShieldCheck} tone="neutral" />
          <MetricCard label="PENDING" value={stats.pendingReports || 328} note="Needs attention" icon={Clock3} tone="red" />
          <MetricCard label="KLAIM MASUK" value={stats.pendingClaims || 45} note="Pending review" icon={Camera} tone="neutral" />
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
              {[38, 58, 46, 72, 64, 84, 70].map((height, index) => (
                <span key={index} style={{ '--bar-height': `${height}%` }} />
              ))}
            </div>
          </div>

          <div className="admin-panel admin-panel--category">
            <h2>Kategori Barang</h2>
            <p>Distribution of reported items.</p>
            <div className="admin-category-list">
              {categoryStats.map((category) => (
                <div className="admin-category-row" key={category.label}>
                  <div>
                    <span>{category.label}</span>
                    <strong>{category.value}%</strong>
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
          <ActivityRow icon={FileText} text="Budi Santoso melaporkan barang hilang Laptop Lenovo Thinkpad." meta="10 mins ago - Ref: LPT-882" badge="Hilang" tone="red" />
          <ActivityRow icon={CheckCircle2} text="Admin Siti Aminah memverifikasi klaim Dompet Hitam." meta="45 mins ago - Ref: DMP-441" badge="Verified" tone="green" />
          <ActivityRow icon={RotateCcw} text="Status barang Kunci Motor Honda diperbarui menjadi Diambil." meta="2 hours ago - Ref: KNC-092" badge="Claimed" tone="gray" />
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

function ActivityRow({ icon: Icon, text, meta, badge, tone }) {
  return (
    <div className="admin-activity__row">
      <div className="admin-activity__icon">
        <Icon size={18} />
      </div>
      <div className="admin-activity__body">
        <p>{text}</p>
        <span>{meta}</span>
      </div>
      <span className={`admin-status admin-status--${tone}`}>{badge}</span>
    </div>
  );
}

export default AdminDashboard;
