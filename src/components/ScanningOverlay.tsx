import React, { useState, useEffect } from 'react';
import { Sparkles, Cpu, Activity, Zap, CheckCircle2 } from 'lucide-react';
import { AppLanguage } from '../types';

interface ScanningOverlayProps {
  language: AppLanguage;
  capturedImage: string;
  imageSizeKb?: number;
}

export const ScanningOverlay: React.FC<ScanningOverlayProps> = ({
  language,
  capturedImage,
  imageSizeKb,
}) => {
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [scanStageIndex, setScanStageIndex] = useState<number>(0);

  const scanStagesId = [
    'Normalisasi Citra & Booster Kontras Canvas...',
    'Mengirimkan Payload Multimodal ke Gemini 2.5 Flash...',
    'Menganalisis Pola Eritema, Kedalaman, & Edema...',
    'Mengklasifikasikan Triage Standar WHO / Palang Merah...',
    'Menghasilkan Panduan Tindakan Mikro & Timer...',
  ];

  const scanStagesEn = [
    'Normalizing Image & Canvas Contrast Booster...',
    'Sending Multimodal Payload to Gemini 2.5 Flash...',
    'Analyzing Erythema, Depth, & Edema Patterns...',
    'Classifying WHO / Red Cross Triage Standard...',
    'Generating Actionable Micro-Steps & Timers...',
  ];

  const stages = language === 'id' ? scanStagesId : scanStagesEn;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const now = Date.now() - startTime;
      setElapsedMs(now);
      const stage = Math.min(stages.length - 1, Math.floor(now / 450));
      setScanStageIndex(stage);
    }, 40);

    return () => clearInterval(interval);
  }, [stages.length]);

  return (
    <div id="scanning-overlay-screen" className="w-full max-w-2xl mx-auto space-y-6 py-4">
      {/* Top Status Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-semibold animate-pulse">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'id' ? 'Pemrosesan Vision Multimodal Aktif' : 'Multimodal Vision Processing Active'}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white">
          {language === 'id' ? 'Menganalisis Kondisi Cedera...' : 'Analyzing Injury Condition...'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          {language === 'id'
            ? 'Gemini Vision sedang mengevaluasi keparahan luka dan menyusun instruksi pertolongan pertama.'
            : 'Gemini Vision is assessing wound severity and preparing step-by-step first-aid actions.'}
        </p>
      </div>

      {/* Captured Image with Laser Scanner Animation */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-2xl overflow-hidden border-2 border-cyan-500/70 bg-black shadow-2xl shadow-cyan-950/60">
        <img
          src={capturedImage}
          alt="Captured wound"
          className="w-full h-full object-cover filter contrast-105"
        />

        {/* Dark tinted overlay with cyber grid */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/30 via-transparent to-cyan-950/40 pointer-events-none"></div>

        {/* Laser Scan Line Animation */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-[scan_2s_ease-in-out_infinite]"></div>

        {/* HUD Targeting Corner Brackets */}
        <div className="absolute inset-4 pointer-events-none flex flex-col justify-between">
          <div className="flex justify-between">
            <div className="w-8 h-8 border-t-2 border-l-2 border-cyan-400"></div>
            <div className="w-8 h-8 border-t-2 border-r-2 border-cyan-400"></div>
          </div>
          <div className="flex justify-between">
            <div className="w-8 h-8 border-b-2 border-l-2 border-cyan-400"></div>
            <div className="w-8 h-8 border-b-2 border-r-2 border-cyan-400"></div>
          </div>
        </div>

        {/* Real-time Latency & Telemetry Badge */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-cyan-800 text-cyan-300 font-mono text-xs flex items-center gap-1.5 shadow-lg">
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
            <span>{(elapsedMs / 1000).toFixed(2)}s</span>
          </div>

          {imageSizeKb && (
            <div className="bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-700 text-slate-300 font-mono text-[10px]">
              Payload: {imageSizeKb} KB
            </div>
          )}
        </div>
      </div>

      {/* Pipeline Stage Tracker */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Reasoning Pipeline</span>
          </span>
          <span className="font-mono text-cyan-400">
            {scanStageIndex + 1}/{stages.length}
          </span>
        </div>

        {/* Stage Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
            style={{ width: `${((scanStageIndex + 1) / stages.length) * 100}%` }}
          ></div>
        </div>

        {/* Active Stage Label */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
          <span className="truncate">{stages[scanStageIndex]}</span>
        </div>
      </div>
    </div>
  );
};
