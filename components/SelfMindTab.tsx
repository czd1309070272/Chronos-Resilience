
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Brain, Activity, Cpu } from 'lucide-react';

interface Node {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const SelfMindTab: React.FC<{ language: 'en' | 'zh-TW'; mindScore: number }> = ({ language, mindScore }) => {
  const size = 260;
  const center = size / 2;
  const [time, setTime] = useState(0);
  const nodesRef = useRef<Node[]>([]);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const nodeCount = 6 + Math.round(mindScore * 14);
    const newNodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (size * 0.38); 
      newNodes.push({
        id: i,
        x: center + Math.cos(angle) * dist,
        y: center + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * (0.1 + mindScore * 0.4),
        vy: (Math.random() - 0.5) * (0.1 + mindScore * 0.4),
        radius: 1.5 + Math.random() * 2
      });
    }
    nodesRef.current = newNodes;
  }, [mindScore]);

  useEffect(() => {
    const animate = (t: number) => {
      setTime(t);
      nodesRef.current.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        const dx = node.x - center;
        const dy = node.y - center;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = size * 0.45;
        if (dist > maxDist) {
          const angle = Math.atan2(dy, dx);
          node.vx -= Math.cos(angle) * 0.05;
          node.vy -= Math.sin(angle) * 0.05;
        }
      });
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const connections = useMemo(() => {
    const lines: { x1: number, y1: number, x2: number, y2: number, opacity: number, key: string }[] = [];
    const nodes = nodesRef.current;
    const threshold = 75;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < threshold) {
          const opacity = 1 - (dist / threshold);
          lines.push({ x1: nodes[i].x, y1: nodes[i].y, x2: nodes[j].x, y2: nodes[j].y, opacity: opacity * 0.5, key: `${i}-${j}` });
        }
      }
    }
    return lines;
  }, [time]);

  const scorePercent = Math.round(mindScore * 100);

  return (
    <div className="relative flex flex-col items-center justify-center py-4 h-full w-full overflow-hidden bg-[#0a0b0d]">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border border-[#c5a059] rounded-full opacity-[0.03]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] border border-[#c5a059] rounded-full opacity-[0.05]" />
      </div>
      <div className="absolute top-2 right-4 flex flex-col items-end z-10">
         <span className="text-[8px] font-black text-[#c5a059] uppercase tracking-widest flex items-center gap-1"><Activity size={10} /> Neural Nexus</span>
         <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Synaptic Load: {scorePercent}%</span>
      </div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible relative z-10">
        <defs>
            <filter id="neuronGlow"><feGaussianBlur stdDeviation="1.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <radialGradient id="centerGrad" cx="0.5" cy="0.5" r="0.5"><stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" /><stop offset="50%" stopColor="#c5a059" stopOpacity="0.5" /><stop offset="100%" stopColor="#c5a059" stopOpacity="0" /></radialGradient>
        </defs>
        {connections.map((line) => (
            <g key={line.key}>
                <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#c5a059" strokeWidth="0.5" strokeOpacity={line.opacity} />
                {line.opacity > 0.25 && (
                   <circle r="1.2" fill="white" filter="url(#neuronGlow)">
                      <animateMotion dur={`${2.5 - mindScore * 1.5}s`} repeatCount="indefinite" path={`M${line.x1},${line.y1} L${line.x2},${line.y2}`} keyPoints="0;1" keyTimes="0;1" calcMode="linear" begin={`${Math.random() * -2}s`} />
                   </circle>
                )}
            </g>
        ))}
        {nodesRef.current.map((node) => (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                <circle r={node.radius} fill="#c5a059" filter="url(#neuronGlow)" opacity={0.8 + Math.sin(time * 0.003 + node.id) * 0.2} />
            </g>
        ))}
        <g transform={`translate(${center}, ${center})`}>
            <circle r="8" fill="url(#centerGrad)"><animate attributeName="r" values="6;9;6" dur="4s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.6;0.9;0.6" dur="4s" repeatCount="indefinite" /></circle>
            <Brain size={10} className="text-black -translate-x-[5px] -translate-y-[5px] absolute" />
        </g>
      </svg>
      <div className="absolute bottom-2 w-full flex justify-between px-6 text-[7px] font-black text-white/20 uppercase tracking-widest">
         <span>Nodes: {nodesRef.current.length}</span>
         <span>Latency: {(20 - mindScore * 15).toFixed(1)}ms</span>
      </div>
    </div>
  );
};

export default SelfMindTab;
