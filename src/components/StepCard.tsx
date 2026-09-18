import React, { useState, useEffect, useRef } from 'react';
import { 
  Droplet, 
  Bandage, 
  Hand, 
  BedDouble, 
  AlertTriangle, 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Volume2, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Sparkles,
  Timer as TimerIcon
} from 'lucide-react';
import { StepAction, StepIconType, AppLanguage } from '../types';
import { soundEngine } from '../utils/audio';

interface StepCardProps {
  language: AppLanguage;
  step: StepAction;
  stepIndex: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
  autoReadVoice: boolean;
}

export const StepCard: React.FC<StepCardProps> = ({
  language,
  step,
  stepIndex,
  totalSteps,
  onPrev,
  onNext,
  onSpeak,
  isSpeaking,
  autoReadVoice,
}) => {
  // Timer State
  const initialDuration = step.timer_duration_seconds;
  const [timeLeft, setTimeLeft] = useState<number>(initialDuration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset timer when active step changes
  useEffect(() => {
    setTimeLeft(step.timer_duration_seconds);
    setIsRunning(false);
    setIsCompleted(false);

    if (autoReadVoice) {
      const readout = `${language === 'id' ? `Langkah ${step.step_number}:` : `Step ${step.step_number}:`} ${step.title}. ${step.instruction}`;
      onSpeak(readout);
    }
  }, [stepIndex, step, autoReadVoice, language]);

  // Countdown loop
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setIsCompleted(true);
            soundEngine.playCompleteChime();
            return 0;
          }
          // Play soft tick every second if running
          soundEngine.playTick();
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsCompleted(true);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  // Timer controls
  const toggleTimer = () => {
    soundEngine.playTick();
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    soundEngine.playTick();
    setIsRunning(false);
    setIsCompleted(false);
    setTimeLeft(step.timer_duration_seconds);
  };

  // Fast forward for demo/testing
  const fastForwardDemo = () => {
    soundEngine.playTick();
    setTimeLeft(3); // Sets timer to 3 seconds remaining so user can see it chime
    setIsRunning(true);
  };

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // SVG circular progress calculation
  const total = initialDuration > 0 ? initialDuration : 1;
  const progressFraction = Math.max(0, Math.min(1, (total - timeLeft) / total));
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressFraction * circumference;

  // Icon mapping
  const renderIcon = (type: StepIconType) => {
    switch (type) {
      case 'WATER':
        return <Droplet className="w-6 h-6 text-cyan-400" />;
      case 'BANDAGE':
        return <Bandage className="w-6 h-6 text-emerald-400" />;
      case 'PRESSURE':
        return <Hand className="w-6 h-6 text-amber-400" />;
      case 'REST':
        return <BedDouble className="w-6 h-6 text-indigo-400" />;
      case 'ALERT':
      default:
        return <AlertTriangle className="w-6 h-6 text-red-400" />;
    }
  };

  const handleSpeakCurrentStep = () => {
    const readout = `${language === 'id' ? `Langkah ${step.step_number}:` : `Step ${step.step_number}:`} ${step.title}. ${step.instruction}`;
    onSpeak(readout);
  };

  return (
    <div
      id={`step-action-card-${step.step_number}`}
      className="h-full flex flex-col justify-between bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl space-y-5 relative overflow-hidden"
    >
      {/* Header with Step Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center shadow-md">
              {renderIcon(step.icon_type)}
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                {language === 'id' ? `Langkah ${step.step_number} dari ${totalSteps}` : `Step ${step.step_number} of ${totalSteps}`}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {step.title}
              </h3>
            </div>
          </div>

          {/* Step Progress Dots */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-full border border-slate-800">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === stepIndex
                    ? 'w-5 bg-cyan-400'
                    : idx < stepIndex
                    ? 'w-2 bg-emerald-400'
                    : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Primary Instruction Body */}
        <div className="space-y-3">
          <p className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed">
            {step.instruction}
          </p>

          {/* Audio Readout Helper */}
          <button
            id="btn-step-tts"
            type="button"
            onClick={handleSpeakCurrentStep}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/70 text-cyan-300 text-xs font-semibold active:scale-95 transition"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-cyan-400 animate-pulse' : 'text-cyan-400'}`} />
            <span>{isSpeaking ? (language === 'id' ? 'Membacakan Instruksi...' : 'Reading...') : (language === 'id' ? 'Dengarkan Instruksi' : 'Listen Instruction')}</span>
          </button>
        </div>

        {/* Built-in Interactive Countdown Timer (if timer > 0) */}
        {initialDuration > 0 && (
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-inner">
            {/* Circular Progress Display */}
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                  {/* Background Ring */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-800/80"
                  />
                  {/* Animated Progress Ring */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={`transition-all duration-500 ${
                      isCompleted ? 'text-emerald-400' : isRunning ? 'text-cyan-400' : 'text-amber-400'
                    }`}
                  />
                </svg>

                {/* Center Time Display */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="font-mono text-xl sm:text-2xl font-black text-white tracking-tight">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {isCompleted ? (language === 'id' ? 'Selesai!' : 'Done!') : isRunning ? (language === 'id' ? 'Berjalan' : 'Running') : (language === 'id' ? 'Jeda' : 'Paused')}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <TimerIcon className="w-4 h-4 text-cyan-400" />
                  <span>{language === 'id' ? 'Penghitung Waktu Tindakan' : 'Action Countdown Timer'}</span>
                </div>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  {language === 'id'
                    ? `Durasi target: ${Math.round(initialDuration / 60)} menit untuk efektivitas pertolongan pertama maksimal.`
                    : `Target duration: ${Math.round(initialDuration / 60)} minutes for maximum first aid efficacy.`}
                </p>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                id="btn-timer-toggle"
                type="button"
                onClick={toggleTimer}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm active:scale-95 transition shadow-lg ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-950/40'
                    : isCompleted
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/40'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-950/40'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>{language === 'id' ? 'Jeda Timer' : 'Pause'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>{language === 'id' ? 'Mulai Timer' : 'Start Timer'}</span>
                  </>
                )}
              </button>

              <button
                id="btn-timer-reset"
                type="button"
                onClick={resetTimer}
                className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 active:scale-95 transition"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Fast-Forward Simulation button for YCWC Judges */}
              <button
                id="btn-timer-fastforward"
                type="button"
                onClick={fastForwardDemo}
                className="flex items-center gap-1 px-2.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold active:scale-95 transition"
                title="Demo Cepat: Set waktu ke 3 detik untuk menguji bunyi lonceng selesai"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Demo (3s)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
        <button
          id="btn-step-prev"
          type="button"
          onClick={onPrev}
          disabled={stepIndex === 0}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition ${
            stepIndex === 0
              ? 'opacity-30 cursor-not-allowed border-slate-800 text-slate-600'
              : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-200 active:scale-95'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{language === 'id' ? 'Langkah Sebelumnya' : 'Previous Step'}</span>
        </button>

        <button
          id="btn-step-next"
          type="button"
          onClick={onNext}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-950/40 active:scale-95 transition"
        >
          <span>
            {stepIndex < totalSteps - 1
              ? language === 'id'
                ? 'Langkah Selanjutnya'
                : 'Next Step'
              : language === 'id'
              ? 'Selesai & Ringkasan'
              : 'Complete & Summary'}
          </span>
          {stepIndex < totalSteps - 1 ? <ChevronRight className="w-4 h-4" /> : <Check className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
