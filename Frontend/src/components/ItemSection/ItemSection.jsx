import { ArrowRight } from 'lucide-react';
import ItemCard from '../ItemCard/ItemCard';
import './ItemSection.css';

function ItemSection({ title, items, viewAllHref = '#', altBackground = false }) {
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

        <div className="item-section__grid">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ItemSection;
