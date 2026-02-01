
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Database, Layers, ChevronLeft, Activity, BarChart3 } from 'lucide-react';
import { LogEntry } from '../types';

interface SelfLogsTabProps {
  language: 'en' | 'zh-TW';
  logs: LogEntry[];
}

const SelfLogsTab: React.FC<SelfLogsTabProps> = ({ language, logs }) => {
  const [time, setTime] = useState(0);
  const [focusedMonth, setFocusedMonth] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Spectral sequence for stars: Red (Newest) -> Orange -> Yellow -> White -> Blue (Oldest)
  const starColors = ['#ff4b4b', '#ff9900', '#ffd700', '#ffffff', '#3a7bd5'];

  useEffect(() => {
    setIsPaused(true);
    const timer = setTimeout(() => {
      setIsPaused(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [focusedMonth]);

  useEffect(() => {
    let requestHandle: number;
    let lastTimestamp = performance.now();

    const loop = (now: number) => {
      if (!isPaused) {
        const delta = (now - lastTimestamp) * 0.001; 
        setTime(prev => prev + delta);
      }
      lastTimestamp = now;
      requestHandle = requestAnimationFrame(loop);
    };

    requestHandle = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestHandle);
  }, [isPaused]);

  const { monthGroups, totalDisplayedLogs } = useMemo(() => {
    const groups: { month: string; entries: LogEntry[] }[] = [];
    const monthMap = new Map<string, LogEntry[]>();
    const processedLogs = logs.slice(0, 100);

    for (const log of processedLogs) {
      // Correct extraction: log.date is "Oct 14, 2023"
      const cleanDate = log.date.replace(',', '');
      const parts = cleanDate.split(' ');
      
      // We want parts[0] (Month) or parts[0]+parts[2] (Month Year)
      const monthStr = parts.length >= 1 ? parts[0].toUpperCase() : 'RECENT';
      
      if (!monthMap.has(monthStr)) {
        monthMap.set(monthStr, []);
        groups.push({ month: monthStr, entries: monthMap.get(monthStr)! });
      }
      
      if (monthMap.get(monthStr)!.length < 8) {
        monthMap.get(monthStr)!.push(log);
      }
    }

    const limitedGroups = groups.slice(0, 5);
    const count = limitedGroups.reduce((acc, g) => acc + g.entries.length, 0);

    return { monthGroups: limitedGroups, totalDisplayedLogs: count };
  }, [logs]);

  const clusters = useMemo(() => {
    const canvasHeight = 240; 
    const canvasWidth = 260;
    const paddingY = 40;
    const count = monthGroups.length;
    const stepY = count > 1 ? (canvasHeight - paddingY * 2) / (count - 1) : 0;

    return monthGroups.map((group, index) => {
      const cy = count === 1 ? canvasHeight / 2 : paddingY + index * stepY;
      const cx = canvasWidth / 2 + Math.sin(index * 2.5) * 20; 

      const particles = group.entries.map((entry, i) => {
        const angleOffset = (i / group.entries.length) * Math.PI * 2;
        const distBase = 22 + (i % 3) * 12; 
        
        return {
          id: entry.id,
          angleOffset,
          distBase,
          isHighlight: entry.isHighlight
        };
      });

      return {
        month: group.month,
        cx,
        cy,
        particles,
        logCount: group.entries.length,
        starColor: starColors[index] || '#c5a059'
      };
    });
  }, [monthGroups]);

  const spinePath = useMemo(() => {
     if (clusters.length < 2) return '';
     return `M ${clusters.map(c => `${c.cx},${c.cy}`).join(' L ')}`;
  }, [clusters]);

  const activeClusterData = useMemo(() => {
    if (!focusedMonth) return null;
    return clusters.find(c => c.month === focusedMonth);
  }, [focusedMonth, clusters]);

  return (
    <div className="relative flex flex-col items-center justify-center py-4 h-full w-full overflow-hidden bg-[#0a0b0d]">
       <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${focusedMonth ? 'opacity-0' : 'opacity-30'}`}>
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#c5a059]/20 to-transparent -translate-x-1/2" />
       </div>

      <div className={`absolute top-2 right-4 flex flex-col items-end z-10 pointer-events-none transition-all duration-500 ${focusedMonth ? 'translate-x-20 opacity-0' : 'translate-x-0 opacity-100'}`}>
         <span className="text-[8px] font-black text-[#c5a059] uppercase tracking-widest animate-pulse flex items-center gap-1">
           <Database size={10} /> Data Nodes
         </span>
         <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Visible: {totalDisplayedLogs}</span>
      </div>

      <div className={`absolute top-2 left-4 flex flex-col items-start gap-1 z-10 pointer-events-none transition-all duration-500 ${focusedMonth ? '-translate-x-20 opacity-0' : 'translate-x-0 opacity-100'}`}>
         <div className="flex items-center gap-2">
            <Layers size={12} className="text-[#c5a059]" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Nebula Timeline</span>
         </div>
      </div>

      {focusedMonth && (
        <button 
            onClick={() => setFocusedMonth(null)}
            className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-2 bg-[#c5a059]/10 border border-[#c5a059]/30 rounded-full text-[#c5a059] hover:bg-[#c5a059]/20 transition-all animate-in fade-in slide-in-from-top-4 duration-500 cursor-pointer pointer-events-auto"
        >
            <ChevronLeft size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">Return</span>
        </button>
      )}

      <svg width="260" height="260" viewBox="0 0 260 260" className="overflow-visible relative z-10">
        <defs>
          <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <radialGradient id="nebulaCloud" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#c5a059" stopOpacity="0.15" />
            <stop offset="40%" stopColor="#7f00ff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0a0b0d" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {clusters.length > 1 && (
            <g style={{ opacity: focusedMonth ? 0 : 1, transition: 'opacity 0.5s ease-in-out' }}>
                <path d={spinePath} fill="none" stroke="#c5a059" strokeWidth="4" strokeOpacity="0.15" filter="url(#starGlow)" strokeLinecap="round" />
                <path d={spinePath} fill="none" stroke="#c5a059" strokeWidth="1.2" strokeOpacity="0.7" strokeLinecap="round" />
            </g>
        )}

        {clusters.map((cluster) => {
            const isFocused = focusedMonth === cluster.month;
            const isDimmed = focusedMonth !== null && !isFocused;
            const targetX = isFocused ? (130 - cluster.cx) : 0;
            const targetY = isFocused ? (130 - cluster.cy) : 0;
            const scale = isFocused ? 2.0 : (isDimmed ? 0 : 1);

            return (
                <g 
                    key={cluster.month}
                    transform={`translate(${cluster.cx}, ${cluster.cy})`}
                    style={{
                        opacity: isDimmed ? 0 : 1,
                        transition: 'opacity 0.5s ease-in-out',
                        pointerEvents: isDimmed ? 'none' : 'auto'
                    }}
                >
                   <g style={{
                        transform: `translate(${targetX}px, ${targetY}px) scale(${scale})`,
                        transformOrigin: '0 0',
                        transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                   }}>
                        <circle cx="0" cy="0" r="65" fill="url(#nebulaCloud)" className="animate-pulse pointer-events-none" style={{ animationDuration: '4s' }} />
                        
                        {/* Static White Orbit Lines with Low Visibility */}
                        {[22, 34, 46].map((r, i) => (
                            <circle 
                                key={i} 
                                cx="0" cy="0" r={r} 
                                fill="none" 
                                stroke="white" 
                                strokeWidth="0.5" 
                                strokeOpacity={isFocused ? 0.08 : 0.04} 
                                strokeDasharray={i % 2 === 0 ? "none" : "2 2"} 
                                className="pointer-events-none" 
                            />
                        ))}

                        <g transform="translate(-55, 0)" className="pointer-events-none" style={{ opacity: isFocused ? 0 : 0.9, transition: 'opacity 0.3s' }}>
                            <text x="-10" y="4" fill="#c5a059" textAnchor="end" className="text-[10px] font-black uppercase tracking-widest drop-shadow-[0_0_5px_rgba(197,160,89,0.5)]">{cluster.month}</text>
                            <line x1="-5" y1="0" x2="30" y2="0" stroke="#c5a059" strokeWidth="0.5" opacity="0.4" />
                        </g>

                        <g className="touch-manipulation">
                            <circle r={6} fill="white" filter="url(#starGlow)" className="pointer-events-none">
                                <animate attributeName="r" values="5.5;6.5;5.5" dur="3s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
                            </circle>
                            <circle r={10} fill={cluster.starColor} fillOpacity="0.5" filter="url(#starGlow)" className="pointer-events-none" />
                            <circle r={18} fill="white" fillOpacity="0" className="cursor-pointer" style={{ pointerEvents: 'fill' }} onClick={(e) => { e.stopPropagation(); setFocusedMonth(isFocused ? null : cluster.month); }} />
                        </g>

                        {cluster.particles.map((p, pIdx) => {
                            const rotationSpeed = 0.15 + (pIdx % 3) * 0.05; 
                            const dir = pIdx % 2 === 0 ? 1 : -1;
                            const currentAngle = p.angleOffset + time * rotationSpeed * dir;
                            const px = Math.cos(currentAngle) * p.distBase;
                            const py = Math.sin(currentAngle) * p.distBase * 0.7;
                            const z = Math.sin(currentAngle); 
                            const scaleP = 0.7 + z * 0.3; 
                            const opacityP = 0.6 + z * 0.4;
                            return (
                                <g key={p.id} transform={`translate(${px}, ${py}) scale(${scaleP})`} className="pointer-events-none">
                                    <circle r={p.isHighlight ? 4 : 2} fill={p.isHighlight ? "#c5a059" : "white"} opacity={opacityP * 0.3} filter="url(#starGlow)" />
                                    <circle r={p.isHighlight ? 2.5 : 1.5} fill={p.isHighlight ? "#c5a059" : "white"} opacity={opacityP} />
                                </g>
                            );
                        })}
                   </g>
                </g>
            );
        })}
      </svg>
      
      <div 
        className={`absolute bottom-8 left-0 right-0 flex flex-col items-center justify-center z-20 transition-all duration-700 ease-[cubic-bezier(0.34, 1.56, 0.64, 1)] ${focusedMonth ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
      >
         {activeClusterData && (
             <div className="flex flex-col items-center">
                 <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md px-6 py-2.5 rounded-full border border-[#c5a059]/20 shadow-[0_0_25px_rgba(197,160,89,0.1)]">
                    <h2 className="text-xl font-black uppercase tracking-[0.2em] text-[#c5a059]">
                        {activeClusterData.month}
                    </h2>
                    <div className="w-[1px] h-4 bg-white/20" />
                    <div className="flex items-center gap-2">
                        <Activity size={14} className="text-white/40" />
                        <span className="text-xs font-black text-white/80 uppercase tracking-widest">
                           {activeClusterData.logCount}
                        </span>
                    </div>
                 </div>
             </div>
         )}
      </div>

      <div className={`absolute bottom-2 w-full flex justify-between px-6 text-[7px] font-black text-white/20 uppercase tracking-widest transition-opacity duration-500 ${focusedMonth ? 'opacity-0' : 'opacity-100'}`}>
         <span>Oldest: {logs[logs.length - 1]?.date || 'N/A'}</span>
         <span>System: Nebula V4-Fixed</span>
      </div>
    </div>
  );
};

export default SelfLogsTab;
