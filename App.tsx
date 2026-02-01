
import React, { useState, useEffect, useMemo, useRef, startTransition, useCallback } from 'react';
import { Settings, Sparkles, Loader2, Coffee, Zap, Shield, Camera, Check, Plus, X, History } from 'lucide-react';
import { INITIAL_USER, INITIAL_SETTINGS, MOCK_MILESTONES, MOCK_LOGS } from './constants';
import { ViewType, UserSettings, Milestone, FutureLetter, LogEntry, UserProfile, DailyTask } from './types';
import { translations } from './translations';
import { backend } from './backend';
import CircularProgress from './components/CircularProgress';
import InteractiveCycleCard from './components/InteractiveCycleCard';
import LifeProgressBar from './components/LifeProgressBar';
import MilestoneCard from './components/MilestoneCard';
import DailyTaskItem from './components/DailyTaskItem';
import DailyHistoryOverlay from './components/DailyHistoryOverlay';
import MilestoneTimeline from './components/MilestoneTimeline';
import BottomNav from './components/BottomNav';
import LogsView from './components/LogsView';
import MapView from './components/MapView';
import SelfView from './components/SelfView';
import CoachView from './components/CoachView';
import SettingsView from './components/SettingsView';
import TemporalGrid from './components/TemporalGrid';
import AnimatedPercentage from './components/AnimatedPercentage';
import AuthView from './components/AuthView';
import GravityStardust from './components/GravityStardust';
import NotificationToast, { ToastType } from './components/NotificationToast';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({ name: INITIAL_USER.name });
  const [isEditingName, setIsEditingName] = useState(false);
  const [view, setView] = useState<ViewType>('dashboard');
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const t = translations[settings.language].dashboard;

  const [milestones, setMilestones] = useState<Milestone[]>(MOCK_MILESTONES);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [selectedDailyId, setSelectedDailyId] = useState<string | null>(null);
  const [isAddingDaily, setIsAddingDaily] = useState(false);
  const [isShowingDailyHistory, setIsShowingDailyHistory] = useState(false);
  const [newDailyTitle, setNewDailyTitle] = useState('');
  
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
  const [lifeProgress, setLifeProgress] = useState(0);
  const [yearsElapsed, setYearsElapsed] = useState(0);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [activeGrid, setActiveGrid] = useState<'yearly' | 'monthly' | 'today' | null>(null);
  const [isOverlayActive, setIsOverlayActive] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const lastScrollTop = useRef(0);
  const scrollThreshold = 20;

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  useEffect(() => {
    backend.setNotifyCallback((msg, type) => {
      addToast(msg, type);
    });
  }, [addToast]);

  const handleSleepChange = async (val: number) => {
    const newSettings = { ...settings, todaySleepTime: val };
    if (val + settings.todayWorkTime > 24) newSettings.todayWorkTime = 24 - val;
    setSettings(newSettings);
    await backend.updateSettings(newSettings);
  };

  const handleWorkChange = async (val: number) => {
    const newSettings = { ...settings, todayWorkTime: val };
    if (val + settings.todaySleepTime > 24) newSettings.todaySleepTime = 24 - val;
    setSettings(newSettings);
    await backend.updateSettings(newSettings);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [savedSettings, savedMilestones, savedLogs, savedProfile, savedDaily] = await Promise.all([
          backend.getSettings(),
          backend.getMilestones(),
          backend.getLogs(),
          backend.getUserProfile(),
          backend.getDailyTasks()
        ]);
        setSettings(savedSettings);
        setMilestones(savedMilestones);
        setLogs(savedLogs);
        setProfile(savedProfile);
        setDailyTasks(savedDaily);
      } catch (err) {
        console.error('Initialization failed', err);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  const handleViewChange = (newView: ViewType) => {
    startTransition(() => {
      setView(newView);
      setIsNavVisible(true);
      lastScrollTop.current = 0;
      setSelectedDailyId(null);
    });
  };

  const handleAuthSuccess = async (name: string) => {
    setIsAuthenticated(true);
    setTimeout(() => {
      backend.notify(
        settings.language === 'en' 
          ? `Welcome back, Commander ${name}. Link stabilized.` 
          : `歡迎回來，${name} 指揮官。同步鏈接已穩定。`, 
        'success'
      );
    }, 1500);

    try {
      const [m, l, s, p, d] = await Promise.all([
        backend.getMilestones(),
        backend.getLogs(),
        backend.getSettings(),
        backend.getUserProfile(),
        backend.getDailyTasks()
      ]);
      setMilestones(m);
      setLogs(l);
      setSettings(s);
      setProfile(p);
      setDailyTasks(d);
    } catch (e) {
      console.error("Failed to sync user data after login", e);
    }
  };

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setView('dashboard');
    backend.notify(settings.language === 'en' ? 'Temporal link severed. Returning to Earth time.' : '時間鏈接已切斷。正在返回地球時間。', 'info');
  }, [settings.language]);

  const handleAddMilestone = async (newMilestone: Milestone) => {
    const updated = [...milestones, newMilestone];
    setMilestones(updated);
    await backend.saveMilestones(updated);
  };

  const handleUpdateMilestone = async (id: string, updates: Partial<Milestone>) => {
    const updated = milestones.map(m => m.id === id ? { ...m, ...updates } : m);
    setMilestones(updated);
    await backend.saveMilestones(updated);
  };

  // Daily Task Handlers
  const handleAddDailyTask = async () => {
    if (!newDailyTitle.trim()) return;
    const updated = await backend.addDailyTask(newDailyTitle.trim());
    setDailyTasks(updated);
    setNewDailyTitle('');
    setIsAddingDaily(false);
    handleOverlayChange(false);
    backend.notify(settings.language === 'en' ? 'Daily frequency locked.' : '每日頻率已鎖定。', 'success');
  };

  const handleToggleDaily = async (id: string) => {
    const updated = await backend.toggleDailyTask(id);
    setDailyTasks(updated);
    const task = updated.find(t => t.id === id);
    if (task?.completed) {
       backend.notify(settings.language === 'en' ? 'Frequency synchronized.' : '頻率已同步（打卡成功）。', 'success');
    }
  };

  const handleArchiveDaily = async (id: string, status: 'completed' | 'aborted') => {
    await backend.archiveDailyTask(id, status);
    const updated = await backend.getDailyTasks();
    setDailyTasks(updated);
    backend.notify(
      status === 'completed' 
        ? (settings.language === 'en' ? 'Mission secured and archived.' : '任務圓滿達成並存檔。')
        : (settings.language === 'en' ? 'Mission aborted and recorded.' : '任務已中止並記錄存檔。'),
      status === 'completed' ? 'success' : 'info'
    );
  };

  const handleUpdateLogs = async (updatedLogs: LogEntry[]) => {
    if (updatedLogs.length > logs.length) {
      const newEntry = updatedLogs[0];
      await backend.addLog(newEntry);
    } else {
      await backend.saveLogs(updatedLogs);
    }
    setLogs(updatedLogs);
  };

  const handleOverlayChange = (active: boolean) => {
    setIsOverlayActive(active);
    setIsNavVisible(!active);
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await backend.uploadFile(file);
        const updated = await backend.updateUserProfile({ avatarUrl: url });
        setProfile(updated);
        backend.notify(settings.language === 'en' ? 'Avatar synchronized' : '頭像已同步', 'success');
      } catch (err) {
        console.error("Avatar upload failed", err);
        backend.notify(settings.language === 'en' ? 'Upload failed' : '上傳失敗', 'warning');
      }
    }
  };

  const handleNameUpdate = async () => {
    if (profile.name.trim()) {
      setIsEditingName(false);
      const updated = await backend.updateUserProfile({ name: profile.name });
      setProfile(updated);
      backend.notify(settings.language === 'en' ? 'Alias updated' : '代號已更新', 'info');
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const shouldListen = view === 'dashboard' || view === 'logs' || view === 'self';
    if (!shouldListen) {
      setIsNavVisible(true);
      return;
    }
    const handleScroll = () => {
      if (isOverlayActive) return;
      const currentScrollTop = container.scrollTop;
      if (currentScrollTop < 0) return;
      if (currentScrollTop < 50) {
        setIsNavVisible(true);
        lastScrollTop.current = currentScrollTop;
        return;
      }
      const diff = currentScrollTop - lastScrollTop.current;
      if (Math.abs(diff) > scrollThreshold) {
        if (diff > 0) setIsNavVisible(false);
        else setIsNavVisible(true);
        lastScrollTop.current = currentScrollTop;
      }
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [view, isAuthenticated, isOverlayActive]);

  useEffect(() => {
    const calculateProgress = () => {
      const now = new Date();
      const [hours, minutes] = settings.birthTime.split(':').map(Number);
      const birthDateStr = settings.birthDate || '1999-01-01';
      const birth = new Date(birthDateStr);
      birth.setHours(hours, minutes, 0, 0);
      let expectancyYears = settings.customLifeExpectancy || 85;
      if (settings.lifeExpectancyPreset === 'average') expectancyYears = 73;
      else if (settings.lifeExpectancyPreset === 'healthy') expectancyYears = 95;
      const elapsedMs = now.getTime() - birth.getTime();
      const totalMs = expectancyYears * 365.25 * 24 * 60 * 60 * 1000;
      const progress = (elapsedMs / totalMs) * 100;
      const years = elapsedMs / (365.25 * 24 * 60 * 60 * 1000);
      setLifeProgress(progress);
      setYearsElapsed(Math.floor(years));
    };
    calculateProgress();
    const interval = setInterval(calculateProgress, 100); 
    return () => clearInterval(interval);
  }, [settings.birthDate, settings.birthTime, settings.lifeExpectancyPreset, settings.customLifeExpectancy]);

  const timeMetrics = useMemo(() => {
    const now = new Date();
    const birthDateStr = settings.birthDate || '1999-01-01';
    const birth = new Date(birthDateStr);
    let lastBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (lastBirthday > now) lastBirthday = new Date(now.getFullYear() - 1, birth.getMonth(), birth.getDate());
    const nextBirthday = new Date(lastBirthday.getFullYear() + 1, birth.getMonth(), birth.getDate());
    const yearProgress = Math.round(((now.getTime() - lastBirthday.getTime()) / (nextBirthday.getTime() - lastBirthday.getTime())) * 100);
    const dayProgress = Math.round(((now.getHours() * 60 + now.getMinutes()) / (24 * 60)) * 100);
    const monthProgress = Math.round((now.getDate() / new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()) * 100);
    return { yearProgress, monthProgress, dayProgress };
  }, [settings.birthDate]);

  const currentExpectancy = useMemo(() => {
    if (settings.lifeExpectancyPreset === 'average') return 73;
    if (settings.lifeExpectancyPreset === 'healthy') return 95;
    return settings.customLifeExpectancy;
  }, [settings.lifeExpectancyPreset, settings.customLifeExpectancy]);

  const dashboardMilestones = useMemo(() => {
    const activeOrFuture = milestones.filter(m => m.status === 'pending' || m.status === 'long-term');
    return activeOrFuture.sort((a, b) => {
      const ageA = a.estimatedAge || 0;
      const ageB = b.estimatedAge || 0;
      const isUrgentA = ageA <= yearsElapsed;
      const isUrgentB = ageB <= yearsElapsed;
      if (isUrgentA && !isUrgentB) return -1;
      if (!isUrgentA && isUrgentB) return 1;
      return ageA - ageB;
    }).slice(0, 3);
  }, [milestones, yearsElapsed]);

  if (isInitializing) return (
    <div className="min-h-[100dvh] bg-[#0a0b0d] flex items-center justify-center">
      <Loader2 className="text-[#c5a059] animate-spin" size={40} />
    </div>
  );

  if (!isAuthenticated) return <AuthView language={settings.language} onLogin={handleAuthSuccess} />;

  return (
    <div className="w-full max-md mx-auto h-[100dvh] bg-[#0a0b0d] relative overflow-hidden font-sans select-none flex flex-col">
      <GravityStardust enabled={settings.gravityEnabled} />
      
      <div className="fixed top-[calc(1rem+env(safe-area-inset-top,24px))] left-0 right-0 z-[200] flex flex-col items-center gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <NotificationToast 
              id={toast.id} 
              message={toast.message} 
              type={toast.type} 
              onClose={removeToast} 
            />
          </div>
        ))}
      </div>

      <main className="flex-grow relative overflow-hidden h-full z-10">
        {view === 'dashboard' && (
          <div ref={scrollRef} className="h-full overflow-y-auto no-scrollbar scroll-smooth pt-[env(safe-area-inset-top,24px)]">
            <div className="px-4 sm:px-6 pt-6 pb-48">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div 
                    onClick={handleAvatarClick}
                    className="group relative w-12 h-12 rounded-2xl bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 overflow-hidden shadow-[0_0_15px_rgba(197,160,89,0.1)] cursor-pointer"
                  >
                    <img 
                      src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} 
                      alt="avatar" 
                      className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-40 transition-opacity" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={16} className="text-[#c5a059]" />
                    </div>
                    <input 
                      type="file" 
                      ref={avatarInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleAvatarChange} 
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[9px] font-black text-[#c5a059] tracking-[0.3em] uppercase mb-0.5">{t.welcome}</p>
                    <div className="relative">
                      {isEditingName ? (
                        <div className="flex items-center gap-2">
                          <input
                            ref={nameInputRef}
                            autoFocus
                            className="bg-white/5 border border-[#c5a059]/30 rounded-lg px-2 py-0.5 text-lg font-black text-white outline-none w-32 uppercase tracking-tight"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            onBlur={handleNameUpdate}
                            onKeyDown={(e) => e.key === 'Enter' && handleNameUpdate()}
                          />
                          <button onClick={handleNameUpdate} className="text-[#c5a059]">
                            <Check size={18} />
                          </button>
                        </div>
                      ) : (
                        <h1 
                          onClick={() => setIsEditingName(true)}
                          className="text-xl font-black text-white leading-tight tracking-tight uppercase cursor-pointer hover:text-[#c5a059] transition-colors border-b border-transparent hover:border-[#c5a059]/30"
                        >
                          {profile.name}
                        </h1>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleViewChange('coach')} className="p-3 bg-white/5 rounded-2xl hover:bg-[#c5a059]/10 hover:border-[#c5a059]/30 transition-all border border-white/5 active:scale-95 group">
                    <Zap size={18} className="text-[#c5a059] group-hover:animate-pulse" />
                  </button>
                  <button onClick={() => handleViewChange('settings')} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/5 active:scale-95">
                    <Settings size={18} className="text-white/40" />
                  </button>
                </div>
              </div>

              <div className="mb-10">
                <AnimatedPercentage value={lifeProgress} precision={settings.decimalPrecision} />
                <div className="mt-4 flex justify-center">
                  <div className="px-4 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059] shadow-[0_0_10px_#c5a059]" />
                    <span className="text-[8px] font-mono font-black text-white/40 uppercase tracking-[0.2em]">{t.active_clarity}: {Math.round((1 - (settings.todaySleepTime / 24)) * 100)}%</span>
                  </div>
                </div>
              </div>

              <LifeProgressBar progress={lifeProgress} yearsElapsed={yearsElapsed} estimatedYears={currentExpectancy} language={settings.language} />

              <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4">
                <InteractiveCycleCard type="sleep" hours={settings.todaySleepTime} onChange={handleSleepChange} language={settings.language} onExpandStateChange={handleOverlayChange} />
                <InteractiveCycleCard type="work" hours={settings.todayWorkTime} onChange={handleWorkChange} language={settings.language} onExpandStateChange={handleOverlayChange} />
              </div>

              <div className="mt-12">
                <div className="flex items-center gap-3 mb-6">
                   <div className="h-px flex-grow bg-white/5" />
                   <h2 className="text-[9px] font-black tracking-[0.4em] text-white/20 uppercase whitespace-nowrap">{t.time_units}</h2>
                   <div className="h-px flex-grow bg-white/5" />
                </div>
                <div className="relative min-h-[140px]">
                  {activeGrid ? (
                    <div className="animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-500">
                      <TemporalGrid type={activeGrid} onClose={() => setActiveGrid(null)} language={settings.language} settings={settings} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500">
                      <CircularProgress percentage={timeMetrics.yearProgress} label={translations[settings.language].temporal.yearly} onClick={() => setActiveGrid('yearly')} />
                      <CircularProgress percentage={timeMetrics.monthProgress} label={translations[settings.language].temporal.monthly} onClick={() => setActiveGrid('monthly')} />
                      <CircularProgress percentage={timeMetrics.dayProgress} label={translations[settings.language].temporal.today} onClick={() => setActiveGrid('today')} />
                    </div>
                  )}
                </div>
              </div>

              {/* Plan B: Daily Frequency */}
              <div className="mt-12" onClick={() => setSelectedDailyId(null)}>
                <div className="flex justify-between items-end mb-6">
                  <h2 className="text-bold font-black tracking-[0.3em] text-[#c5a059] uppercase">{t.daily_tasks}</h2>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsShowingDailyHistory(true); handleOverlayChange(true); }}
                      className="flex items-center gap-2 p-2 bg-white/5 border border-white/5 rounded-xl text-white/40 transition-all active:scale-90"
                    >
                      <History size={16} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{t.history_task}</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsAddingDaily(true); handleOverlayChange(true); }}
                      className="flex items-center gap-2 p-2 bg-[#c5a059]/10 rounded-xl text-[#c5a059] transition-all active:scale-90"
                    >
                      <Plus size={16} strokeWidth={3} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{t.add_task}</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {dailyTasks.length > 0 ? (
                    dailyTasks.map(task => (
                      <DailyTaskItem 
                        key={task.id} 
                        task={task} 
                        isSelected={selectedDailyId === task.id}
                        onSelect={setSelectedDailyId}
                        onToggle={handleToggleDaily} 
                        onArchive={handleArchiveDaily}
                        language={settings.language}
                      />
                    ))
                  ) : (
                    <div className="p-10 border border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center opacity-20">
                       <Zap size={24} className="mb-2" />
                       <p className="text-[10px] font-black uppercase tracking-widest">No Frequencies Initialized</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Plan A: Long-term Objectives */}
              <div className="mt-12">
                <div className="flex justify-between items-end mb-6">
                  <h2 className="text-bold font-black tracking-[0.3em] text-white/30 uppercase">{t.bucket_list}</h2>
                  <button onClick={() => handleViewChange('milestones')} className="text-[10px] font-black text-[#c5a059] uppercase hover:text-white transition-colors border-b border-[#c5a059]/20 pb-0.5">
                    {milestones.filter(m => m.status === 'completed').length} {t.completed}
                  </button>
                </div>
                <div className="space-y-3">
                  {dashboardMilestones.map(m => (
                    <div key={m.id} onClick={() => handleViewChange('milestones')} className="cursor-pointer">
                      <MilestoneCard milestone={m} currentAge={yearsElapsed} />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
        {view === 'milestones' && <MilestoneTimeline milestones={milestones} onBack={() => handleViewChange('dashboard')} onAdd={handleAddMilestone} onUpdate={handleUpdateMilestone} currentAge={yearsElapsed} language={settings.language} />}
        {view === 'logs' && <div ref={scrollRef} className="h-full overflow-y-auto no-scrollbar scroll-smooth pt-[env(safe-area-inset-top,24px)]"><LogsView language={settings.language} logs={logs} onUpdateLogs={handleUpdateLogs} onOverlayStateChange={handleOverlayChange} /></div>}
        {view === 'map' && <MapView language={settings.language} isNavVisible={isNavVisible} setIsNavVisible={setIsNavVisible} />}
        {view === 'coach' && <CoachView onBack={() => handleViewChange('dashboard')} language={settings.language} />}
        {view === 'self' && <div ref={scrollRef} className="h-full overflow-y-auto no-scrollbar scroll-smooth pt-[env(safe-area-inset-top,24px)]"><SelfView onSettingsClick={() => handleViewChange('settings')} onCoachClick={() => handleViewChange('coach')} language={settings.language} settings={settings} logs={logs} onOverlayStateChange={handleOverlayChange} onLogout={handleLogout} /></div>}
        {view === 'settings' && <SettingsView settings={settings} onUpdate={setSettings} onBack={() => handleViewChange('dashboard')} />}
      </main>

      {view !== 'milestones' && view !== 'settings' && view !== 'coach' && <BottomNav currentView={view} onViewChange={handleViewChange} visible={isNavVisible} language={settings.language} />}

      {/* Add Daily Task Overlay */}
      {isAddingDaily && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="absolute inset-0" onClick={() => { setIsAddingDaily(false); handleOverlayChange(false); }} />
           <div className="relative bg-[#0d0f14] border-t border-[#c5a059]/30 rounded-t-[3rem] p-8 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-full duration-500">
              <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-8" />
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">{t.add_task}</h2>
                <button onClick={() => { setIsAddingDaily(false); handleOverlayChange(false); }} className="p-3 bg-white/5 rounded-2xl text-white/20"><X size={20} /></button>
              </div>
              
              <div className="space-y-6">
                <div className="relative">
                  <input 
                    autoFocus
                    type="text"
                    value={newDailyTitle}
                    onChange={(e) => setNewDailyTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddDailyTask()}
                    placeholder="E.g. Morning Meditation"
                    className="w-full h-16 bg-black/40 border border-white/10 rounded-2xl px-6 text-white font-black outline-none focus:border-[#c5a059]/40 transition-all uppercase text-sm"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-[#c5a059]/10 rounded-lg">
                    <Zap size={16} className="text-[#c5a059]" />
                  </div>
                </div>

                <button 
                  onClick={handleAddDailyTask}
                  disabled={!newDailyTitle.trim()}
                  className="w-full h-16 bg-[#c5a059] text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-[0_10px_30px_rgba(197,160,89,0.3)] active:scale-95 disabled:opacity-30 transition-all flex items-center justify-center gap-3"
                >
                  <Check size={18} strokeWidth={3} />
                  Initialize Frequency
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Daily Task History Overlay */}
      {isShowingDailyHistory && (
        <DailyHistoryOverlay 
          language={settings.language} 
          onClose={() => { setIsShowingDailyHistory(false); handleOverlayChange(false); }} 
        />
      )}
    </div>
  );
};

export default App;
