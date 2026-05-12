import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShieldCheck, FileText, CheckCircle, Users } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import './Admin.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuthStore();
  const [stats, setStats] = useState({ pending: 0, verified: 0, totalUsers: 24, totalItems: 0 });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    
    // Fetch some mock stats
    const fetchStats = async () => {
      const reports = await api.getVerificationReports();
      const items = await api.getItems('all');
      setStats({
        pending: reports.filter(r => r.status === 'pending_verification').length,
        verified: reports.filter(r => r.status === 'verified').length,
        totalUsers: 142,
        totalItems: items.length
      });
    };
    fetchStats();
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  return (
    <main className="admin-page">
      <div className="admin-sidebar">
        <div className="admin-brand">
          <Package size={24} /> SEEKEM Admin
        </div>
        <nav className="admin-nav">
          <a href="#" className="active"><Package size={20} /> Dashboard</a>
          <button onClick={() => navigate('/admin/verification')} className="admin-nav-item">
            <ShieldCheck size={20} /> Verifikasi Laporan
            {stats.pending > 0 && <span className="admin-badge">{stats.pending}</span>}
          </button>
          <a href="#"><FileText size={20} /> Kelola Klaim</a>
          <a href="#"><Users size={20} /> Pengguna</a>
        </nav>
      </div>

      <div className="admin-content">
        <div className="admin-header">
          <h2>Dashboard Overview</h2>
          <p>Selamat datang, {user?.name}</p>
        </div>

        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="stat-icon pending"><FileText size={24} /></div>
            <div className="stat-info">
              <h3>{stats.pending}</h3>
              <p>Menunggu Verifikasi</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon verified"><CheckCircle size={24} /></div>
            <div className="stat-info">
              <h3>{stats.verified}</h3>
              <p>Laporan Terverifikasi</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon total"><Package size={24} /></div>
            <div className="stat-info">
              <h3>{stats.totalItems}</h3>
              <p>Total Barang</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon users"><Users size={24} /></div>
            <div className="stat-info">
              <h3>{stats.totalUsers}</h3>
              <p>Total Pengguna</p>
            </div>
          </div>
        </div>
        
        <div className="admin-recent-activity">
          <h3>Aktivitas Terbaru</h3>
          <div className="activity-placeholder">
            <p>Belum ada aktivitas hari ini.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdminDashboard;
