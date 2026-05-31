import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Package } from 'lucide-react';
import heroImg from '../../assets/images/hero-illustration.png';
import './Hero.css';

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero" id="hero-section">
      {/* Decorative crosses */}
      <span className="hero__decorative-cross">+</span>
      <span className="hero__decorative-cross">+</span>
      <span className="hero__decorative-cross">+</span>
      <span className="hero__decorative-cross">+</span>
      <span className="hero__decorative-cross">+</span>
      <span className="hero__decorative-cross">+</span>

      <div className="hero__container">
        {/* Left Content */}
        <div className="hero__content">
          <div className="hero__badge">
            <ShieldCheck size={14} className="hero__badge-icon" />
            SISTEM TERPERCAYA
          </div>

          <h1 className="hero__title">
            You Lost it?
            <span className="hero__title-highlight">We Found it!</span>
          </h1>

          <p className="hero__subtitle">
            Platform mahasiswa IPB untuk melaporkan barang hilang dan barang ditemukan.
          </p>

          <div className="hero__cta-group">
            <button 
              className="hero__cta-btn hero__cta-btn--primary" 
              id="btn-report-lost"
              onClick={() => navigate('/report/lost')}
            >
              Laporkan Barang Hilang
              <div className="hero__cta-icon">
                <ArrowRight size={14} />
              </div>
            </button>

            <button 
              className="hero__cta-btn hero__cta-btn--secondary" 
              id="btn-report-found"
              onClick={() => navigate('/report/found')}
            >
              Laporkan Barang Ditemukan
              <div className="hero__cta-icon">
                <ArrowRight size={14} />
              </div>
            </button>
          </div>

          <div className="hero__trust">
            <ShieldCheck size={14} className="hero__trust-icon" />
            Bersama menjaga lingkungan IPB yang aman dan saling peduli.
          </div>
        </div>

        {/* Right Visual */}
        <div className="hero__visual">
          <img
            src={heroImg}
            alt="Mahasiswa IPB membantu menemukan barang"
            className="hero__illustration"
          />

          <div className="hero__floating-badge" id="floating-notification">
            <div className="hero__floating-badge-icon">
              <Package size={20} />
            </div>
            <div className="hero__floating-badge-text">
              <span className="hero__floating-badge-count">3 Barang Baru Dilaporkan</span>
              <span className="hero__floating-badge-label">Cek sekarang →</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
