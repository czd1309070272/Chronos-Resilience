
import React, { useState, useEffect, useRef } from 'react';

interface LifeProgressBarProps {
  progress: number;
  yearsElapsed: number;
  estimatedYears: number;
  language: 'en' | 'zh-TW';
}

const LifeProgressBar: React.FC<LifeProgressBarProps> = ({ progress, yearsElapsed, estimatedYears, language }) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const hasInitialized = useRef(false);

  useEffect(() => {
    setDisplayProgress(0);
    hasInitialized.current = false;
  }, []);

  useEffect(() => {
    if (progress > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      const timer = setTimeout(() => {
        setDisplayProgress(progress);
      }, 50);
      return () => clearTimeout(timer);
    } else if (hasInitialized.current) {
      setDisplayProgress(progress);
    }
  }, [progress]);

  const earthTimeLabel = language === 'en' ? 'EARTH TIME' : '地球時間 (誕生)';
  const horizonLabel = language === 'en' ? 'EVENT HORIZON' : '事件視界 (終點)';

  return (
    <div className="mt-8">
      <div className="flex justify-between text-[9px] font-mono font-black tracking-[0.2em] text-white/30 mb-3 px-1">
        <span className="flex items-center gap-1.5">
           <div className="w-1.5 h-1.5 rounded-full bg-[#3a7bd5]/60" />
           {earthTimeLabel}
        </span>
        <span className="flex items-center gap-1.5">
           {horizonLabel}
           <div className="w-1.5 h-1.5 rounded-full bg-[#ff4b2b]/60" />
        </span>
      </div>
      
      <div className="h-14 w-full bg-[#0a0b0d] rounded-2xl overflow-hidden relative border border-white/10 p-1 shadow-inner">
        {/* Tactical Coordinate Grid */}
        <div className="absolute inset-0 grid grid-cols-20 grid-rows-1 gap-px p-2 pointer-events-none opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="h-full w-px bg-white"></div>
          ))}
        </div>
        
        {/* Horizontal Baseline */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5 -translate-y-1/2" />

        {/* Relativity Gradient Fill */}
        <div 
          className="h-full rounded-xl bg-gradient-to-r from-[#3a7bd5] via-[#c5a059] to-[#ff4b2b] relative flex items-center justify-end transition-all duration-[1800ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{ width: `${Math.max(2, displayProgress)}%` }}
        >
          {/* Gravitational Lens Effect Indicator */}
          <div className="relative w-8 h-8 flex items-center justify-center -mr-4">
             <div className="absolute inset-0 bg-white/20 rounded-full animate-ping duration-[3s]" />
             <div className="absolute inset-1 bg-white/30 rounded-full blur-sm" />
             <div className="w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_20px_white] z-10" />
             
             {/* Red/Blue shift halo */}
             <div className="absolute -inset-2 border border-white/5 rounded-full" />
          </div>
          
          {/* Scanning Line */}
          <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white shadow-[0_0_10px_white]" />
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 px-1">
        <div className="flex flex-col">
           <span className="text-[7px] font-mono font-black text-white/20 uppercase tracking-widest mb-0.5">Projected Decay</span>
           <span className="text-[10px] font-mono font-black text-white/50">{estimatedYears} {language === 'en' ? 'EARTH YEARS' : '地球年'}</span>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-[7px] font-mono font-black text-[#c5a059] uppercase tracking-widest mb-0.5">Temporal displacement</span>
           <span className="text-[10px] font-mono font-black text-[#c5a059] shadow-[#c5a059]/20">{yearsElapsed} {language === 'en' ? 'SOLAR UNITS' : '太陽週期'}</span>
        </div>
      </div>
    </div>
  );
};

export default LifeProgressBar;
