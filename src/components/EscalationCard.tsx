import React, { useState, useEffect } from 'react';
import { PhoneCall, MapPin, Copy, Check, Radio, FileText, AlertTriangle, ShieldCheck, ExternalLink, RefreshCw } from 'lucide-react';
import { AppLanguage, GeolocationData, TriageInfo } from '../types';

interface EscalationCardProps {
  language: AppLanguage;
  triage: TriageInfo;
  operatorSummary: string;
  onEmergencyCall: () => void;
}

export const EscalationCard: React.FC<EscalationCardProps> = ({
  triage,
  operatorSummary,
  onEmergencyCall,
}) => {
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [copiedLocation, setCopiedLocation] = useState<boolean>(false);
  const [geoState, setGeoState] = useState<GeolocationData>({
    latitude: null,
    longitude: null,
    accuracy: null,
    addressText: '',
    loading: false,
  });

  // Fetch device geolocation
  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setGeoState((prev) => ({
        ...prev,
        error: 'Geolokasi tidak didukung pada peramban ini.',
      }));
      return;
    }

    setGeoState((prev) => ({ ...prev, loading: true, error: undefined }));

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);

        let address = `${lat.toFixed(5)}, ${lon.toFixed(5)} (Akurasi: ±${acc}m)`;

        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
            { headers: { 'User-Agent': 'FirstAidLens-AI-App' } }
          );
          if (resp.ok) {
            const data = await resp.json();
            if (data && data.display_name) {
              address = data.display_name;
            }
          }
        } catch {
          // Fallback to coordinates
        }

        setGeoState({
          latitude: lat,
          longitude: lon,
          accuracy: acc,
          addressText: address,
          loading: false,
        });
      },
      () => {
        setGeoState((prev) => ({
          ...prev,
          loading: false,
          error: 'Izin GPS tidak diberikan atau sinyal lemah.',
        }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const handleCopySummary = () => {
    const fullText = `[FIRSTAIDLENS LAPORAN P3K]\nJENIS: ${triage.injury_type}\nURGENSI: ${triage.urgency_level}\nRINGKASAN:\n${operatorSummary}\nLOKASI GPS: ${geoState.addressText || 'Menunggu sinyal GPS'}`;
    navigator.clipboard.writeText(fullText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handleCopyLocation = () => {
    if (!geoState.addressText) return;
    navigator.clipboard.writeText(geoState.addressText);
    setCopiedLocation(true);
    setTimeout(() => setCopiedLocation(false), 2500);
  };

  return (
    <div id="escalation-telecard" className="space-y-6">
      {/* Primary Emergency Hotlines Card */}
      <div className="bg-gradient-to-br from-red-950/80 via-slate-900/90 to-slate-950 border-2 border-red-600/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-red-400">
              <PhoneCall className="w-5 h-5 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Eskalasi Medis &amp; Panggilan Ambulans
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Panggilan Darurat Satu-Ketukan
            </h3>
          </div>

          {/* Direct 112 Dial Button */}
          <button
            id="btn-dial-112-large"
            type="button"
            onClick={onEmergencyCall}
            className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-extrabold text-base shadow-xl shadow-red-950/60 transition cursor-pointer"
          >
            <PhoneCall className="w-5 h-5 animate-bounce" />
            <span>Hubungi 112 (Bebas Pulsa)</span>
          </button>
        </div>

        {/* Secondary Hotlines */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-red-900/40">
          <a
            id="btn-call-119"
            href="tel:119"
            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition shadow-sm"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>119 (Kemenkes SPGDT)</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          <a
            id="btn-call-110"
            href="tel:110"
            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition shadow-sm"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span>110 (Polisi / TKP)</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          <a
            id="btn-call-113"
            href="tel:113"
            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition shadow-sm"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>113 (Damkar / Rescue)</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Geolocation Resolver & Incident Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Geolocation Card */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>Lokasi Kejadian (GPS Real-time)</span>
              </div>
              <button
                id="btn-refresh-gps"
                type="button"
                onClick={fetchLocation}
                disabled={geoState.loading}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-300 transition cursor-pointer"
                title="Perbarui GPS"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${geoState.loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              {geoState.loading ? (
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                  <span>Mengunci koordinat GPS...</span>
                </div>
              ) : geoState.error ? (
                <div className="text-xs text-amber-400 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{geoState.error}</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-200 leading-relaxed break-words">
                    {geoState.addressText || 'Koordinat belum tersedia'}
                  </p>
                  {geoState.latitude && (
                    <p className="font-mono text-[11px] text-cyan-400">
                      LAT: {geoState.latitude.toFixed(6)}, LON: {geoState.longitude?.toFixed(6)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            id="btn-copy-gps"
            type="button"
            onClick={handleCopyLocation}
            disabled={!geoState.addressText}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 active:scale-95 transition shadow-sm cursor-pointer"
          >
            {copiedLocation ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedLocation ? 'Alamat Tersalin!' : 'Salin Titik Lokasi'}</span>
          </button>
        </div>

        {/* Operator Script Card */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>Ringkasan Operator Medis 112</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 max-h-36 overflow-y-auto leading-relaxed whitespace-pre-wrap">
              {operatorSummary || 'Memuat ringkasan insiden...'}
            </div>
          </div>

          <button
            id="btn-copy-summary"
            type="button"
            onClick={handleCopySummary}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/70 border border-cyan-800/80 text-cyan-300 text-xs font-bold active:scale-95 transition shadow-sm cursor-pointer"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copiedSummary ? 'Laporan Lengkap Tersalin!' : 'Salin Teks untuk Operator'}</span>
          </button>
        </div>
      </div>

      {/* 24-Hour Observation & Home Care Advice */}
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-3 shadow-xl">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Panduan Observasi Mandiri 24 Jam</span>
        </div>
        <ul className="text-xs text-slate-300/90 space-y-2 list-disc list-inside leading-relaxed">
          <li>Ganti perban/kasa steril minimal 1 kali sehari atau saat kasa basah/kotor.</li>
          <li>Perhatikan tanda-tanda infeksi: kemerahan yang meluas, rasa hangat menyengat, nanah, atau demam &gt; 38°C.</li>
          <li>Untuk luka robek dalam atau gigitan hewan, pastikan korban berkonsultasi mengenai vaksinasi Tetanus/Rabies.</li>
        </ul>
      </div>
    </div>
  );
};
