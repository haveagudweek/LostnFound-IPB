import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Briefcase,
  CreditCard,
  Key,
  Loader2,
  Package,
  PenLine,
  Shirt,
  Smartphone,
  Wallet,
  Watch,
} from 'lucide-react';
import { api } from '../services/api';
import { ITEM_CATEGORIES, categoryIdFromLabel } from '../data/catalog';
import './CategoriesPage.css';

const categoryIcons = {
  Smartphone,
  Wallet,
  Key,
  CreditCard,
  Package,
  BookOpen,
  Briefcase,
  PenLine,
  Shirt,
  Watch,
};

function CategoriesPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchItems() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getItems('all');
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) setError('Gagal memuat kategori.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchItems();

    return () => {
      cancelled = true;
    };
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = {};
    items.forEach((item) => {
      const categoryId = categoryIdFromLabel(item.category);
      counts[categoryId] = (counts[categoryId] || 0) + 1;
    });
    return counts;
  }, [items]);

  return (
    <main className="categories-page" id="categories-page">
      <div className="container">
        <header className="categories-page__header">
          <span>Kategori Barang</span>
          <h1>Semua Kategori</h1>
          <p>Pilih kategori untuk melihat barang hilang dan temuan yang sesuai.</p>
        </header>

        {loading ? (
          <div className="categories-page__state">
            <Loader2 className="spin" size={42} />
            <p>Memuat kategori...</p>
          </div>
        ) : error ? (
          <div className="categories-page__state categories-page__state--error">
            <p>{error}</p>
          </div>
        ) : (
          <section className="categories-grid" aria-label="Daftar kategori">
            {ITEM_CATEGORIES.map((category) => {
              const Icon = categoryIcons[category.icon] || Package;
              const count = categoryCounts[category.id] || 0;

              return (
                <button
                  type="button"
                  className="category-card"
                  key={category.id}
                  onClick={() => navigate(`/search?category=${category.id}`)}
                >
                  <span className="category-card__icon">
                    <Icon size={24} />
                  </span>
                  <span className="category-card__body">
                    <strong>{category.label}</strong>
                    <small>{count} barang terdata</small>
                  </span>
                </button>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

export default CategoriesPage;
