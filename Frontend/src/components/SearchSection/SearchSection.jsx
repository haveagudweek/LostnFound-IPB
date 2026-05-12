import { useState } from 'react';
import { Search, Smartphone, Wallet, Key, CreditCard, Package } from 'lucide-react';
import './SearchSection.css';

const categoryIcons = {
  Smartphone: Smartphone,
  Wallet: Wallet,
  Key: Key,
  CreditCard: CreditCard,
  Package: Package,
};

const categories = [
  { id: 'elektronik', label: 'Elektronik', icon: 'Smartphone' },
  { id: 'dompet', label: 'Dompet', icon: 'Wallet' },
  { id: 'kunci', label: 'Kunci', icon: 'Key' },
  { id: 'kartu', label: 'Kartu', icon: 'CreditCard' },
  { id: 'lainnya', label: 'Lainnya', icon: 'Package' },
];

function SearchSection() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className="search-section" id="search-section">
      <div className="search-section__container">
        <div className="search-section__box">
          {/* Left - Quick Search */}
          <div className="search-section__left">
            <div className="search-section__label">Pencarian Cepat</div>
            <div className="search-section__input-wrapper">
              <div className="search-section__input-group">
                <Search size={18} className="search-section__input-icon" />
                <input
                  type="text"
                  className="search-section__input"
                  placeholder="Cari nama barang, lokasi, atau ID laporan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Pencarian cepat"
                  id="quick-search-input"
                />
              </div>
              <button className="search-section__btn" id="btn-search">
                Cari
              </button>
            </div>
          </div>

          {/* Right - Category Filter */}
          <div className="search-section__right">
            <div className="search-section__filter-label">Filter Kategori</div>
            <div className="search-section__pills" id="category-pills">
              {categories.map((cat) => {
                const IconComponent = categoryIcons[cat.icon];
                return (
                  <button
                    key={cat.id}
                    className={`search-section__pill ${activeCategory === cat.id ? 'search-section__pill--active' : ''}`}
                    onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                    id={`pill-${cat.id}`}
                  >
                    <IconComponent size={14} className="search-section__pill-icon" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SearchSection;
