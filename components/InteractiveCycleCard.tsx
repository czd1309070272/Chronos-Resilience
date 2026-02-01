
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Coffee, Briefcase, X, Check, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { translations } from '../translations';
import { backend } from '../backend';

interface InteractiveCycleCardProps {
  type: 'sleep' | 'work';
  hours: number;
  onChange: (hours: number) => void;
  language: 'en' | 'zh-TW';
  onExpandStateChange?: (isExpanded: boolean) => void;
}

const InteractiveCycleCard: React.FC<InteractiveCycleCardProps> = ({ type, hours, onChange, language, onExpandStateChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tempHours, setTempHours] = useState(hours);
  const [isSyncing, setIsSyncing] = useState(false);
  const t = translations[language].dashboard;
  
  const circleRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);

  const targetHours = 8;
  const percentage = (hours / targetHours) * 100;
  const tempPercentage = (tempHours / targetHours) * 100;

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (tempHours / 24) * circumference;

  const icon = type === 'sleep' ? <Coffee size={16} className="sm:size-[18px]" /> : <Briefcase size={16} className="sm:size-[18px]" />;
  const largeIcon = type === 'sleep' ? <Coffee size={24} /> : <Briefcase size={24} />;
  
  const themeColor = type === 'sleep' ? '#c5a059' : '#ffffff';
  const label = type === 'sleep' ? t.today_sleep : t.today_work;

  const feedbackMessage = useMemo(() => {
    if (type === 'sleep') {
      return tempHours < targetHours ? t.feedback.sleep_low : t.feedback.sleep_good;
    } else {
      return tempHours > 10 ? t.feedback.work_high : t.feedback.work_good;
    }
  }, [type, tempHours, targetHours, t.feedback]);

  const setExpandedState = (expanded: boolean) => {
    setIsExpanded(expanded);
    if (onExpandStateChange) {
      onExpandStateChange(expanded);
    }
  };

  const handleUpdateFromCoord = useCallback((clientX: number, clientY: number) => {
    if (!circleRef.current) return;
    const rect = circleRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const angleRad = Math.atan2(clientY - centerY, clientX - centerX);
    let angleDeg = (angleRad * 180) / Math.PI + 90;
    if (angleDeg < 0) angleDeg += 360;

    let newHours = (angleDeg / 360) * 24;
    newHours = Math.round(newHours * 2) / 2;
    newHours = Math.min(24, Math.max(0, newHours));
    setTempHours(newHours);
  }, []);

  const onStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    handleUpdateFromCoord(clientX, clientY);
  };

  const onMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    handleUpdateFromCoord(clientX, clientY);
  }, [handleUpdateFromCoord]);

  const onEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    if (isExpanded) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onMove);
      window.addEventListener('touchend', onEnd);
      setTempHours(hours);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isExpanded, hours, onMove, onEnd]);

  const handleConfirm = async () => {
    setIsSyncing(true);
    try {
      const currentSettings = await backend.getSettings();
      const updatedSettings = { ...currentSettings };
      if (type === 'sleep') {
        updatedSettings.todaySleepTime = tempHours;
        if (tempHours + updatedSettings.todayWorkTime > 24) {
          updatedSettings.todayWorkTime = 24 - tempHours;
        }
      } else {
        updatedSettings.todayWorkTime = tempHours;
        if (tempHours + updatedSettings.todaySleepTime > 24) {
          updatedSettings.todaySleepTime = 24 - tempHours;
        }
      }
      
      await backend.updateSettings(updatedSettings);
      onChange(tempHours);
      setExpandedState(false);
    } catch (err) {
      console.error("Failed to sync temporal loop", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const isWarning = type === 'sleep' ? tempHours < targetHours : tempHours > 10;

  return (
    <>
      <div 
        onClick={() => setExpandedState(true)}
        className="flex flex-col items-center justify-between p-4 sm:p-5 bg-[#111318] rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 w-full aspect-square transition-all duration-300 cursor-pointer hover:scale-[1.05] hover:border-[#c5a059]/30 hover:shadow-[0_0_20px_rgba(197,160,89,0.1)]"
      >
        <div className="relative w-full aspect-square max-w-[120px] sm:max-w-[80px] flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke={themeColor}
              strokeWidth={6}
              fill="transparent"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40 - (percentage / 300) * (2 * Math.PI * 40)}
              strokeLinecap="round"
              className="transition-all duration-[1200ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-80 transition-opacity" style={{ color: themeColor }}>
            {icon}
          </div>
        </div>
        <div className="flex flex-col items-center mt-3 sm:mt-4">
          <span className="text-xs sm:text-sm font-black text-white tracking-tighter">{Math.round(percentage)}%</span>
          <span className="text-[8px] sm:text-[10px] font-black text-white/30 tracking-[0.2em] uppercase mt-1 text-center">
            {label}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300 p-6">
          <div className="relative w-full max-w-sm bg-[#0d0f14] border border-white/10 rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 opacity-10 blur-[80px] rounded-full pointer-events-none" style={{ backgroundColor: themeColor }} />
            
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl border transition-colors" style={{ backgroundColor: `${themeColor}1a`, borderColor: `${themeColor}33`, color: themeColor }}>
                  {largeIcon}
                </div>
                <div>
                  <h2 className="text-xl font-black text-white leading-tight uppercase tracking-tighter">{label}</h2>
                  <p className="text-[10px] font-black tracking-[0.2em] uppercase mt-1 opacity-60" style={{ color: themeColor }}>Telemetry Calibration</p>
                </div>
              </div>
              <button onClick={() => !isSyncing && setExpandedState(false)} disabled={isSyncing} className="p-3 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-colors disabled:opacity-50">
                <X size={20} />
              </button>
            </div>

            <div className={`relative flex flex-col items-center justify-center py-4 select-none ${isSyncing ? 'pointer-events-none opacity-50' : ''}`}>
              <svg 
                ref={circleRef}
                viewBox="0 0 220 220" 
                className="w-full max-w-[260px] aspect-square transform transition-transform"
                onMouseDown={onStart}
                onTouchStart={onStart}
              >
                <circle cx="110" cy="110" r={radius} stroke="rgba(255,255,255,0.03)" strokeWidth="12" fill="transparent" />
                <circle
                  cx="110" cy="110" r={radius}
                  stroke={isWarning ? '#ff4b4b' : themeColor} strokeWidth="12" fill="transparent"
                  strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                  className="transition-all duration-300 ease-out transform -rotate-90 origin-center"
                />
                <g transform={`rotate(${(tempHours / 24) * 360 - 90}, 110, 110)`} className="cursor-pointer">
                  <circle cx={110 + radius} cy="110" r="14" fill="#0d0f14" stroke={isWarning ? '#ff4b4b' : themeColor} strokeWidth="2" style={{ filter: `drop-shadow(0 0 10px ${isWarning ? '#ff4b4b' : themeColor})` }} />
                  <circle cx={110 + radius} cy="110" r="3" fill={isWarning ? '#ff4b4b' : themeColor} className="animate-pulse" />
                </g>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-6xl font-black text-white tracking-tighter flex items-baseline">
                  {Math.round(tempPercentage)}<span className="text-xl ml-1 font-mono" style={{ color: themeColor }}>%</span>
                </span>
                <span className="text-sm font-mono font-black text-white/40 uppercase tracking-[0.3em] mt-2">
                  {tempHours.toFixed(1)}H UNIT
                </span>
              </div>
            </div>

            <div className="mt-12 space-y-4">
              <div className={`rounded-2xl p-4 flex items-start gap-3 border transition-all duration-300 ${isWarning ? 'bg-red-500/10 border-red-500/20' : 'bg-[#111318] border-white/5'}`}>
                {isWarning ? (
                  <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-500" />
                ) : (
                  <Info size={16} className="shrink-0 mt-0.5" style={{ color: themeColor }} />
                )}
                <p className={`text-[10px] font-black leading-relaxed uppercase tracking-[0.1em] transition-colors duration-300 ${isWarning ? 'text-red-400' : 'text-white/50'}`}>
                  {feedbackMessage}
                </p>
              </div>

              <button 
                onClick={handleConfirm}
                disabled={isSyncing}
                className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 ${type === 'sleep' ? 'bg-[#c5a059] text-black shadow-[0_10px_30px_rgba(197,160,89,0.4)]' : 'bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.2)]'}`}
              >
                {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} strokeWidth={3} />}
                {isSyncing ? 'Linking...' : 'Establish Connection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InteractiveCycleCard;
