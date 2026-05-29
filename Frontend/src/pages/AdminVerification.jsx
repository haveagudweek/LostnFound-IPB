import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Download, Laptop, Loader2, Search, WalletCards } from 'lucide-react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import './Admin.css';

const statusTabs = [
  { key: 'all', label: 'Semua' },
  { key: 'pending_verification', label: 'Pending' },
  { key: 'verified', label: 'Verified' },
  { key: 'rejected', label: 'Rejected' },
];

function AdminVerification() {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Semua Kategori');
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }

    let cancelled = false;
    async function fetchReports() {
      setLoading(true);
      const data = await api.getVerificationReports();
      if (!cancelled) {
        setReports(data);
        setLoading(false);
      }
    }

    fetchReports();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, navigate]);

  const filteredReports = useMemo(() => {
    const loweredQuery = query.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesCategory = category === 'Semua Kategori' || report.category === category;
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesQuery = !loweredQuery
        || report.id.toLowerCase().includes(loweredQuery)
        || report.name.toLowerCase().includes(loweredQuery)
        || report.location.toLowerCase().includes(loweredQuery);

      return matchesCategory && matchesStatus && matchesQuery;
    });
  }, [reports, category, statusFilter, query]);

  const categoryOptions = useMemo(() => {
    const categories = [...new Set(reports.map((report) => report.category).filter(Boolean))];
    return ['Semua Kategori', ...categories.sort((a, b) => a.localeCompare(b))];
  }, [reports]);

  if (!isAdmin) return null;

  return (
    <AdminLayout>
      <div className="admin-page">
        <section className="admin-list-header">
          <div>
            <span>LAPORAN MASUK</span>
            <h1>Manajemen Laporan</h1>
            <p>Verifikasi dan kelola laporan barang temuan dari civitas akademika.</p>
          </div>
          <button className="admin-export-btn">
            <Download size={16} />
            Ekspor CSV
          </button>
        </section>

        <section className="admin-filter-card">
          <label className="admin-select">
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categoryOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </label>

          <div className="admin-segmented">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                className={statusFilter === tab.key ? 'is-active' : ''}
                onClick={() => setStatusFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <label className="admin-table-search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Cari no referensi atau nama..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </section>

        <section className="admin-table-card">
          {loading ? (
            <div className="admin-loading">
              <Loader2 className="spin" size={42} />
            </div>
          ) : (
            <>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>REF ID</th>
                    <th>NAMA BARANG</th>
                    <th>KATEGORI</th>
                    <th>LOKASI TEMUAN</th>
                    <th>TANGGAL</th>
                    <th>TAG</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.id} onClick={() => navigate(`/admin/verification/${report.id}`)}>
                      <td>#{report.id}</td>
                      <td>
                        <div className="admin-item-cell">
                          <span>{report.category === 'Elektronik' ? <Laptop size={16} /> : <WalletCards size={16} />}</span>
                          <strong>{report.name}</strong>
                        </div>
                      </td>
                      <td><span className="admin-pill">{report.category}</span></td>
                      <td>{report.location}</td>
                      <td>{report.time}</td>
                      <td><span className="admin-pill">{report.tag}</span></td>
                      <td><StatusBadge status={report.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <footer className="admin-table-footer">
                <span>Menampilkan {filteredReports.length ? `1-${filteredReports.length}` : '0'} dari {reports.length} laporan</span>
                <div className="admin-pagination">
                  <button aria-label="Halaman sebelumnya"><ChevronLeft size={15} /></button>
                  <button className="is-active">1</button>
                  <button>2</button>
                  <button>3</button>
                  <span>...</span>
                  <button aria-label="Halaman berikutnya"><ChevronRight size={15} /></button>
                </div>
              </footer>
            </>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}

function StatusBadge({ status }) {
  if (status === 'verified') {
    return <span className="admin-status admin-status--green">Verified</span>;
  }

  if (status === 'rejected') {
    return <span className="admin-status admin-status--gray">Rejected</span>;
  }

  return <span className="admin-status admin-status--red">Pending</span>;
}

export default AdminVerification;
