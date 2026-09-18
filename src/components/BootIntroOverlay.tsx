import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Activity, Eye, Cpu, Zap, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppLanguage } from '../types';
import { soundEngine } from '../utils/audio';
import { Hero3DMedicalGlobe } from './Hero3DMedicalGlobe';

interface BootIntroOverlayProps {
  language: AppLanguage;
  onComplete: () => void;
}

export const BootIntroOverlay: React.FC<BootIntroOverlayProps> = ({ language, onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const steps = language === 'id' ? [
    { title: 'Inisialisasi Sensor Optik 3D & Kamera HUD...', icon: Eye, status: 'Online' },
    { title: 'Menghubungkan Mesin Vision Gemini 2.5 Flash...', icon: Cpu, status: 'Ready' },
    { title: 'Memuat Algoritma Triage WHO & Palang Merah...', icon: Activity, status: 'Active' },
    { title: 'Sistem Hologram AI Siap Menolong!', icon: Zap, status: 'Armed' },
  ] : [
    { title: 'Initializing 3D Optical Sensors & Camera HUD...', icon: Eye, status: 'Online' },
    { title: 'Connecting Gemini 2.5 Flash Multimodal Vision Engine...', icon: Cpu, status: 'Ready' },
    { title: 'Loading WHO & Red Cross Emergency Triage Protocols...', icon: Activity, status: 'Active' },
    { title: '3D Hologram AI System Armed & Ready!', icon: Zap, status: 'Armed' },
  ];

  useEffect(() => {
    // Play boot audio chime on mount
    soundEngine.playBootChime();

    // Progress counter & Step transitions with realistic micro-delays
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 2;
        if (next >= 100) {
          clearInterval(interval);
          setIsCompleted(true);
          soundEngine.playCompleteChime();

          // WOW Confetti Burst on 100% completion
          try {
            confetti({
              particleCount: 75,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#06b6d4', '#3b82f6', '#10b981', '#ffffff'],
            });
          } catch {
            // Ignore if canvas blocked
          }

          setTimeout(() => {
            onComplete();
          }, 850);
          return 100;
        }
        return next;
      });
    }, 38);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    if (progress >= 80) setStepIndex(3);
    else if (progress >= 55) setStepIndex(2);
    else if (progress >= 28) setStepIndex(1);
    else setStepIndex(0);
  }, [progress]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08, filter: 'blur(16px)' }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05070E] overflow-hidden select-none"
    >
      {/* Background Cyber Grid & Animated Light Streaks */}
      <div className="absolute inset-0 cyber-grid opacity-35 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.12)_0%,rgba(5,7,14,0.95)_75%)] pointer-events-none" />

      {/* Cinematic Ambient Glowing Aura Blobs */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.25, 0.6, 0.25],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-[600px] h-[600px] rounded-full bg-cyan-500/25 blur-[150px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1.25, 0.95, 1.25],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-[450px] h-[450px] rounded-full bg-blue-600/20 blur-[130px] pointer-events-none translate-x-36 -translate-y-24"
      />

      {/* Main Center Holographic HUD Showcase */}
      <div className="relative z-10 max-w-xl w-full mx-auto px-5 sm:px-6 flex flex-col items-center text-center space-y-6">
        
        {/* 3D Interactive WebGL Hologram Medical Cross Globe */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <Hero3DMedicalGlobe progress={progress} />
        </motion.div>

        {/* Brand Title & Subtitle with Neon Holographic Styling */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 text-xs font-semibold shadow-lg shadow-cyan-950/60">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="tracking-widest uppercase text-[11px] font-mono font-bold">
              3D MULTIMODAL AI VISION
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            FirstAidLens <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]">AI</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            {language === 'id'
              ? 'Memuat Asisten P3K & Triage Darurat Cerdas dengan Panduan Visi 3D'
              : 'Real-Time Multimodal Computer Vision Emergency First-Aid Copilot'}
          </p>
        </div>

        {/* Live Step Progress Status Glass Tile */}
        <div className="w-full bg-slate-900/80 backdrop-blur-2xl border border-cyan-900/50 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3.5 text-left relative overflow-hidden">
          {/* Subtle glowing scanner line on top border */}
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-laser-sweep" />

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-400 flex items-center gap-2 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span>STATUS: {steps[stepIndex]?.status}</span>
            </span>
            <span className="text-cyan-300 font-extrabold font-mono text-sm">{progress}%</span>
          </div>

          {/* Linear Glowing Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800 relative">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.9)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>

          {/* Active Boot Step Message */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              {React.createElement(steps[stepIndex]?.icon || Activity, {
                className: 'w-4 h-4 text-cyan-400 shrink-0 animate-pulse',
              })}
              <span className="text-xs sm:text-sm font-medium text-slate-200 truncate">
                {steps[stepIndex]?.title}
              </span>
            </div>

            {isCompleted && (
              <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold shrink-0">
                <ShieldCheck className="w-4 h-4" />
                <span>Siap</span>
              </span>
            )}
          </div>
        </div>

        {/* Skip / Instant Enter Button */}
        <button
          id="btn-skip-boot-intro"
          type="button"
          onClick={() => {
            soundEngine.playCompleteChime();
            onComplete();
          }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs sm:text-sm font-bold border border-slate-700/80 shadow-lg active:scale-95 transition cursor-pointer"
        >
          <span>{language === 'id' ? 'Lewati & Masuk' : 'Skip & Enter'}</span>
          <ArrowRight className="w-4 h-4 text-cyan-400" />
        </button>

      </div>
    </motion.div>
  );
};
