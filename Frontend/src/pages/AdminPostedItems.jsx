import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff, Loader2, PackageCheck, Search, Trash2 } from 'lucide-react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { api } from '../services/api';
import './Admin.css';

const statusOptions = [
  { value: 'all', label: 'Semua Status' },
  { value: 'found', label: 'Ditemukan' },
  { value: 'lost', label: 'Hilang' },
  { value: 'held', label: 'Hold Posting' },
];

function itemStatusLabel(item) {
  if (item.postingStatus === 'held') return 'Hold';
  if (item.claimStatus === 'claimed') return 'Claimed';
  return item.status === 'found' ? 'Ditemukan' : 'Hilang';
}

function itemStatusClass(item) {
  if (item.postingStatus === 'held') return 'admin-status--gray';
  if (item.claimStatus === 'claimed') return 'admin-status--green';
  return item.status === 'found' ? 'admin-status--green' : 'admin-status--red';
}

function AdminPostedItems() {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const addToast = useUIStore((state) => state.addToast);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('Semua Kategori');
  const [query, setQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [openActionMenu, setOpenActionMenu] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }

    let cancelled = false;

    async function fetchItems() {
      setLoading(true);
      try {
        const data = await api.getPostedItems();
        if (!cancelled) setItems(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchItems();

    return () => {
      cancelled = true;
    };
  }, [isAdmin, navigate]);

  const postedItems = useMemo(() =>
    items.filter((item) => item.claimStatus !== 'claimed'),
  [items]);

  const categoryOptions = useMemo(() => {
    const categories = [...new Set(postedItems.map((item) => item.category).filter(Boolean))];
    return ['Semua Kategori', ...categories.sort((a, b) => a.localeCompare(b))];
  }, [postedItems]);

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase();

    return postedItems.filter((item) => {
      const matchesStatus = statusFilter === 'all'
        || item.status === statusFilter
        || (statusFilter === 'held' && item.postingStatus === 'held');
      const matchesCategory = categoryFilter === 'Semua Kategori' || item.category === categoryFilter;
      const matchesQuery = !term || [item.id, item.name, item.category, item.location, item.reporterName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));

      return matchesStatus && matchesCategory && matchesQuery;
    });
  }, [postedItems, statusFilter, categoryFilter, query]);

  const totals = useMemo(() => ({
    all: postedItems.length,
    found: postedItems.filter((item) => item.status === 'found').length,
    lost: postedItems.filter((item) => item.status === 'lost').length,
    held: postedItems.filter((item) => item.postingStatus === 'held').length,
    claimed: items.filter((item) => item.claimStatus === 'claimed').length,
  }), [items, postedItems]);

  if (!isAdmin) return null;

  const refreshItems = async () => {
    const data = await api.getPostedItems();
    setItems(data);
  };

  const handleItemAction = async (event, item, action) => {
    event.stopPropagation();
    setOpenActionMenu(null);
    setActionLoading(`${action}-${item.id}`);

    try {
      await api.managePostedItem(item.id, action);
      await refreshItems();
      const message = action === 'hold'
        ? 'Posting barang berhasil di-hold.'
        : action === 'post'
          ? 'Posting barang berhasil ditampilkan kembali.'
          : 'Posting barang berhasil dihapus.';
      addToast(message, 'success');
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout searchPlaceholder="Cari barang diposting...">
      <div className="admin-page">
        <section className="admin-list-header">
          <div>
            <span>BARANG DIPOSTING</span>
            <h1>Kelola Posting Barang</h1>
            <p>Daftar barang katalog yang aktif maupun sedang di-hold oleh admin.</p>
          </div>
        </section>

        <section className="admin-metrics admin-metrics--compact" aria-label="Ringkasan barang diposting">
          <PostedMetric label="TOTAL" value={totals.all} />
          <PostedMetric label="DITEMUKAN" value={totals.found} />
          <PostedMetric label="HILANG" value={totals.lost} />
          <PostedMetric label="HOLD" value={totals.held} />
        </section>

        <section className="admin-filter-card">
          <label className="admin-select">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </label>

          <label className="admin-select">
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              {categoryOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </label>

          <label className="admin-table-search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Cari barang, lokasi, pelapor..."
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
          ) : filteredItems.length ? (
            <>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ITEM ID</th>
                    <th>NAMA BARANG</th>
                    <th>KATEGORI</th>
                    <th>LOKASI</th>
                    <th>WAKTU</th>
                    <th>PELAPOR</th>
                    <th>STATUS</th>
                    <th>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} onClick={() => navigate(`/item/${item.id}`)}>
                      <td>#{item.id}</td>
                      <td>
                        <div className="admin-item-cell">
                          <span><PackageCheck size={16} /></span>
                          <strong>{item.name}</strong>
                        </div>
                      </td>
                      <td><span className="admin-pill">{item.category || '-'}</span></td>
                      <td>{item.location || '-'}</td>
                      <td>{item.time || '-'}</td>
                      <td>{item.reporterName || '-'}</td>
                      <td><span className={`admin-status ${itemStatusClass(item)}`}>{itemStatusLabel(item)}</span></td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            type="button"
                            className="admin-mini-action admin-mini-action--dropdown"
                            disabled={Boolean(actionLoading)}
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenActionMenu((current) => (current === item.id ? null : item.id));
                            }}
                          >
                            {actionLoading?.endsWith(`-${item.id}`) ? <Loader2 className="spin" size={14} /> : 'Ubah'}
                          </button>
                          {openActionMenu === item.id && (
                            <div className="admin-status-menu">
                              <button
                                type="button"
                                disabled={item.postingStatus === 'held'}
                                onClick={(event) => handleItemAction(event, item, 'hold')}
                              >
                                <EyeOff size={14} />
                                Hold posting
                              </button>
                              <button
                                type="button"
                                disabled={item.postingStatus !== 'held'}
                                onClick={(event) => handleItemAction(event, item, 'post')}
                              >
                                <Eye size={14} />
                                Posting
                              </button>
                              <button
                                type="button"
                                onClick={(event) => handleItemAction(event, item, 'delete')}
                              >
                                <Trash2 size={14} />
                                Hapus
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <footer className="admin-table-footer">
                <span>Menampilkan 1-{filteredItems.length} dari {postedItems.length} barang terdata</span>
                <div className="admin-pagination">
                  <button aria-label="Halaman sebelumnya"><ChevronLeft size={15} /></button>
                  <button className="is-active">1</button>
                  <button aria-label="Halaman berikutnya"><ChevronRight size={15} /></button>
                </div>
              </footer>
            </>
          ) : (
            <div className="admin-empty">Belum ada barang yang sesuai filter.</div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}

function PostedMetric({ label, value }) {
  return (
    <article className="admin-metric admin-metric--compact">
      <div className="admin-metric__top">
        <span>{label}</span>
        <PackageCheck size={20} />
      </div>
      <strong>{value.toLocaleString('id-ID')}</strong>
    </article>
  );
}

export default AdminPostedItems;
