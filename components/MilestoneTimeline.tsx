
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, Plus, CheckCircle2, X, Target, Sparkles, Frown, Trophy, CloudRain, RotateCcw, Orbit, AlertCircle, Ghost, Zap, Loader2, Minus, Bot, MessageSquare, Info } from 'lucide-react';
import { Milestone } from '../types';
import { translations } from '../translations';

interface MilestoneTimelineProps {
  milestones: Milestone[];
  onBack: () => void;
  onAdd: (milestone: Milestone) => void;
  onUpdate: (id: string, updates: Partial<Milestone>) => void;
  currentAge: number;
  language: 'en' | 'zh-TW';
}

const FeedbackOverlay: React.FC<{ language: 'en' | 'zh-TW'; type: 'success' | 'regret'; onClose: () => void }> = ({ language, type, onClose }) => {
  const t = translations[language].milestones;
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300 cursor-pointer"
    >
      <div className="bg-[#111318] border border-white/10 rounded-[3rem] p-10 flex flex-col items-center gap-6 shadow-[0_0_60px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-500 pointer-events-none text-center">
        {type === 'success' ? (
          <>
            <div className="w-24 h-24 rounded-full bg-[#c5a059]/20 flex items-center justify-center relative mx-auto">
              <Trophy size={48} className="text-[#c5a059] animate-bounce" />
              <span className="absolute -top-2 -right-2 text-[#c5a059]"><Sparkles size={24} /></span>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-black text-white mb-2">{t.incredible}</h3>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{t.growth_detected}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center relative mx-auto">
              <CloudRain size={48} className="text-red-400" />
              <span className="absolute -top-2 -right-2 text-red-400"><Frown size={24} /></span>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-black text-white mb-2">{t.detour}</h3>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{t.time_slips}</p>
            </div>
          </>
        )}
        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mt-2 animate-pulse">Click anywhere to skip</p>
      </div>
    </div>
  );
};

const CreateMilestoneOverlay: React.FC<{ 
  language: 'en' | 'zh-TW'; 
  onClose: () => void; 
  onSave: (m: Milestone) => void;
  currentAge: number;
  initialTitle?: string;
  initialCategory?: 'Adventure' | 'Travel' | 'Skill';
}> = ({ language, onClose, onSave, currentAge, initialTitle = '', initialCategory = 'Adventure' }) => {
  const t = translations[language].milestones;
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState<'Adventure' | 'Travel' | 'Skill'>(initialCategory);
  // Set initial estimated age to currentAge or slightly above for better UX
  const [estimatedAge, setEstimatedAge] = useState<number>(currentAge);
  const MAX_TITLE_LENGTH = 40;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: Date.now().toString(),
      title: title.trim(),
      status: 'pending',
      category,
      estimatedAge
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-[#0d0f14] border-t border-[#c5a059]/20 rounded-t-[3rem] p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-full duration-500 ease-out">
        <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-8" />
        <h2 className="text-xl font-black mb-8">{t.set_goal}</h2>
        <div className="space-y-8">
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block">{t.ambition_title}</label>
              <span className={`text-[9px] font-mono font-black tabular-nums transition-colors ${title.length >= MAX_TITLE_LENGTH ? 'text-red-500' : 'text-[#c5a059]/40'}`}>
                {title.length} / {MAX_TITLE_LENGTH}
              </span>
            </div>
            <input 
              autoFocus 
              value={title} 
              maxLength={MAX_TITLE_LENGTH}
              onChange={e => setTitle(e.target.value)} 
              className="w-full bg-transparent text-2xl font-black outline-none border-b border-white/5 pb-2 focus:border-[#c5a059]/40 transition-colors" 
              placeholder="..." 
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 block">{t.category}</label>
            <div className="flex gap-2">
              {(['Adventure', 'Travel', 'Skill'] as const).map(c => (
                <button key={c} onClick={() => setCategory(c)} className={`flex-1 py-3 rounded-2xl text-[10px] font-black border transition-all ${category === c ? 'bg-[#c5a059]/20 border-[#c5a059]/40 text-[#c5a059]' : 'bg-white/5 border-transparent text-white/30'}`}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-3"><label className="text-[10px] font-black text-white/30 uppercase tracking-widest">{t.temporal_target}</label><span className="text-xs font-black text-[#c5a059]">{estimatedAge}Y</span></div>
            <input 
              type="range" 
              min={currentAge} 
              max="100" 
              value={estimatedAge} 
              onChange={e => setEstimatedAge(parseInt(e.target.value))} 
              className="w-full accent-[#c5a059]" 
            />
          </div>
          <button onClick={handleSave} disabled={!title.trim()} className="w-full h-16 bg-[#c5a059] text-black rounded-[2rem] font-black uppercase text-xs tracking-widest active:scale-95 transition-all">{t.commit}</button>
        </div>
      </div>
    </div>
  );
};

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ milestones, onBack, onAdd, onUpdate, currentAge, language }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [retryData, setRetryData] = useState<{ title: string; category: 'Adventure' | 'Travel' | 'Skill' } | null>(null);
  const [feedback, setFeedback] = useState<'success' | 'regret' | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dockingId, setDockingId] = useState<string | null>(null);
  const [millerTick, setMillerTick] = useState(false);
  
  const t = translations[language].milestones;

  // Miller's Planet 1.25s Tick
  useEffect(() => {
    const interval = setInterval(() => {
      setMillerTick(true);
      setTimeout(() => setMillerTick(false), 200);
    }, 1250);
    return () => clearInterval(interval);
  }, []);

  // Split milestones: Active trajectory vs Lost signals
  const activeMilestones = milestones.filter(m => m.status !== 'missed');
  const missedMilestones = milestones.filter(m => m.status === 'missed').sort((a, b) => (a.estimatedAge || 0) - (b.estimatedAge || 0));

  const ageGroups = useMemo(() => {
    const groups: Record<number, Milestone[]> = {};
    activeMilestones.forEach(m => {
      const age = m.estimatedAge || 0;
      if (!groups[age]) groups[age] = [];
      groups[age].push(m);
    });
    return Object.entries(groups)
      .map(([age, list]) => ({ age: parseInt(age), milestones: list }))
      .sort((a, b) => a.age - b.age);
  }, [activeMilestones]);

  const stats = useMemo(() => {
    const completed = milestones.filter(m => m.status === 'completed').length;
    const remaining = milestones.filter(m => m.status === 'pending' || m.status === 'long-term').length;
    const overdue = milestones.filter(m => m.status !== 'completed' && m.status !== 'missed' && (m.estimatedAge || 0) < currentAge).length;
    return { completed, remaining, overdue };
  }, [milestones, currentAge]);

  const toggleSelection = (id: string) => {
    if (dockingId) return;
    setSelectedId(prev => prev === id ? null : id);
  };

  const startDockingSequence = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDockingId(id);
    
    // Simulate docking sequence with rotation and delay
    setTimeout(() => {
      onUpdate(id, { status: 'completed', date: new Date().getFullYear().toString() });
      setFeedback('success');
      setDockingId(null);
      setSelectedId(null);
    }, 2500); // Cinematic delay for docking
  };

  const handleFail = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(id, { status: 'missed' });
    setFeedback('regret');
    setSelectedId(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0b0d]">
      <style>{`
        @keyframes wave-ripple {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes morse-flicker {
          0%, 100% { opacity: 0.2; }
          40% { opacity: 0.8; }
          45% { opacity: 0.2; }
          50% { opacity: 0.9; }
          55% { opacity: 0.1; }
        }
        @keyframes event-horizon-glow {
          0%, 100% { filter: drop-shadow(0 0 5px #c5a059) brightness(1); }
          50% { filter: drop-shadow(0 0 15px #c5a059) brightness(1.5); }
        }
        .miller-wave {
          background: linear-gradient(-45deg, #0a0b0d, #111318, #1a2c33, #0a0b0d);
          background-size: 400% 400%;
          animation: wave-ripple 15s ease infinite;
        }
        .docking-spin {
          animation: spin-slow 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .tesseract-string {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(239, 68, 68, 0.4), transparent);
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.2);
        }
        .morse-light {
          animation: morse-flicker 4s infinite;
        }
        .event-horizon-line {
          background: linear-gradient(to bottom, 
            #3a7bd5 0%, 
            #c5a059 50%, 
            #ff4b2b 100%
          );
          box-shadow: 0 0 10px rgba(197, 160, 89, 0.3);
          animation: event-horizon-glow 4s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-6 pb-4 pt-[calc(1rem+env(safe-area-inset-top,24px))] sticky top-0 z-50 bg-[#0a0b0d]/80 backdrop-blur-lg border-b border-white/5">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60"><ChevronLeft size={24} /></button>
        <h2 className="text-sm font-black tracking-widest uppercase">{t.title}</h2>
        <button onClick={() => setIsAdding(true)} className="p-2 bg-[#c5a059]/10 text-[#c5a059] rounded-xl"><Plus size={24} /></button>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar pb-32">
        {/* Stats HUD */}
        <div className="flex justify-center gap-6 my-10 px-6">
          <div className="flex-1 bg-[#111318] border border-[#c5a059]/20 rounded-[2rem] p-5 text-center transition-all hover:border-[#c5a059]/40">
            <span className="block text-3xl font-black text-[#c5a059]">{stats.completed}</span>
            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{t.completed}</span>
          </div>
          <div className="flex-1 bg-[#111318] border border-white/5 rounded-[2rem] p-5 text-center transition-all hover:border-white/10">
            <span className="block text-3xl font-black text-white/80">{stats.remaining}</span>
            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{t.remaining}</span>
          </div>
        </div>

        {/* Event Horizon Timeline */}
        <div className="px-6 relative flex min-h-[300px]">
          {/* Tactical Event Horizon Bar - Increased width and margin to prevent overlap */}
          <div className="w-1/8 shrink-0 flex flex-col items-center pointer-events-none select-none relative ml-2">
            <div className="flex-grow w-[3px] event-horizon-line rounded-full relative">
              {/* Accretion Disk Glow Dots */}
              {Array.from({ length: 20 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full blur-[2px] ${i % 3 === 0 ? 'bg-[#c5a059]' : 'bg-white/10'}`} 
                  style={{ top: `${i * 5}%`, opacity: 0.2 + (Math.sin(i + (millerTick ? 1 : 0)) * 0.1) }} 
                />
              ))}
            </div>
          </div>

          <div className="flex-grow space-y-12 pb-20 min-w-0">
            {ageGroups.map((group) => (
              <React.Fragment key={group.age}>
                <div className="relative group min-w-0">
                  {/* Waypoint Header - Lensing Effect - Adjusted negative margin to align with shifted bar */}
                  <div className="flex items-center gap-3 mb-4 -ml-[8%]">
                    <div className={`
                      w-5 h-5 rounded-full bg-[#0a0b0d] border-2 flex items-center justify-center z-10 transition-all duration-700
                      ${group.age === currentAge 
                        ? 'border-white scale-150 shadow-[0_0_20px_white] ring-4 ring-white/10' 
                        : group.age < currentAge 
                          ? 'border-red-500/40 opacity-50 grayscale' // Redshifted
                          : 'border-[#c5a059] shadow-[0_0_10px_rgba(197,160,89,0.2)]' // Blueshifted
                      }
                    `}>
                      <div className={`w-1.5 h-1.5 rounded-full ${group.age === currentAge ? 'bg-white animate-ping' : group.age < currentAge ? 'bg-red-500' : 'bg-[#c5a059]'}`} />
                    </div>
                    <div className={`
                      flex items-baseline gap-2 px-3 py-1 rounded-full border backdrop-blur-md transition-all duration-500 
                      ${group.age === currentAge 
                        ? 'bg-white/10 border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
                        : 'bg-[#111318]/60 border-white/5'
                      }
                    `}>
                      <span className={`text-xs font-black tabular-nums ${group.age === currentAge ? 'text-white' : 'text-white/40'}`}>{group.age}Y</span>
                      <div className="w-[1px] h-2 bg-white/10" />
                      <span className="text-[6px] font-black uppercase tracking-widest text-white/20">{group.milestones.length} Signals</span>
                    </div>
                  </div>

                  {/* Task Cluster */}
                  <div className="space-y-3 ml-2 min-w-0">
                    {group.milestones.map((m) => {
                      const isCompleted = m.status === 'completed';
                      const isOverdue = !isCompleted && group.age < currentAge;
                      const isCurrentTask = !isCompleted && group.age === currentAge;
                      const isSelected = selectedId === m.id;
                      const isDocking = dockingId === m.id;

                      return (
                        <div 
                          key={m.id} 
                          onClick={() => toggleSelection(m.id)} 
                          className={`
                            relative border rounded-[2rem] p-5 transition-all duration-500 active:scale-[0.98] overflow-hidden w-full min-w-0
                            ${isCompleted ? 'bg-[#111318]/60 border-[#c5a059]/30' : isOverdue ? 'bg-[#111318]/40 border-red-500/20 opacity-70 grayscale-[0.5]' : isCurrentTask ? 'miller-wave border-white/30 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]' : 'bg-[#111318]/60 border-white/5'}
                            ${isSelected ? 'bg-[#16181d] border-[#c5a059]/60 scale-[1.02]' : ''}
                            ${isDocking ? 'docking-spin border-[#c5a059] shadow-[0_0_30px_rgba(197,160,89,0.4)] scale-110 z-40' : ''}
                          `}
                        >
                          {/* Miller's Planet Tick Overlay */}
                          {isCurrentTask && (
                            <div className={`absolute top-0 right-0 p-2 transition-opacity duration-150 ${millerTick ? 'opacity-100' : 'opacity-20'}`}>
                              <div className="flex flex-col items-center gap-1">
                                <div className="w-[1px] h-3 bg-[#c5a059] shadow-[0_0_5px_#c5a059]" />
                                <span className="text-[5px] font-black text-[#c5a059] tracking-tighter">TICK</span>
                              </div>
                            </div>
                          )}

                          {/* Docking Target Overlay */}
                          {isDocking && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                              <div className="w-full h-full border border-[#c5a059]/20 rounded-full scale-[1.5] animate-ping" />
                              <div className="absolute w-full h-[1px] bg-[#c5a059]/10" />
                              <div className="absolute h-full w-[1px] bg-[#c5a059]/10" />
                            </div>
                          )}

                          <div className="flex justify-between items-center relative z-10 min-w-0">
                            <div className="space-y-1 flex-1 min-w-0 pr-4">
                              <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em]">{m.category}</span>
                              <h3 className={`text-sm font-black uppercase tracking-tight break-all leading-tight ${isCompleted ? 'text-[#c5a059]' : 'text-white/80'}`}>
                                {m.title}
                              </h3>
                              {isOverdue && <div className="flex items-center gap-1 text-red-500 animate-pulse"><AlertCircle size={8} /><span className="text-[7px] font-black uppercase tracking-tighter shrink-0">{t.overdue} GRAVITY LOCK</span></div>}
                              {isCurrentTask && <span className={`text-[7px] font-black uppercase tracking-tighter transition-colors shrink-0 ${millerTick ? 'text-white' : 'text-white/40'}`}>ACTIVE MISSION • EVENT HORIZON</span>}
                              {isDocking && <span className="text-[7px] font-black text-[#c5a059] uppercase tracking-tighter animate-pulse italic shrink-0">DOCKING IN PROGRESS... NO GHOSTING</span>}
                            </div>
                            <div className={`shrink-0 transition-all ${isCompleted ? 'text-[#c5a059]' : isDocking ? 'text-[#c5a059] animate-spin' : isCurrentTask ? 'text-white animate-spin-slow' : 'text-white/10'}`}>
                              {isCompleted ? <CheckCircle2 size={20} /> : isDocking ? <Loader2 size={20} /> : isCurrentTask ? <Orbit size={20} /> : <div className="w-5 h-5 rounded-full border border-white/10" />}
                            </div>
                          </div>

                          <div className={`flex gap-2 overflow-hidden transition-all duration-500 ${isSelected && !isCompleted && !isDocking ? 'max-h-20 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                            <button onClick={(e) => startDockingSequence(m.id, e)} className="flex-1 h-10 bg-[#c5a059]/10 border border-[#c5a059]/20 rounded-xl flex items-center justify-center gap-2 text-[#c5a059] text-[9px] font-black uppercase hover:bg-[#c5a059] hover:text-black transition-all">
                              <Zap size={12} className="animate-pulse" /> {language === 'en' ? 'ENGAGE DOCKING' : '啟動對接'}
                            </button>
                            <button onClick={(e) => handleFail(m.id, e)} className="flex-1 h-10 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center gap-2 text-red-500 text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">
                              <X size={12} /> {t.let_go}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* THE TESSERACT ARCHIVE (LOST SIGNALS) */}
        {missedMilestones.length > 0 && (
          <div className="mt-24 relative px-6 overflow-hidden min-h-[400px]">
            {/* 5D Background Strings */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="tesseract-string" style={{ left: `${(i + 1) * 8}%` }} />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0d] via-transparent to-[#0a0b0d]" />
            </div>

            <div className="relative z-10">
              <div className="flex flex-col items-center mb-12">
                <div className="flex items-center gap-2 mb-2">
                  <Ghost size={16} className="text-red-500 animate-pulse" />
                  <h2 className="text-[10px] font-black text-red-500 tracking-[0.5em] uppercase">{t.spectral_echoes}</h2>
                </div>
                <div className="text-[8px] font-black text-white/10 uppercase tracking-[0.8em]">Tesseract Archive V5.0</div>
              </div>

              <div className="space-y-4">
                {missedMilestones.map((m, idx) => (
                  <div 
                    key={m.id} 
                    className="relative group perspective-1000"
                    style={{ animationDelay: `${idx * 150}ms` }}
                  >
                    <div className="bg-[#111318]/80 border-l-2 border-red-500/30 backdrop-blur-md rounded-r-3xl p-5 flex items-center justify-between transition-all duration-500 group-hover:translate-x-4 group-hover:bg-[#1a1c22] border-y border-r border-white/5">
                      <div className="flex items-center gap-6 min-w-0 flex-1">
                        {/* Morse Code Signal Indicator */}
                        <div className="flex flex-col gap-1 shrink-0">
                          <div className={`w-1.5 h-1.5 rounded-full bg-red-500 morse-light`} />
                          <div className={`w-1.5 h-3 rounded-full bg-red-500/40 morse-light`} style={{ animationDelay: '1s' }} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono font-black text-red-500/60 uppercase tracking-tighter shrink-0">{m.estimatedAge}Y ARCHIVE</span>
                            <div className="h-px w-4 bg-red-500/20 shrink-0" />
                          </div>
                          <h4 className="text-xs font-black text-white/40 uppercase tracking-tight group-hover:text-white/80 transition-colors break-all line-clamp-2">{m.title}</h4>
                          <span className="text-[7px] font-black text-white/10 uppercase tracking-[0.3em]">{m.category} • SIGNAL LOST</span>
                        </div>
                      </div>

                      <button 
                        onClick={(e) => { e.stopPropagation(); setRetryData({ title: m.title, category: m.category || 'Adventure' }); setIsAdding(true); }}
                        className="p-3 bg-white/5 rounded-2xl text-white/20 hover:text-[#c5a059] hover:bg-[#c5a059]/10 transition-all active:scale-90 shrink-0"
                      >
                        <RotateCcw size={16} />
                      </button>

                      {/* Ghostly trail effect on hover */}
                      <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-16 flex flex-col items-center opacity-20">
                <div className="w-1 h-12 bg-gradient-to-b from-red-500 to-transparent" />
                <span className="text-[7px] font-black text-red-500 uppercase tracking-[0.5em] mt-2">STAY</span>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {milestones.length === 0 && (
          <div className="px-6 py-20 flex flex-col items-center justify-center opacity-30 text-center">
            <Target size={48} className="mb-4" />
            <p className="text-xs font-black uppercase tracking-[0.3em]">{language === 'en' ? 'NO TRAJECTORY DATA' : '尚無航跡數據'}</p>
          </div>
        )}
      </div>

      {isAdding && (
        <CreateMilestoneOverlay 
          language={language}
          onClose={() => { setIsAdding(false); setRetryData(null); }} 
          onSave={onAdd} 
          currentAge={currentAge}
          initialTitle={retryData?.title}
          initialCategory={retryData?.category}
        />
      )}

      {feedback && (
        <FeedbackOverlay language={language} type={feedback} onClose={() => setFeedback(null)} />
      )}
    </div>
  );
};

export default MilestoneTimeline;
