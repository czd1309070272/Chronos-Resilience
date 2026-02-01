
import React, { useState, useEffect } from 'react';
import { X, History, Trash2, Calendar, ShieldCheck, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { DailyTaskHistory } from '../types';
import { translations } from '../translations';
import { backend } from '../backend';

interface DailyHistoryOverlayProps {
  language: 'en' | 'zh-TW';
  onClose: () => void;
}

const DailyHistoryOverlay: React.FC<DailyHistoryOverlayProps> = ({ language, onClose }) => {
  const [history, setHistory] = useState<DailyTaskHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const t = translations[language].dashboard;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await backend.getDailyHistory();
        setHistory(data);
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const updated = await backend.deleteDailyHistoryEntry(id);
      setHistory(updated);
      backend.notify(language === 'en' ? 'Archive record erased.' : '存檔記錄已清除。', 'info');
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col animate-in fade-in duration-500 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#c5a059] to-transparent" />
      </div>

      <div className="flex items-center justify-between px-6 py-8 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/20 flex items-center justify-center">
            <History size={24} className="text-[#c5a059]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">{t.history_title}</h2>
            <p className="text-[10px] font-mono font-black text-[#c5a059]/60 uppercase tracking-widest mt-1">
              Station Archive // Frequency Logs
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-4 bg-white/5 rounded-2xl text-white/40 border border-white/5 active:scale-95 transition-all"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar px-6 py-8 relative z-10">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 size={32} className="text-[#c5a059] animate-spin" />
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-4">
            {history.map((item) => (
              <div 
                key={item.id}
                className="bg-[#111318]/60 border border-white/5 rounded-[2.5rem] p-6 relative group overflow-hidden animate-in slide-in-from-bottom-4 duration-500"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                       {item.status === 'completed' ? (
                         <ShieldCheck size={14} className="text-[#c5a059]" />
                       ) : (
                         <AlertCircle size={14} className="text-red-500" />
                       )}
                       <span className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'completed' ? 'text-[#c5a059]' : 'text-red-500'}`}>
                         {item.status === 'completed' ? t.completed : t.aborted}
                       </span>
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight leading-tight">{item.title}</h3>
                  </div>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-3 bg-white/5 rounded-xl text-white/20 hover:text-red-500 transition-all active:scale-90"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex items-center gap-4 text-[9px] font-mono font-black text-white/30 uppercase tracking-tighter">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={12} className="text-[#c5a059]/40" />
                      Final Freq: {item.finalStreak}
                    </div>
                  </div>
                </div>

                {/* Decorative status bar */}
                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:via-white/10 transition-all w-full`} />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
            <History size={48} className="mb-6" />
            <h3 className="text-sm font-black uppercase tracking-[0.3em]">No Temporal Records</h3>
            <p className="text-[10px] font-mono font-black mt-2">ARCHIVE VACUUM // ALL SYSTEMS NOMINAL</p>
          </div>
        )}
      </div>

      <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-md relative z-10">
        <p className="text-[8px] font-mono font-black text-white/10 text-center uppercase tracking-[0.4em]">
          End of Transmission Archive // V5-Encrypted
        </p>
      </div>
    </div>
  );
};

export default DailyHistoryOverlay;