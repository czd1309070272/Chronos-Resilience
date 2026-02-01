
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Globe as GlobeIcon, MapPin, Compass, Navigation, Calendar, Info, Layers, Maximize2, MoveUpRight, Trophy, PlaneTakeoff, Plus, Minus, Move, ChevronRight, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { MOCK_MAP_LOCATIONS } from '../constants';
import { translations } from '../translations';

const TacticalMapSVG = () => (
  <svg viewBox="0 0 1000 500" className="w-full h-full opacity-30 transition-opacity duration-1000">
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
    
    <g className="text-white/20">
      <path d="M150,120 L280,110 L320,150 L300,250 L200,350 L100,200 Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M280,300 L350,320 L320,450 L250,420 Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M450,100 L550,100 L580,180 L480,200 Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M450,220 L580,220 L600,380 L520,400 L460,300 Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M600,100 L850,110 L900,250 L700,350 L600,200 Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M800,380 L900,380 L920,450 L820,460 Z" fill="currentColor" fillOpacity="0.1" />
    </g>

    <line x1="0" y1="250" x2="1000" y2="250" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5,5" strokeOpacity="0.1" />
    <line x1="500" y1="0" x2="500" y2="500" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5,5" strokeOpacity="0.1" />
  </svg>
);

interface MapViewProps {
  language: 'en' | 'zh-TW';
  isNavVisible: boolean;
  setIsNavVisible: (visible: boolean) => void;
}

const MapView: React.FC<MapViewProps> = ({ language, isNavVisible, setIsNavVisible }) => {
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_MAP_LOCATIONS.find(l => l.isCurrent)?.id || MOCK_MAP_LOCATIONS[0].id);
  const [activeTab, setActiveTab] = useState<'log' | 'stats'>('log');
  const t = translations[language].map;
  
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const touchStartDist = useRef<number | null>(null);
  const startScale = useRef<number>(1);

  const selectedLocation = useMemo(() => MOCK_MAP_LOCATIONS.find(l => l.id === selectedId), [selectedId]);

  const stats = useMemo(() => ({
    total: MOCK_MAP_LOCATIONS.length,
    countries: 4,
    milestones: 8,
    coverage: 12.4
  }), []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.pointer-events-auto')) return;
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStartPos.current.x,
      y: e.clientY - dragStartPos.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.pointer-events-auto')) return;
      setIsDragging(true);
      dragStartPos.current = { x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y };
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
      startScale.current = scale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setOffset({
        x: e.touches[0].clientX - dragStartPos.current.x,
        y: e.touches[0].clientY - dragStartPos.current.y
      });
    } else if (e.touches.length === 2 && touchStartDist.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const zoomFactor = dist / touchStartDist.current;
      setScale(Math.min(Math.max(startScale.current * zoomFactor, 0.5), 4));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDist.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.005;
      setScale(prev => Math.min(Math.max(prev + delta, 0.5), 4));
    }
  };

  const toggleLocation = (id: string) => {
    setSelectedId(prev => prev === id ? null : id);
  };

  return (
    <div 
      className="relative h-screen w-full bg-[#0a0b0d] flex flex-col overflow-hidden text-white font-sans touch-none select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      
      <div className="absolute top-0 left-0 right-0 z-50 px-6 pt-8 pb-4 bg-gradient-to-b from-[#0a0b0d] via-[#0a0b0d]/80 to-transparent pointer-events-none">
        <div className="flex justify-between items-center pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center shadow-[0_0_20px_rgba(197,160,89,0.15)]">
              <GlobeIcon size={22} className="text-[#c5a059] animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight uppercase leading-none">{t.title}</h1>
              <p className="text-[10px] font-black text-[#c5a059] tracking-[0.2em] uppercase mt-1">{t.satellite}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-[#111318]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-1.5">
            <button 
              onClick={() => setActiveTab('log')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'log' ? 'bg-[#c5a059] text-black shadow-lg' : 'text-white/30 hover:text-white'}`}
            >
              {t.expeditions}
            </button>
            <button 
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'stats' ? 'bg-[#c5a059] text-black shadow-lg' : 'text-white/30 hover:text-white'}`}
            >
              {t.analytics}
            </button>
          </div>
        </div>
      </div>

      <div 
        className={`relative flex-grow flex flex-col items-center justify-center overflow-hidden transition-colors ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.08)_0%,transparent_60%)]" />
        </div>

        <div 
          ref={mapContainerRef}
          className="relative w-full max-w-5xl aspect-[2/1] px-12 sm:px-20 transition-transform duration-100 ease-out will-change-transform"
          style={{ 
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          }}
        >
          <TacticalMapSVG />

          {MOCK_MAP_LOCATIONS.map((loc) => (
            <div
              key={loc.id}
              className="absolute transition-all transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
              style={{ left: `${loc.coordinates.x}%`, top: `${loc.coordinates.y}%` }}
              onClick={(e) => { e.stopPropagation(); toggleLocation(loc.id); }}
            >
              <div className="relative flex items-center justify-center">
                <div 
                  className={`pulse-container transition-transform duration-300 ${selectedId === loc.id ? 'scale-150' : 'scale-100 hover:scale-110'}`}
                  style={{ transform: `scale(${1 / scale * (selectedId === loc.id ? 1.5 : 1)})` }}
                >
                  <div className={`pulse-ring ${selectedId === loc.id ? 'opacity-80' : 'opacity-20 group-hover:opacity-40'}`} />
                  <div className={`pulse-dot ${selectedId === loc.id ? 'bg-white shadow-[0_0_15px_#c5a059]' : 'bg-[#c5a059]/80'}`} />
                </div>
                
                {selectedId !== loc.id && (
                  <div className="absolute top-8 whitespace-nowrap opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all pointer-events-none">
                    <div className="bg-[#111318]/90 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg">
                      <span className="text-[8px] font-black text-white/60 tracking-widest uppercase">{loc.title}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {selectedLocation && (
            <div 
              className="absolute pointer-events-none transition-all duration-300 z-[60]"
              style={{ 
                left: `${selectedLocation.coordinates.x}%`, 
                top: `${selectedLocation.coordinates.y}%`,
                transform: `translate(-100%, -50%) translateX(-24px) scale(${1 / scale})`,
                transformOrigin: 'right center'
              }}
            >
              <div className="bg-[#111318]/95 backdrop-blur-3xl border border-[#c5a059]/40 rounded-[2rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] w-[180px] pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="relative h-20 w-full rounded-xl overflow-hidden mb-3 border border-white/10">
                  <img src={selectedLocation.imageUrl} alt="" className="w-full h-full object-cover grayscale-[0.2]" />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/10">
                    <Maximize2 size={8} className="text-[#c5a059]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-start mb-0.5">
                    <h3 className="text-[10px] font-black text-white tracking-tight uppercase truncate mr-1">{selectedLocation.title}</h3>
                    {selectedLocation.isCurrent && (
                      <span className="shrink-0 text-[6px] font-black text-[#c5a059] bg-[#c5a059]/10 px-1 py-0.5 rounded border border-[#c5a059]/30">LIVE</span>
                    )}
                  </div>
                  <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-2 truncate">{selectedLocation.subtitle}</p>
                  <div className="flex items-center justify-between border-t border-white/5 pt-2">
                    <div className="flex items-center gap-1 text-white/30">
                      <Calendar size={8} />
                      <span className="text-[7px] font-black uppercase tracking-tighter">{selectedLocation.date}</span>
                    </div>
                    <button className="w-6 h-6 bg-[#c5a059]/10 rounded-lg text-[#c5a059] flex items-center justify-center hover:bg-[#c5a059] hover:text-black transition-all">
                      <MoveUpRight size={10} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'stats' && (
        <div className="absolute inset-x-0 bottom-32 px-6 flex flex-col items-center animate-in slide-in-from-bottom-10 fade-in duration-500 z-40 pointer-events-none">
           <div className="grid grid-cols-4 gap-3 w-full max-w-sm pointer-events-auto">
             {[
               { icon: MapPin, val: stats.total, label: t.locations, color: '#c5a059' },
               { icon: Navigation, val: stats.countries, label: t.nations, color: '#3a7bd5' },
               { icon: Trophy, val: stats.milestones, label: t.expeditions_stat, color: '#c5a059' },
               { icon: GlobeIcon, val: stats.coverage + '%', label: t.coverage, color: '#fff' }
             ].map((s, i) => (
               <div key={i} className="bg-[#111318]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-2">
                 <s.icon size={14} style={{ color: s.color }} />
                 <span className="text-sm font-black" style={{ color: s.color }}>{s.val}</span>
                 <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em]">{s.label}</span>
               </div>
             ))}
           </div>
        </div>
      )}

      <div 
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-40 flex items-center transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isToolbarVisible ? 'translate-x-0' : 'translate-x-[calc(100%-24px)]'
        }`}
      >
        <button 
          onClick={() => setIsToolbarVisible(!isToolbarVisible)}
          className="w-6 h-12 bg-[#111318]/80 backdrop-blur-xl border border-y border-l border-white/10 rounded-l-xl flex items-center justify-center text-[#c5a059]/60 hover:text-[#c5a059] transition-colors"
        >
          {isToolbarVisible ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="flex flex-col gap-3 p-4 bg-[#111318]/70 backdrop-blur-xl border-l border-white/10 rounded-l-3xl shadow-2xl">
          <button 
            onClick={() => setScale(s => Math.min(s + 0.2, 4))}
            className="w-12 h-12 bg-[#111318]/70 border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:text-[#c5a059] active:scale-90 transition-all"
          >
            <Plus size={20} />
          </button>
          <button 
            onClick={() => setScale(s => Math.max(s - 0.2, 0.5))}
            className="w-12 h-12 bg-[#111318]/70 border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:text-[#c5a059] active:scale-90 transition-all"
          >
            <Minus size={20} />
          </button>
          <button 
            onClick={() => { setOffset({ x: 0, y: 0 }); setScale(1); }}
            className="w-12 h-12 bg-[#111318]/70 border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:text-[#c5a059] active:scale-90 transition-all"
          >
            <Move size={20} />
          </button>
          <div className="h-px bg-white/10 my-1 mx-2" />
          {[Layers, Compass].map((Icon, i) => (
            <button key={i} className="w-12 h-12 bg-[#111318]/70 border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:text-[#c5a059] transition-all active:scale-90">
              <Icon size={20} />
            </button>
          ))}
        </div>
      </div>

      <div 
        className={`absolute right-10 z-[60] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isNavVisible ? 'bottom-32' : 'bottom-10'
        }`}
      >
        <button 
          onClick={() => setIsNavVisible(!isNavVisible)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all shadow-2xl active:scale-90 ${
            isNavVisible 
              ? 'bg-[#111318]/80 border-white/10 text-white/30' 
              : 'bg-[#c5a059] border-[#c5a059] text-black shadow-[0_0_20px_rgba(197,160,89,0.4)]'
          }`}
          title={isNavVisible ? "Hide Bottom Nav" : "Show Bottom Nav"}
        >
          {isNavVisible ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
      </div>
    </div>
  );
};

export default MapView;
