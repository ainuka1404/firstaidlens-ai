import React from 'react';
import { Siren, AlertOctagon, PhoneCall, X, ShieldAlert } from 'lucide-react';
import { AppLanguage, TriageInfo } from '../types';

interface RedFlagModalProps {
  language: AppLanguage;
  triage: TriageInfo;
  isOpen: boolean;
  onClose: () => void;
  onEmergencyCall: () => void;
}

export const RedFlagModal: React.FC<RedFlagModalProps> = ({
  language,
  triage,
  isOpen,
  onClose,
  onEmergencyCall,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="red-flag-emergency-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-gradient-to-b from-red-950 via-slate-950 to-black border-2 border-red-600 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[0_0_50px_rgba(239,68,68,0.5)] space-y-6 relative overflow-hidden text-center">
        {/* Pulsing Alert Badge */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-2xl shadow-red-600/50 animate-bounce">
          <Siren className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-900/80 border border-red-600 text-red-200 text-xs font-black uppercase tracking-wider">
            <AlertOctagon className="w-4 h-4 text-red-400" />
            <span>{language === 'id' ? 'RED PRIORITY - DARURAT MEDIS' : 'RED PRIORITY - CRITICAL EMERGENCY'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {triage.injury_type}
          </h2>

          <p className="text-sm text-red-200 leading-relaxed font-medium">
            {triage.severity_summary}
          </p>
        </div>

        {/* Immediate Crucial Instruction */}
        <div className="bg-red-950/80 border border-red-700/80 rounded-2xl p-4 text-left space-y-2 text-xs sm:text-sm text-red-100">
          <div className="font-bold flex items-center gap-2 text-red-300">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>{language === 'id' ? 'PROTOKOL PENYELAMATAN SEGERA:' : 'IMMEDIATE LIFE-SAVING PROTOCOL:'}</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-200">
            <li>{language === 'id' ? 'Segera telepon nomor darurat 112 / 119 untuk memanggil ambulans.' : 'Immediately call emergency 112 / 119 for ambulance dispatch.'}</li>
            <li>{language === 'id' ? 'JANGAN mencabut benda tajam atau kaca yang masih tertancap dalam.' : 'DO NOT pull out deeply embedded glass or objects.'}</li>
            <li>{language === 'id' ? 'Lakukan penekanan kain bersih di sekitar luka tanpa menggerakkan korban.' : 'Apply clean cloth pressure around the wound without unnecessary moving.'}</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            id="btn-modal-dial-112"
            type="button"
            onClick={onEmergencyCall}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-lg shadow-xl shadow-red-900/60 transition"
          >
            <PhoneCall className="w-6 h-6 animate-pulse" />
            <span>{language === 'id' ? 'PANGGIL 112 SEKARANG' : 'CALL 112 NOW'}</span>
          </button>

          <button
            id="btn-modal-view-steps"
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition"
          >
            {language === 'id' ? 'Lihat Panduan Tindakan Mikro Selangkah Demi Selangkah' : 'View Step-by-Step Micro Action Guidance'}
          </button>
        </div>
      </div>
    </div>
  );
};
