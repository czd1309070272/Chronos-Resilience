
import React, { useState, useEffect, useRef } from 'react';

interface AnimatedPercentageProps {
  value: number;
  precision: number;
}

const AnimatedPercentage: React.FC<AnimatedPercentageProps> = ({ value, precision }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [tick, setTick] = useState(false);
  const isAnimating = useRef(false);
  const hasStartedAnimation = useRef(false);

  // High-precision number animation
  useEffect(() => {
    if (value > 0 && !hasStartedAnimation.current) {
      hasStartedAnimation.current = true;
      isAnimating.current = true;
      
      const duration = 2500; 
      const startTime = performance.now();
      const startValue = 0;
      const targetValue = value;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 5); 
        const currentVal = startValue + (targetValue - startValue) * ease;
        setDisplayValue(currentVal);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          isAnimating.current = false;
        }
      };

      requestAnimationFrame(animate);
    } else if (hasStartedAnimation.current) {
      setDisplayValue(value);
    }
  }, [value]);

  // Miller's Planet Visual "Tick" (1.25s interval)
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(true);
      setTimeout(() => setTick(false), 150);
    }, 1250);
    return () => clearInterval(interval);
  }, []);

  const finalValue = !hasStartedAnimation.current 
    ? 0 
    : (isAnimating.current ? displayValue : value);
    
  const parts = finalValue.toFixed(precision).split('.');
  
  // Adjust font sizes for high precision to prevent overflow
  const mainFontSize = precision > 6 ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-7xl';
  const decimalFontSize = precision > 6 ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-5xl';

  return (
    <div className="relative py-4 flex flex-col items-center justify-center select-none group">
      {/* Gargantua Accretion Disk Effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-16 bg-[#c5a059]/10 blur-[60px] rounded-full animate-pulse" />
        <div className="absolute w-64 h-64 border border-[#c5a059]/5 rounded-full animate-[spin_20s_linear_infinite]" />
        <div className="absolute w-72 h-72 border-t border-[#c5a059]/10 rounded-full animate-[spin_15s_linear_infinite]" />
      </div>

      {/* Main Miller's Clock Display */}
      <div className="relative flex items-baseline font-mono font-black tracking-[-0.05em] px-6 sm:px-10">
        {/* Visual Tick Indicator */}
        <div className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
          <div className={`w-1 sm:w-1.5 h-6 rounded-full transition-all duration-150 ${tick ? 'bg-[#c5a059] shadow-[0_0_15px_#c5a059] scale-y-125' : 'bg-white/10 scale-y-100'}`} />
          <span className="text-[5px] sm:text-[6px] text-white/20 font-black">TICK</span>
        </div>

        <span className={`${mainFontSize} text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all`}>{parts[0]}</span>
        <span className={`${mainFontSize} text-[#c5a059] transition-opacity duration-150`}>.</span>
        <span className={`${decimalFontSize} text-white/80 tabular-nums transition-all`}>{parts[1] || '0'.repeat(precision)}</span>
        
        <div className="flex flex-col ml-2 sm:ml-3 items-start pb-1">
          <span className="text-[6px] sm:text-[8px] text-[#c5a059] uppercase tracking-[0.3em] font-black leading-none mb-1">UNITS</span>
          <span className="text-lg sm:text-xl text-white/20 leading-none">%</span>
        </div>

        {/* Right Side Telemetry */}
        <div className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1">
           <div className={`w-1 h-1 rounded-full ${tick ? 'bg-[#c5a059]' : 'bg-white/10'}`} />
           <div className={`w-1 h-1 rounded-full ${!tick ? 'bg-white/20' : 'bg-white/5'}`} />
           <div className="w-0.5 sm:w-1 h-4 bg-white/5 rounded-full overflow-hidden">
              <div className="w-full bg-[#c5a059]/40 transition-all duration-500" style={{ height: `${(finalValue % 1) * 100}%` }} />
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedPercentage;
