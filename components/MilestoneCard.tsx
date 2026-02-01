
import React from 'react';
import { CheckCircle2, Circle, Zap } from 'lucide-react';
import { Milestone } from '../types';

interface MilestoneCardProps {
  milestone: Milestone;
  currentAge?: number;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone, currentAge }) => {
  const isCompleted = milestone.status === 'completed';
  const isPending = milestone.status === 'pending';
  const isActive = currentAge !== undefined && milestone.status !== 'completed' && milestone.estimatedAge === currentAge;
  const isOverdue = currentAge !== undefined && milestone.status !== 'completed' && (milestone.estimatedAge || 0) < currentAge;

  return (
    <div className={`flex items-center gap-4 p-5 border rounded-[2.5rem] mb-3 transition-all group overflow-hidden relative ${
      isActive 
        ? 'bg-[#c5a059]/10 border-[#c5a059]/30 shadow-[0_0_20px_rgba(197,160,89,0.05)]' 
        : isCompleted 
          ? 'bg-[#111318]/60 border-white/5 hover:bg-[#16181d] hover:border-[#c5a059]/20'
          : 'bg-[#111318]/40 border-white/5 hover:border-white/10'
    }`}>
      {isActive && (
        <div className="absolute top-0 right-0 p-2 opacity-50">
          <Zap size={10} className="text-[#c5a059] animate-pulse" />
        </div>
      )}

      <div className={`flex-shrink-0 transition-colors ${
        isCompleted || isActive ? 'text-[#c5a059]' : 'text-white/10 group-hover:text-white/20'
      }`}>
        {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} className={isActive ? 'animate-pulse' : ''} />}
      </div>
      
      <div className="flex-grow min-w-0">
        <h3 className={`text-sm font-black uppercase tracking-tight break-all line-clamp-1 ${
          isCompleted || isActive ? 'text-white' : 'text-white/40'
        }`}>
          {milestone.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-[7px] font-mono font-black text-white/20 uppercase tracking-widest whitespace-nowrap">
            {milestone.category || 'N/A'} • {isCompleted ? 'STATION SECURED' : isActive ? 'ACTIVE MISSION' : 'ORBITAL TARGET'}
          </p>
          {isOverdue && (
            <span className="text-[6px] font-black text-red-500/60 uppercase tracking-tighter">OVERDUE</span>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 flex flex-col items-end">
        {isCompleted ? (
          <>
            <span className="text-[10px] font-mono font-black text-[#c5a059] tracking-tighter">{milestone.date}</span>
            <span className="text-[6px] font-black text-[#c5a059]/40 uppercase tracking-widest">Secured</span>
          </>
        ) : (
          <div className={`px-2 py-1 rounded-md border transition-colors ${
            isActive 
              ? 'bg-[#c5a059]/20 border-[#c5a059]/40' 
              : 'bg-white/5 border-white/5'
          }`}>
            <span className={`text-[8px] font-mono font-black uppercase tracking-widest ${
              isActive ? 'text-[#c5a059]' : 'text-white/20'
            }`}>
              {milestone.estimatedAge}Y
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MilestoneCard;
