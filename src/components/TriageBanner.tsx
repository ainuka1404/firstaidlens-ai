import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Siren, Volume2, ShieldAlert, Sparkles, Activity } from 'lucide-react';
import { TriageInfo, AppLanguage } from '../types';

interface TriageBannerProps {
  language: AppLanguage;
  triage: TriageInfo;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
}

export const TriageBanner: React.FC<TriageBannerProps> = ({
  language,
  triage,
  onSpeak,
  isSpeaking,
}) => {
  const isRed = triage.urgency_level === 'RED';
  const isYellow = triage.urgency_level === 'YELLOW';
  const isGreen = triage.urgency_level === 'GREEN';

  const badgeConfig = {
    RED: {
      bg: 'bg-red-950/60 border-red-600/90 text-red-200 shadow-red-950/60',
      pill: 'bg-red-600 text-white',
      title: language === 'id' ? 'DARURAT TINGGI (RED PRIORITY)' : 'HIGH EMERGENCY (RED PRIORITY)',
      desc: language === 'id' ? 'Perlu Eskalasi Medis / Panggilan 112 Segera' : 'Requires Medical Escalation / Immediate 112 Call',
      icon: Siren,
      borderGlow: 'shadow-[0_0_25px_rgba(239,68,68,0.25)] border-red-500/80',
    },
    YELLOW: {
      bg: 'bg-amber-950/50 border-amber-500/80 text-amber-200 shadow-amber-950/50',
      pill: 'bg-amber-500 text-slate-950',
      title: language === 'id' ? 'PERHATIAN SEDANG (YELLOW CAUTION)' : 'MODERATE CAUTION (YELLOW)',
      desc: language === 'id' ? 'Dapat Ditangani P3K dengan Pemantauan Ketat' : 'Manageable with First-Aid & Close Observation',
      icon: AlertTriangle,
      borderGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)] border-amber-500/80',
    },
    GREEN: {
      bg: 'bg-emerald-950/50 border-emerald-500/80 text-emerald-200 shadow-emerald-950/50',
      pill: 'bg-emerald-500 text-slate-950',
      title: language === 'id' ? 'AMAN MANDIRI (GREEN CARE)' : 'MILD / HOME CARE (GREEN)',
      desc: language === 'id' ? 'Luka Ringan, Aman Ditangani Mandiri di Rumah' : 'Minor Injury, Safe for Home First-Aid Care',
      icon: CheckCircle2,
      borderGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)] border-emerald-500/80',
    },
  }[triage.urgency_level];

  const Icon = badgeConfig.icon;

  const handleReadout = () => {
    const textToSpeak = language === 'id'
      ? `Hasil Triage: ${badgeConfig.title}. Jenis cedera: ${triage.injury_type}. ${triage.severity_summary}`
      : `Triage Result: ${badgeConfig.title}. Injury type: ${triage.injury_type}. ${triage.severity_summary}`;
    onSpeak(textToSpeak);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      id="triage-assessment-card"
      className={`h-full flex flex-col justify-between relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 p-5 sm:p-6 backdrop-blur-md transition-all ${badgeConfig.bg} ${badgeConfig.borderGlow}`}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          {/* Triage Level Info */}
          <div className="flex items-start gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                isRed ? 'bg-red-600 text-white animate-pulse' : isYellow ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
              }`}
            >
              <Icon className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wide shadow-sm ${badgeConfig.pill}`}>
                  {triage.urgency_level}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  {badgeConfig.title}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {triage.injury_type}
              </h3>
            </div>
          </div>

          {/* Voice Readout Button */}
          <button
            id="btn-triage-tts"
            type="button"
            onClick={handleReadout}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold active:scale-95 transition shadow-sm shrink-0 cursor-pointer ${
              isSpeaking
                ? 'bg-cyan-950/90 border-cyan-500 text-cyan-300 shadow-cyan-950/50 ring-1 ring-cyan-400/40'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-slate-200 hover:text-white'
            }`}
            title="Dengarkan Suara Penilaian AI"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-cyan-400 animate-pulse' : 'text-cyan-400'}`} />
            <span>{isSpeaking ? (language === 'id' ? 'Membaca...' : 'Speaking...') : (language === 'id' ? 'Dengarkan' : 'Listen')}</span>
          </button>
        </div>

        {/* Severity Summary Description */}
        <div className="pt-2 space-y-3">
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
            {triage.severity_summary}
          </p>

          {triage.immediate_ambulance_needed && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-900/70 border border-red-700 text-red-100 text-xs font-bold animate-pulse shadow-md">
              <ShieldAlert className="w-4 h-4 text-red-300 shrink-0" />
              <span>
                {language === 'id'
                  ? 'PERHATIAN: Kasus ini membutuhkan pemanggilan ambulans / tenaga medis 112!'
                  : 'WARNING: This emergency case requires immediate ambulance / 112 dispatch!'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono text-[11px] text-slate-300">{badgeConfig.desc}</span>
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">WHO Triage</span>
      </div>
    </motion.div>
  );
};


