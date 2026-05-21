import { ArrowRight, Loader2, PackageX } from 'lucide-react';
import ItemCard from '../ItemCard/ItemCard';
import './ItemSection.css';

function ItemSection({ title, items, viewAllHref = '#', altBackground = false, loading = false, error = null }) {
  return (
    <section className={`item-section ${altBackground ? 'item-section--alt' : ''}`}>
      <div className="item-section__container">
        <div className="item-section__header">
          <h2 className="item-section__title">{title}</h2>
          <a href={viewAllHref} className="item-section__link">
            LIHAT SEMUA
            <ArrowRight size={14} />
          </a>
        </div>

        {loading ? (
          <div className="item-section__state">
            <Loader2 className="spin" size={36} />
            <p>Memuat data barang...</p>
          </div>
        ) : error ? (
          <div className="item-section__state item-section__state--error">
            <p>{error}</p>
          </div>
        ) : items.length > 0 ? (
          <div className="item-section__grid">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="item-section__state">
            <PackageX size={36} />
            <p>Belum ada data barang.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default ItemSection;
