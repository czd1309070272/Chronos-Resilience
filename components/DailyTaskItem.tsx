
import React, { useState, useEffect } from 'react';
import { Check, Flame, Trash2, Zap } from 'lucide-react';
import { DailyTask } from '../types';

interface DailyTaskItemProps {
  task: DailyTask;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onToggle: (id: string) => void; // Unused in current logic but kept for type compatibility
  onArchive: (id: string, status: 'completed' | 'aborted') => void;
  language: 'en' | 'zh-TW';
}

const DailyTaskItem: React.FC<DailyTaskItemProps> = ({ task, isSelected, onSelect, onArchive, language }) => {
  const [tick, setTick] = useState(false);

  // Miller's Planet Visual "Tick" (1.25s interval) - 保持與系統其他部分同步的節律
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(true);
      setTimeout(() => setTick(false), 150);
    }, 1250);
    return () => clearInterval(interval);
  }, []);

  const handleItemClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(isSelected ? null : task.id);
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div 
      onClick={handleItemClick}
      className={`group flex flex-col p-5 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden active:scale-[0.98] ${
        task.completed 
          ? 'bg-[#c5a059]/10 border-[#c5a059]/40 shadow-[0_0_20px_rgba(197,160,89,0.05)]' 
          : isSelected 
            ? 'bg-[#1a1c22] border-white/20 shadow-xl'
            : 'bg-[#111318]/40 border-white/5 hover:border-white/10'
      }`}
    >
      {/* Cinematic Tick Indicator */}
      <div className={`absolute top-5 right-6 flex flex-col items-center gap-1 transition-opacity duration-300 ${tick ? 'opacity-100' : 'opacity-20'}`}>
        <div className={`w-[1px] h-3 bg-[#c5a059] shadow-[0_0_8px_#c5a059] transition-transform duration-150 ${tick ? 'scale-y-125' : 'scale-y-100'}`} />
        <span className="text-[5px] font-black text-[#c5a059] tracking-tighter">TICK</span>
      </div>

      <div className="flex items-center gap-4">
        <div className={`shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-700 ${
          task.completed 
            ? 'bg-[#c5a059] border-[#c5a059] shadow-[0_0_15px_#c5a059]' 
            : 'border-white/10'
        }`}>
          {task.completed ? <Check size={24} className="text-black" strokeWidth={4} /> : <div className={`w-2 h-2 rounded-full transition-all duration-150 ${tick ? 'bg-[#c5a059] scale-125 shadow-[0_0_10px_#c5a059]' : 'bg-white/10 scale-100'}`} />}
        </div>

        <div className="flex-grow min-w-0">
          <h3 className={`text-sm font-black uppercase tracking-tight truncate transition-colors duration-500 ${
            task.completed ? 'text-white' : 'text-white/60'
          }`}>
            {task.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Flame size={12} className={task.streak > 0 ? 'text-[#c5a059]' : 'text-white/10'} />
              <span className={`text-[9px] font-mono font-black transition-colors ${
                tick && !task.completed ? 'text-[#c5a059]' : task.streak > 0 ? 'text-[#c5a059]/60' : 'text-white/10'
              }`}>
                {task.streak} FREQ_SYNC
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Panel */}
      <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isSelected ? 'max-h-32 opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
        <div className="grid grid-cols-2 gap-3 pb-2">
          <button 
            onClick={(e) => handleAction(e, () => { onArchive(task.id, 'completed'); onSelect(null); })}
            className="h-14 rounded-2xl bg-[#c5a059] text-black shadow-[0_10px_20px_rgba(197,160,89,0.2)] flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] transition-all active:scale-95"
          >
            <Zap size={16} className="animate-pulse" />
            {language === 'en' ? 'SYNCHRONIZE' : '同步頻率'}
          </button>
          
          <button 
            onClick={(e) => handleAction(e, () => { onArchive(task.id, 'aborted'); onSelect(null); })}
            className="h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-[0.1em] transition-all active:scale-95 hover:bg-red-500 hover:text-white"
          >
            <Trash2 size={16} />
            {language === 'en' ? 'ABORT MISSION' : '中止任務'}
          </button>
        </div>
      </div>

      {/* Background Pulse for completed state */}
      {task.completed && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#c5a059]/5 to-transparent pointer-events-none animate-pulse" />
      )}
    </div>
  );
};

export default DailyTaskItem;
