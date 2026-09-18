import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface BackgroundVFXProps {
  urgencyLevel?: 'RED' | 'YELLOW' | 'GREEN' | null;
}

export const BackgroundVFX: React.FC<BackgroundVFXProps> = ({ urgencyLevel }) => {
  // Determine ambient glow colors based on current triage urgency
  const glowConfig = useMemo(() => {
    switch (urgencyLevel) {
      case 'RED':
        return {
          primary: 'from-rose-600/25 via-red-950/20 to-transparent',
          secondary: 'bg-red-700/15',
          accent: 'text-red-500',
          pulseSpeed: 2.5,
        };
      case 'YELLOW':
        return {
          primary: 'from-amber-500/25 via-yellow-950/20 to-transparent',
          secondary: 'bg-amber-600/15',
          accent: 'text-amber-400',
          pulseSpeed: 4.5,
        };
      case 'GREEN':
      default:
        return {
          primary: 'from-cyan-500/20 via-blue-950/20 to-transparent',
          secondary: 'bg-cyan-600/15',
          accent: 'text-cyan-400',
          pulseSpeed: 6,
        };
    }
  }, [urgencyLevel]);

  // Floating medical particles (crosses, bubbles, and sparkles)
  const particles = useMemo(
    () => [
      { id: 1, x: '8%', y: '18%', size: 14, delay: 0, duration: 9, type: 'cross' },
      { id: 2, x: '88%', y: '25%', size: 18, delay: 1.5, duration: 11, type: 'cross' },
      { id: 3, x: '20%', y: '75%', size: 12, delay: 2.2, duration: 8, type: 'plus' },
      { id: 4, x: '82%', y: '80%', size: 16, delay: 0.8, duration: 10, type: 'plus' },
      { id: 5, x: '50%', y: '12%', size: 10, delay: 3, duration: 12, type: 'circle' },
      { id: 6, x: '12%', y: '50%', size: 8, delay: 1, duration: 7, type: 'circle' },
      { id: 7, x: '92%', y: '60%', size: 10, delay: 2.5, duration: 9.5, type: 'circle' },
    ],
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Background Cyber Grid with animated panning */}
      <div className="absolute inset-0 cyber-grid opacity-25" />

      {/* Holographic Hex Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]" />

      {/* Top Ambient Pulsing Radial Aura */}
      <motion.div
        animate={{
          scale: [1, 1.18, 1],
          opacity: [0.4, 0.75, 0.4],
        }}
        transition={{
          duration: glowConfig.pulseSpeed,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute -top-48 left-1/2 -translate-x-1/2 w-[850px] h-[600px] rounded-full bg-gradient-to-b ${glowConfig.primary} blur-[140px]`}
      />

      {/* Bottom Corner Floating Glow Orbs */}
      <motion.div
        animate={{
          scale: [1.15, 0.95, 1.15],
          opacity: [0.25, 0.5, 0.25],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-28 -left-28 w-[500px] h-[500px] rounded-full bg-blue-700/15 blur-[140px]"
      />

      <motion.div
        animate={{
          scale: [0.95, 1.2, 0.95],
          opacity: [0.2, 0.45, 0.2],
          x: [0, -25, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute -bottom-28 -right-28 w-[520px] h-[520px] rounded-full ${glowConfig.secondary} blur-[140px]`}
      />

      {/* Floating Medical Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.2, 0.65, 0.2],
            y: [0, -25, 0],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
          style={{ left: p.x, top: p.y }}
          className={`absolute flex items-center justify-center ${glowConfig.accent} opacity-30`}
        >
          {p.type === 'cross' ? (
            <svg
              width={p.size}
              height={p.size}
              viewBox="0 0 24 24"
              fill="currentColor"
              className="drop-shadow-[0_0_8px_currentColor]"
            >
              <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7V2z" />
            </svg>
          ) : p.type === 'plus' ? (
            <span className="text-xl font-bold font-mono drop-shadow-[0_0_6px_currentColor]">
              +
            </span>
          ) : (
            <div
              style={{ width: p.size, height: p.size }}
              className="rounded-full bg-cyan-400/40 shadow-[0_0_10px_#22d3ee]"
            />
          )}
        </motion.div>
      ))}

      {/* Live ECG Heartbeat Wave SVG Line at the bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-20 opacity-40 overflow-hidden pointer-events-none">
        <svg
          viewBox="0 0 1400 80"
          className={`w-full h-full ${glowConfig.accent}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
              <stop offset="45%" stopColor="currentColor" stopOpacity="0.8" />
              <stop offset="55%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="65%" stopColor="currentColor" stopOpacity="0.8" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path
            d="M 0 40 L 200 40 L 220 30 L 230 60 L 240 10 L 250 68 L 260 40 L 500 40 L 520 28 L 530 62 L 540 8 L 550 72 L 560 40 L 850 40 L 870 32 L 880 58 L 890 12 L 900 66 L 910 40 L 1200 40 L 1220 28 L 1230 62 L 1240 8 L 1250 70 L 1260 40 L 1400 40"
            fill="none"
            stroke="url(#ecgGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            className="animate-ecg drop-shadow-[0_0_10px_currentColor]"
          />
        </svg>
      </div>
    </div>
  );
};
