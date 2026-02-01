
import React, { useState, useEffect } from 'react';
import { CoreAttributes } from '../types';

interface SelfCoreTabProps {
  attributes: CoreAttributes;
}

const SelfCoreTab: React.FC<SelfCoreTabProps> = ({ attributes }) => {
  const [reveal, setReveal] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const duration = 1200;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setReveal(ease);
      if (progress < 1) requestAnimationFrame(step);
    };
    const handle = requestAnimationFrame(step);
    return () => cancelAnimationFrame(handle);
  }, [attributes]);

  const size = 260;
  const center = size / 2;
  const radius = 90;
  
  const points = [
    { label: 'HEALTH', value: attributes.health, angle: -90 },
    { label: 'MIND', value: attributes.mind, angle: -30 },
    { label: 'SKILL', value: attributes.skill, angle: 30 },
    { label: 'SOCIAL', value: attributes.social, angle: 90 },
    { label: 'ADVENTURE', value: attributes.adventure, angle: 150 },
    { label: 'SPIRIT', value: attributes.spirit, angle: 210 },
  ];

  const getCoord = (angle: number, distance: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: center + distance * Math.cos(rad),
      y: center + distance * Math.sin(rad),
    };
  };

  const polygonPath = points
    .map((p) => {
      const { x, y } = getCoord(p.angle, radius * p.value * reveal);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative flex flex-col items-center justify-center py-4 h-full">
      <div className="absolute top-2 right-4 flex flex-col items-end">
         <span className="text-[8px] font-black text-[#c5a059] uppercase tracking-widest animate-pulse">Core Matrix</span>
         <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">System Status: Optimal</span>
      </div>
      <svg width={size} height={size} className="overflow-visible">
        <defs>
          <filter id="coreGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {[0.4, 0.7, 1].map((r, i) => (
          <polygon
            key={i}
            points={points.map((p) => {
              const { x, y } = getCoord(p.angle, radius * r * reveal);
              return `${x},${y}`;
            }).join(' ')}
            fill="transparent"
            stroke="white"
            strokeOpacity={0.05 * reveal}
            strokeWidth="1"
          />
        ))}
        {points.map((p, i) => {
          const { x, y } = getCoord(p.angle, radius * reveal);
          return (
            <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="white" strokeOpacity={0.1 * reveal} strokeWidth="1" />
          );
        })}
        <polygon points={polygonPath} fill="rgba(197, 160, 89, 0.15)" stroke="#c5a059" strokeWidth="2" filter="url(#coreGlow)" style={{ opacity: reveal }} />
        {points.map((p, i) => {
          const { x, y } = getCoord(p.angle, radius * p.value * reveal);
          return (
            <circle key={i} cx={x} cy={y} r={3 * reveal} fill="#c5a059" />
          );
        })}
        {points.map((p, i) => {
          const { x, y } = getCoord(p.angle, (radius + 28) * reveal);
          const scoreValue = Math.round(p.value * 10);
          return (
            <text key={i} x={x} y={y} textAnchor="middle" className="text-[9px] font-black uppercase tracking-[0.15em]" dominantBaseline="middle" style={{ opacity: Math.max(0, reveal - 0.2) }}>
              <tspan x={x} dy="-0.4em" className="fill-white/30">{p.label}</tspan>
              <tspan x={x} dy="1.2em" className="fill-[#c5a059]">{scoreValue}/10</tspan>
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default SelfCoreTab;
