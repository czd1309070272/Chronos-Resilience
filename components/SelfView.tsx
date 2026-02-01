
import React, { useState, useEffect, useMemo } from 'react';
import { Settings, Lock, Edit3, Grid, BarChart2, Brain, Sparkles, X, Check, Calendar as CalendarIcon, Unlock, Key, Copy, AlertCircle, Eye, Loader2, ChevronRight, Terminal, Shield, Cpu, Activity, Zap, Fingerprint, Dna, LogOut, Power } from 'lucide-react';
import { FutureLetter, UserSettings, LogEntry, UserAnalytics } from '../types';
import { translations } from '../translations';
import { backend } from '../backend';
import SelfCoreTab from './SelfCoreTab';
import SelfLogsTab from './SelfLogsTab';
import SelfMindTab from './SelfMindTab';
import SelfSoulTab from './SelfSoulTab';
import NotificationArchive from './NotificationArchive';

interface SelfViewProps {
  onSettingsClick?: () => void;
  onCoachClick?: () => void;
  onOverlayStateChange?: (active: boolean) => void;
  onLogout?: () => void;
  language: 'en' | 'zh-TW';
  settings: UserSettings;
  logs: LogEntry[];
}

const ChronosChart: React.FC<{ title: string; rest: number; work: number; hobby: number; language: 'en' | 'zh-TW' }> = ({ title, rest, work, hobby, language }) => {
  const data = [
    { label: language === 'en' ? 'Sleep' : '睡眠', color: '#c5a059', hours: rest },
    { label: language === 'en' ? 'Work' : '工作', color: '#ffffff', hours: work },
    { label: language === 'en' ? 'Hobby' : '愛好', color: '#333333', hours: hobby },
  ];

  const totalProvided = rest + work + hobby;
  const factor = totalProvided > 0 ? 24 / totalProvided : 1;
  const normalizedData = data.map(d => ({ ...d, displayHours: d.hours * factor }));

  const totalHours = 24;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let accumulatedRotation = -90;

  return (
    <div className="flex-1 flex flex-col items-center bg-[#111318]/40 border border-white/5 rounded-[2.5rem] p-5 shadow-xl transition-all hover:border-white/10 group">
      <h3 className="text-[9px] font-black text-white/30 tracking-[0.2em] uppercase mb-5 text-center leading-tight h-6 flex items-center group-hover:text-[#c5a059]/60 transition-colors">{title}</h3>
      <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full transform transition-transform duration-500 group-hover:scale-105">
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="10" />
          {normalizedData.map((item, i) => {
            const percentage = item.displayHours / totalHours;
            const strokeDashoffset = circumference * (1 - percentage);
            const currentRotation = accumulatedRotation;
            accumulatedRotation += percentage * 360;
            return (
              <circle
                key={i}
                cx="50" cy="50" r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ 
                  transform: `rotate(${currentRotation}deg)`, 
                  transformOrigin: '50px 50px', 
                  transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' 
                }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
          <span className="text-[14px] font-black text-white">24h</span>
        </div>
      </div>
      <div className="w-full space-y-2.5">
        {data.map((item, i) => (
          <div key={i} className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{item.label}</span>
            </div>
            <span className="text-[10px] font-black text-white">{item.hours.toFixed(1)}h</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const EncryptingOverlay: React.FC<{ language: 'en' | 'zh-TW' }> = ({ language }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  
  const statusMessages = language === 'en' 
    ? ['Initializing Tesseract link...', 'Modulating gravity waves...', 'Encoding temporal coordinates...', 'Sealing 5D matrix...', 'Transmission finalized.']
    : ['初始化超正方體鏈接...', '調製引力波...', '編碼時間坐標...', '封裝五維矩陣...', '傳輸已完成。'];

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 15;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
      }
      setProgress(current);
      setStatus(statusMessages[Math.floor((current / 100) * (statusMessages.length - 1))]);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[250] bg-[#0a0b0d] flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#c5a059] to-transparent animate-pulse"
            style={{ left: `${i * 5}%`, animationDelay: `${i * 0.2}s`, opacity: 0.1 + Math.random() * 0.3 }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-xs flex flex-col items-center">
        <div className="w-24 h-24 mb-12 relative">
          <div className="absolute inset-0 border-2 border-[#c5a059]/20 rounded-full animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-2 border-t-2 border-[#c5a059] rounded-full animate-[spin_2s_linear_infinite]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Cpu size={32} className="text-[#c5a059] animate-pulse" />
          </div>
        </div>

        <div className="w-full space-y-4 text-center">
          <h2 className="text-xl font-black text-white uppercase tracking-[0.2em]">{language === 'en' ? 'Quantum Encryption' : '量子加密中'}</h2>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-[#c5a059] shadow-[0_0_15px_#c5a059] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono font-black text-[#c5a059] uppercase animate-pulse">{status}</span>
            <span className="text-[10px] font-mono font-black text-white/40">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-10 opacity-10 font-mono text-[8px] text-white">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i}>0x{Math.random().toString(16).slice(2, 10).toUpperCase()} &gt; SYNC_LOCKED</div>
        ))}
      </div>
    </div>
  );
};

const SelfView: React.FC<SelfViewProps> = ({ onSettingsClick, onCoachClick, onOverlayStateChange, onLogout, language, settings, logs }) => {
  const [isWriting, setIsWriting] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showKeyNotification, setShowKeyNotification] = useState(false);
  const [showCommArchive, setShowCommArchive] = useState(false);
  const [lastGeneratedKey, setLastGeneratedKey] = useState('');
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'core' | 'logs' | 'mind' | 'soul'>('core');
  
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [futureLetter, setFutureLetter] = useState<FutureLetter | null>(null);

  const [letterContent, setLetterContent] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [unlockError, setUnlockError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Encryption Settings State
  const [encryptionMode, setEncryptionMode] = useState<'auto' | 'manual'>('auto');
  const [manualMorse, setManualMorse] = useState<string[]>(['.', '.', '.', '.', '.', '.']);
  const [unlockMorse, setUnlockMorse] = useState<string[]>(['.', '.', '.', '.', '.', '.']);

  const t = translations[language].self;

  const isLetterOpen = useMemo(() => futureLetter?.status === 'open', [futureLetter]);
  const isLetterEncrypted = useMemo(() => futureLetter?.status === 'encrypted', [futureLetter]);
  const isNoLetter = useMemo(() => !futureLetter || futureLetter.status === 'none', [futureLetter]);

  useEffect(() => {
    backend.getUserAnalytics().then(res => {
      setAnalytics(res);
      setLoadingAnalytics(false);
    });
    backend.getFutureLetter().then(res => {
      if (res.status !== 'none') {
        setFutureLetter(res as FutureLetter);
        setTargetDate((res as FutureLetter).targetDate.split('T')[0]);
      } else {
        setFutureLetter(null);
      }
    });
  }, []);

  useEffect(() => {
    if (!futureLetter || isLetterOpen) { setTimeLeft(null); return; }
    const updateTimer = () => {
      const now = new Date().getTime();
      const target = new Date(futureLetter.targetDate).getTime();
      const diff = target - now;
      if (diff <= 0) { 
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 }); 
        return; 
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ d, h, m, s });
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [futureLetter, isLetterOpen]);

  const defaultTimeLeft = useMemo(() => ({ d: 0, h: 0, m: 0, s: 0 }), []);
  const displayTime = isLetterOpen ? { d: 0, h: 0, m: 0, s: 0 } : (timeLeft || defaultTimeLeft);

  const tabs: { id: typeof activeTab; icon: any; label: string }[] = [
    { id: 'core', icon: Grid, label: 'CORE' },
    { id: 'logs', icon: BarChart2, label: 'LOGS' },
    { id: 'mind', icon: Brain, label: 'MIND' },
    { id: 'soul', icon: Sparkles, label: 'SOUL' }
  ];

  const handleOverlayToggle = (type: 'archive' | 'writing' | 'unlocking' | 'key' | 'encrypting', visible: boolean) => {
    if (type === 'archive') setShowCommArchive(visible);
    if (type === 'writing') {
      setIsWriting(visible);
      if (visible && isNoLetter) {
        setTargetDate(new Date().toISOString().split('T')[0]);
      }
    }
    if (type === 'encrypting') setIsEncrypting(visible);
    if (type === 'unlocking') {
      setIsUnlocking(visible);
      setUnlockError(false);
      setUnlockMorse(['.', '.', '.', '.', '.', '.']);
    }
    if (type === 'key') setShowKeyNotification(visible);
    onOverlayStateChange?.(visible);
  };

  const toggleMorseBit = (index: number, mode: 'writing' | 'unlocking') => {
    if (mode === 'writing') {
      setManualMorse(prev => {
        const next = [...prev];
        next[index] = next[index] === '.' ? '-' : '.';
        return next;
      });
    } else {
      setUnlockMorse(prev => {
        const next = [...prev];
        next[index] = next[index] === '.' ? '-' : '.';
        return next;
      });
      setUnlockError(false);
    }
  };

  const handleSaveLetterInternal = async () => {
    if (!letterContent || !targetDate) return;

    const selectedDate = new Date(targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate.getTime() <= today.getTime()) {
      const warningMsg = language === 'en' 
        ? "Unable to perform time travel. Destination must be in the future." 
        : "無法進行時間穿越。目的地必須設定在未來。";
      backend.notify(warningMsg, "warning");
      return;
    }
    
    setIsWriting(false);
    setIsEncrypting(true);
    
    await new Promise(resolve => setTimeout(resolve, 3200));

    const newLetterData = {
      content: letterContent,
      targetDate: new Date(targetDate).toISOString(),
      createdAt: new Date().toISOString(),
      decryptionKey: encryptionMode === 'manual' ? manualMorse.join('') : undefined
    };

    try {
      const savedLetter = await backend.saveFutureLetter(newLetterData);
      setFutureLetter(savedLetter);
      setLastGeneratedKey(savedLetter.decryptionKey || '');
      setIsEncrypting(false);
      setShowKeyNotification(true);
      onOverlayStateChange?.(true);
    } catch (err) {
      console.error("Transmission failed", err);
      setIsEncrypting(false);
      backend.notify("TEMPORAL_LINK_FAILURE", "warning");
    }
  };

  const handleManualUnlock = async () => {
    const key = unlockMorse.join('');
    setIsVerifying(true);
    setUnlockError(false);

    try {
      const unlockedLetter = await backend.getFutureLetter(key);
      if (unlockedLetter.status !== 'none') {
        setFutureLetter(unlockedLetter as FutureLetter);
        setIsUnlocking(false);
        onOverlayStateChange?.(false);
      }
    } catch (err) {
      console.error("Decryption failed", err);
      setUnlockError(true);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="pb-40 px-6 pt-8 bg-[#0a0b0d]">
      {isEncrypting && <EncryptingOverlay language={language} />}

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-black text-white leading-none mb-1">{t.title}</h1>
          <p className="text-[10px] font-black text-[#c5a059] tracking-[0.2em] uppercase opacity-80">{t.version}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleOverlayToggle('archive', true)} className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-[#c5a059]/10 hover:border-[#c5a059]/30 transition-all active:scale-95 shadow-[0_0_15px_rgba(197,160,89,0.05)]">
            <Terminal size={20} className="text-[#c5a059]/60" />
          </button>
          <button onClick={onCoachClick} className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-[#c5a059]/10 hover:border-[#c5a059]/30 transition-all active:scale-95 shadow-[0_0_15px_rgba(197,160,89,0.1)]"><Sparkles size={20} className="text-[#c5a059]" /></button>
          <button onClick={onSettingsClick} className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors"><Settings size={20} className="text-white/60" /></button>
        </div>
      </div>
      
      <div className="relative bg-gradient-to-br from-[#1a2c33] to-[#111318] border border-white/5 rounded-[2.5rem] p-6 mb-10 overflow-hidden shadow-2xl transition-all">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            <path d="M0 100 Q100 50 200 100 T400 100" fill="none" stroke="#c5a059" strokeWidth="40" strokeOpacity="0.2" className="blur-3xl" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-black text-white mb-1 uppercase tracking-tight">{t.letter_title}</h2>
              <p className="text-[10px] font-bold text-[#c5a059]/60 uppercase tracking-widest">{isLetterOpen ? t.unlocked_msg : t.encrypted_msg}</p>
            </div>
            <button onClick={() => isLetterEncrypted && handleOverlayToggle('unlocking', true)} className={`transition-all duration-500 transform ${isLetterOpen ? 'text-[#c5a059] scale-110' : 'text-[#c5a059]/60 hover:scale-110 active:scale-95'} ${isLetterEncrypted ? 'animate-pulse' : ''}`}>
              {isLetterOpen ? <Unlock size={20} className="drop-shadow-[0_0_8px_#c5a059]" /> : <Lock size={20} />}
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-8">
            {[ 
              { val: displayTime.d.toString().padStart(2, '0'), unit: 'DAYS' }, 
              { val: displayTime.h.toString().padStart(2, '0'), unit: 'HRS' }, 
              { val: displayTime.m.toString().padStart(2, '0'), unit: 'MINS' }, 
              { val: displayTime.s.toString().padStart(2, '0'), unit: 'SECS' } 
            ].map((item, i) => (
              <div key={i} className={`bg-black/20 border border-white/5 rounded-2xl p-3 flex flex-col items-center transition-all duration-1000 ${isLetterOpen ? 'opacity-20 grayscale' : ''}`}>
                <span className={`text-xl font-black tracking-tighter transition-colors ${isLetterOpen ? 'text-white' : 'text-[#c5a059]'}`}>{item.val}</span>
                <span className="text-[8px] font-black text-white/20 mt-1">{item.unit}</span>
              </div>
            ))}
          </div>

          {isLetterOpen && futureLetter && (
            <div className="mb-8 p-6 bg-white/5 rounded-3xl border border-[#c5a059]/20 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <p className="text-sm italic text-white/90 leading-relaxed font-medium">"{futureLetter.content}"</p>
              <div className="mt-6 flex justify-between items-center border-t border-white/5 pt-4">
                 <span className="text-[8px] font-black text-[#c5a059] uppercase tracking-widest">Sealed: {new Date(futureLetter.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {(isNoLetter || isLetterOpen) && (
            <button onClick={() => handleOverlayToggle('writing', true)} className={`w-full ${isLetterOpen ? 'bg-white/10 text-white hover:bg-white/20 border border-white/5' : 'bg-[#c5a059] text-black hover:bg-[#b59049] shadow-[0_10px_25px_rgba(197,160,89,0.3)]'} font-black text-sm h-14 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 animate-in fade-in duration-500`}>
              {isLetterOpen ? <Eye size={18} strokeWidth={3} /> : <Edit3 size={18} strokeWidth={3} />}
              {futureLetter ? t.update : t.write}
            </button>
          )}
        </div>
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-center gap-4 mb-8">
           <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#c5a059]/20" />
           <h2 className="text-[10px] font-black text-[#c5a059]/60 tracking-[0.4em] uppercase text-center">{t.attributes}</h2>
           <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#c5a059]/20" />
        </div>
        
        <div className="bg-[#111318]/40 border border-white/5 rounded-[2.5rem] p-6 relative min-h-[300px] flex items-center justify-center overflow-hidden mb-6 shadow-xl backdrop-blur-sm">
          {loadingAnalytics ? (
            <Loader2 className="text-[#c5a059] animate-spin" size={32} />
          ) : (
            <>
              {activeTab === 'core' && <SelfCoreTab attributes={analytics!.attributes} />}
              {activeTab === 'logs' && <SelfLogsTab language={language} logs={logs} />}
              {activeTab === 'mind' && <SelfMindTab language={language} mindScore={analytics!.attributes.mind} />}
              {activeTab === 'soul' && <SelfSoulTab language={language} analytics={analytics!} />}
            </>
          )}
        </div>

        <div className="flex bg-[#111318]/60 border border-white/5 rounded-[2rem] p-1.5 shadow-lg">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex flex-col items-center justify-center py-4 gap-1.5 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-[#1a1c22] text-[#c5a059] shadow-xl border border-white/5' : 'text-white/20 hover:text-white/40'}`}>
              <tab.icon size={18} className={activeTab === tab.id ? 'animate-pulse' : ''} />
              <span className="text-[8px] font-black tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-10 flex gap-4 animate-in slide-in-from-bottom-6 fade-in duration-1000">
        <ChronosChart title={t.target_allocation} rest={settings.sleepOffset} work={8} hobby={Math.max(0, 16-settings.sleepOffset)} language={language} />
        <ChronosChart title={t.today_allocation} rest={settings.todaySleepTime} work={settings.todayWorkTime} hobby={Math.max(0, 24-settings.todaySleepTime-settings.todayWorkTime)} language={language} />
      </div>

      {/* Cinematic Logout Section */}
      <div className="mt-20 pt-10 border-t border-white/5 flex flex-col items-center">
        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mb-6 animate-pulse" />
        <button 
          onClick={onLogout}
          className="w-full h-16 bg-red-500/5 border border-red-500/10 rounded-[2rem] flex items-center justify-center gap-4 text-red-500 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-500/10 hover:border-red-500/20 transition-all active:scale-95 group shadow-[0_0_20px_rgba(239,68,68,0.05)]"
        >
          <Power size={18} className="group-hover:rotate-180 transition-transform duration-700" />
          {t.logout}
        </button>
        <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em] mt-8 mb-4 text-center leading-relaxed">
          {t.logout_sub}<br />
          RESILIENCE_ARCHIVE // SIGNAL_OFF
        </p>
      </div>

      {showCommArchive && <NotificationArchive language={language} onClose={() => handleOverlayToggle('archive', false)} />}

      {isWriting && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
          <div className="flex-grow p-8 flex flex-col overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-10 shrink-0">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">{futureLetter ? t.update_message : t.write}</h2>
              <button onClick={() => handleOverlayToggle('writing', false)} className="p-3 bg-white/5 rounded-2xl text-white/40 border border-white/5"><X size={20} /></button>
            </div>
            
            <textarea
              value={letterContent}
              onChange={(e) => setLetterContent(e.target.value)}
              placeholder={t.temporal_message}
              className="flex-grow min-h-[150px] bg-transparent text-xl font-medium text-white/90 outline-none resize-none placeholder:text-white/10"
              autoFocus
            />

            <div className="mt-8 space-y-8 shrink-0">
              {/* Encryption Method Selector */}
              <div>
                <label className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest block mb-4">Encryption Protocol</label>
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                  <button 
                    onClick={() => setEncryptionMode('auto')}
                    className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all ${encryptionMode === 'auto' ? 'bg-[#c5a059] text-black shadow-lg' : 'text-white/30'}`}
                  >
                    <Fingerprint size={14} /> Auto Sync
                  </button>
                  <button 
                    onClick={() => setEncryptionMode('manual')}
                    className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all ${encryptionMode === 'manual' ? 'bg-[#c5a059] text-black shadow-lg' : 'text-white/30'}`}
                  >
                    <Dna size={14} /> Manual Morse
                  </button>
                </div>
              </div>

              {/* Manual Morse Grid */}
              {encryptionMode === 'manual' && (
                <div className="animate-in slide-in-from-top-2 duration-500">
                  <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mb-4 text-center">Touch bits to toggle pattern</p>
                  <div className="grid grid-cols-6 gap-2">
                    {manualMorse.map((bit, i) => (
                      <button 
                        key={i} 
                        onClick={() => toggleMorseBit(i, 'writing')}
                        className={`aspect-square rounded-xl border flex items-center justify-center transition-all active:scale-90 ${bit === '.' ? 'bg-white/5 border-white/10' : 'bg-[#c5a059]/20 border-[#c5a059]/40'}`}
                      >
                        <div className={`transition-all duration-300 ${bit === '.' ? 'w-2 h-2 rounded-full bg-white/40' : 'w-6 h-1 rounded-full bg-[#c5a059]'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest block mb-3">{t.unlock_milestone}</label>
                <div className="relative">
                   <CalendarIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c5a059]" />
                   <input 
                    type="date" 
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm font-black text-white outline-none focus:border-[#c5a059]/40"
                   />
                </div>
              </div>

              <button 
                onClick={handleSaveLetterInternal}
                disabled={!letterContent || !targetDate}
                className="w-full h-16 bg-[#c5a059] text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-[0_10px_30px_rgba(197,160,89,0.3)] active:scale-95 disabled:opacity-30 disabled:grayscale transition-all"
              >
                {t.confirm_store}
              </button>
            </div>
          </div>
        </div>
      )}

      {isUnlocking && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-[#111318] border border-white/10 rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-500">
             <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                   <Key className="text-[#c5a059]" size={20} />
                   <h2 className="text-xl font-black text-white uppercase tracking-tighter">{t.decrypt_title}</h2>
                </div>
                <button onClick={() => !isVerifying && handleOverlayToggle('unlocking', false)} disabled={isVerifying} className="p-2 text-white/20"><X size={20} /></button>
             </div>
             
             <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6 leading-relaxed">{t.enter_key}</p>
             
             <div className="space-y-8">
                <div className="relative py-4">
                  <div className="grid grid-cols-6 gap-2">
                    {unlockMorse.map((bit, i) => (
                      <button 
                        key={i} 
                        onClick={() => toggleMorseBit(i, 'unlocking')}
                        disabled={isVerifying}
                        className={`aspect-square rounded-xl border flex items-center justify-center transition-all active:scale-90 ${bit === '.' ? 'bg-white/5 border-white/10' : 'bg-[#c5a059]/20 border-[#c5a059]/40'} ${unlockError ? 'border-red-500' : ''}`}
                      >
                        <div className={`transition-all duration-300 ${bit === '.' ? 'w-2 h-2 rounded-full bg-white/40' : 'w-6 h-1 rounded-full bg-[#c5a059]'}`} />
                      </button>
                    ))}
                  </div>
                  {isVerifying && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
                       <Loader2 size={24} className="text-[#c5a059] animate-spin" />
                    </div>
                  )}
                </div>

                {unlockError && <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse justify-center"><AlertCircle size={12} /> Invalid Access Pattern</div>}
                
                <button 
                  onClick={handleManualUnlock}
                  disabled={isVerifying}
                  className="w-full h-16 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all disabled:opacity-30"
                >
                  {isVerifying ? t.access_destiny + "..." : t.access_destiny}
                </button>
             </div>
          </div>
        </div>
      )}

      {showKeyNotification && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="w-full max-w-sm flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-[#c5a059]/20 flex items-center justify-center mb-8 border border-[#c5a059]/30">
                 <Shield size={32} className="text-[#c5a059]" />
              </div>
              <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">{t.key_secured}</h2>
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-10 leading-relaxed px-4">{t.only_key}</p>
              
              <div className="w-full bg-[#111318] border border-[#c5a059]/30 rounded-3xl p-6 mb-10 group relative text-center">
                 <div className="text-4xl font-black tracking-[0.4em] text-[#c5a059] mb-2">{lastGeneratedKey}</div>
                 <div className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em] mt-4">One-Time Temporal Sync</div>
                 <button onClick={() => { navigator.clipboard.writeText(lastGeneratedKey); backend.notify("COPIED", "success"); }} className="absolute top-4 right-4 text-white/10 group-hover:text-[#c5a059] transition-colors"><Copy size={14} /></button>
              </div>

              <button 
                onClick={() => handleOverlayToggle('key', false)}
                className="w-full h-16 bg-[#c5a059] text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] active:scale-95 transition-all"
              >
                {t.seal}
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default SelfView;
