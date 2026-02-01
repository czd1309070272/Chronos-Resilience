
import React, { useState, useEffect, useMemo } from 'react';
import { Orbit } from 'lucide-react';
import { UserAnalytics } from '../types';

interface SelfSoulTabProps {
  language: 'en' | 'zh-TW';
  analytics: UserAnalytics;
}

const SelfSoulTab: React.FC<SelfSoulTabProps> = ({ language, analytics }) => {
  const [reveal, setReveal] = useState(0);
  const [time, setTime] = useState(0);

  const soulData = useMemo(() => {
    const { spirit, mind, adventure, social } = analytics.attributes;
    const avg = (spirit + mind + adventure + social) / 4;
    let calculatedLevel = Math.round(avg * 10);
    if (calculatedLevel < 1) calculatedLevel = 1;
    if (calculatedLevel > 10) calculatedLevel = 10;
    return { level: calculatedLevel, moodStability: analytics.soul.moodStability };
  }, [analytics]);

  useEffect(() => {
    let start = performance.now();
    const loop = (t: number) => {
      const elapsed = t - start;
      setTime(elapsed);
      const revealProgress = Math.min(elapsed / 1500, 1);
      const ease = 1 - Math.pow(1 - revealProgress, 3);
      setReveal(ease);
      requestAnimationFrame(loop);
    };
    const handle = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(handle);
  }, []);

  const stars = useMemo(() => {
    return Array.from({ length: 45 }).map(() => ({
      x: Math.random() * 260,
      y: Math.random() * 260,
      r: Math.random() * 0.8 + 0.2,
      baseOpacity: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.003 + 0.001,
      offset: Math.random() * Math.PI * 2
    }));
  }, []);

  const planets = useMemo(() => {
    const basePalette = ['#c5a059', '#ffffff', '#3a7bd5', '#7f00ff', '#ff0055', '#ffd700', '#00ff9d', '#ff9900', '#ff00ff', '#00ccff', '#ff4d4d', '#b388ff'];
    const shuffledColors = [...basePalette].sort(() => Math.random() - 0.5);
    return Array.from({ length: soulData.level }).map((_, i) => {
      const rx = 45 + Math.random() * 70; 
      const ry = 20 + Math.random() * 50; 
      const rotate = Math.random() * 180; 
      const speed = (0.0002 + Math.random() * 0.0006) * (Math.random() > 0.5 ? 1 : -1); 
      const size = 2 + Math.random() * 2.5; 
      const color = shuffledColors[i % shuffledColors.length];
      const startAngle = Math.random() * Math.PI * 2; 
      return { rx, ry, rotate, speed, size, color, startAngle };
    });
  }, [soulData.level]);

  const center = 130;
  const coreSize = 10 + (soulData.level * 1.5); 

  return (
    <div className="relative flex flex-col items-center justify-center py-4 h-full w-full overflow-hidden">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a0b2e]/30 via-[#0a0b0d]/0 to-[#0a0b0d] z-0 pointer-events-none" />
      <div className="absolute top-2 right-4 flex flex-col items-end z-10">
         <span className="text-[8px] font-black text-[#c5a059] uppercase tracking-widest animate-pulse">Cosmic Resonance</span>
         <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Stability: {soulData.moodStability}%</span>
      </div>
       <div className="absolute top-2 left-4 flex flex-col items-start gap-1 z-10">
         <div className="flex items-center gap-2">
            <Orbit size={12} className="text-[#c5a059]" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Level {soulData.level} / 10</span>
         </div>
      </div>
      <svg width="260" height="260" viewBox="0 0 260 260" className="overflow-visible relative z-10">
        <defs>
          <radialGradient id="soulCoreGradient" cx="0.5" cy="0.5" r="0.5"><stop offset="0%" stopColor="white" stopOpacity="1" /><stop offset="30%" stopColor="#c5a059" stopOpacity="0.8" /><stop offset="70%" stopColor="#7f00ff" stopOpacity="0.3" /><stop offset="100%" stopColor="#0a0b0d" stopOpacity="0" /></radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {stars.map((s, i) => (
             <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" fillOpacity={(s.baseOpacity + (Math.sin(time * s.speed + s.offset) * 0.5 + 0.5) * 0.4) * reveal} />
        ))}
        <g transform={`translate(${center}, ${center}) scale(${reveal})`}>
           <circle r={coreSize * 2.5} fill="url(#soulCoreGradient)" opacity={0.3 + Math.sin(time * 0.0015) * 0.1} />
           <circle r={coreSize * 0.8} fill="white" filter="url(#glow)" className="drop-shadow-[0_0_15px_rgba(197,160,89,0.8)]" />
        </g>
        {planets.map((orbit, i) => {
           const angle = time * orbit.speed + orbit.startAngle;
           const rad = (orbit.rotate * Math.PI) / 180;
           const calcPos = (a: number) => {
               const rawX = orbit.rx * Math.cos(a); const rawY = orbit.ry * Math.sin(a);
               return { x: center + (rawX * Math.cos(rad) - rawY * Math.sin(rad)), y: center + (rawX * Math.sin(rad) + rawY * Math.cos(rad)) };
           };
           const pos = calcPos(angle);
           return (
             <g key={i} opacity={Math.min(Math.max((reveal - 0.2) * 2, 0), 1)}>
               <ellipse cx={center} cy={center} rx={orbit.rx} ry={orbit.ry} fill="none" stroke={orbit.color} strokeWidth="0.5" strokeOpacity={0.1} transform={`rotate(${orbit.rotate}, ${center}, ${center})`} />
               <circle cx={pos.x} cy={pos.y} r={orbit.size} fill={orbit.color} className="drop-shadow-[0_0_5px_currentColor]" style={{ color: orbit.color }} />
             </g>
           );
        })}
      </svg>
    </div>
  );
};

export default SelfSoulTab;
