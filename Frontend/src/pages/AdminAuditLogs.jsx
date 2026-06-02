import { useEffect, useMemo, useState } from 'react';
import { Activity, ChevronDown, ChevronLeft, ChevronRight, History, Loader2, Search } from 'lucide-react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import './Admin.css';

const successOptions = [
  { value: 'all', label: 'Semua Status' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
];

function formatDateTime(value) {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}

function formatDetail(value) {
  if (!value) return '-';

  try {
    const parsed = JSON.parse(value);
    return Object.entries(parsed)
      .map(([key, entry]) => `${key}: ${Array.isArray(entry) ? entry.join(', ') : entry}`)
      .join(' | ');
  } catch {
    return value;
  }
}

function labelFromAction(action = '') {
  return action
    .split('.')
    .map((part) => part.replace(/_/g, ' '))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' / ');
}

function AdminAuditLogs() {
  const { isAdmin } = useAuthStore();
  const [activeView, setActiveView] = useState('audit');
  const [logs, setLogs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [successFilter, setSuccessFilter] = useState('all');
  const [activityResourceFilter, setActivityResourceFilter] = useState('all');
  const [activityStatusFilter, setActivityStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [activityQuery, setActivityQuery] = useState('');

  useEffect(() => {
    if (!isAdmin) return;

    let cancelled = false;

    async function fetchLogs() {
      setLoading(true);
      setActivityLoading(true);
      try {
        const [auditData, activityData] = await Promise.all([
          api.getAuditLogs({ limit: 250 }),
          api.getActivityLogs({ limit: 250 }),
        ]);

        if (!cancelled) {
          setLogs(auditData);
          setActivities(activityData);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setActivityLoading(false);
        }
      }
    }

    fetchLogs();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const actionOptions = useMemo(() => {
    const actions = [...new Set(logs.map((log) => log.action).filter(Boolean))];
    return ['all', ...actions.sort((a, b) => a.localeCompare(b))];
  }, [logs]);

  const resourceOptions = useMemo(() => {
    const resources = [...new Set(logs.map((log) => log.resource_type).filter(Boolean))];
    return ['all', ...resources.sort((a, b) => a.localeCompare(b))];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const term = query.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const matchesResource = resourceFilter === 'all' || log.resource_type === resourceFilter;
      const matchesSuccess = successFilter === 'all'
        || (successFilter === 'success' && log.success)
        || (successFilter === 'failed' && !log.success);
      const matchesQuery = !term || [
        log.actor_email,
        log.action,
        log.resource_type,
        log.resource_id,
        log.detail,
        log.ip_address,
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(term));

      return matchesAction && matchesResource && matchesSuccess && matchesQuery;
    });
  }, [logs, actionFilter, resourceFilter, successFilter, query]);

  const activityResourceOptions = useMemo(() => {
    const resources = [...new Set(activities.map((activityLog) => activityLog.resource_type).filter(Boolean))];
    return ['all', ...resources.sort((a, b) => a.localeCompare(b))];
  }, [activities]);

  const activityStatusOptions = useMemo(() => {
    const statuses = [...new Set(activities.map((activityLog) => activityLog.status).filter(Boolean))];
    return ['all', ...statuses.sort((a, b) => a.localeCompare(b))];
  }, [activities]);

  const filteredActivities = useMemo(() => {
    const term = activityQuery.trim().toLowerCase();

    return activities.filter((activityLog) => {
      const matchesResource = activityResourceFilter === 'all' || activityLog.resource_type === activityResourceFilter;
      const matchesStatus = activityStatusFilter === 'all' || activityLog.status === activityStatusFilter;
      const matchesQuery = !term || [
        activityLog.title,
        activityLog.description,
        activityLog.actor_name,
        activityLog.actor_email,
        activityLog.status,
        activityLog.resource_type,
        activityLog.resource_id,
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(term));

      return matchesResource && matchesStatus && matchesQuery;
    });
  }, [activities, activityResourceFilter, activityStatusFilter, activityQuery]);

  if (!isAdmin) return null;

  return (
    <AdminLayout searchPlaceholder="Cari log...">
      <div className="admin-page admin-page--wide">
        <section className="admin-list-header">
          <div>
            <span>LOG CENTER</span>
            <h1>Riwayat Sistem</h1>
            <p>Lacak audit keamanan dan aktivitas operasional aplikasi dari satu halaman.</p>
          </div>
        </section>

        <section className="admin-log-tabs" aria-label="Pilihan jenis log">
          <button
            type="button"
            className={activeView === 'audit' ? 'is-active' : ''}
            onClick={() => setActiveView('audit')}
          >
            <History size={16} />
            Audit Log
          </button>
          <button
            type="button"
            className={activeView === 'activity' ? 'is-active' : ''}
            onClick={() => setActiveView('activity')}
          >
            <Activity size={16} />
            Activity Log
          </button>
        </section>

        {activeView === 'audit' ? (
          <AuditLogPanel
            actionFilter={actionFilter}
            actionOptions={actionOptions}
            filteredLogs={filteredLogs}
            loading={loading}
            logs={logs}
            query={query}
            resourceFilter={resourceFilter}
            resourceOptions={resourceOptions}
            setActionFilter={setActionFilter}
            setQuery={setQuery}
            setResourceFilter={setResourceFilter}
            setSuccessFilter={setSuccessFilter}
            successFilter={successFilter}
          />
        ) : (
          <ActivityLogPanel
            activities={activities}
            activityLoading={activityLoading}
            activityQuery={activityQuery}
            activityResourceFilter={activityResourceFilter}
            activityResourceOptions={activityResourceOptions}
            activityStatusFilter={activityStatusFilter}
            activityStatusOptions={activityStatusOptions}
            filteredActivities={filteredActivities}
            setActivityQuery={setActivityQuery}
            setActivityResourceFilter={setActivityResourceFilter}
            setActivityStatusFilter={setActivityStatusFilter}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function AuditLogPanel({
  actionFilter,
  actionOptions,
  filteredLogs,
  loading,
  logs,
  query,
  resourceFilter,
  resourceOptions,
  setActionFilter,
  setQuery,
  setResourceFilter,
  setSuccessFilter,
  successFilter,
}) {
  return (
    <>
      <section className="admin-metrics admin-metrics--compact" aria-label="Ringkasan audit log">
        <AuditMetric label="TOTAL EVENT" value={logs.length} />
        <AuditMetric label="SUCCESS" value={logs.filter((log) => log.success).length} />
        <AuditMetric label="FAILED" value={logs.filter((log) => !log.success).length} />
        <AuditMetric label="SIGNED" value={logs.filter((log) => log.signature_valid === true).length} />
      </section>

      <section className="admin-filter-card">
        <label className="admin-select">
          <select value={actionFilter} onChange={(event) => setActionFilter(event.target.value)}>
            {actionOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'Semua Action' : labelFromAction(option)}
              </option>
            ))}
          </select>
          <ChevronDown size={16} />
        </label>

        <label className="admin-select">
          <select value={resourceFilter} onChange={(event) => setResourceFilter(event.target.value)}>
            {resourceOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'Semua Resource' : option}
              </option>
            ))}
          </select>
          <ChevronDown size={16} />
        </label>

        <label className="admin-select">
          <select value={successFilter} onChange={(event) => setSuccessFilter(event.target.value)}>
            {successOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <ChevronDown size={16} />
        </label>

        <label className="admin-table-search">
          <Search size={16} />
          <input
            type="search"
            placeholder="Cari email, action, detail..."
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
        ) : filteredLogs.length ? (
          <>
            <table className="admin-table admin-table--audit">
              <thead>
                <tr>
                  <th>WAKTU</th>
                  <th>ACTOR</th>
                  <th>ACTION</th>
                  <th>RESOURCE</th>
                  <th>DETAIL</th>
                  <th>IP</th>
                  <th>STATUS</th>
                  <th>INTEGRITY</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDateTime(log.created_at)}</td>
                    <td>{log.actor_email || '-'}</td>
                    <td><span className="admin-pill">{labelFromAction(log.action)}</span></td>
                    <td>
                      {log.resource_type ? (
                        <span>{log.resource_type} #{log.resource_id || '-'}</span>
                      ) : '-'}
                    </td>
                    <td className="admin-audit-detail">{formatDetail(log.detail)}</td>
                    <td>{log.ip_address || '-'}</td>
                    <td>
                      <span className={`admin-status ${log.success ? 'admin-status--green' : 'admin-status--red'}`}>
                        {log.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td><SignatureStatusBadge signatureValid={log.signature_valid} /></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <footer className="admin-table-footer">
              <span>Menampilkan {filteredLogs.length ? `1-${filteredLogs.length}` : '0'} dari {logs.length} event</span>
              <div className="admin-pagination">
                <button aria-label="Halaman sebelumnya"><ChevronLeft size={15} /></button>
                <button className="is-active">1</button>
                <button aria-label="Halaman berikutnya"><ChevronRight size={15} /></button>
              </div>
            </footer>
          </>
        ) : (
          <div className="admin-empty">Belum ada audit log yang sesuai filter.</div>
        )}
      </section>
    </>
  );
}

function SignatureStatusBadge({ signatureValid }) {
  if (signatureValid === true) {
    return <span className="admin-status admin-status--green">Valid</span>;
  }

  if (signatureValid === false) {
    return <span className="admin-status admin-status--red">Invalid</span>;
  }

  return <span className="admin-status admin-status--gray">Unsigned</span>;
}

function ActivityLogPanel({
  activities,
  activityLoading,
  activityQuery,
  activityResourceFilter,
  activityResourceOptions,
  activityStatusFilter,
  activityStatusOptions,
  filteredActivities,
  setActivityQuery,
  setActivityResourceFilter,
  setActivityStatusFilter,
}) {
  return (
    <>
      <section className="admin-metrics admin-metrics--compact" aria-label="Ringkasan activity log">
        <ActivityMetric label="TOTAL ACTIVITY" value={activities.length} />
        <ActivityMetric label="LAPORAN" value={activities.filter((item) => item.resource_type === 'laporan').length} />
        <ActivityMetric label="KLAIM" value={activities.filter((item) => item.resource_type === 'klaim').length} />
        <ActivityMetric label="PENDING" value={activities.filter((item) => item.status === 'pending').length} />
      </section>

      <section className="admin-filter-card">
        <label className="admin-select">
          <select value={activityResourceFilter} onChange={(event) => setActivityResourceFilter(event.target.value)}>
            {activityResourceOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'Semua Resource' : option}
              </option>
            ))}
          </select>
          <ChevronDown size={16} />
        </label>

        <label className="admin-select">
          <select value={activityStatusFilter} onChange={(event) => setActivityStatusFilter(event.target.value)}>
            {activityStatusOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'Semua Status' : option}
              </option>
            ))}
          </select>
          <ChevronDown size={16} />
        </label>

        <label className="admin-table-search">
          <Search size={16} />
          <input
            type="search"
            placeholder="Cari aktivitas, aktor, status..."
            value={activityQuery}
            onChange={(event) => setActivityQuery(event.target.value)}
          />
        </label>
      </section>

      <section className="admin-table-card">
        {activityLoading ? (
          <div className="admin-loading">
            <Loader2 className="spin" size={42} />
          </div>
        ) : filteredActivities.length ? (
          <>
            <table className="admin-table admin-table--activity">
              <thead>
                <tr>
                  <th>WAKTU</th>
                  <th>AKTIVITAS</th>
                  <th>ACTOR</th>
                  <th>RESOURCE</th>
                  <th>DETAIL</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((activityLog) => (
                  <tr key={activityLog.id}>
                    <td>{formatDateTime(activityLog.created_at)}</td>
                    <td>
                      <div className="admin-audit-title">
                        <strong>{activityLog.title}</strong>
                        <span>{labelFromAction(activityLog.event_type)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="admin-audit-title">
                        <strong>{activityLog.actor_name || '-'}</strong>
                        <span>{activityLog.actor_email || '-'}</span>
                      </div>
                    </td>
                    <td>{activityLog.resource_type} #{activityLog.resource_id}</td>
                    <td className="admin-audit-detail">{activityLog.description || '-'}</td>
                    <td><ActivityStatusBadge status={activityLog.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <footer className="admin-table-footer">
              <span>Menampilkan {filteredActivities.length ? `1-${filteredActivities.length}` : '0'} dari {activities.length} aktivitas</span>
              <div className="admin-pagination">
                <button aria-label="Halaman sebelumnya"><ChevronLeft size={15} /></button>
                <button className="is-active">1</button>
                <button aria-label="Halaman berikutnya"><ChevronRight size={15} /></button>
              </div>
            </footer>
          </>
        ) : (
          <div className="admin-empty">Belum ada activity log yang sesuai filter.</div>
        )}
      </section>
    </>
  );
}

function ActivityStatusBadge({ status }) {
  if (status === 'published' || status === 'resolved' || status === 'approved' || status === 'success') {
    return <span className="admin-status admin-status--green">{status}</span>;
  }

  if (status === 'rejected' || status === 'deleted' || status === 'cancelled') {
    return <span className="admin-status admin-status--gray">{status}</span>;
  }

  if (status === 'claimed' || status === 'held') {
    return <span className="admin-status admin-status--green">{status}</span>;
  }

  return <span className="admin-status admin-status--red">{status}</span>;
}

function AuditMetric({ label, value }) {
  return (
    <article className="admin-metric admin-metric--compact">
      <div className="admin-metric__top">
        <span>{label}</span>
        <History size={20} />
      </div>
      <strong>{value.toLocaleString('id-ID')}</strong>
    </article>
  );
}

function ActivityMetric({ label, value }) {
  return (
    <article className="admin-metric admin-metric--compact">
      <div className="admin-metric__top">
        <span>{label}</span>
        <Activity size={20} />
      </div>
      <strong>{value.toLocaleString('id-ID')}</strong>
    </article>
  );
}

export default AdminAuditLogs;
