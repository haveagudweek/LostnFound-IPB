import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  Loader2,
  MapPin,
  PackageCheck,
  Search,
  ShieldCheck,
  Tag,
  XCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import './History.css';

const statusConfig = {
  pending_verification: {
    label: 'Menunggu Verifikasi',
    tone: 'warning',
    icon: Clock3,
    description: 'Laporan sedang dicek admin sebelum tampil ke katalog.',
  },
  verified: {
    label: 'Terverifikasi',
    tone: 'success',
    icon: CheckCircle2,
    description: 'Laporan sudah disetujui dan dapat ditindaklanjuti.',
  },
  rejected: {
    label: 'Ditolak',
    tone: 'danger',
    icon: XCircle,
    description: 'Laporan atau klaim tidak lolos verifikasi admin.',
  },
  pending: {
    label: 'Klaim Diproses',
    tone: 'warning',
    icon: Clock3,
    description: 'Klaim sedang diperiksa oleh admin.',
  },
  approved: {
    label: 'Klaim Disetujui',
    tone: 'success',
    icon: ShieldCheck,
    description: 'Klaim sudah disetujui. Ikuti instruksi pengambilan dari admin.',
  },
};

const tabs = [
  { id: 'all', label: 'Semua' },
  { id: 'report', label: 'Laporan' },
  { id: 'claim', label: 'Klaim' },
];

function getStatusMeta(status) {
  return statusConfig[status] || {
    label: 'Status Tidak Diketahui',
    tone: 'neutral',
    icon: AlertCircle,
    description: 'Status belum tersedia.',
  };
}

function normalizeEntries(reports, claims) {
  const reportEntries = reports.map((report) => ({
    id: report.id,
    kind: 'report',
    kindLabel: report.tag === 'Hilang' ? 'Laporan Hilang' : 'Laporan Temuan',
    title: report.name,
    category: report.category,
    location: report.location,
    detailLocation: report.detailLocation,
    time: report.time,
    submittedAt: report.reportTime,
    status: report.status,
    image: report.image,
    description: report.description,
    referenceId: report.id,
    actionPath: report.status === 'verified' && report.reportId ? `/item/${report.reportId}` : null,
  }));

  const claimEntries = claims.map((claim) => ({
    id: claim.id,
    kind: 'claim',
    kindLabel: 'Klaim Barang',
    title: claim.itemName,
    category: claim.category || 'Barang Klaim',
    location: claim.location,
    time: [claim.foundDate, claim.foundTime].filter(Boolean).join(', '),
    submittedAt: claim.claimDate,
    status: claim.status,
    image: claim.image,
    description: claim.description,
    referenceId: claim.id,
    actionPath: claim.itemId ? `/item/${claim.itemId}` : null,
    adminNote: claim.adminNote,
    history: claim.history,
  }));

  return [...reportEntries, ...claimEntries];
}

function History() {
  const user = useAuthStore((state) => state.user);
  const addToast = useUIStore((state) => state.addToast);
  const [history, setHistory] = useState({ reports: [], claims: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchHistory() {
      setLoading(true);
      try {
        const data = await api.getUserHistory(user);
        if (!cancelled) {
          setHistory({
            reports: data.reports || [],
            claims: data.claims || [],
          });
        }
      } catch (error) {
        addToast(error.message, 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [addToast, user]);

  const entries = useMemo(
    () => normalizeEntries(history.reports, history.claims),
    [history.claims, history.reports]
  );

  const filteredEntries = useMemo(() => {
    const term = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesTab = activeTab === 'all' || entry.kind === activeTab;
      const matchesQuery = !term || [entry.title, entry.category, entry.location, entry.referenceId]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
      return matchesTab && matchesQuery;
    });
  }, [activeTab, entries, query]);

  const selectedEntry = filteredEntries.find((entry) => entry.id === selectedId) || filteredEntries[0] || null;

  const totals = {
    all: entries.length,
    report: history.reports.length,
    claim: history.claims.length,
    pending: entries.filter((entry) => ['pending', 'pending_verification'].includes(entry.status)).length,
  };

  if (loading) {
    return (
      <main className="history-page">
        <div className="history-loading">
          <Loader2 className="spin" size={44} />
          <p>Memuat riwayat...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="history-page" id="history-page">
      <div className="container">
        <section className="history-hero" aria-labelledby="history-title">
          <div>
            <p className="history-hero__eyebrow">Riwayat Saya</p>
            <h1 id="history-title">Laporan dan klaim barang</h1>
            <p className="history-hero__subtitle">
              Pantau detail barang yang pernah Anda laporkan atau klaim beserta status verifikasi saat ini.
            </p>
          </div>
          <Link to="/report" className="history-hero__action">
            <FileText size={18} />
            <span>Buat Laporan</span>
          </Link>
        </section>

        <section className="history-stats" aria-label="Ringkasan riwayat">
          <div className="history-stat">
            <span>Total Aktivitas</span>
            <strong>{totals.all}</strong>
          </div>
          <div className="history-stat">
            <span>Laporan</span>
            <strong>{totals.report}</strong>
          </div>
          <div className="history-stat">
            <span>Klaim</span>
            <strong>{totals.claim}</strong>
          </div>
          <div className="history-stat">
            <span>Dalam Proses</span>
            <strong>{totals.pending}</strong>
          </div>
        </section>

        <section className="history-workspace" aria-label="Daftar dan detail riwayat">
          <div className="history-list-panel">
            <div className="history-toolbar">
              <div className="history-tabs" role="tablist" aria-label="Filter riwayat">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={activeTab === tab.id ? 'is-active' : ''}
                    onClick={() => setActiveTab(tab.id)}
                    type="button"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <label className="history-search">
                <Search size={16} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari barang atau lokasi"
                />
              </label>
            </div>

            {filteredEntries.length ? (
              <div className="history-list">
                {filteredEntries.map((entry) => {
                  const meta = getStatusMeta(entry.status);
                  const StatusIcon = meta.icon;
                  return (
                    <button
                      key={`${entry.kind}-${entry.id}`}
                      className={`history-entry ${selectedEntry?.id === entry.id ? 'is-selected' : ''}`}
                      onClick={() => setSelectedId(entry.id)}
                      type="button"
                    >
                      <img src={entry.image} alt={entry.title} />
                      <div className="history-entry__body">
                        <div className="history-entry__topline">
                          <span>{entry.kindLabel}</span>
                          <small>{entry.referenceId}</small>
                        </div>
                        <strong>{entry.title}</strong>
                        <p>{entry.location || 'Lokasi belum tersedia'}</p>
                        <span className={`history-status history-status--${meta.tone}`}>
                          <StatusIcon size={14} />
                          {meta.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="history-empty">
                <ClipboardList size={40} />
                <h2>Belum ada riwayat</h2>
                <p>Aktivitas yang sesuai filter akan muncul di sini.</p>
              </div>
            )}
          </div>

          <aside className="history-detail-panel" aria-label="Detail riwayat">
            {selectedEntry ? (
              <>
                <div className="history-detail__image">
                  <img src={selectedEntry.image} alt={selectedEntry.title} />
                </div>
                <div className="history-detail__header">
                  <span>{selectedEntry.kindLabel}</span>
                  <h2>{selectedEntry.title}</h2>
                  <code>{selectedEntry.referenceId}</code>
                </div>

                <div className="history-detail__status">
                  {(() => {
                    const meta = getStatusMeta(selectedEntry.status);
                    const StatusIcon = meta.icon;
                    return (
                      <>
                        <span className={`history-status history-status--${meta.tone}`}>
                          <StatusIcon size={15} />
                          {meta.label}
                        </span>
                        <p>{meta.description}</p>
                      </>
                    );
                  })()}
                </div>

                <dl className="history-detail__meta">
                  <div>
                    <dt><Tag size={15} /> Kategori</dt>
                    <dd>{selectedEntry.category || '-'}</dd>
                  </div>
                  <div>
                    <dt><MapPin size={15} /> Lokasi</dt>
                    <dd>{selectedEntry.detailLocation || selectedEntry.location || '-'}</dd>
                  </div>
                  <div>
                    <dt><Clock3 size={15} /> Waktu Kejadian</dt>
                    <dd>{selectedEntry.time || '-'}</dd>
                  </div>
                  <div>
                    <dt><PackageCheck size={15} /> Dikirim</dt>
                    <dd>{selectedEntry.submittedAt || '-'}</dd>
                  </div>
                </dl>

                <div className="history-detail__description">
                  <h3>Detail Barang</h3>
                  <p>{selectedEntry.description || 'Tidak ada deskripsi tambahan.'}</p>
                </div>

                {(selectedEntry.adminNote || selectedEntry.history) && (
                  <div className="history-detail__note">
                    <strong>Catatan Proses</strong>
                    <p>{selectedEntry.adminNote || selectedEntry.history}</p>
                  </div>
                )}

                {selectedEntry.actionPath && (
                  <Link to={selectedEntry.actionPath} className="history-detail__link">
                    Lihat Halaman Barang
                  </Link>
                )}
              </>
            ) : (
              <div className="history-empty history-empty--detail">
                <ClipboardList size={40} />
                <h2>Pilih riwayat</h2>
                <p>Detail barang dan status akan tampil di panel ini.</p>
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}

export default History;
