import { useUIStore } from '../../store/uiStore';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

const toastTitle = {
  success: 'Berhasil',
  error: 'Gagal',
  info: 'Informasi',
};

function Toast() {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.type}`}>
          <div className="toast__icon">
            {toast.type === 'success' && <CheckCircle size={20} />}
            {toast.type === 'error' && <AlertCircle size={20} />}
              {toast.type === 'info' && <Info size={20} />}
          </div>
          <div className="toast__content">
            <strong>{toastTitle[toast.type] || toastTitle.info}</strong>
            <div className="toast__message">{toast.message}</div>
          </div>
          <button className="toast__close" onClick={() => removeToast(toast.id)} aria-label="Tutup notifikasi">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default Toast;
