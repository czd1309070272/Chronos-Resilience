
import React, { useState, useEffect, useRef } from 'react';

interface CircularProgressProps {
  percentage: number;
  label: string;
  color?: string;
  onClick?: () => void;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ percentage, label, color = "#c5a059", onClick }) => {
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const hasInitialized = useRef(false);
  const strokeWidth = 6;
  const radius = 42; 
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    setDisplayPercentage(0);
    hasInitialized.current = false;
  }, []);

  useEffect(() => {
    if (percentage > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      const timer = setTimeout(() => {
        setDisplayPercentage(percentage);
      }, 100);
      return () => clearTimeout(timer);
    } else if (hasInitialized.current) {
      setDisplayPercentage(percentage);
    }
  }, [percentage]);

  const offset = circumference - (displayPercentage / 100) * circumference;

  return (
    <div 
      onClick={onClick}
      className={`flex flex-col items-center justify-between p-3 sm:p-5 bg-[#111318]/60 backdrop-blur-md rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 w-full aspect-square transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-[1.05] hover:border-[#c5a059]/40 hover:shadow-[0_0_30px_rgba(197,160,89,0.1)]' : ''}`}
    >
      <div className="relative w-full aspect-square max-w-[85px] flex items-center justify-center">
        {/* The Endurance Structure Background */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-10">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white" />
          {Array.from({ length: 12 }).map((_, i) => (
             <line 
                key={i} 
                x1="50" y1="4" x2="50" y2="12" 
                stroke="currentColor" 
                strokeWidth="1" 
                className="text-white"
                transform={`rotate(${i * 30}, 50, 50)`}
             />
          ))}
        </svg>

        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full transform -rotate-90 drop-shadow-[0_0_12px_rgba(197,160,89,0.2)]"
        >
          {/* Segmented Track Background */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference / 12 - 2} 2`}
            className="text-white/5"
          />
          {/* Endurance Main Progress Bar */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="butt"
            className="transition-all duration-[1500ms] ease-out"
          />
          {/* Segment Overlay to create gaps */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#0a0b0d"
            strokeWidth={strokeWidth + 1}
            fill="transparent"
            strokeDasharray={`2 ${circumference / 12 - 2}`}
            strokeDashoffset="1"
            className="pointer-events-none"
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-0.5">
          <span className="text-[12px] sm:text-[14px] font-mono font-black text-white leading-none">
            {Math.round(displayPercentage)}
          </span>
          <span className="text-[7px] sm:text-[8px] font-mono font-black text-[#c5a059] mt-0.5">%</span>
        </div>
      </div>
      
      <span className="text-[7px] sm:text-[9px] font-mono font-black text-white/30 tracking-[0.2em] uppercase mt-3 sm:mt-4 text-center">
        {label}
      </span>
    </div>
  );
};

export default CircularProgress;
