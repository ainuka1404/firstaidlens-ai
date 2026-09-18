import React, { useState } from 'react';
import { X, Code2, Cpu, CheckCircle2, Copy, Sparkles, Layers, ShieldCheck, Zap } from 'lucide-react';
import { AppLanguage, FirstAidAssessment } from '../types';

interface ArchitectureModalProps {
  language: AppLanguage;
  isOpen: boolean;
  onClose: () => void;
  lastAssessment?: FirstAidAssessment | null;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  language,
  isOpen,
  onClose,
  lastAssessment,
}) => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'schema' | 'system' | 'pipeline'>('schema');

  if (!isOpen) return null;

  const schemaJson = `{
  "type": "OBJECT",
  "properties": {
    "triage": {
      "type": "OBJECT",
      "properties": {
        "urgency_level": { "type": "STRING", "enum": ["GREEN", "YELLOW", "RED"] },
        "injury_type": { "type": "STRING" },
        "severity_summary": { "type": "STRING" },
        "immediate_ambulance_needed": { "type": "BOOLEAN" }
      },
      "required": ["urgency_level", "injury_type", "severity_summary", "immediate_ambulance_needed"]
    },
    "critical_warnings": {
      "type": "ARRAY",
      "items": { "type": "STRING" }
    },
    "step_by_step_actions": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "step_number": { "type": "INTEGER" },
          "title": { "type": "STRING" },
          "instruction": { "type": "STRING" },
          "timer_duration_seconds": { "type": "INTEGER" },
          "icon_type": { "type": "STRING", "enum": ["WATER", "BANDAGE", "PRESSURE", "REST", "ALERT"] }
        },
        "required": ["step_number", "title", "instruction", "timer_duration_seconds"]
      }
    },
    "operator_summary": {
      "type": "STRING"
    }
  },
  "required": ["triage", "critical_warnings", "step_by_step_actions", "operator_summary"]
}`;

  const systemInstructionText = `Anda adalah "FirstAidLens AI", sistem asisten pertolongan pertama darurat domestik.
Tugas Anda:
1. Menganalisis gambar luka/cedera domestik secara objektif dan cepat.
2. Mengklasifikasikan tingkat urgensi (GREEN / YELLOW / RED).
3. Memberikan panduan langkah-demi-langkah P3K yang konkret, tenang, dan berbasis standar medis Palang Merah Internasional / WHO.
4. Memberikan daftar larangan fatal (DO NOT DO).
5. Jangan pernah memberikan resep obat keras, antibiotik oral, atau prosedur bedah invasif.`;

  const copyToClipboard = (text: string, tabName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <div
      id="architecture-schema-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Young Coder World Cup 2026 – Tech & Schema Specs
              </h3>
              <p className="text-xs text-slate-400">
                Google AI Studio (Gemini 2.5 Flash) Strict Multimodal Vision Engine
              </p>
            </div>
          </div>

          <button
            id="btn-close-architecture"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Diagnostic Metadata Badge if last assessment exists */}
        {lastAssessment?.metadata && (
          <div className="bg-cyan-950/40 border-b border-cyan-900/50 px-6 py-2.5 flex items-center justify-between text-xs font-mono text-cyan-300">
            <div className="flex items-center gap-4 flex-wrap">
              <span>Model: <strong className="text-white">{lastAssessment.metadata.modelUsed}</strong></span>
              <span>Latensi: <strong className="text-emerald-400">{lastAssessment.metadata.inferenceLatencyMs} ms</strong></span>
              {lastAssessment.metadata.imageCompressedSizeKb && (
                <span>Payload: <strong className="text-cyan-400">{lastAssessment.metadata.imageCompressedSizeKb} KB</strong></span>
              )}
            </div>
            <span className="text-[10px] text-slate-400">Status: Real-time Validated</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg border-b-2 transition ${
              activeTab === 'schema'
                ? 'border-cyan-400 text-cyan-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Gemini Response Schema (Strict JSON)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg border-b-2 transition ${
              activeTab === 'system'
                ? 'border-cyan-400 text-cyan-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            System Instruction Prompt
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg border-b-2 transition ${
              activeTab === 'pipeline'
                ? 'border-cyan-400 text-cyan-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            End-to-End Pipeline
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 font-sans text-slate-300 text-sm">
          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Definisi skema JSON terstruktur deterministik yang dieksekusi oleh Gemini API:
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(schemaJson, 'schema')}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 bg-slate-800 px-2.5 py-1 rounded border border-slate-700 transition"
                >
                  {copiedTab === 'schema' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTab === 'schema' ? 'Tersalin' : 'Salin JSON'}</span>
                </button>
              </div>

              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
                {schemaJson}
              </pre>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Instruksi sistem medis dengan standar Palang Merah Internasional & WHO:
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(systemInstructionText, 'system')}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 bg-slate-800 px-2.5 py-1 rounded border border-slate-700 transition"
                >
                  {copiedTab === 'system' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTab === 'system' ? 'Tersalin' : 'Salin Prompt'}</span>
                </button>
              </div>

              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {systemInstructionText}
              </pre>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                    <Layers className="w-4 h-4" />
                    <span>1. Client Vision Pre-processing</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    WebRTC Camera stream dikonversi via HTML5 Canvas dengan kompresi adaptif (&lt; 300 KB, 800x600 px) dan contrast booster untuk efisiensi latensi & bandwidth.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <Cpu className="w-4 h-4" />
                    <span>2. Gemini Multimodal Vision</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Server-side API route memanggil Google AI Studio SDK secara stateless (Zero-PII) dengan response_mime_type JSON ketat.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Zap className="w-4 h-4" />
                    <span>3. Micro-Step Timers</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Countdown timer real-time (misal 20 menit luka bakar / 10 menit bebat tekan) dengan osilator sintesis Web Audio API (chime & soft tick).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>4. Web Speech Copilot & GPS 112</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Web Speech API (TTS) membacakan langkah P3K dalam Bahasa Indonesia/Inggris secara tenang, dipadukan resolusi GPS instan untuk operator darurat.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Young Coder World Cup (YCWC) 2026 – Senior Category</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
