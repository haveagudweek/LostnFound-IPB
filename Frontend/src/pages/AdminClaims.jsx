import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import './Admin.css';

function AdminClaims() {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }

    let cancelled = false;
    async function fetchClaims() {
      setLoading(true);
      const data = await api.getClaims();
      if (!cancelled) {
        setClaims(data.filter((claim) => claim.status === 'pending'));
        setLoading(false);
      }
    }

    fetchClaims();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  return (
    <AdminLayout>
      <div className="admin-page">
        <section className="admin-claim-list-header">
          <h1>ANTREAN KLAIM</h1>
        </section>

        {loading ? (
          <div className="admin-loading">
            <Loader2 className="spin" size={42} />
          </div>
        ) : (
          <section className="admin-claim-list">
            {claims.map((claim) => (
              <button className="admin-claim-card" key={claim.id} onClick={() => navigate(`/admin/claims/${claim.id}`)}>
                <span className="admin-claim-card__ref">#{claim.id}</span>
                <div className="admin-claim-card__body">
                  <img src={claim.image} alt={claim.itemName} />
                  <div>
                    <strong>{claim.itemName}</strong>
                    <span>{claim.ownerName}</span>
                    <small>{claim.foundDate} - {claim.foundTime}</small>
                  </div>
                </div>
                <span className="admin-status admin-status--red">Pending</span>
              </button>
            ))}
          </section>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminClaims;
