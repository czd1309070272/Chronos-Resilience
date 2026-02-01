
import React from 'react';
import { Activity, Map as MapIcon, BookOpen, User } from 'lucide-react';
import { ViewType } from '../types';
import { translations } from '../translations';

interface BottomNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  visible?: boolean;
  language: 'en' | 'zh-TW';
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange, visible = true, language }) => {
  const t = translations[language].nav;
  const tabs: { id: ViewType; icon: React.ReactNode; label: string }[] = [
    { id: 'dashboard', icon: <Activity size={20} />, label: t.life },
    { id: 'map', icon: <MapIcon size={20} />, label: t.map },
    { id: 'logs', icon: <BookOpen size={20} />, label: t.logs },
    { id: 'self', icon: <User size={20} />, label: t.self },
  ];

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 px-6 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        visible ? 'translate-y-0' : 'translate-y-[calc(100%+80px)]'
      }`}
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 24px) + 12px)' }}
    >
      <div className="bg-white/[0.03] backdrop-blur-[24px] border border-white/10 rounded-[2.5rem] flex items-center justify-around px-2 h-16 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Subtle inner glow for glass effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
        
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all relative z-10 ${
              currentView === tab.id ? 'text-[#c5a059]' : 'text-white/30 hover:text-white/50'
            }`}
          >
            <div className={`transition-transform duration-300 ${currentView === tab.id ? 'scale-110' : 'scale-100'}`}>
              {tab.icon}
            </div>
            <span className={`text-[8px] font-black tracking-widest transition-opacity duration-300 ${currentView === tab.id ? 'opacity-100' : 'opacity-60'}`}>
              {tab.label}
            </span>
            
            {/* Active Indicator Dot */}
            {currentView === tab.id && (
              <div className="absolute -bottom-1 w-1 h-1 bg-[#c5a059] rounded-full shadow-[0_0_8px_#c5a059]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
