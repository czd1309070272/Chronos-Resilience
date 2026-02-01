
import React, { useMemo } from 'react';
import { Calendar, Flame, Clock, Layers } from 'lucide-react';
import { UserSettings } from '../types';

interface TemporalGridProps {
  type: 'yearly' | 'monthly' | 'today';
  onClose: () => void;
  language: 'en' | 'zh-TW';
  settings: UserSettings;
}

const TemporalGrid: React.FC<TemporalGridProps> = ({ type, onClose, language, settings }) => {
  const { items, passed, label, unitLabel, icon: Icon, gridCols } = useMemo(() => {
    const now = new Date();
    
    if (type === 'yearly') {
      const birthDateStr = settings.birthDate || '1999-01-01';
      const birth = new Date(birthDateStr);
      let lastBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
      if (lastBirthday > now) {
        lastBirthday = new Date(now.getFullYear() - 1, birth.getMonth(), birth.getDate());
      }
      const nextBirthday = new Date(lastBirthday.getFullYear() + 1, birth.getMonth(), birth.getDate());
      
      const totalDays = Math.round((nextBirthday.getTime() - lastBirthday.getTime()) / (1000 * 60 * 60 * 24));
      const dayOfYear = Math.floor((now.getTime() - lastBirthday.getTime()) / (1000 * 60 * 60 * 24));

      return {
        items: Array.from({ length: totalDays }).map(() => ({ label: '' })),
        passed: dayOfYear,
        label: language === 'en' ? 'Temporal Burn' : '年度燃燒',
        unitLabel: language === 'en' ? 'Days Gone' : '天已逝',
        icon: Flame,
        gridCols: 'grid-cols-[repeat(auto-fill,minmax(7px,1fr))]'
      };
    } else if (type === 'monthly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        items: months.map(m => ({ label: m })),
        passed: now.getMonth(),
        label: language === 'en' ? 'Monthly Cycle' : '月度循環',
        unitLabel: language === 'en' ? 'Months Passed' : '月已過',
        icon: Layers,
        gridCols: 'grid-cols-6'
      };
    } else {
      return {
        items: Array.from({ length: 24 }).map((_, i) => ({ label: `${i + 1}h` })),
        passed: now.getHours(),
        label: language === 'en' ? 'Daily Pulse' : '今日脈動',
        unitLabel: language === 'en' ? 'Hours Elapsed' : '小時已逝',
        icon: Clock,
        gridCols: 'grid-cols-8'
      };
    }
  }, [type, language, settings.birthDate]);

  return (
    <div 
      onClick={onClose}
      className="bg-[#111318] rounded-[1.5rem] border border-[#c5a059]/20 p-4 animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden cursor-pointer hover:border-[#c5a059]/40 transition-all shadow-[0_0_20px_rgba(197,160,89,0.05)]"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#c5a059]/5 blur-[60px] rounded-full pointer-events-none" />
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div>
          <h2 className="text-[9px] font-black text-[#c5a059] tracking-[0.2em] uppercase mb-0.5 flex items-center gap-1.5">
            <Icon size={10} className={type === 'yearly' ? 'animate-pulse' : ''} />
            {label}
          </h2>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-white">{passed}</span>
            <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">{unitLabel}</span>
          </div>
        </div>
        <div className="text-[7px] font-black text-white/20 uppercase tracking-widest border border-white/5 px-1.5 py-0.5 rounded-md">Exit</div>
      </div>
      <div className={`grid ${gridCols} gap-1 mb-4 relative z-10`}>
        {items.map((item, i) => {
          const isPassed = i < passed;
          const isCurrent = i === passed;
          let className = "aspect-square rounded-[4px] transition-all duration-700 flex items-center justify-center ";
          if (isPassed) {
             const randomIntensity = (i % 3 === 0) ? 'bg-[#c5a059]' : (i % 7 === 0) ? 'bg-[#c5a059]/80' : 'bg-[#c5a059]/60';
             className += `${randomIntensity} shadow-[0_0_3px_rgba(197,160,89,0.2)]`;
          } else if (isCurrent) {
             className += "bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)] animate-pulse scale-105 z-10";
          } else {
             className += "bg-[#1a1c22] opacity-30"; 
          }
          return (
            <div key={i} className={className}>
              {item.label && <span className={`text-[7px] font-black uppercase tracking-tighter ${isPassed || isCurrent ? 'text-black' : 'text-white/30'}`}>{item.label}</span>}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between border-t border-white/5 pt-3 relative z-10">
        <div className="flex items-center gap-1.5 text-[7px] font-black text-white/30 uppercase tracking-widest">
           <Calendar size={8} />
           <span>{type.toUpperCase()} Progress: {Math.round((passed / items.length) * 100)}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Left</span>
          <div className="flex gap-0.5"><div className="w-1.5 h-1.5 rounded-[1px] bg-[#1a1c22] opacity-50"></div><div className="w-1.5 h-1.5 rounded-[1px] bg-[#c5a059]"></div><div className="w-1.5 h-1.5 rounded-[1px] bg-white"></div></div>
          <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Spent</span>
        </div>
      </div>
    </div>
  );
};

export default TemporalGrid;
