import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import foundIllust from '../assets/images/illust-found.png';
import lostIllust from '../assets/images/illust-lost.png';
import './ReportSelection.css';

function ReportSelection() {
  const [selectedType, setSelectedType] = useState(null);
  const navigate = useNavigate();

  const handleNext = () => {
    if (selectedType === 'found') {
      navigate('/report/found');
    } else if (selectedType === 'lost') {
      navigate('/report/lost');
    }
  };

  return (
    <main className="report-selection" id="report-selection-page">
      <div className="report-selection__header">
        <h1 className="report-selection__title">KAMU INGIN LAPOR SESUATU?</h1>
        <p className="report-selection__subtitle">Laporkan Atau Temukan Barang Dengan Mudah!</p>
      </div>

      <div className="report-selection__cards-container">
        {/* Card: Lapor Barang Temuan */}
        <div
          className={`report-card ${selectedType === 'found' ? 'report-card--selected' : ''}`}
          onClick={() => setSelectedType('found')}
        >
          <h2 className="report-card__title">LAPOR BARANG TEMUAN</h2>
          <div className="report-card__image-wrapper report-card__image-wrapper--found">
            <img src={foundIllust} alt="Lapor Barang Temuan" className="report-card__image" />
          </div>
          <div className="report-card__footer">
            <p>Menemukan barang yang tidak ada pemiliknya?</p>
          </div>
        </div>

        {/* Card: Lapor Barang Hilang */}
        <div
          className={`report-card ${selectedType === 'lost' ? 'report-card--selected' : ''}`}
          onClick={() => setSelectedType('lost')}
        >
          <h2 className="report-card__title">LAPOR BARANG HILANG</h2>
          <div className="report-card__image-wrapper report-card__image-wrapper--lost">
            <img src={lostIllust} alt="Lapor Barang Hilang" className="report-card__image" />
          </div>
          <div className="report-card__footer">
            <p>Kehilangan barang yang kamu sayangi?</p>
          </div>
        </div>
      </div>

      <div className="report-selection__action">
        <button
          className="report-selection__btn"
          onClick={handleNext}
          disabled={!selectedType}
        >
          Selanjutnya
          <ArrowRight size={18} />
        </button>
      </div>
    </main>
  );
}

export default ReportSelection;
