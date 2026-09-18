import React, { useState } from 'react';
import { ShieldAlert, ChevronUp, ChevronDown, HeartHandshake, Info } from 'lucide-react';
import { AppLanguage } from '../types';

interface MedicalDisclaimerProps {
  language: AppLanguage;
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({ language }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <footer className="w-full bg-[#080C14] border-t border-slate-800 text-slate-400 text-xs py-3 px-4 sm:px-6 transition-all">
      <div className="max-w-6xl mx-auto space-y-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-[11px] sm:text-xs text-slate-300">
              <strong className="text-white font-semibold">
                {language === 'id' ? 'Pemberitahuan Medis:' : 'Medical Disclaimer:'}
              </strong>{' '}
              {language === 'id'
                ? 'FirstAidLens AI adalah alat bantu panduan pertolongan pertama awal, bukan pengganti tenaga medis profesional atau diagnosis rumah sakit.'
                : 'FirstAidLens AI is an initial first-aid decision copilot, not a substitute for professional medical care or hospital diagnosis.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold transition"
          >
            <span>{expanded ? (language === 'id' ? 'Sembunyikan Ketentuan' : 'Hide Details') : (language === 'id' ? 'Pedoman Medis & Privasi' : 'Medical & Privacy Info')}</span>
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>

        {expanded && (
          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-2 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <strong className="text-slate-200 block mb-1">
                  {language === 'id' ? 'Kepatuhan Protokol WHO' : 'WHO Protocol Compliance'}
                </strong>
                {language === 'id'
                  ? 'Seluruh rekomendasi tindakan mikro mengikuti panduan penanganan darurat Palang Merah Internasional & WHO tanpa resep obat keras.'
                  : 'All micro-action guidelines follow International Red Cross & WHO standards without hard medication prescriptions.'}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <strong className="text-slate-200 block mb-1">
                  {language === 'id' ? 'Privasi Tanpa PII (Stateless)' : 'Zero-PII Data Privacy'}
                </strong>
                {language === 'id'
                  ? 'Gambar diproses secara stateless di memori RAM dan tidak pernah diunggah ke basis data publik atau disimpan di penyimpanan peramban.'
                  : 'Images are processed statelessly in volatile RAM and are never stored in public databases or persistent local storage.'}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <strong className="text-slate-200 block mb-1">
                  {language === 'id' ? 'Eskalasi 112 Kedaruratan' : 'Emergency 112 Escalation'}
                </strong>
                {language === 'id'
                  ? 'Jika korban tidak sadar, mengalami luka bakar derajat 3, atau perdarahan memancar, segera hubungi 112/119 sebelum melakukan tindakan lanjutan.'
                  : 'If victim is unconscious, has 3rd degree burns, or arterial bleeding, dial 112/119 immediately before further handling.'}
              </div>
            </div>

            <p className="text-center text-slate-500 pt-1">
              FirstAidLens AI • Young Coder World Cup (YCWC) 2026 Senior Category • Developed with Google AI Studio
            </p>
          </div>
        )}
      </div>
    </footer>
  );
};
