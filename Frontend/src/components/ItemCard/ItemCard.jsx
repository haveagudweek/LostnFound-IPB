import { MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import './ItemCard.css';

function ItemCard({ item }) {
  const badgeClass = item.status === 'found'
    ? 'item-card__badge--found'
    : 'item-card__badge--lost';

  const badgeText = item.status === 'found' ? 'DITEMUKAN' : 'HILANG';

  return (
    <Link to={`/item/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <article className="item-card" id={`item-${item.id}`}>
        <div className="item-card__image-wrapper">
          <img
            src={item.image}
            alt={item.name}
            className="item-card__image"
            loading="lazy"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
          />
          <span className={`item-card__badge ${badgeClass}`}>
            {badgeText}
          </span>
        </div>

        <div className="item-card__content">
          <h3 className="item-card__name">{item.name}</h3>
          <div className="item-card__meta">
            <div className="item-card__meta-item">
              <MapPin size={12} className="item-card__meta-icon" />
              <span>{item.location}</span>
            </div>
            <div className="item-card__meta-item">
              <Clock size={12} className="item-card__meta-icon" />
              <span>{item.time}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default ItemCard;
