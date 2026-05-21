import { useState, useEffect } from 'react';
import { ChevronDown, Filter, Loader2, PackageX, RotateCcw, Search } from 'lucide-react';
import ItemCard from '../components/ItemCard/ItemCard';
import { api } from '../services/api';
import { CAMPUS_LOCATIONS, ITEM_CATEGORIES, categoryLabelFromId } from '../data/catalog';
import './ItemsPage.css';

function ItemsPage({ type }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('Semua Lokasi');

  const isFound = type === 'found';
  const title = isFound ? 'Barang Ditemukan' : 'Barang Hilang';

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getItems(type, query, {
          category: categoryLabelFromId(categoryFilter),
          location: locationFilter === 'Semua Lokasi' ? '' : locationFilter,
        });
        setItems(data);
      } catch {
        setError('Gagal memuat data barang.');
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [type, query, categoryFilter, locationFilter]);

  const resetFilters = () => {
    setCategoryFilter('all');
    setLocationFilter('Semua Lokasi');
  };

  return (
    <main className="items-page">
      <div className="container">
        <div className="items-page__header">
          <h1>{title}</h1>
          <p>Daftar {title.toLowerCase()} yang dilaporkan dalam sistem SEEKEM.</p>
        </div>

        <div className="items-page__controls">
          <div className="items-page__search">
            <Search size={20} className="items-page__search-icon" />
            <input 
              type="text" 
              placeholder="Cari berdasarkan nama, lokasi, atau kategori..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            className={`items-page__filter-btn ${showFilters ? 'items-page__filter-btn--active' : ''}`}
            onClick={() => setShowFilters((prev) => !prev)}
            aria-expanded={showFilters}
          >
            <Filter size={20} />
            Filter
          </button>
        </div>

        {showFilters && (
          <div className="items-page__filters" id="items-page-filters">
            <label className="items-page__select">
              <span>Kategori</span>
              <div>
                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                  <option value="all">Semua Kategori</option>
                  {ITEM_CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} />
              </div>
            </label>

            <label className="items-page__select">
              <span>Lokasi</span>
              <div>
                <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
                  {CAMPUS_LOCATIONS.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} />
              </div>
            </label>

            <button type="button" className="items-page__reset-btn" onClick={resetFilters}>
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        )}

        {error && (
          <div className="items-page__error">
            {error}
            <button onClick={() => window.location.reload()}>Coba Lagi</button>
          </div>
        )}

        {loading ? (
          <div className="items-page__loading">
            <Loader2 className="spin" size={48} />
            <p>Memuat data barang...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="items-grid">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="items-page__empty">
            <PackageX size={64} className="items-page__empty-icon" />
            <h3>Tidak ada barang yang ditemukan</h3>
            <p>Coba gunakan kata kunci pencarian yang berbeda.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default ItemsPage;
