import { MapPin, Mail, Phone, Globe, ExternalLink } from 'lucide-react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer__container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__logo">
              <div className="footer__logo-icon">
                <img src="/seekem-logo.png" alt="" className="footer__logo-img" />
              </div>
              <span className="footer__logo-text">SEEKEM</span>
            </div>
            <p className="footer__description">
              Platform resmi IPB University untuk kehilangan dan penemuan barang.
            </p>
          </div>

          {/* Navigation */}
          <div className="footer__column">
            <h4 className="footer__column-title">Navigasi</h4>
            <div className="footer__links">
              <a href="/" className="footer__link">Dashboard</a>
              <a href="/lost" className="footer__link">Lost Items</a>
              <a href="/found" className="footer__link">Found Items</a>
            </div>
          </div>

          {/* Help */}
          <div className="footer__column">
            <h4 className="footer__column-title">Bantuan</h4>
            <div className="footer__links">
              <a href="#" className="footer__link">Panduan Penggunaan</a>
              <a href="#" className="footer__link">FAQ</a>
              <a href="#" className="footer__link">Kebijakan Privasi</a>
              <a href="#" className="footer__link">Syarat &amp; Ketentuan</a>
            </div>
          </div>

          {/* Contact */}
          <div className="footer__column">
            <h4 className="footer__column-title">Kontak</h4>

            <div className="footer__contact-item">
              <MapPin size={16} className="footer__contact-icon" />
              <span className="footer__contact-text">
                IPB University<br />
                Jl. Meranti, Dramaga,<br />
                Bogor 16680
              </span>
            </div>

            <div className="footer__contact-item">
              <Mail size={16} className="footer__contact-icon" />
              <span className="footer__contact-text">
                lostandfound@apps.ipb.ac.id
              </span>
            </div>

            <div className="footer__contact-item">
              <Phone size={16} className="footer__contact-icon" />
              <span className="footer__contact-text">
                (0251) 8623 456
              </span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer__bottom">
          <span className="footer__social-label">Ikuti Kami</span>
          <div className="footer__social">
            <a href="#" className="footer__social-btn" aria-label="Website">
              <Globe size={16} />
            </a>
            <a href="#" className="footer__social-btn" aria-label="External">
              <ExternalLink size={16} />
            </a>
            <a href="#" className="footer__social-btn" aria-label="Mail">
              <Mail size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
