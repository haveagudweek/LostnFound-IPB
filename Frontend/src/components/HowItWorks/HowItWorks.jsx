import { FileText, CheckCircle, Handshake, ChevronRight } from 'lucide-react';
import './HowItWorks.css';

const steps = [
  {
    id: 'report',
    icon: FileText,
    iconClass: 'how-it-works__card-icon--blue',
    title: 'Laporkan',
    description: 'Laporkan barang hilang atau ditemukan dengan mudah dan cepat.',
  },
  {
    id: 'verify',
    icon: CheckCircle,
    iconClass: 'how-it-works__card-icon--green',
    title: 'Verifikasi',
    description: 'Laporan diverifikasi oleh admin untuk memastikan keabsahan informasi.',
  },
  {
    id: 'return',
    icon: Handshake,
    iconClass: 'how-it-works__card-icon--orange',
    title: 'Temukan / Kembalikan',
    description: 'Kami membantu mempertemukan kembali barang dengan pemilik yang berhak.',
  },
];

function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="how-it-works__container">
        <h2 className="how-it-works__title">Bagaimana Sistem Ini Bekerja?</h2>

        <div className="how-it-works__grid">
          {steps.map((step) => {
            const IconComp = step.icon;
            return (
              <div className="how-it-works__card" key={step.id} id={`step-${step.id}`}>
                <div className={`how-it-works__card-icon ${step.iconClass}`}>
                  <IconComp size={26} />
                </div>
                <div>
                  <h3 className="how-it-works__card-title">{step.title}</h3>
                  <p className="how-it-works__card-desc">{step.description}</p>
                </div>
                <div className="how-it-works__card-arrow">
                  <ChevronRight size={18} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
