
import React, { useEffect } from 'react';
import { Info, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'info' | 'success' | 'warning';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}

const NotificationToast: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
  useEffect(() => {
    // 自動消失時間改為 2000ms (2秒)
    const timer = setTimeout(() => onClose(id), 2000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 size={18} className="text-[#c5a059]" />,
          border: 'border-[#c5a059]/30',
          bg: 'bg-[#111318]/90',
          glow: 'shadow-[0_0_20px_rgba(197,160,89,0.15)]'
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={18} className="text-red-500" />,
          border: 'border-red-500/30',
          bg: 'bg-[#111318]/90',
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]'
        };
      default:
        return {
          icon: <Info size={18} className="text-white/60" />,
          border: 'border-white/10',
          bg: 'bg-[#111318]/90',
          glow: 'shadow-[0_0_20px_rgba(255,255,255,0.05)]'
        };
    }
  };

  const styles = getStyles();

  return (
    <div 
      className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${styles.border} ${styles.bg} ${styles.glow} backdrop-blur-xl animate-in slide-in-from-top-4 duration-500 w-[calc(100vw-48px)] max-w-sm`}
    >
      <div className="shrink-0">{styles.icon}</div>
      <div className="flex-grow">
        <p className="text-[11px] font-black text-white/90 uppercase tracking-tight leading-snug break-all">{message}</p>
      </div>
      <button 
        onClick={() => onClose(id)}
        className="shrink-0 p-1 text-white/20 hover:text-white transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default NotificationToast;
