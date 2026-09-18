import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Camera,
  SwitchCamera,
  Zap,
  ZapOff,
  Upload,
  Sparkles,
  AlertCircle,
  Info,
  CheckCircle2,
  Play,
  Cpu,
  Activity,
  Scan,
  ShieldCheck,
} from 'lucide-react';
import { AppLanguage, PresetCase } from '../types';
import { PRESET_CASES } from '../utils/offlineData';
import { compressAndEnhanceImage, readFileAsDataURL } from '../utils/canvas';
import { soundEngine } from '../utils/audio';

interface CameraViewProps {
  language: AppLanguage;
  onCaptureImage: (base64: string, sizeKb: number, notes?: string) => void;
  onSelectPreset: (preset: PresetCase) => void;
  isProcessing: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onCaptureImage,
  onSelectPreset,
  isProcessing,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [torchSupported, setTorchSupported] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  }, []);

  // Start camera helper
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);

      // Check for torch capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = (videoTrack.getCapabilities && videoTrack.getCapabilities()) as unknown as { torch?: boolean };
        if (capabilities && capabilities.torch) {
          setTorchSupported(true);
        } else {
          setTorchSupported(false);
        }
      }
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      setCameraError(
        'Tidak dapat mengakses kamera live. Pastikan izin kamera telah disetujui, atau unggah foto dari galeri/gunakan sampel simulasi di bawah.'
      );
      setCameraActive(false);
    }
  }, [facingMode]);

  // Toggle torch / flash
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (!videoTrack) return;

    try {
      const newTorchState = !torchOn;
      await (videoTrack.applyConstraints as unknown as (constraints: object) => Promise<void>)({
        advanced: [{ torch: newTorchState }],
      });
      setTorchOn(newTorchState);
    } catch (e) {
      console.warn('Torch not supported on this device/browser', e);
    }
  };

  // Flip camera between environment (rear) and user (front)
  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  useEffect(() => {
    if (cameraActive) {
      startCamera();
    }
  }, [facingMode, cameraActive, startCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Handle capture from live video
  const handleShutterCapture = async () => {
    if (!videoRef.current || !cameraActive) return;
    soundEngine.playShutter();

    try {
      const result = await compressAndEnhanceImage(videoRef.current);
      stopCamera();
      onCaptureImage(result.base64Data, result.sizeKb, additionalNotes);
    } catch (err) {
      console.error('Failed to capture frame:', err);
    }
  };

  // Handle gallery file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    try {
      const rawBase64 = await readFileAsDataURL(file);
      const img = new Image();
      img.src = rawBase64;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const compressed = await compressAndEnhanceImage(img);
      soundEngine.playShutter();
      stopCamera();
      onCaptureImage(compressed.base64Data, compressed.sizeKb, additionalNotes);
    } catch (err) {
      console.error('File compression failed:', err);
    }
  };

  // Handle Drag & Drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) return;

      try {
        const rawBase64 = await readFileAsDataURL(file);
        const img = new Image();
        img.src = rawBase64;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const compressed = await compressAndEnhanceImage(img);
        soundEngine.playShutter();
        stopCamera();
        onCaptureImage(compressed.base64Data, compressed.sizeKb, additionalNotes);
      } catch (err) {
        console.error('Drop compression error:', err);
      }
    }
  };

  // Handle demo case selection
  const handlePresetSelect = (preset: PresetCase) => {
    setSelectedPresetId(preset.id);
    soundEngine.playTick();
    onSelectPreset(preset);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-6"
    >
      {/* Top Bento Header Card */}
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center space-y-3 relative overflow-hidden shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-semibold shadow-md shadow-cyan-950/50">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          <span>Triage Visual AI Vision (Standar Medis WHO & PMI)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
          Pemindaian Cedera & Panduan P3K Instan
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Arahkan kamera atau unggah foto luka bakar, sayatan, atau cedera domestik. AI akan langsung mengevaluasi tingkat keparahan dan memandu langkah pertolongan pertama dengan hitung mundur waktu.
        </p>
      </div>

      {/* Main Bento Grid: Viewfinder Hero Cell (8 cols) + Incident Context & Stats Tile (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bento Cell 1: Viewport / Camera / Dropzone (8 cols) */}
        <div
          id="camera-viewport-card"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`lg:col-span-8 bg-slate-900/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 overflow-hidden shadow-2xl relative flex flex-col justify-center ${
            isDragOver
              ? 'border-cyan-400 bg-cyan-950/40 shadow-cyan-500/30'
              : cameraActive
              ? 'border-cyan-500 shadow-cyan-950/60'
              : 'border-slate-800/90 hover:border-slate-700'
          }`}
        >
          {cameraActive ? (
            /* Live WebRTC Camera Active State */
            <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full bg-black flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover"
              />

              {/* Animated Continuous Laser Sweep */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-laser-sweep pointer-events-none z-10" />

              {/* Target Reticle Viewfinder Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6 z-20">
                {/* Top guidance banner */}
                <div className="bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-cyan-500/50 text-white text-xs font-semibold flex items-center gap-2 shadow-lg">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-cyan-200">Posisikan area luka di dalam bingkai (Jarak 15-25 cm)</span>
                </div>

                {/* Central Target Reticle Box with Rotating HUD Ticks */}
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 border border-cyan-400/40 rounded-3xl flex items-center justify-center">
                  {/* Rotating Micro-Radar Ring */}
                  <div className="absolute inset-3 rounded-full border border-dashed border-cyan-400/25 animate-spin-slow pointer-events-none" />

                  {/* Glowing Corner brackets */}
                  <div className="absolute -top-1.5 -left-1.5 w-7 h-7 border-t-4 border-l-4 border-cyan-400 rounded-tl-xl drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                  <div className="absolute -top-1.5 -right-1.5 w-7 h-7 border-t-4 border-r-4 border-cyan-400 rounded-tr-xl drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                  <div className="absolute -bottom-1.5 -left-1.5 w-7 h-7 border-b-4 border-l-4 border-cyan-400 rounded-bl-xl drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 border-b-4 border-r-4 border-cyan-400 rounded-br-xl drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>

                  {/* Center crosshair */}
                  <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-4 h-0.5 bg-cyan-400/80 shadow-[0_0_6px_#22d3ee]"></div>
                    <div className="absolute w-0.5 h-4 bg-cyan-400/80 shadow-[0_0_6px_#22d3ee]"></div>
                  </div>
                </div>

                {/* Bottom camera controls overlay */}
                <div className="pointer-events-auto flex items-center justify-center gap-4 w-full">
                  {/* Switch Camera front/back */}
                  <button
                    id="btn-camera-flip"
                    type="button"
                    onClick={flipCamera}
                    className="p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 backdrop-blur-md transition active:scale-95 shadow-md cursor-pointer"
                    title="Ganti Kamera Depan/Belakang"
                  >
                    <SwitchCamera className="w-5 h-5 text-cyan-400" />
                  </button>

                  {/* Main Shutter Button with Pulsing Radar Ring */}
                  <button
                    id="btn-camera-shutter"
                    type="button"
                    onClick={handleShutterCapture}
                    disabled={isProcessing}
                    className="relative p-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-xl shadow-cyan-500/50 active:scale-90 transition group cursor-pointer"
                    title="Ambil Foto & Analisis Cedera"
                  >
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-4 border-white flex items-center justify-center bg-cyan-400 group-hover:bg-cyan-300 shadow-inner">
                      <Camera className="w-7 h-7 text-slate-950" />
                    </div>
                  </button>

                  {/* Torch Toggle (if supported) */}
                  {torchSupported && (
                    <button
                      id="btn-camera-torch"
                      type="button"
                      onClick={toggleTorch}
                      className={`p-3 rounded-full border backdrop-blur-md transition active:scale-95 shadow-md cursor-pointer ${
                        torchOn
                          ? 'bg-amber-500/80 border-amber-400 text-slate-950 shadow-amber-500/40'
                          : 'bg-slate-900/80 border-slate-700 text-white hover:bg-slate-800'
                      }`}
                      title={torchOn ? 'Matikan Lampu Senter' : 'Nyalakan Lampu Senter'}
                    >
                      {torchOn ? <Zap className="w-5 h-5 fill-current" /> : <ZapOff className="w-5 h-5" />}
                    </button>
                  )}

                  {/* Close camera */}
                  <button
                    id="btn-camera-close"
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 backdrop-blur-md transition active:scale-95 text-xs font-semibold shadow-md cursor-pointer"
                    title="Tutup Kamera"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Camera Inactive / Default Entry State with Laser Glow */
            <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

              <motion.div
                animate={{
                  scale: [1, 1.06, 1],
                  boxShadow: [
                    '0 0 15px rgba(6,182,212,0.2)',
                    '0 0 40px rgba(6,182,212,0.5)',
                    '0 0 15px rgba(6,182,212,0.2)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-3xl bg-cyan-950/80 border-2 border-cyan-500/60 flex items-center justify-center text-cyan-300 shadow-xl relative z-10"
              >
                <Camera className="w-10 h-10" />
              </motion.div>

              <div className="space-y-2 max-w-md relative z-10">
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Mulai Pemindaian Visual Kamera
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Gunakan kamera ponsel atau unggah foto dari galeri untuk analisis real-time kondisi cedera.
                </p>
              </div>

              {/* Camera Error Notice if any */}
              {cameraError && (
                <div className="max-w-md p-3 rounded-xl bg-amber-950/70 border border-amber-800/80 text-amber-300 text-xs flex items-start gap-2 text-left relative z-10">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-md relative z-10">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  id="btn-start-camera"
                  type="button"
                  onClick={startCamera}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-950/60 transition cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                  <span>Buka Kamera Langsung</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  id="btn-upload-file"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 min-w-[160px] flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 shadow-lg transition cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>Unggah Foto</span>
                </motion.button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="text-xs text-slate-400 flex items-center gap-1.5 relative z-10">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Format didukung: JPG, PNG, WEBP. Kompresi otomatis &lt; 300 KB.</span>
              </div>
            </div>
          )}
        </div>

        {/* Bento Cell 2: Incident Context & AI Specifications (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Notes Card */}
          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Info className="w-4 h-4" />
              <span>Catatan Konteks Kejadian</span>
            </div>
            <label htmlFor="input-incident-notes" className="block text-xs text-slate-300 leading-relaxed">
              Catatan Tambahan (Usia korban, cairan penyebab, durasi kejadian):
            </label>
            <textarea
              id="input-incident-notes"
              rows={3}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Contoh: Anak usia 4 tahun tersiram air teh panas 5 menit lalu..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-none transition"
            />
          </div>

          {/* AI Multimodal Telemetry Bento Tile */}
          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 space-y-3.5 shadow-xl flex-1 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Cpu className="w-4 h-4" />
                <span>Fitur &amp; Standar Medis</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 block font-medium">Model AI</span>
                  <span className="font-bold text-cyan-300">Gemini 2.5 Flash</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 block font-medium">Sistem Triage</span>
                  <span className="font-bold text-emerald-300">WHO / PMI 3-Tier</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 block font-medium">Target Respon</span>
                  <span className="font-bold text-amber-300">&lt; 2.0 Detik</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 block font-medium">Panduan Suara</span>
                  <span className="font-bold text-indigo-300">Web Speech API</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-900/50 text-[11px] text-cyan-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Deteksi visual langsung memberikan hitung mundur waktu P3K.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Cell 3: Preset Demo Cases for Instant Simulation */}
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl sm:rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              Sampel Kasus Darurat (Simulasi Cepat)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Uji respon sistem tanpa perlu memotret cedera nyata
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRESET_CASES.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            const urgencyBg =
              preset.urgency === 'RED'
                ? 'bg-red-950/70 border-red-700 text-red-300'
                : preset.urgency === 'YELLOW'
                ? 'bg-amber-950/70 border-amber-700 text-amber-300'
                : 'bg-emerald-950/70 border-emerald-700 text-emerald-300';

            return (
              <button
                id={`btn-preset-${preset.id}`}
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 group relative overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/50 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-950/50'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={preset.thumbnailUrl}
                    alt={preset.titleId}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0 bg-slate-950 shadow-md"
                  />
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${urgencyBg}`}>
                        {preset.urgency}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate">{preset.category}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition line-clamp-1">
                      {preset.titleId}
                    </h4>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80 text-cyan-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Muat Kasus Ini</span>
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
