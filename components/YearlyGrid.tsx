
import React, { useMemo } from 'react';
import { Calendar, Flame } from 'lucide-react';

interface YearlyGridProps {
  onClose: () => void;
}

const YearlyGrid: React.FC<YearlyGridProps> = ({ onClose }) => {
  const { days, daysPassed } = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    // Check for leap year
    const year = now.getFullYear();
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const totalDays = isLeap ? 366 : 365;

    return {
      days: Array.from({ length: totalDays }),
      daysPassed: dayOfYear
    };
  }, []);

  return (
    <div 
      onClick={onClose}
      className="bg-[#111318] rounded-[2rem] border border-[#00f2ff]/20 p-6 animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden cursor-pointer hover:border-[#00f2ff]/40 transition-all shadow-[0_0_30px_rgba(0,242,255,0.05)]"
    >
      {/* Background Glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00f2ff]/5 blur-[80px] rounded-full pointer-events-none" />
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h2 className="text-[10px] font-black text-[#00f2ff] tracking-[0.3em] uppercase mb-1 flex items-center gap-2">
            <Flame size={12} className="animate-pulse" />
            Temporal Burn
          </h2>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{daysPassed}</span>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Days Gone</span>
          </div>
        </div>
        <div className="text-[8px] font-black text-white/20 uppercase tracking-widest border border-white/5 px-2 py-1 rounded-md">
          Click to exit
        </div>
      </div>

      {/* The 365 Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(8px,1fr))] gap-1.5 mb-6 relative z-10">
        {days.map((_, i) => {
          const isPassed = i < daysPassed;
          const isToday = i === daysPassed;
          
          let className = "aspect-square rounded-[2px] transition-all duration-700 ";
          
          if (isPassed) {
             // Passed days are Lit / "Burned"
             const randomIntensity = (i % 3 === 0) ? 'bg-[#00f2ff]' : (i % 7 === 0) ? 'bg-[#00f2ff]/80' : 'bg-[#00f2ff]/60';
             className += `${randomIntensity} shadow-[0_0_5px_rgba(0,242,255,0.3)]`;
          } else if (isToday) {
             // Today is white hot
             className += "bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse scale-125";
          } else {
             // Future is Dark
             className += "bg-[#1a1c22] opacity-30"; 
          }

          return (
            <div 
              key={i} 
              className={className}
            />
          );
        })}
      </div>

      {/* Legend / Footer */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4 relative z-10">
        <div className="flex items-center gap-2 text-[8px] font-black text-white/30 uppercase tracking-widest">
           <Calendar size={10} />
           <span>Year Progress: {Math.round((daysPassed / days.length) * 100)}%</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Left</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-[1px] bg-[#1a1c22] opacity-50"></div>
            <div className="w-2 h-2 rounded-[1px] bg-[#00f2ff]/40"></div>
            <div className="w-2 h-2 rounded-[1px] bg-[#00f2ff]"></div>
            <div className="w-2 h-2 rounded-[1px] bg-white shadow-[0_0_5px_white]"></div>
          </div>
          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Spent</span>
        </div>
      </div>
    </div>
  );
};

export default YearlyGrid;
