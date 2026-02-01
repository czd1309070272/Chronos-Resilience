
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Clock, Heart, Coffee, Briefcase, Zap, Volume2, Maximize2, Palette, Save, RotateCcw, Globe, CalendarDays, Loader2, Move3d, AlertTriangle } from 'lucide-react';
import { UserSettings } from '../types';
import { translations } from '../translations';
import { backend } from '../backend';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdate: (settings: UserSettings) => void;
  onBack: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdate, onBack }) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [showGravityWarning, setShowGravityWarning] = useState(false);
  const t = translations[localSettings.language].settings;

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const updateField = (field: keyof UserSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleGravityToggle = () => {
    if (!localSettings.gravityEnabled) {
      setShowGravityWarning(true);
    } else {
      updateField('gravityEnabled', false);
    }
  };

  const confirmGravityEnable = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response !== 'granted') {
          alert('Gyroscope permission denied. Feature cannot be enabled.');
          setShowGravityWarning(false);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    
    updateField('gravityEnabled', true);
    setShowGravityWarning(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const saved = await backend.updateSettings(localSettings);
      onUpdate(saved);
      onBack();
    } catch (err) {
      console.error('Failed to save temporal config', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalSettings(settings);
  };

  return (
    <div className="h-full bg-[#0a0b0d] flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between px-6 py-6 z-50 bg-[#0a0b0d]/20 backdrop-blur-md border-b border-white/5">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-black tracking-tight text-white uppercase">{t.title}</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar pb-40">
        <div className="px-6 pt-6 space-y-10">
          
          {/* Language Selection */}
          <section>
            <div className="flex items-center gap-2 mb-6 opacity-40">
              <Globe size={14} className="text-[#c5a059]" />
              <h2 className="text-[10px] font-black tracking-[0.3em] uppercase">{t.lang}</h2>
            </div>
            <div className="flex bg-[#111318] p-1.5 rounded-[1.5rem] border border-white/5">
              <button 
                onClick={() => updateField('language', 'zh-TW')}
                className={`flex-1 py-4 rounded-[1.1rem] transition-all text-[10px] font-black uppercase tracking-widest ${
                  localSettings.language === 'zh-TW' ? 'bg-[#c5a059] text-black shadow-lg' : 'text-white/20 hover:text-white/40'
                }`}
              >
                繁體中文
              </button>
              <button 
                onClick={() => updateField('language', 'en')}
                className={`flex-1 py-4 rounded-[1.1rem] transition-all text-[10px] font-black uppercase tracking-widest ${
                  localSettings.language === 'en' ? 'bg-[#c5a059] text-black shadow-lg' : 'text-white/20 hover:text-white/40'
                }`}
              >
                English
              </button>
            </div>
          </section>

          {/* Life Parameters */}
          <section>
            <div className="flex items-center gap-2 mb-6 opacity-40">
              <Heart size={14} className="text-[#c5a059]" />
              <h2 className="text-[10px] font-black tracking-[0.3em] uppercase">{t.params}</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-[#111318] border border-white/5 rounded-3xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CalendarDays className="text-white/20" size={20} />
                  <div>
                    <p className="text-xs font-bold text-white">{t.birthday}</p>
                    <p className="text-[10px] text-white/30 uppercase font-black">{localSettings.birthDate || '1999-01-01'}</p>
                  </div>
                </div>
                <input 
                  type="date" 
                  value={localSettings.birthDate}
                  onChange={(e) => updateField('birthDate', e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black text-[#c5a059] outline-none"
                />
              </div>

              <div className="bg-[#111318] border border-white/5 rounded-3xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Clock className="text-white/20" size={20} />
                  <div>
                    <p className="text-xs font-bold text-white">{t.birth_time}</p>
                    <p className="text-[10px] text-white/30 uppercase font-black">{t.precise_min}</p>
                  </div>
                </div>
                <input 
                  type="time" 
                  value={localSettings.birthTime}
                  onChange={(e) => updateField('birthTime', e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm font-black text-[#c5a059] outline-none"
                />
              </div>

              <div className="bg-[#111318] border border-white/5 rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Maximize2 className="text-white/20" size={20} />
                    <div>
                      <p className="text-xs font-bold text-white">{t.expectancy}</p>
                      <p className="text-[10px] text-white/30 uppercase font-black">{t.preset}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'average', label: localSettings.language === 'en' ? 'WORLD' : '世界標準' },
                    { id: 'healthy', label: localSettings.language === 'en' ? 'OPTIMAL' : '健康理想' },
                    { id: 'custom', label: localSettings.language === 'en' ? 'CUSTOM' : '自定義' }
                  ].map(p => (
                    <button 
                      key={p.id}
                      onClick={() => updateField('lifeExpectancyPreset', p.id)}
                      className={`py-3 rounded-2xl text-[9px] font-black transition-all border ${
                        localSettings.lifeExpectancyPreset === p.id 
                        ? 'bg-[#c5a059]/10 border-[#c5a059]/40 text-[#c5a059]' 
                        : 'bg-white/5 border-transparent text-white/30'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {localSettings.lifeExpectancyPreset === 'custom' && (
                  <div className="mt-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest">{t.custom_val}</p>
                      <div className="flex items-center gap-3">
                        <input 
                          type="number" 
                          min="1" max="150"
                          value={localSettings.customLifeExpectancy}
                          onChange={(e) => updateField('customLifeExpectancy', parseInt(e.target.value) || 0)}
                          className="w-20 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-center text-sm font-black text-white outline-none"
                        />
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Years</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-[#111318] border border-white/5 rounded-3xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Coffee className="text-white/20" size={20} />
                  <div>
                    <p className="text-xs font-bold text-white">{t.sleep}</p>
                    <p className="text-[10px] text-white/30 uppercase font-black">{t.sleep_hours}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-[#c5a059]">{localSettings.sleepOffset}h</span>
                  <input 
                    type="range" min="4" max="12" step="0.5"
                    value={localSettings.sleepOffset}
                    onChange={(e) => updateField('sleepOffset', parseFloat(e.target.value))}
                    className="w-24 accent-[#c5a059]"
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6 opacity-40">
              <Briefcase size={14} className="text-[#c5a059]" />
              <h2 className="text-[10px] font-black tracking-[0.3em] uppercase">{t.work}</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-[#111318] border border-white/5 rounded-3xl p-5">
                <p className="text-xs font-bold text-white mb-4">{t.work_cycle}</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-[8px] text-white/20 font-black uppercase">Start</p>
                    <input type="time" value={localSettings.workStart} onChange={e => updateField('workStart', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-black text-white outline-none" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[8px] text-white/20 font-black uppercase">End</p>
                    <input type="time" value={localSettings.workEnd} onChange={e => updateField('workEnd', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-black text-white outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6 opacity-40">
              <Palette size={14} className="text-[#c5a059]" />
              <h2 className="text-[10px] font-black tracking-[0.3em] uppercase">{t.visual}</h2>
            </div>

            <div className="space-y-4">
               <div className="bg-[#111318] border border-white/5 rounded-3xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Zap className="text-white/20" size={20} />
                  <div>
                    <p className="text-xs font-bold text-white">{t.precision}</p>
                    <p className="text-[10px] text-white/30 uppercase font-black">{t.digits}</p>
                  </div>
                </div>
                <select 
                  value={localSettings.decimalPrecision}
                  onChange={(e) => updateField('decimalPrecision', parseInt(e.target.value))}
                  className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm font-black text-[#c5a059] outline-none"
                >
                  {[2, 4, 6, 8].map(n => <option key={n} value={n}>{n} {t.digits}</option>)}
                </select>
              </div>

              <div className="bg-[#111318] border border-white/5 rounded-3xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Volume2 className="text-white/20" size={20} />
                  <div>
                    <p className="text-xs font-bold text-white">{t.haptics}</p>
                    <p className="text-[10px] text-white/30 uppercase font-black">{t.feedback}</p>
                  </div>
                </div>
                <button 
                  onClick={() => updateField('soundEnabled', !localSettings.soundEnabled)}
                  className={`w-14 h-8 rounded-full relative transition-colors ${localSettings.soundEnabled ? 'bg-[#c5a059]' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${localSettings.soundEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <div className="bg-[#111318] border border-white/5 rounded-3xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Move3d className="text-white/20" size={20} />
                  <div>
                    <p className="text-xs font-bold text-white">{t.gravity_title}</p>
                    <p className="text-[10px] text-white/30 uppercase font-black">{t.gravity_desc}</p>
                  </div>
                </div>
                <button 
                  onClick={handleGravityToggle}
                  className={`w-14 h-8 rounded-full relative transition-colors ${localSettings.gravityEnabled ? 'bg-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.4)]' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${localSettings.gravityEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#0a0b0d]/20 backdrop-blur-md border-t border-white/5 z-[60] flex gap-4">
        <button 
          onClick={handleReset} 
          disabled={isSaving}
          className="flex-1 h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          <RotateCcw size={18} className="text-white/60" />
          <span className="text-xs font-black text-white/60 uppercase tracking-widest">{t.reset}</span>
        </button>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="flex-[2] h-14 bg-[#c5a059] hover:bg-[#b59049] rounded-2xl flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(197,160,89,0.3)] transition-all active:scale-95 disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={18} className="text-black animate-spin" /> : <Save size={18} className="text-black" />}
          <span className="text-xs font-black text-black uppercase tracking-widest">{isSaving ? 'Syncing...' : t.save}</span>
        </button>
      </div>

      {showGravityWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 p-6">
          <div className="bg-[#111318] border border-red-500/30 rounded-[2.5rem] p-8 max-w-sm w-full shadow-[0_0_50px_rgba(239,68,68,0.1)] animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-red-500/20">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h3 className="text-lg font-black text-white text-center mb-4 uppercase tracking-tight">{t.gravity_warning_title}</h3>
            <p className="text-xs text-white/60 text-center leading-relaxed mb-8">
              {t.gravity_warning_msg}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowGravityWarning(false)}
                className="flex-1 h-12 rounded-xl bg-white/5 text-white/40 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors"
              >
                {t.cancel}
              </button>
              <button 
                onClick={confirmGravityEnable}
                className="flex-1 h-12 rounded-xl bg-red-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-red-600 transition-colors"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
