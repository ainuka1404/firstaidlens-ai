import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Volume2,
  X,
  Move,
  Send,
  Loader2,
  PhoneCall,
  Camera,
  MessageSquare,
} from 'lucide-react';
import { AppLanguage, FirstAidAssessment, MascotChatMessage } from '../types';
import { soundEngine } from '../utils/audio';
import { voiceCopilot } from '../utils/speech';

interface NurseMascotProps {
  language: AppLanguage;
  voiceEnabled: boolean;
  onEmergencyCall: () => void;
  onTriggerScan?: () => void;
  assessment?: FirstAidAssessment | null;
  currentImage?: string | null;
}

export const NurseMascot: React.FC<NurseMascotProps> = ({
  language,
  voiceEnabled,
  onEmergencyCall,
  onTriggerScan,
  assessment,
  currentImage,
}) => {
  // Chat window is CLOSED by default, opens only when clicking on Nura
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isWaving, setIsWaving] = useState<boolean>(false);
  const [isWinking, setIsWinking] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const constraintsRef = useRef<HTMLDivElement>(null);

  // Chat State
  const [messages, setMessages] = useState<MascotChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Welcome message tailored exclusively to the current application and injury photo condition
  useEffect(() => {
    let initialGreeting = '';
    if (language === 'id') {
      if (assessment?.triage) {
        initialGreeting = `Halo! Suster Nura siap menemani kamu terkait kondisi cedera saat ini: **${assessment.triage.injury_type}** (${assessment.triage.urgency_level}).\n\nSilakan tanyakan apa saja tentang cara merawat luka, pembalutan, kompres, atau rasa sakit yang dirasakan! 🩺💕`;
      } else {
        initialGreeting = `Halo! Saya **Suster Nura** 🩺 asisten medis FirstAidLens.\n\nKamu bisa tanya cara penggunaan aplikasi ini atau langsung pindai foto luka lewat kamera untuk panduan P3K instan! Ada yang bisa Nura bantu? 💕`;
      }
    } else {
      if (assessment?.triage) {
        initialGreeting = `Hi! Nurse Nura is right here to assist with your current injury: **${assessment.triage.injury_type}** (${assessment.triage.urgency_level}).\n\nFeel free to ask me about wound care, dressing, cold compress, or pain management! 🩺💕`;
      } else {
        initialGreeting = `Hi! I'm **Nurse Nura** 🩺, your FirstAidLens medical assistant.\n\nAsk me how to use the app or scan a wound photo with the camera for instant first-aid guidance! How can I help? 💕`;
      }
    }

    setMessages([
      {
        id: 'msg-welcome-1',
        sender: 'nura',
        text: initialGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [assessment, language]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Auto wink & wave cycles for lifelike 3D mascot feel
  useEffect(() => {
    const winkInterval = setInterval(() => {
      setIsWinking(true);
      setTimeout(() => setIsWinking(false), 240);
    }, 4800);

    const waveInterval = setInterval(() => {
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 1400);
    }, 10000);

    return () => {
      clearInterval(winkInterval);
      clearInterval(waveInterval);
    };
  }, []);

  // Context-aware questions focused on current application usage & injury condition
  const getSuggestions = () => {
    if (assessment?.triage) {
      const type = assessment.triage.injury_type.toLowerCase();
      if (type.includes('bakar') || type.includes('burn')) {
        return language === 'id'
          ? [
              'Bolehkah diolesi salep atau minyak?',
              'Kapan lepuhan luka bakar boleh dipecahkan?',
              'Berapa lama harus dibilas air mengalir?',
            ]
          : [
              'Can I apply burn ointment or oil?',
              'Should I pop the burn blister?',
              'How long should I flush with water?',
            ];
      }
      if (type.includes('sayat') || type.includes('cut') || type.includes('darah') || type.includes('bleed')) {
        return language === 'id'
          ? [
              'Bagaimana cara menghentikan darah?',
              'Kapan luka ini butuh dijahit?',
              'Apakah perlu suntik tetanus?',
            ]
          : [
              'How to stop the bleeding completely?',
              'Does this cut need stitches?',
              'Do I need a tetanus shot?',
            ];
      }
      if (type.includes('kilir') || type.includes('sprain') || type.includes('sendi') || type.includes('joint')) {
        return language === 'id'
          ? [
              'Bolehkah bagian yang bengkak dipijat/diurut?',
              'Berapa menit kompres es yang aman?',
              'Kapan saya boleh mulai berjalan lagi?',
            ]
          : [
              'Should I massage a sprained swollen area?',
              'How many minutes for ice compression?',
              'When is it safe to put weight on it?',
            ];
      }
      // General injury scanned
      return language === 'id'
        ? [
            'Bagaimana cara membalut luka ini?',
            'Apa tanda luka ini mengalami infeksi?',
            'Kapan harus segera ke dokter/IGD?',
          ]
        : [
            'How should I dress this wound?',
            'What are signs of infection?',
            'When should I visit the ER?',
          ];
    }

    // Default suggestions when no photo is scanned
    return language === 'id'
      ? [
          'Bagaimana cara foto luka agar akurat?',
          'Cedera apa saja yang bisa dideteksi?',
          'Kapan saya harus hubungi 119?',
        ]
      : [
          'How to capture an accurate injury photo?',
          'What injuries can this app detect?',
          'When should I call emergency 119?',
        ];
  };

  // Send message to Suster Nura Chat API
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputPrompt).trim();
    if (!textToSend || isLoading) return;

    soundEngine.playMascotPop();
    setInputPrompt('');

    const userMsg: MascotChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/mascot-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          language,
          assessment: assessment || null,
          imageBase64: currentImage || null,
          history: messages.slice(-6),
        }),
      });

      const data = await res.json();
      const replyText =
        data.reply ||
        (language === 'id'
          ? 'Nura siap membantu! Ada yang bisa Nura jelaskan lagi seputar kondisi cedera ini?'
          : 'I am here to help! Any other questions regarding this injury?');

      const nuraMsg: MascotChatMessage = {
        id: `msg-nura-${Date.now()}`,
        sender: 'nura',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, nuraMsg]);

      // Voice read response if enabled
      if (voiceEnabled) {
        voiceCopilot.speak(replyText.replace(/[*_#`]/g, ''), language);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: MascotChatMessage = {
        id: `msg-nura-err-${Date.now()}`,
        sender: 'nura',
        text:
          language === 'id'
            ? 'Nura tetap di sini menemani kamu. Pastikan luka dibersihkan dengan air mengalir dan jangan ditekan berlebihan ya! 💕'
            : 'I am right here with you. Keep the injury clean with running water and avoid excessive pressure! 💕',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Mascot Character Click to Toggle Chat
  const handleMascotClick = () => {
    if (isDragging) return;

    soundEngine.playMascotPop();
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 1200);

    // Spawn cute floating hearts
    const newHeart = {
      id: Date.now(),
      x: (Math.random() - 0.5) * 40,
      y: -20 - Math.random() * 20,
    };
    setHearts((prev) => [...prev.slice(-4), newHeart]);

    // Toggle chat panel on mascot click
    setIsOpen((prev) => !prev);
  };

  // Speak a specific message
  const handleReadMessage = (text: string) => {
    soundEngine.playMascotPop();
    voiceCopilot.speak(text.replace(/[*_#`]/g, ''), language);
  };

  return (
    <div
      ref={constraintsRef}
      className="fixed inset-0 pointer-events-none z-40 overflow-hidden"
    >
      {/* Draggable Mascot Wrapper with spring physics */}
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.15}
        dragMomentum={false}
        onDragStart={() => {
          setIsDragging(true);
          soundEngine.playMascotBounce();
        }}
        onDragEnd={() => {
          setTimeout(() => setIsDragging(false), 100);
        }}
        initial={{ x: 20, y: 100 }}
        className="pointer-events-auto absolute bottom-6 right-6 sm:bottom-8 sm:right-8 cursor-grab active:cursor-grabbing select-none flex flex-col items-end group"
      >
        {/* Floating Heart Particles */}
        <AnimatePresence>
          {hearts.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 1, y: 0, scale: 0.5, x: h.x }}
              animate={{ opacity: 0, y: -70, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute pointer-events-none -top-4 text-pink-400 z-50 drop-shadow-md"
            >
              <Heart className="w-5 h-5 fill-pink-400" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Mascot Interactive Chat Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="mb-3 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-2xl border-2 border-cyan-500/50 rounded-2xl shadow-2xl shadow-cyan-950/80 text-left overflow-hidden flex flex-col relative"
              style={{ maxHeight: '72vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Pointer to Mascot */}
              <div className="absolute -bottom-2.5 right-10 w-4 h-4 bg-slate-900 border-r-2 border-b-2 border-cyan-500/50 rotate-45 pointer-events-none z-10" />

              {/* Chat Window Header */}
              <div className="bg-slate-950/90 px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-400 flex items-center justify-center text-white font-bold shadow-md">
                      🩺
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white tracking-wide">
                        {language === 'id' ? 'Suster Nura 3D' : 'Nurse Nura 3D'}
                      </h4>
                      <span className="px-1.5 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded text-[9px] font-mono">
                        AI
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                      {language === 'id' ? 'Tanya Medis & Kondisi Foto' : 'Injury & App Copilot'}
                    </p>
                  </div>
                </div>

                {/* Close Button & Emergency Shortcut */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onEmergencyCall}
                    className="flex items-center gap-1 text-red-400 hover:text-red-300 bg-red-950/70 px-2 py-1 rounded-lg border border-red-800/80 text-[10px] font-bold transition"
                    title="Panggilan Darurat 119"
                  >
                    <PhoneCall className="w-3 h-3 animate-pulse" />
                    <span>119</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Tutup Chat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Photo Context Banner */}
              {assessment?.triage ? (
                <div className="bg-cyan-950/50 border-b border-cyan-500/20 px-3 py-1.5 flex items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-2 truncate">
                    {currentImage && (
                      <img
                        src={currentImage}
                        alt="Scanned wound"
                        className="w-6 h-6 rounded-md object-cover border border-cyan-400/50 shrink-0"
                      />
                    )}
                    <span className="text-slate-300 truncate">
                      {language === 'id' ? 'Terhubung ke foto:' : 'Linked to photo:'}{' '}
                      <strong className="text-cyan-300">{assessment.triage.injury_type}</strong>
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 font-mono ${
                      assessment.triage.urgency_level === 'RED'
                        ? 'bg-red-950 text-red-300 border border-red-700'
                        : assessment.triage.urgency_level === 'YELLOW'
                        ? 'bg-amber-950 text-amber-300 border border-amber-700'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    }`}
                  >
                    {assessment.triage.urgency_level}
                  </span>
                </div>
              ) : (
                <div className="bg-slate-950/60 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{language === 'id' ? 'Belum ada foto cedera' : 'No injury photo yet'}</span>
                  </span>
                  {onTriggerScan && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onTriggerScan();
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold underline text-[10px]"
                    >
                      {language === 'id' ? 'Pindai Kamera' : 'Scan Camera'}
                    </button>
                  )}
                </div>
              )}

              {/* Chat View */}
              <div className="flex flex-col flex-1 min-h-0 h-80 sm:h-96">
                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender === 'nura' && (
                        <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-xs shrink-0 mt-0.5">
                          🩺
                        </div>
                      )}
                      <div
                        className={`max-w-[82%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-cyan-600 text-white rounded-br-none shadow-md shadow-cyan-950/50'
                            : 'bg-slate-950/90 text-slate-200 border border-slate-800/90 rounded-bl-none shadow-inner'
                        }`}
                      >
                        <div className="whitespace-pre-line break-words">{msg.text}</div>
                        <div className="flex items-center justify-between gap-2 mt-1.5 pt-1 border-t border-white/10 text-[9px] opacity-70">
                          <span>{msg.timestamp}</span>
                          {msg.sender === 'nura' && (
                            <button
                              type="button"
                              onClick={() => handleReadMessage(msg.text)}
                              className="hover:opacity-100 hover:text-cyan-300 transition flex items-center gap-1"
                              title="Dengarkan Nura"
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>{language === 'id' ? 'Dengar' : 'Listen'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-xs text-cyan-300 bg-slate-950/80 px-3 py-2 rounded-xl border border-cyan-500/30 w-fit"
                    >
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                      <span>
                        {language === 'id'
                          ? 'Suster Nura sedang menganalisis...'
                          : 'Nurse Nura is analyzing...'}
                      </span>
                    </motion.div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Context-Aware Quick Question Chips */}
                <div className="px-3 py-1.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                  <span className="text-[10px] text-slate-500 font-mono uppercase shrink-0">
                    💡 {language === 'id' ? 'Tanya:' : 'Ask:'}
                  </span>
                  {getSuggestions().map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(suggestion)}
                      className="px-2 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-950 hover:border-cyan-500/50 border border-slate-700 text-[10px] text-slate-300 hover:text-cyan-200 whitespace-nowrap active:scale-95 transition shrink-0"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                {/* Chat Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-2 bg-slate-950 border-t border-slate-800 flex items-center gap-1.5 shrink-0"
                >
                  <input
                    type="text"
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    placeholder={
                      assessment?.triage
                        ? language === 'id'
                          ? `Tanya Nura tentang foto ${assessment.triage.injury_type}...`
                          : `Ask Nura about this ${assessment.triage.injury_type}...`
                        : language === 'id'
                        ? 'Tanya Suster Nura seputar aplikasi & pertolongan pertama...'
                        : 'Ask Nurse Nura about this app or first aid...'
                    }
                    className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!inputPrompt.trim() || isLoading}
                    className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 font-bold active:scale-95 transition shadow-md shadow-cyan-950/50 shrink-0"
                    title="Kirim pesan"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mascot 3D Character Canvas & Interactive Hitbox */}
        <div
          id="mascot-nura-character"
          onClick={handleMascotClick}
          className="relative flex items-center justify-center cursor-pointer group"
          title={
            language === 'id'
              ? 'Klik gambar Suster Nura untuk membuka Chat P3K! (Bisa diseret/drag)'
              : 'Click Nurse Nura to open First-Aid Chat! (Draggable)'
          }
        >
          {/* Helper Badge when chat is closed */}
          {!isOpen && (
            <div className="absolute -top-7 right-0 bg-cyan-950/90 border border-cyan-500/70 text-cyan-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap shadow-lg animate-bounce">
              <MessageSquare className="w-2.5 h-2.5" />
              <span>{language === 'id' ? 'Klik untuk Chat' : 'Click to Chat'}</span>
            </div>
          )}

          {/* Drag Handle Helper Badge on hover */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 border border-cyan-500/60 text-cyan-300 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap shadow-lg pointer-events-none">
            <Move className="w-2.5 h-2.5" />
            <span>{language === 'id' ? 'Bisa Diseret' : 'Draggable'}</span>
          </div>

          {/* Glowing Aura Ring Underfoot */}
          <div className="absolute -bottom-2 w-20 h-5 bg-cyan-500/30 rounded-full blur-md group-hover:bg-cyan-400/50 transition-all" />

          {/* 3D Pixar Nurse Character SVG Composition */}
          <motion.div
            animate={{
              y: isDragging ? -5 : [0, -6, 0],
              scale: isDragging ? 1.08 : 1,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative w-24 h-24 sm:w-28 sm:h-28 drop-shadow-[0_10px_20px_rgba(6,182,212,0.4)]"
          >
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full filter drop-shadow-lg"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* 3D Gradients for Pixar Skin, Hair & Scrub Suit */}
                <radialGradient id="pixarSkin" cx="45%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#FFF1E6" />
                  <stop offset="65%" stopColor="#FBD5C5" />
                  <stop offset="100%" stopColor="#F2B79F" />
                </radialGradient>

                <linearGradient id="pixarHair" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3E2723" />
                  <stop offset="40%" stopColor="#5D4037" />
                  <stop offset="100%" stopColor="#2E1C14" />
                </linearGradient>

                <linearGradient id="pixarScrub" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E0F7FA" />
                  <stop offset="35%" stopColor="#B2EBF2" />
                  <stop offset="85%" stopColor="#00BCD4" />
                  <stop offset="100%" stopColor="#00838F" />
                </linearGradient>

                <linearGradient id="pixarCap" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="70%" stopColor="#E2E8F0" />
                  <stop offset="100%" stopColor="#CBD5E1" />
                </linearGradient>

                <linearGradient id="pixarEyeIris" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00E5FF" />
                  <stop offset="50%" stopColor="#0091EA" />
                  <stop offset="100%" stopColor="#01579B" />
                </linearGradient>

                <filter id="pixarGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Character Body / Nursing Uniform */}
              <path
                d="M 60 145 C 60 120, 140 120, 140 145 L 148 190 C 148 195, 52 195, 52 190 Z"
                fill="url(#pixarScrub)"
                stroke="#00838F"
                strokeWidth="2.5"
              />

              {/* Scrub Collar V-Neck & Red Cross Pocket Badge */}
              <polygon points="90,132 110,132 100,148" fill="#FFFFFF" opacity="0.9" />
              <rect x="116" y="152" width="16" height="16" rx="4" fill="#FFFFFF" />
              {/* Red Cross */}
              <rect x="122" y="155" width="4" height="10" rx="1" fill="#EF4444" />
              <rect x="119" y="158" width="10" height="4" rx="1" fill="#EF4444" />

              {/* Cute Stethoscope */}
              <path
                d="M 80 134 Q 80 162 100 168 Q 120 162 120 134"
                fill="none"
                stroke="#64748B"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="100" cy="168" r="6" fill="#00E5FF" stroke="#0F172A" strokeWidth="2" filter="url(#pixarGlow)" />

              {/* Left Static Arm */}
              <path
                d="M 58 138 Q 42 155 50 172"
                fill="none"
                stroke="url(#pixarSkin)"
                strokeWidth="11"
                strokeLinecap="round"
              />

              {/* Right Waving Arm (Interactive Animated) */}
              <motion.g
                animate={{
                  rotate: isWaving ? [0, 25, -15, 20, 0] : [0, 6, 0],
                }}
                transition={{
                  duration: isWaving ? 0.6 : 2.5,
                  repeat: isWaving ? 2 : Infinity,
                  ease: 'easeInOut',
                }}
                style={{ originX: '142px', originY: '138px' }}
              >
                <path
                  d="M 142 138 Q 165 130 168 112"
                  fill="none"
                  stroke="url(#pixarSkin)"
                  strokeWidth="11"
                  strokeLinecap="round"
                />
                {/* Cute Hand waving with tiny holographic scanner */}
                <circle cx="168" cy="110" r="7" fill="#FBD5C5" />
                <circle cx="172" cy="106" r="3" fill="#22D3EE" filter="url(#pixarGlow)" />
              </motion.g>

              {/* Neck */}
              <rect x="90" y="118" width="20" height="18" rx="6" fill="url(#pixarSkin)" />

              {/* Hair Back Volume */}
              <ellipse cx="100" cy="82" rx="46" ry="44" fill="url(#pixarHair)" />

              {/* Big Cute Pixar Head */}
              <ellipse cx="100" cy="85" rx="42" ry="38" fill="url(#pixarSkin)" />

              {/* Hair Front Side Bangs */}
              <path
                d="M 58 75 Q 75 48 100 48 Q 130 48 142 75 Q 128 62 100 62 Q 72 62 58 75 Z"
                fill="url(#pixarHair)"
              />
              <path
                d="M 58 75 Q 56 100 64 110 Q 64 88 68 76 Z"
                fill="url(#pixarHair)"
              />
              <path
                d="M 142 75 Q 144 100 136 110 Q 136 88 132 76 Z"
                fill="url(#pixarHair)"
              />

              {/* Nurse Cap (Iconic 3D Pixar Medical Cap) */}
              <path
                d="M 72 52 C 72 32, 128 32, 128 52 Z"
                fill="url(#pixarCap)"
                stroke="#94A3B8"
                strokeWidth="1.5"
              />
              <rect x="96" y="38" width="8" height="2.5" rx="1" fill="#EF4444" />
              <rect x="98.7" y="35.2" width="2.5" height="8" rx="1" fill="#EF4444" />

              {/* Rosy Glowing Cheeks (Blush) */}
              <ellipse cx="73" cy="97" rx="6.5" ry="4" fill="#FB7185" opacity="0.65" />
              <ellipse cx="127" cy="97" rx="6.5" ry="4" fill="#FB7185" opacity="0.65" />

              {/* Left Eye (Big Expressive Pixar Eye) */}
              <g>
                <ellipse cx="80" cy="84" rx="11" ry="13" fill="#FFFFFF" />
                <ellipse cx="81" cy="84" rx="7.5" ry="9" fill="url(#pixarEyeIris)" />
                <ellipse cx="81" cy="84" rx="4" ry="5" fill="#0F172A" />
                {/* Corneal Highlights */}
                <circle cx="78" cy="80" r="3.2" fill="#FFFFFF" />
                <circle cx="83" cy="87" r="1.5" fill="#FFFFFF" opacity="0.8" />
                {/* Eyelashes */}
                <path d="M 68 76 Q 80 70 91 76" fill="none" stroke="#2E1C14" strokeWidth="2.5" strokeLinecap="round" />
              </g>

              {/* Right Eye (Normal or Winking) */}
              {isWinking ? (
                <path
                  d="M 109 84 Q 120 94 131 84"
                  fill="none"
                  stroke="#2E1C14"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              ) : (
                <g>
                  <ellipse cx="120" cy="84" rx="11" ry="13" fill="#FFFFFF" />
                  <ellipse cx="119" cy="84" rx="7.5" ry="9" fill="url(#pixarEyeIris)" />
                  <ellipse cx="119" cy="84" rx="4" ry="5" fill="#0F172A" />
                  {/* Corneal Highlights */}
                  <circle cx="116" cy="80" r="3.2" fill="#FFFFFF" />
                  <circle cx="121" cy="87" r="1.5" fill="#FFFFFF" opacity="0.8" />
                  {/* Eyelashes */}
                  <path d="M 109 76 Q 120 70 131 76" fill="none" stroke="#2E1C14" strokeWidth="2.5" strokeLinecap="round" />
                </g>
              )}

              {/* Cute Eyebrows */}
              <path d="M 72 68 Q 80 64 88 68" fill="none" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 112 68 Q 120 64 128 68" fill="none" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" />

              {/* Cute Little Nose */}
              <path d="M 98 90 Q 100 93 102 90" fill="none" stroke="#E0A088" strokeWidth="2" strokeLinecap="round" />

              {/* Cheerful Smile */}
              <path
                d="M 91 98 Q 100 108 109 98"
                fill="none"
                stroke="#C2410C"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            </svg>

            {/* Glowing Active Online Status Indicator */}
            <span className="absolute bottom-1 right-2 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500 border-2 border-slate-900"></span>
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
