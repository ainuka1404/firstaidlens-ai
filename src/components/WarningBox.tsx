import React from 'react';
import { Ban, AlertOctagon, ShieldAlert } from 'lucide-react';
import { AppLanguage } from '../types';

interface WarningBoxProps {
  language: AppLanguage;
  warnings: string[];
}

export const WarningBox: React.FC<WarningBoxProps> = ({ language, warnings }) => {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div
      id="critical-warnings-card"
      className="h-full flex flex-col justify-between bg-red-950/40 backdrop-blur-md border-2 border-red-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 relative overflow-hidden"
    >
      <div className="space-y-3">
        {/* Header with Warning Icon */}
        <div className="flex items-center gap-2.5 text-red-400">
          <div className="p-2 rounded-xl bg-red-900/60 border border-red-700/80 shadow-md">
            <AlertOctagon className="w-5 h-5 text-red-300" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block">Prohibited Actions</span>
            <h4 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-red-200">
              {language === 'id' ? 'LARANGAN FATAL (DO NOT DO)' : 'CRITICAL WARNINGS (DO NOT DO)'}
            </h4>
          </div>
        </div>

        {/* Warning Items List */}
        <div className="space-y-2.5 pt-1">
          {warnings.map((warn, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-red-950/70 border border-red-900/70 text-red-100 text-xs sm:text-sm font-medium leading-relaxed shadow-sm"
            >
              <Ban className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{warn}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-[11px] text-red-300/80 italic pt-2 border-t border-red-900/40">
        {language === 'id'
          ? 'Mematuhi larangan di atas mencegah infeksi bakteri, syok, dan kerusakan jaringan permanen.'
          : 'Complying with the above prohibitions prevents bacterial infection, shock, and permanent tissue damage.'}
      </div>
    </div>
  );
};

