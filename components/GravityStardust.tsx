
import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number; // Also acts as mass/depth
  color: string;
  alpha: number;
  baseAlpha: number;
  pulseSpeed: number;
}

const GravityStardust: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const gravityRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize handling
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles with more depth
    const initParticles = () => {
      const count = 150; // Increased count for better density
      const colors = ['#00f2ff', '#ffffff', '#3a7bd5', '#7f00ff'];
      particlesRef.current = [];
      
      for (let i = 0; i < count; i++) {
        const size = Math.random() * 2.5 + 0.5;
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          size: size,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.5 + 0.1,
          baseAlpha: Math.random() * 0.5 + 0.1,
          pulseSpeed: 0.02 + Math.random() * 0.03
        });
      }
    };
    initParticles();

    // Orientation Handler
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { gamma, beta } = event; // gamma: left/right, beta: front/back
      if (gamma !== null && beta !== null) {
        // More subtle gravity influence
        const gx = Math.min(Math.max(gamma, -45), 45) / 20; 
        const gy = Math.min(Math.max(beta, -45), 45) / 20;
        gravityRef.current = { x: gx, y: gy };
      }
    };

    // Mouse Fallback
    const handleMouseMove = (event: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const gx = (event.clientX - centerX) / 300; // Reduced sensitivity
      const gy = (event.clientY - centerY) / 300;
      gravityRef.current = { x: gx, y: gy };
    };

    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;
      
      const g = gravityRef.current;

      particlesRef.current.forEach(p => {
        // Physics: Depth perception (larger particles move faster/react more)
        const depthFactor = p.size * 0.4;

        // Apply Gravity (Acceleration)
        p.vx += g.x * 0.03 * depthFactor;
        p.vy += g.y * 0.03 * depthFactor;

        // Air Resistance / Friction (Prevents infinite acceleration)
        p.vx *= 0.96;
        p.vy *= 0.96;

        // Natural Float / Brownian Motion (Always moving slightly)
        p.vx += Math.sin(time + p.x * 0.01) * 0.005;
        p.vy += Math.cos(time + p.y * 0.01) * 0.005;

        // Update Position
        p.x += p.vx;
        p.y += p.vy;

        // WRAP AROUND LOGIC (Space Loop) - Solves the "clumping" issue
        // Add a buffer so they don't pop in/out instantly
        const buffer = 10;
        if (p.x > canvas.width + buffer) p.x = -buffer;
        else if (p.x < -buffer) p.x = canvas.width + buffer;
        
        if (p.y > canvas.height + buffer) p.y = -buffer;
        else if (p.y < -buffer) p.y = canvas.height + buffer;

        // Visuals: Twinkle
        p.alpha = p.baseAlpha + Math.sin(time * 5 * p.pulseSpeed) * 0.2;

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        // Only glow larger particles for performance & aesthetic
        if (p.size > 1.5) {
            ctx.shadowBlur = p.size * 2;
            ctx.shadowColor = p.color;
        } else {
            ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
      style={{ opacity: 0.8 }} // Base opacity for the whole layer
    />
  );
};

export default GravityStardust;
