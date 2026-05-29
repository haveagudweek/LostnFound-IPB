import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import './ConfirmDialog.css';

function ConfirmDialog() {
  const confirmation = useUIStore((state) => state.confirmation);

  if (!confirmation) return null;

  const isDanger = confirmation.tone === 'danger';

  return (
    <div className="confirm-dialog" role="presentation">
      <div className="confirm-dialog__backdrop" onClick={confirmation.onCancel} />
      <section
        className={`confirm-dialog__panel ${isDanger ? 'confirm-dialog__panel--danger' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <button
          type="button"
          className="confirm-dialog__close"
          onClick={confirmation.onCancel}
          aria-label="Tutup konfirmasi"
        >
          <X size={18} />
        </button>

        <div className="confirm-dialog__icon">
          {isDanger ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
        </div>

        <div className="confirm-dialog__content">
          <span className="confirm-dialog__eyebrow">SEEKEM Confirmation</span>
          <h2 id="confirm-dialog-title">{confirmation.title}</h2>
          <p>{confirmation.message}</p>
        </div>

        <div className="confirm-dialog__actions">
          <button type="button" className="confirm-dialog__cancel" onClick={confirmation.onCancel}>
            {confirmation.cancelLabel}
          </button>
          <button type="button" className="confirm-dialog__confirm" onClick={confirmation.onConfirm}>
            {confirmation.confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ConfirmDialog;
