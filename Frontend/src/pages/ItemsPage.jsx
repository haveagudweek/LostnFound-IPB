import { useState, useEffect } from 'react';
import { Search, Filter, Loader2, PackageX } from 'lucide-react';
import ItemCard from '../components/ItemCard/ItemCard';
import { api } from '../services/api';
import './ItemsPage.css';

function ItemsPage({ type }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  const isFound = type === 'found';
  const title = isFound ? 'Barang Ditemukan' : 'Barang Hilang';

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getItems(type, query);
        setItems(data);
      } catch {
        setError('Gagal memuat data barang.');
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [type, query]);

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
          <button className="items-page__filter-btn">
            <Filter size={20} />
            Filter
          </button>
        </div>

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
