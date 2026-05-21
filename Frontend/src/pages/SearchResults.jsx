import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, Clock, ChevronLeft, ChevronRight, Loader2, PackageX } from 'lucide-react';
import { api } from '../services/api';
import { CAMPUS_LOCATIONS, ITEM_CATEGORIES, categoryIdFromLabel } from '../data/catalog';
import './SearchResults.css';

/* ── Category & location master data ── */
const ITEMS_PER_PAGE = 6;

/* ── Helper: generate a pseudo-unique reference code from item id ── */
function refCode(item) {
  const prefix = item.category ? item.category.substring(0, 3).toUpperCase() : 'ITM';
  const num = String(item.id).replace(/\D/g, '').padStart(3, '0').slice(-3);
  return `REF-${prefix}-${num}`;
}

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category');

  /* ── Data state ── */
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ── Filter state ── */
  const [categoryState, setCategoryState] = useState({
    param: categoryParam,
    categories: categoryParam ? [categoryParam] : [],
  });
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [statusFilter, setStatusFilter] = useState({ lost: true, found: true });
  const [locationFilter, setLocationFilter] = useState('Semua Lokasi');

  /* ── Pagination ── */
  const [currentPage, setCurrentPage] = useState(1);

  if (categoryState.param !== categoryParam) {
    setCategoryState({
      param: categoryParam,
      categories: categoryParam ? [categoryParam] : [],
    });
  }

  const selectedCategories = categoryState.categories;

  /* ── Fetch items whenever query changes ── */
  useEffect(() => {
    let cancelled = false;
    async function fetchItems() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getItems('all', query);
        if (!cancelled) setAllItems(data);
      } catch {
        if (!cancelled) setError('Gagal memuat data barang.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchItems();
    return () => { cancelled = true; };
  }, [query]);

  /* ── Derived: filtered items ── */
  const filteredItems = useMemo(() => {
    let items = [...allItems];

    // Category filter
    if (selectedCategories.length > 0) {
      items = items.filter((item) =>
        selectedCategories.includes(categoryIdFromLabel(item.category))
      );
    }

    // Status filter
    if (!statusFilter.lost || !statusFilter.found) {
      items = items.filter((item) => {
        if (item.status === 'lost') return statusFilter.lost;
        if (item.status === 'found') return statusFilter.found;
        return true;
      });
    }

    // Location filter
    if (locationFilter && locationFilter !== 'Semua Lokasi') {
      items = items.filter((item) =>
        item.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    return items;
  }, [allItems, selectedCategories, statusFilter, locationFilter]);

  /* ── Derived: category counts (from allItems, before category filter) ── */
  const categoryCounts = useMemo(() => {
    const counts = {};
    allItems.forEach((item) => {
      const cat = categoryIdFromLabel(item.category);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [allItems]);

  const locationOptions = useMemo(() => {
    const itemLocations = allItems.map((item) => item.location).filter(Boolean);
    return [...new Set([...CAMPUS_LOCATIONS, ...itemLocations])];
  }, [allItems]);

  /* ── Pagination logic ── */
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ── Event handlers ── */
  function toggleCategory(catId) {
    setCategoryState((prev) => ({
      param: categoryParam,
      categories: prev.categories.includes(catId)
        ? prev.categories.filter((c) => c !== catId)
        : [...prev.categories, catId],
    }));
    setCurrentPage(1);
  }

  function toggleStatus(key) {
    setStatusFilter((prev) => ({ ...prev, [key]: !prev[key] }));
    setCurrentPage(1);
  }

  function resetFilters() {
    setCategoryState({ param: categoryParam, categories: [] });
    setStatusFilter({ lost: true, found: true });
    setLocationFilter('Semua Lokasi');
    setCurrentPage(1);
  }

  function goToPage(page) {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  }

  /* ── Build visible categories list ── */
  const visibleCategories = showAllCategories ? ITEM_CATEGORIES : ITEM_CATEGORIES.slice(0, 7);

  /* ── Pagination numbers ── */
  function getPaginationNumbers() {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3);
      if (currentPage > 3 && currentPage < totalPages) {
        pages.push('...', currentPage);
      } else {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    // Deduplicate
    return [...new Set(pages)];
  }

  /* ════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════ */
  return (
    <main className="search-results" id="search-results-page">
      <div className="search-results__container">
        {/* ── Header ── */}
        <header className="search-results__header">
          <span className="search-results__label">SEARCH RESULTS</span>
          <h1 className="search-results__title">
            {query ? (
              <>Hasil Pencarian untuk <em>"{query}"</em></>
            ) : (
              'Jelajahi Arsip Barang'
            )}
          </h1>
          <p className="search-results__subtitle">
            Menampilkan {filteredItems.length} hasil dari database arsip.
          </p>
        </header>

        {/* ── Body: sidebar + content ── */}
        <div className="search-results__body">
          {/* ── Sidebar ── */}
          <aside className="search-results__sidebar" id="search-filters">
            {/* Kategori */}
            <div className="sr-filter-group">
              <h3 className="sr-filter-group__title">KATEGORI</h3>
              <ul className="sr-filter-group__list">
                {visibleCategories.map((cat) => {
                  const count = categoryCounts[cat.id] || 0;
                  const isChecked = selectedCategories.includes(cat.id);
                  return (
                    <li key={cat.id} className="sr-filter-group__item">
                      <label className="sr-checkbox" htmlFor={`cat-${cat.id}`}>
                        <input
                          type="checkbox"
                          id={`cat-${cat.id}`}
                          checked={isChecked}
                          onChange={() => toggleCategory(cat.id)}
                        />
                        <span className="sr-checkbox__box" />
                        <span className="sr-checkbox__label">
                          {cat.label}
                          {count > 0 && <span className="sr-checkbox__count"> ({count})</span>}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              {ITEM_CATEGORIES.length > 7 && (
                <button
                  className="sr-filter-group__more"
                  onClick={() => setShowAllCategories(!showAllCategories)}
                >
                  {showAllCategories ? 'Tampilkan sedikit' : 'Tampilkan semua'}
                </button>
              )}
            </div>

            {/* Status */}
            <div className="sr-filter-group">
              <h3 className="sr-filter-group__title">STATUS</h3>
              <ul className="sr-filter-group__list">
                <li className="sr-filter-group__item">
                  <label className="sr-checkbox" htmlFor="status-lost">
                    <input
                      type="checkbox"
                      id="status-lost"
                      checked={statusFilter.lost}
                      onChange={() => toggleStatus('lost')}
                    />
                    <span className="sr-checkbox__box" />
                    <span className="sr-checkbox__label">
                      <span className="sr-status-dot sr-status-dot--lost" />
                      Hilang
                    </span>
                  </label>
                </li>
                <li className="sr-filter-group__item">
                  <label className="sr-checkbox" htmlFor="status-found">
                    <input
                      type="checkbox"
                      id="status-found"
                      checked={statusFilter.found}
                      onChange={() => toggleStatus('found')}
                    />
                    <span className="sr-checkbox__box" />
                    <span className="sr-checkbox__label">
                      <span className="sr-status-dot sr-status-dot--found" />
                      Ditemukan
                    </span>
                  </label>
                </li>
              </ul>
            </div>

            {/* Lokasi */}
            <div className="sr-filter-group">
              <h3 className="sr-filter-group__title">LOKASI</h3>
              <div className="sr-select-wrapper">
                <select
                  className="sr-select"
                  id="location-filter"
                  value={locationFilter}
                  onChange={(e) => {
                    setLocationFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {locationOptions.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reset */}
            <button className="sr-reset-btn" id="btn-reset-filter" onClick={resetFilters}>
              RESET FILTER
            </button>
          </aside>

          {/* ── Content ── */}
          <section className="search-results__content">
            {loading ? (
              <div className="search-results__loading">
                <Loader2 className="spin" size={48} />
                <p>Memuat data barang...</p>
              </div>
            ) : error ? (
              <div className="search-results__error">
                {error}
                <button onClick={() => window.location.reload()}>Coba Lagi</button>
              </div>
            ) : paginatedItems.length > 0 ? (
              <>
                <div className="sr-cards-grid" id="search-results-grid">
                  {paginatedItems.map((item) => (
                    <SearchResultCard key={item.id} item={item} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="sr-pagination" id="search-pagination" aria-label="Pagination">
                    <button
                      className="sr-pagination__arrow"
                      disabled={currentPage === 1}
                      onClick={() => goToPage(currentPage - 1)}
                      aria-label="Halaman sebelumnya"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {getPaginationNumbers().map((page, idx) =>
                      page === '...' ? (
                        <span key={`ellipsis-${idx}`} className="sr-pagination__ellipsis">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          className={`sr-pagination__page ${currentPage === page ? 'sr-pagination__page--active' : ''}`}
                          onClick={() => goToPage(page)}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      className="sr-pagination__arrow"
                      disabled={currentPage === totalPages}
                      onClick={() => goToPage(currentPage + 1)}
                      aria-label="Halaman selanjutnya"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </nav>
                )}
              </>
            ) : (
              <div className="search-results__empty">
                <PackageX size={64} className="search-results__empty-icon" />
                <h3>Tidak ada barang yang ditemukan</h3>
                <p>Coba gunakan kata kunci pencarian yang berbeda atau ubah filter.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

/* ══════════════════════════════════════════════
   SearchResultCard — matches Hi-Fi card design
   ══════════════════════════════════════════════ */
function SearchResultCard({ item }) {
  const isLost = item.status === 'lost';
  const badgeText = isLost ? 'LOST' : 'FOUND';
  const badgeClass = isLost ? 'sr-card__badge--lost' : 'sr-card__badge--found';

  return (
    <Link to={`/item/${item.id}`} className="sr-card-link">
      <article className="sr-card" id={`sr-item-${item.id}`}>
        {/* Image area */}
        <div className="sr-card__image-wrapper">
          <img
            src={item.image}
            alt={item.name}
            className="sr-card__image"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x260?text=No+Image';
            }}
          />
          {/* Badge */}
          <span className={`sr-card__badge ${badgeClass}`}>
            <span className="sr-card__badge-dot" />
            {badgeText}
          </span>
          {/* Ref code */}
          <span className="sr-card__ref">{refCode(item)}</span>
        </div>

        {/* Content */}
        <div className="sr-card__content">
          <h3 className="sr-card__title">{item.name}</h3>
          {item.description && (
            <p className="sr-card__desc">{item.description}</p>
          )}
          <div className="sr-card__meta">
            <div className="sr-card__meta-row">
              <MapPin size={13} className="sr-card__meta-icon" />
              <span>{item.location}</span>
            </div>
            <div className="sr-card__meta-row">
              <Clock size={13} className="sr-card__meta-icon" />
              <span>{item.time}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default SearchResults;
