import { PresetCase } from '../types';

// Helper to create clean medical illustration SVGs as data URLs for demo thumbnails
function createSvgDataUrl(bgGradient: [string, string], iconSvg: string, text: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradient[0]}" />
        <stop offset="100%" stop-color="${bgGradient[1]}" />
      </linearGradient>
      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="600" height="400" fill="url(#g)" />
    <rect width="600" height="400" fill="url(#grid)" />
    <circle cx="300" cy="170" r="85" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
    <g transform="translate(250, 120)">
      ${iconSvg}
    </g>
    <rect x="60" y="295" width="480" height="55" rx="12" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.1)"/>
    <text x="300" y="330" fill="#F1F5F9" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">${text}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const PRESET_CASES: PresetCase[] = [
  {
    id: 'oil-burn-2nd-degree',
    titleId: 'Luka Bakar Minyak Panas (Derajat 2)',
    titleEn: 'Hot Cooking Oil Scald (2nd Degree)',
    category: 'Luka Bakar',
    urgency: 'YELLOW',
    description: 'Terpercik minyak goreng panas saat menggoreng di dapur; muncul kemerahan & lepuhan kecil berair.',
    thumbnailUrl: createSvgDataUrl(
      ['#78350F', '#B45309'],
      `<path d="M50 0C50 0 85 45 85 70C85 89.33 69.33 105 50 105C30.67 105 15 89.33 15 70C15 45 50 0 50 0Z" fill="#F59E0B" />
       <path d="M50 35C50 35 68 60 68 75C68 84.94 59.94 93 50 93C40.06 93 32 84.94 32 75C32 60 50 35 50 35Z" fill="#EF4444" />`,
      'SIMULASI: LUKA BAKAR MINYAK PANAS'
    ),
    assessmentData: {
      triage: {
        urgency_level: 'YELLOW',
        injury_type: 'Luka Bakar Termal Derajat 2 Minor (Minyak Panas)',
        severity_summary: 'Luka bakar termal lapisan epidermis-dermis superfisial dengan eritema dan lepuh kecil (< 3 cm). Dapat ditangani di rumah dengan protokol pendinginan ketat.',
        immediate_ambulance_needed: false
      },
      critical_warnings: [
        'JANGAN pernah mengoleskan pasta gigi, kecap, mentega, atau minyak goreng pada luka!',
        'JANGAN gunakan es batu atau air es secara langsung (dapat memicu vasokonstriksi & kerusakan jaringan).',
        'JANGAN memecahkan gelembung lepuhan (blister) karena berfungsi sebagai pelindung steril alami.'
      ],
      step_by_step_actions: [
        {
          step_number: 1,
          title: 'Dinginkan Segera dengan Air Mengalir',
          instruction: 'Alirkan air bersih bersuhu sejuk (bukan es) secara terus menerus ke area luka selama 20 menit penuh untuk menghentikan perambatan panas ke lapisan kulit dalam.',
          timer_duration_seconds: 1200,
          icon_type: 'WATER'
        },
        {
          step_number: 2,
          title: 'Lepaskan Perhiasan / Pakaian Ketat',
          instruction: 'Lepaskan cincin, jam tangan, atau gelang di sekitar area luka sebelum terjadi pembengkakan (edema jaringan).',
          timer_duration_seconds: 0,
          icon_type: 'ALERT'
        },
        {
          step_number: 3,
          title: 'Tutup dengan Kasa Steril Lembab / Plastik Wrap Bersih',
          instruction: 'Tutup luka secara longgar dengan kasa steril yang dibasahi sedikit NaCl / air matang, atau gunakan plastik wrap bersih tanpa ditekan.',
          timer_duration_seconds: 0,
          icon_type: 'BANDAGE'
        },
        {
          step_number: 4,
          title: 'Observasi Tanda Infeksi & Nyeri',
          instruction: 'Jika lepuhan meluas lebih dari telapak tangan, terdapat nanah, atau nyeri tak tertahankan, segera bawa ke faskes / dokter.',
          timer_duration_seconds: 0,
          icon_type: 'REST'
        }
      ],
      operator_summary: 'PASIEN MENGALAMI LUKA BAKAR DERAJAT 2 MINOR AKIBAT MINYAK GORENG. LUAS < 3%. TELAH DILAKUKAN PENDINGINAN AIR MENGALIR 20 MENIT DAN DIBEBAT STERIL. STATUS AMAN TANPA SESAK NAPAS.',
      metadata: {
        modelUsed: 'gemini-2.5-flash (YCWC Protocol Cache)',
        inferenceLatencyMs: 140,
        timestamp: new Date().toISOString(),
        imageCompressedSizeKb: 142,
        isDemoFallback: true
      }
    }
  },
  {
    id: 'knife-cut-kitchen',
    titleId: 'Luka Iris Pisau Dapur (Perdarahan Sedang)',
    titleEn: 'Kitchen Knife Laceration (Bleeding)',
    category: 'Luka Sayat / Iris',
    urgency: 'YELLOW',
    description: 'Teriris pisau dapur saat memotong daging/sayuran; darah merembes aktif di jari/telapak tangan.',
    thumbnailUrl: createSvgDataUrl(
      ['#881337', '#BE123C'],
      `<path d="M20 80L80 20L95 35L35 95Z" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2"/>
       <path d="M15 85L30 100L10 105Z" fill="#38BDF8"/>
       <circle cx="65" cy="70" r="10" fill="#EF4444"/>
       <path d="M65 75C65 75 75 88 75 96C75 101.5 70.5 106 65 106C59.5 106 55 101.5 55 96C55 88 65 75 65 75Z" fill="#DC2626"/>`,
      'SIMULASI: LUKA IRIS PISAU DAPUR'
    ),
    assessmentData: {
      triage: {
        urgency_level: 'YELLOW',
        injury_type: 'Luka Iris Tajam Bersih Jari/Tangan (Laceration)',
        severity_summary: 'Luka iris linier dengan perdarahan kapiler aktif namun terkendali. Tidak ada tanda keterlibatan pembuluh darah besar atau mati rasa saraf distal.',
        immediate_ambulance_needed: false
      },
      critical_warnings: [
        'JANGAN membuka-tutup kain kasa saat sedang menekan (ini akan merusak bekuan darah pembentuk hemostasis)!',
        'JANGAN gunakan bubuk kopi, abu dapur, atau tembakau pada luka (risiko tetanus & infeksi fatal).',
        'JANGAN mengikat torniket karet kencang kecuali terjadi perdarahan memancar tak terkendali.'
      ],
      step_by_step_actions: [
        {
          step_number: 1,
          title: 'Tekan Langsung dengan Kain Bersih / Kasa',
          instruction: 'Letakkan kasa steril atau kain bersih di atas luka dan tekan secara mantap dan stabil tanpa jeda selama 10 menit.',
          timer_duration_seconds: 600,
          icon_type: 'PRESSURE'
        },
        {
          step_number: 2,
          title: 'Posisikan Area Luka Lebih Tinggi dari Jantung',
          instruction: 'Angkat tangan/jari yang terluka ke atas setinggi dada/jantung untuk mengurangi tekanan hidrostatik dan memperlambat laju perdarahan.',
          timer_duration_seconds: 0,
          icon_type: 'REST'
        },
        {
          step_number: 3,
          title: 'Bersihkan Tepi Luka dengan Air Mengalir',
          instruction: 'Setelah darah berhenti, bilas perlahan tepi luka dengan air bersih / NaCl. Hindari menggosok bagian dalam luka secara kasar.',
          timer_duration_seconds: 0,
          icon_type: 'WATER'
        },
        {
          step_number: 4,
          title: 'Bebat Rapat & Pasang Plester Kasa',
          instruction: 'Rapatkan kedua tepi luka lalu fiksasi menggunakan plester butterfly / plester luka elastis steril. Periksa apakah butuh booster vaksin tetanus.',
          timer_duration_seconds: 0,
          icon_type: 'BANDAGE'
        }
      ],
      operator_summary: 'KORBAN TERIRIS PISAU DAPUR DI JARI TANGAN. PERDARAHAN TELAH DITEKAN 10 MENIT. TEPI LUKA RATA TANPA MATI RASA. DARAH TERKENDALI.',
      metadata: {
        modelUsed: 'gemini-2.5-flash (YCWC Protocol Cache)',
        inferenceLatencyMs: 160,
        timestamp: new Date().toISOString(),
        imageCompressedSizeKb: 128,
        isDemoFallback: true
      }
    }
  },
  {
    id: 'severe-glass-arterial-bleed',
    titleId: 'Luka Robek Kaca Dalam & Perdarahan Deras',
    titleEn: 'Severe Glass Laceration & Heavy Bleeding',
    category: 'Darurat Kritis (RED)',
    urgency: 'RED',
    description: 'Terkena pecahan kaca pintu/jendela besar; darah mengucur deras dan tampak luka terbuka dalam.',
    thumbnailUrl: createSvgDataUrl(
      ['#450A0A', '#991B1B'],
      `<polygon points="40,20 70,30 85,85 55,75 25,60" fill="#93C5FD" opacity="0.8" stroke="#FFFFFF" stroke-width="2"/>
       <path d="M50 40C40 60 20 80 20 95C20 110 35 120 50 120C65 120 80 110 80 95C80 80 60 60 50 40Z" fill="#DC2626"/>
       <path d="M50 10L50 35M25 25L40 40M75 25L60 40" stroke="#FCA5A5" stroke-width="4" stroke-linecap="round"/>`,
      'SIMULASI: DARURAT MERAH (PERDARAHAN BERAT)'
    ),
    assessmentData: {
      triage: {
        urgency_level: 'RED',
        injury_type: 'Luka Robek Terbuka Dalam dengan Risiko Perdarahan Mayor',
        severity_summary: 'KEDARURATAN MEDIS TINGGI! Luka robek dalam dengan volume perdarahan masif berisiko syok hipovolemik. Panggil ambulans (112) SEGERA!',
        immediate_ambulance_needed: true
      },
      critical_warnings: [
        'SEGERA HUBUNGI 112 / 119 ATAU BAWA KE IGD RUMAH SAKIT TERDEKAT!',
        'JANGAN mencabut pecahan kaca besar yang masih tertancap dalam (dapat memicu perdarahan fatal instan)!',
        'JANGAN memberi minum/makan pada korban jika ada indikasi lemas/syok atau perlu tindakan operasi bedah.'
      ],
      step_by_step_actions: [
        {
          step_number: 1,
          title: 'Panggil Ambulans / Nomor Darurat 112',
          instruction: 'Instruksikan orang terdekat untuk segera menelepon 112 / 119 sambil Anda mulai melakukan tindakan penyelamatan penekanan luka.',
          timer_duration_seconds: 0,
          icon_type: 'ALERT'
        },
        {
          step_number: 2,
          title: 'Tekanan Maksimal Sekitar Luka (Pressure)',
          instruction: 'Gunakan kain bersih/handuk tebal, tekan kuat-kuat pada area luka. Jika ada benda tertancap, tekan di samping/sekeliling benda, bukan di atasnya.',
          timer_duration_seconds: 600,
          icon_type: 'PRESSURE'
        },
        {
          step_number: 3,
          title: 'Imobilisasi & Cegah Syok',
          instruction: 'Baringkan korban dengan posisi kaki sedikit ditinggikan, selimuti agar tetap hangat, dan ajak bicara terus menerus untuk memantau kesadaran.',
          timer_duration_seconds: 0,
          icon_type: 'REST'
        }
      ],
      operator_summary: 'DARURAT RED: KORBAN MENGALAMI LUKA ROBEK KACA DALAM DI LENGAN DENGAN PERDARAHAN HEBAT. KESADARAN COMPOS MENTIS MELEMAH. SEDANG DILAKUKAN BEBAT TEKAN. MOHON AMBULANS KE LOKASI SEGERA.',
      metadata: {
        modelUsed: 'gemini-2.5-flash (YCWC Protocol Cache)',
        inferenceLatencyMs: 110,
        timestamp: new Date().toISOString(),
        imageCompressedSizeKb: 165,
        isDemoFallback: true
      }
    }
  },
  {
    id: 'minor-scrape-abrasion',
    titleId: 'Luka Lecet / Abrasi Ringan Terjatuh',
    titleEn: 'Minor Knee/Elbow Abrasion (Scrape)',
    category: 'Luka Lecet',
    urgency: 'GREEN',
    description: 'Terpeleset di lantai atau lapangan; kulit lutut terkelupas tipis dengan sedikit titik darah/kotoran.',
    thumbnailUrl: createSvgDataUrl(
      ['#064E3B', '#047857'],
      `<circle cx="50" cy="50" r="40" fill="#34D399" opacity="0.3"/>
       <path d="M30 45Q50 30 70 45Q60 65 30 45Z" fill="#F87171"/>
       <circle cx="45" cy="48" r="3" fill="#DC2626"/>
       <circle cx="55" cy="42" r="2.5" fill="#DC2626"/>
       <circle cx="38" cy="42" r="2" fill="#78350F"/>`,
      'SIMULASI: LUKA LECET RINGAN'
    ),
    assessmentData: {
      triage: {
        urgency_level: 'GREEN',
        injury_type: 'Abrasi Kulit Epidermis Superfisial (Luka Lecet)',
        severity_summary: 'Luka lecet minor tanpa penetrasi jaringan dalam. Sangat aman dirawat mandiri di rumah dengan antiseptik dan perawatan higienis.',
        immediate_ambulance_needed: false
      },
      critical_warnings: [
        'JANGAN meniup luka lecet dengan mulut karena menyebarkan bakteri ludah.',
        'JANGAN menggosok partikel pasir secara kasar yang dapat merusak jaringan baru.'
      ],
      step_by_step_actions: [
        {
          step_number: 1,
          title: 'Cuci Bersih dengan Sabun Lembut & Air',
          instruction: 'Bilas area luka di bawah air mengalir bersuhu ruang selama 3-5 menit untuk membersihkan debu dan partikel tanah.',
          timer_duration_seconds: 180,
          icon_type: 'WATER'
        },
        {
          step_number: 2,
          title: 'Keringkan dengan Tepuk Lembut',
          instruction: 'Gunakan kasa steril atau tisu bersih untuk mengeringkan tepi luka secara perlahan (jangan digosok).',
          timer_duration_seconds: 0,
          icon_type: 'REST'
        },
        {
          step_number: 3,
          title: 'Oleskan Antiseptik / Salep P3K & Tutup Plester',
          instruction: 'Oleskan cairan povidone-iodine tipis atau petroleum jelly, lalu pasang plester luka bersirkulasi udara baik.',
          timer_duration_seconds: 0,
          icon_type: 'BANDAGE'
        }
      ],
      operator_summary: 'LUKA LECET RINGAN PADA LUTUT/SIKU. SUDAH DIBERSIHKAN AIR MENGALIR DAN DIBERIKAN ANTISEPTIK. KONDISI SANGAT STABIL.',
      metadata: {
        modelUsed: 'gemini-2.5-flash (YCWC Protocol Cache)',
        inferenceLatencyMs: 120,
        timestamp: new Date().toISOString(),
        imageCompressedSizeKb: 110,
        isDemoFallback: true
      }
    }
  },
  {
    id: 'sprain-ankle-rice',
    titleId: 'Terkilir / Keseleo Pergelangan Kaki (R.I.C.E)',
    titleEn: 'Ankle Sprain (R.I.C.E Protocol)',
    category: 'Cedera Otot / Sendi',
    urgency: 'YELLOW',
    description: 'Salah tumpuan saat turun tangga atau olahraga; pergelangan kaki bengkak dan nyeri digerakkan.',
    thumbnailUrl: createSvgDataUrl(
      ['#1E1B4B', '#4338CA'],
      `<path d="M35 15L45 55L75 60L85 85L25 85L15 15Z" fill="#818CF8" opacity="0.7"/>
       <ellipse cx="60" cy="65" rx="16" ry="12" fill="#F59E0B" opacity="0.8"/>
       <path d="M55 60L65 70M65 60L55 70" stroke="#DC2626" stroke-width="3" stroke-linecap="round"/>`,
      'SIMULASI: TERKILIR / KESELEO'
    ),
    assessmentData: {
      triage: {
        urgency_level: 'YELLOW',
        injury_type: 'Terkilir Ligamen Pergelangan Kaki (Ankle Sprain)',
        severity_summary: 'Edema dan nyeri lokal akibat peregangan ligamen sendi. Terapkan protokol standar internasional R.I.C.E.',
        immediate_ambulance_needed: false
      },
      critical_warnings: [
        'JANGAN mengurut, memijat keras, atau menarik paksa area sendi yang baru terkilir!',
        'JANGAN memberikan kompres panas, balsem panas, atau alkohol pada 48 jam pertama (memperparah inflamasi & bengkak).'
      ],
      step_by_step_actions: [
        {
          step_number: 1,
          title: 'Rest (Istirahatkan Total)',
          instruction: 'Hentikan seluruh aktivitas berjalan atau menopang beban pada kaki yang cedera segera.',
          timer_duration_seconds: 0,
          icon_type: 'REST'
        },
        {
          step_number: 2,
          title: 'Ice (Kompres Dingin 15-20 Menit)',
          instruction: 'Bungkus es batu dengan handuk kain (jangan tempelkan es langsung ke kulit) dan kompres selama 15 menit untuk meredakan pembengkakan.',
          timer_duration_seconds: 900,
          icon_type: 'WATER'
        },
        {
          step_number: 3,
          title: 'Compression (Balut Tekan Elastis)',
          instruction: 'Balut pergelangan kaki dengan perban elastis berbentuk angka 8. Pastikan tidak terlalu kencang agar ujung jari tidak kebiruan.',
          timer_duration_seconds: 0,
          icon_type: 'BANDAGE'
        },
        {
          step_number: 4,
          title: 'Elevation (Tinggikan Kaki)',
          instruction: 'Sangga kaki dengan bantal sehingga posisinya berada lebih tinggi dari posisi jantung saat berbaring.',
          timer_duration_seconds: 0,
          icon_type: 'REST'
        }
      ],
      operator_summary: 'CEDERA TERKILIR PERGELANGAN KAKI. PROTOKOL R.I.C.E SEDANG BERJALAN. TIDAK ADA DEFORMITAS TULANG TERBUKA. PASIEN BISA BERISTIRAHAT.',
      metadata: {
        modelUsed: 'gemini-2.5-flash (YCWC Protocol Cache)',
        inferenceLatencyMs: 135,
        timestamp: new Date().toISOString(),
        imageCompressedSizeKb: 135,
        isDemoFallback: true
      }
    }
  }
];
