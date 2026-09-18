import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, PhoneCall } from 'lucide-react';
import { AppLanguage, FirstAidAssessment, PresetCase } from './types';
import { Navbar } from './components/Navbar';
import { CameraView } from './components/CameraView';
import { ScanningOverlay } from './components/ScanningOverlay';
import { TriageBanner } from './components/TriageBanner';
import { StepCard } from './components/StepCard';
import { WarningBox } from './components/WarningBox';
import { EscalationCard } from './components/EscalationCard';
import { RedFlagModal } from './components/RedFlagModal';
import { MedicalDisclaimer } from './components/MedicalDisclaimer';
import { BootIntroOverlay } from './components/BootIntroOverlay';
import { BackgroundVFX } from './components/BackgroundVFX';
import { NurseMascot } from './components/NurseMascot';
import { voiceCopilot } from './utils/speech';
import { soundEngine } from './utils/audio';

type ViewMode = 'capture' | 'scanning' | 'results';

export default function App() {
  const [language] = useState<AppLanguage>('id');
  const [viewMode, setViewMode] = useState<ViewMode>('capture');
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [showBootIntro, setShowBootIntro] = useState<boolean>(true);

  // Active Assessment Data
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageSizeKb, setImageSizeKb] = useState<number | undefined>(undefined);
  const [assessment, setAssessment] = useState<FirstAidAssessment | null>(null);

  // Modals
  const [isRedFlagOpen, setIsRedFlagOpen] = useState<boolean>(false);

  // Initialize Speech listener
  useEffect(() => {
    voiceCopilot.setListener((speaking) => {
      setIsSpeaking(speaking);
    });
  }, []);

  // Keyboard navigation for steps
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'results' || !assessment) return;

      if (e.key === 'ArrowRight' && activeStepIndex < assessment.step_by_step_actions.length - 1) {
        setActiveStepIndex((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && activeStepIndex > 0) {
        setActiveStepIndex((prev) => prev - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, activeStepIndex, assessment]);

  // Voice toggle handler
  const handleToggleVoice = () => {
    const nextState = !voiceEnabled;
    setVoiceEnabled(nextState);
    voiceCopilot.setEnabled(nextState);
    if (!nextState) {
      voiceCopilot.stop();
    }
  };

  // Speak text helper
  const handleSpeak = (text: string) => {
    if (!voiceEnabled) {
      setVoiceEnabled(true);
      voiceCopilot.setEnabled(true);
    }
    soundEngine.playMascotPop();
    voiceCopilot.speak(text, 'id');
  };

  // Trigger 112 Call
  const handleEmergencyCall = () => {
    soundEngine.playEmergencyAlert();
    window.location.href = 'tel:112';
  };

  // Handle capture & API inference
  const handleCaptureImage = async (base64Image: string, sizeKb: number, notes?: string) => {
    setCurrentImage(base64Image);
    setImageSizeKb(sizeKb);
    setViewMode('scanning');

    try {
      const response = await fetch('/api/analyze-injury', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Image,
          language: 'id',
          additionalNotes: notes,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data: FirstAidAssessment = await response.json();
      setAssessment(data);
      setActiveStepIndex(0);
      setViewMode('results');

      // If RED triage, sound emergency alert and show Red Flag modal
      if (data.triage.urgency_level === 'RED') {
        soundEngine.playEmergencyAlert();
        setIsRedFlagOpen(true);
      } else {
        soundEngine.playCompleteChime();
      }

      // Read initial assessment voice in Indonesian
      if (voiceEnabled) {
        const welcomeSpeech = `Triage selesai. Urgensi ${data.triage.urgency_level}: ${data.triage.injury_type}. ${data.step_by_step_actions[0]?.title || ''}`;
        handleSpeak(welcomeSpeech);
      }
    } catch (error) {
      console.error('Inference error:', error);
      setViewMode('capture');
    }
  };

  // Handle preset demo case selection
  const handleSelectPreset = (preset: PresetCase) => {
    setCurrentImage(preset.thumbnailUrl);
    setImageSizeKb(preset.assessmentData.metadata?.imageCompressedSizeKb || 140);
    setViewMode('scanning');

    // Fast 0.75s scan simulation
    setTimeout(() => {
      setAssessment(preset.assessmentData);
      setActiveStepIndex(0);
      setViewMode('results');

      if (preset.assessmentData.triage.urgency_level === 'RED') {
        soundEngine.playEmergencyAlert();
        setIsRedFlagOpen(true);
      } else {
        soundEngine.playCompleteChime();
      }

      if (voiceEnabled) {
        const welcomeSpeech = `Triage ${preset.assessmentData.triage.urgency_level}: ${preset.assessmentData.triage.injury_type}. ${preset.assessmentData.step_by_step_actions[0]?.title || ''}`;
        handleSpeak(welcomeSpeech);
      }
    }, 750);
  };

  // Reset to scanner
  const handleReset = () => {
    voiceCopilot.stop();
    setAssessment(null);
    setCurrentImage(null);
    setActiveStepIndex(0);
    setViewMode('capture');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070A12] text-slate-100 font-sans relative overflow-x-hidden">
      {/* Background Visual Effects (Dynamic Cyber grid, floating particles, glowing aurora mesh, ECG wave) */}
      <BackgroundVFX urgencyLevel={assessment?.triage.urgency_level || null} />

      {/* Boot Intro Cinematic WOW Overlay */}
      <AnimatePresence>
        {showBootIntro && (
          <BootIntroOverlay
            language="id"
            onComplete={() => setShowBootIntro(false)}
          />
        )}
      </AnimatePresence>

      {/* Top Navigation */}
      <Navbar
        language="id"
        voiceEnabled={voiceEnabled}
        onToggleVoice={handleToggleVoice}
        onEmergencyCall={handleEmergencyCall}
        onReplayIntro={() => setShowBootIntro(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-center relative z-10">
        <AnimatePresence mode="wait">
          {viewMode === 'capture' && (
            <motion.div
              key="view-capture"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <CameraView
                language="id"
                onCaptureImage={handleCaptureImage}
                onSelectPreset={handleSelectPreset}
                isProcessing={false}
              />
            </motion.div>
          )}

          {viewMode === 'scanning' && currentImage && (
            <motion.div
              key="view-scanning"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <ScanningOverlay
                language="id"
                capturedImage={currentImage}
                imageSizeKb={imageSizeKb}
              />
            </motion.div>
          )}

          {viewMode === 'results' && assessment && (
            <motion.div
              key="view-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              id="first-aid-results-view"
              className="space-y-6"
            >
              {/* Top Toolbar / Retake Button & Incident Context Bento Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 shadow-xl">
                <button
                  id="btn-retake-scan"
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700 active:scale-95 transition shadow-sm cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Pindai Cedera Baru</span>
                </button>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {assessment.metadata && (
                    <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-cyan-400 font-bold">
                        {assessment.metadata.modelUsed}
                      </span>
                      <span className="text-slate-500">|</span>
                      <span className="text-slate-300">
                        {assessment.metadata.inferenceLatencyMs} ms
                      </span>
                    </div>
                  )}
                  {currentImage && (
                    <div className="relative group">
                      <img
                        src={currentImage}
                        alt="Current Wound Thumbnail"
                        className="w-10 h-10 rounded-xl object-cover border-2 border-slate-700 shadow-md transition group-hover:scale-105"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Bento Grid: 12-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Tile 1: Triage Assessment (7 cols) */}
                <div className="lg:col-span-7 flex flex-col">
                  <TriageBanner
                    language="id"
                    triage={assessment.triage}
                    onSpeak={handleSpeak}
                    isSpeaking={isSpeaking}
                  />
                </div>

                {/* Tile 2: Critical DO NOT DO Warnings (5 cols) */}
                <div className="lg:col-span-5 flex flex-col">
                  <WarningBox
                    language="id"
                    warnings={assessment.critical_warnings}
                  />
                </div>

                {/* Tile 3: Step-by-Step Action Card with Interactive Timer (12 cols) */}
                {assessment.step_by_step_actions && assessment.step_by_step_actions.length > 0 && (
                  <div className="lg:col-span-12">
                    <StepCard
                      language="id"
                      step={assessment.step_by_step_actions[activeStepIndex] || assessment.step_by_step_actions[0]}
                      stepIndex={activeStepIndex}
                      totalSteps={assessment.step_by_step_actions.length}
                      onPrev={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                      onNext={() =>
                        setActiveStepIndex((prev) =>
                          Math.min(assessment.step_by_step_actions.length - 1, prev + 1)
                        )
                      }
                      onSpeak={handleSpeak}
                      isSpeaking={isSpeaking}
                      autoReadVoice={voiceEnabled}
                    />
                  </div>
                )}

                {/* Tile 4: Medical Escalation, GPS Tele-Emergency & Dispatcher Script (12 cols) */}
                <div className="lg:col-span-12">
                  <EscalationCard
                    language="id"
                    triage={assessment.triage}
                    operatorSummary={assessment.operator_summary}
                    onEmergencyCall={handleEmergencyCall}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Legal & Medical Disclaimer Footer */}
      <MedicalDisclaimer language="id" />

      {/* Interactive 3D Pixar Nurse Mascot (Nura) - Click to Open, Draggable, Context-Aware Chat */}
      <NurseMascot
        language="id"
        voiceEnabled={voiceEnabled}
        onEmergencyCall={handleEmergencyCall}
        onTriggerScan={handleReset}
        assessment={assessment}
        currentImage={currentImage}
      />

      {/* Red Flag Critical Emergency Interceptor Modal */}
      {assessment && (
        <RedFlagModal
          language="id"
          triage={assessment.triage}
          isOpen={isRedFlagOpen}
          onClose={() => setIsRedFlagOpen(false)}
          onEmergencyCall={handleEmergencyCall}
        />
      )}
    </div>
  );
}
