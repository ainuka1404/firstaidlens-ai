import React from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, Volume2, VolumeX, PhoneCall } from 'lucide-react';
import { AppLanguage } from '../types';

interface NavbarProps {
  language: AppLanguage;
  onLanguageChange?: (lang: AppLanguage) => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onEmergencyCall: () => void;
  onReplayIntro?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  voiceEnabled,
  onToggleVoice,
  onEmergencyCall,
  onReplayIntro,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#070A12]/85 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-cyan-950/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand & Logo with Live Glowing Pulse */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/40 text-white font-bold animate-pulse-glow cursor-pointer"
          >
            <Shield className="w-5 h-5 drop-shadow-md" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                FirstAidLens <span className="text-cyan-400 font-mono text-xs px-1.5 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-700/60 shadow-sm shadow-cyan-950">AI</span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              <span>Visual First-Aid & Triage Darurat Domestik</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Replay Intro Boot Animation */}
          {onReplayIntro && (
            <button
              id="btn-replay-intro"
              type="button"
              onClick={onReplayIntro}
              className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-100 bg-cyan-950/70 hover:bg-cyan-900/70 px-3 py-1.5 rounded-xl border border-cyan-700/60 transition shadow-sm active:scale-95 cursor-pointer"
              title="Putar Ulang Animasi Boot Intro"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
              <span className="hidden sm:inline">Intro AI</span>
            </button>
          )}

          {/* Voice Guidance Toggle */}
          <button
            id="btn-toggle-voice"
            type="button"
            onClick={onToggleVoice}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition active:scale-95 cursor-pointer ${
              voiceEnabled
                ? 'bg-cyan-950/70 border-cyan-600/80 text-cyan-300 hover:bg-cyan-900/70 shadow-sm shadow-cyan-950/40'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={voiceEnabled ? 'Suara AI Aktif (Membacakan Instruksi)' : 'Suara AI Dimatikan'}
          >
            {voiceEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="hidden sm:inline">{voiceEnabled ? 'Suara Aktif' : 'Bisu'}</span>
          </button>

          {/* One-Tap 112 Call */}
          <button
            id="btn-header-dial-112"
            type="button"
            onClick={onEmergencyCall}
            className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm px-3.5 py-1.5 rounded-xl shadow-lg shadow-red-950/60 border border-red-500/50 transition cursor-pointer"
            title="Panggil Layanan Darurat 112"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
            <span>Darurat 112</span>
          </button>
        </div>
      </div>
    </header>
  );
};
