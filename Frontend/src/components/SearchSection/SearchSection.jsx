import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Smartphone, Wallet, Key, CreditCard, Package, BookOpen, Briefcase, PenLine, Shirt, Watch } from 'lucide-react';
import { ITEM_CATEGORIES } from '../../data/catalog';
import './SearchSection.css';

const categoryIcons = {
  Smartphone: Smartphone,
  Wallet: Wallet,
  Key: Key,
  CreditCard: CreditCard,
  Package: Package,
  BookOpen: BookOpen,
  Briefcase: Briefcase,
  PenLine: PenLine,
  Shirt: Shirt,
  Watch: Watch,
};

const POPULAR_CATEGORY_IDS = ['elektronik', 'dompet', 'kunci', 'kartu-identitas', 'tas'];

function SearchSection() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const buildSearchUrl = (categoryId = activeCategory) => {
    const params = new URLSearchParams();
    const query = searchQuery.trim();

    if (query) params.set('q', query);
    if (categoryId) params.set('category', categoryId);

    return `/search${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(buildSearchUrl());
  };

  const handleCategoryClick = (categoryId) => {
    const nextCategory = activeCategory === categoryId ? null : categoryId;
    setActiveCategory(nextCategory);
    navigate(buildSearchUrl(nextCategory));
  };

  const popularCategories = ITEM_CATEGORIES.filter((category) => POPULAR_CATEGORY_IDS.includes(category.id));

  return (
    <section className="search-section" id="search-section">
      <div className="search-section__container">
        <div className="search-section__box">
          {/* Left - Quick Search */}
          <form className="search-section__left" onSubmit={handleSearch}>
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
              <button type="submit" className="search-section__btn" id="btn-search">
                Cari
              </button>
            </div>
          </form>

          {/* Right - Category Filter */}
          <div className="search-section__right">
            <div className="search-section__filter-label">Filter Kategori</div>
            <div className="search-section__pills" id="category-pills">
              {popularCategories.map((cat) => {
                const IconComponent = categoryIcons[cat.icon] || Package;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    className={`search-section__pill ${activeCategory === cat.id ? 'search-section__pill--active' : ''}`}
                    onClick={() => handleCategoryClick(cat.id)}
                    id={`pill-${cat.id}`}
                  >
                    <IconComponent size={14} className="search-section__pill-icon" />
                    {cat.label}
                  </button>
                );
              })}
              <button
                type="button"
                className="search-section__pill search-section__pill--more"
                onClick={() => navigate('/categories')}
                id="pill-more-categories"
              >
                <Package size={14} className="search-section__pill-icon" />
                Lainnya
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SearchSection;
