
import React, { useState, useEffect } from 'react';
import { Terminal, Trash2, X, Activity, Satellite, WifiOff } from 'lucide-react';
import { backend, NotificationHistoryEntry, ToastType } from '../backend';
import { translations } from '../translations';

interface NotificationArchiveProps {
  language: 'en' | 'zh-TW';
  onClose: () => void;
}

const NotificationArchive: React.FC<NotificationArchiveProps> = ({ language, onClose }) => {
  const [history, setHistory] = useState<NotificationHistoryEntry[]>([]);
  const t = translations[language].self;

  useEffect(() => {
    setHistory(backend.getNotificationHistory());
  }, []);

  const handleClear = () => {
    backend.clearNotificationHistory();
    setHistory([]);
  };

  const getSignalColor = (type: ToastType) => {
    switch (type) {
      case 'success': return 'text-[#c5a059]';
      case 'warning': return 'text-red-500';
      default: return 'text-white/40';
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-3xl flex flex-col animate-in fade-in duration-500">
      {/* 頂部裝飾 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c5a059]/20 to-transparent" />
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20">
            <Terminal size={20} className="text-[#c5a059]" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">{t.comm_archive}</h2>
            <p className="text-[9px] font-mono font-black text-white/20 uppercase tracking-widest mt-1">Deep Space Log // V4.2</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-3 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-colors border border-white/5 active:scale-95"
        >
          <X size={20} />
        </button>
      </div>

      {/* List Container */}
      <div className="flex-grow overflow-y-auto no-scrollbar px-6 py-6">
        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((entry, idx) => (
              <div 
                key={entry.id}
                className="group relative bg-[#111318]/40 border border-white/5 rounded-2xl p-5 hover:border-[#c5a059]/20 transition-all animate-in slide-in-from-bottom-2 duration-500"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* 裝飾細節 */}
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Satellite size={10} className={getSignalColor(entry.type)} />
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className={`text-[8px] font-mono font-black uppercase tracking-[0.2em] ${getSignalColor(entry.type)}`}>
                      [{entry.type.toUpperCase()}_SIGNAL]
                    </span>
                    <span className="text-[8px] font-mono font-black text-white/20 uppercase tracking-tighter tabular-nums">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-white/80 leading-relaxed font-mono">
                    &gt; {entry.message}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex gap-0.5">
                       {Array.from({ length: 12 }).map((_, i) => (
                         <div key={i} className={`w-[2px] h-1.5 rounded-full ${i < (idx % 8 + 3) ? getSignalColor(entry.type) : 'bg-white/5'} opacity-40`} />
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
            <WifiOff size={48} className="mb-6" />
            <h3 className="text-sm font-black uppercase tracking-[0.3em]">{t.no_signals}</h3>
            <p className="text-[9px] font-mono font-black mt-2">LINK STABLE // NO ANOMALIES DETECTED</p>
          </div>
        )}
      </div>

      {/* Footer / Controls */}
      {history.length > 0 && (
        <div className="p-8 border-t border-white/5 bg-[#0a0b0d]">
          <button 
            onClick={handleClear}
            className="w-full h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center gap-3 text-red-500 text-xs font-black uppercase tracking-[0.2em] hover:bg-red-500/20 transition-all active:scale-95"
          >
            <Trash2 size={18} />
            {t.clear_signals}
          </button>
        </div>
      )}
      
      {/* 底部掃描線特效 */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
        <div className="w-full h-1 bg-white animate-[scan_4s_linear_infinite]" />
      </div>
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
};

export default NotificationArchive;
