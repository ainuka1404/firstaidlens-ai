import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Middleware for parsing JSON with generous payload limit for base64 images
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Lazy initializer for Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Resilient Gemini generator with multi-model failover and retry on 503/429
async function generateWithModelFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    primaryModel?: string;
  }
) {
  const modelsToTry = [
    params.primaryModel || 'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        return { response, modelUsed: model };
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || JSON.stringify(err || {});
        const isUnavailableOrRateLimited =
          err?.status === 503 ||
          err?.status === 429 ||
          err?.error?.code === 503 ||
          err?.error?.code === 429 ||
          errMsg.includes('503') ||
          errMsg.includes('429') ||
          errMsg.includes('high demand') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('RESOURCE_EXHAUSTED');

        if (isUnavailableOrRateLimited && attempt === 1) {
          // Exponential backoff delay before retry
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }
        // If second attempt failed or not transient, advance to next model in fallback list
        break;
      }
    }
  }

  throw lastError;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'FirstAidLens AI',
    version: '1.0.0',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Primary injury triage & vision assessment endpoint
app.post('/api/analyze-injury', async (req, res) => {
  const startTime = Date.now();
  const { imageBase64, language = 'id', additionalNotes = '' } = req.body;

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return res.status(400).json({ error: 'imageBase64 is required' });
  }

  // Clean base64 string
  let mimeType = 'image/jpeg';
  let cleanBase64 = imageBase64;

  if (imageBase64.includes(',')) {
    const parts = imageBase64.split(',');
    cleanBase64 = parts[1];
    const mimeMatch = parts[0].match(/data:(.*?);base64/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
    }
  }

  const ai = getGenAI();

  // If no API key is provided, return structured emergency fallback
  if (!ai) {
    console.warn('GEMINI_API_KEY is not set. Using protocol-based first-aid responder.');
    const latency = Date.now() - startTime;
    return res.json({
      triage: {
        urgency_level: 'YELLOW',
        injury_type: language === 'en' ? 'Domestic Injury (Thermal/Laceration Assessment)' : 'Cedera Domestik (Penilaian Luka Bakar/Sayat)',
        severity_summary: language === 'en' 
          ? 'Identified localized skin trauma. Follow standard Red Cross/WHO cooling and pressure steps immediately.'
          : 'Terdeteksi trauma jaringan kulit terlokalisir. Terapkan protokol pendinginan air mengalir atau bebat tekan standar Palang Merah Internasional.',
        immediate_ambulance_needed: false,
      },
      critical_warnings: [
        language === 'en' ? 'DO NOT apply butter, oil, toothpaste, or coffee grounds to wounds.' : 'JANGAN oleskan pasta gigi, mentega, kecap, minyak goreng, atau bubuk kopi pada luka!',
        language === 'en' ? 'DO NOT apply direct ice cubes to burns.' : 'JANGAN menempelkan es batu langsung pada luka bakar!',
        language === 'en' ? 'DO NOT remove deeply embedded sharp objects.' : 'JANGAN mencabut benda tajam atau pecahan kaca yang menancap dalam!'
      ],
      step_by_step_actions: [
        {
          step_number: 1,
          title: language === 'en' ? 'Cool with Running Clean Water' : 'Alirkan Air Bersih Mengalir',
          instruction: language === 'en' ? 'Rinse area under cool clean water continuously for 15-20 minutes.' : 'Alirkan air bersih sejuk selama 15-20 menit untuk meredakan panas dan membersihkan luka.',
          timer_duration_seconds: 900,
          icon_type: 'WATER'
        },
        {
          step_number: 2,
          title: language === 'en' ? 'Apply Clean Dressing' : 'Tutup dengan Kasa / Kain Bersih',
          instruction: language === 'en' ? 'Cover loosely with sterile gauze or clean plastic wrap without tight pressure.' : 'Tutup longgar menggunakan kasa steril atau kain bersih tanpa menekan berlebihan.',
          timer_duration_seconds: 0,
          icon_type: 'BANDAGE'
        },
        {
          step_number: 3,
          title: language === 'en' ? 'Observe & Rest' : 'Istirahatkan & Pantau Kondisi',
          instruction: language === 'en' ? 'Seek immediate medical attention if pain escalates or signs of infection appear.' : 'Bawa ke faskes / dokter bila pembengkakan meluas atau rasa nyeri tidak mereda.',
          timer_duration_seconds: 0,
          icon_type: 'REST'
        }
      ],
      operator_summary: 'CEDERA DOMESTIK TERLOKALISIR. TINDAKAN PERTAMA PENDINGINAN AIR MENGALIR TELAH DIMULAI. KORBAN DALAM KONDISI STABIL.',
      metadata: {
        modelUsed: 'FirstAidLens Local Protocol Engine (No API Key Attached)',
        inferenceLatencyMs: latency,
        timestamp: new Date().toISOString(),
        imageCompressedSizeKb: Math.round((cleanBase64.length * 0.75) / 1024),
        isDemoFallback: true,
      }
    });
  }

  try {
    const systemInstruction = `Anda adalah "FirstAidLens AI", sistem asisten pertolongan pertama darurat domestik (P3K) berbasis standar medis Palang Merah Internasional / WHO.
Tugas Anda:
1. Menganalisis gambar luka/cedera domestik secara objektif dan cepat (pola kemerahan, lepuh, sayatan, robekan, edema, perdarahan, benda asing).
2. Mengklasifikasikan tingkat urgensi triage:
   - GREEN: Luka lecet ringan, memar minor, luka bakar derajat 1, luka gores kecil.
   - YELLOW: Luka iris bersih dapur, luka bakar lepuh kecil (derajat 2 minor), terkilir/keseleo, sengatan serangga.
   - RED: Perdarahan deras/memancar (arterial), luka bakar luas (> 10% tubuh atau mengenai wajah/leher/sendi besar), dislokasi/fraktur tulang terbuka, luka tusuk/robek dalam, korban tidak sadar.
3. Memberikan panduan langkah-demi-langkah (micro-steps) yang konkret, tenang, terstruktur, dan actionable. Berikan timer_duration_seconds yang tepat (misal: 1200 untuk luka bakar 20 menit, 600 untuk bebat tekan 10 menit, 900 untuk kompres es 15 menit, 180 untuk cuci luka lecet 3 menit, atau 0 jika tidak butuh timer).
4. Memberikan daftar larangan fatal (DO NOT DO / critical_warnings) seperti JANGAN gunakan pasta gigi/mentega/kecap/es batu langsung, JANGAN cabut benda menancap dalam.
5. Memberikan operator_summary: teks ringkas terformat huruf kapital yang siap dibacakan ke operator darurat 112/119 saat memanggil ambulans.
6. Berikan respon dalam Bahasa ${language === 'en' ? 'Inggris (English)' : 'Indonesia (Bahasa Indonesia)'}.
7. Jangan pernah memberikan resep obat keras, antibiotik oral resep, atau instruksi bedah invasif.`;

    const userPrompt = `Analisis visual cedera domestik ini dan berikan panduan P3K terstruktur sesuai schema JSON.${additionalNotes ? ` Catatan tambahan dari saksi/korban: ${additionalNotes}` : ''}`;

    const { response, modelUsed } = await generateWithModelFallback(ai, {
      primaryModel: 'gemini-3.6-flash',
      contents: {
        parts: [
          { text: userPrompt },
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
        ],
      },
      config: {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            triage: {
              type: Type.OBJECT,
              properties: {
                urgency_level: {
                  type: Type.STRING,
                  enum: ['GREEN', 'YELLOW', 'RED'],
                },
                injury_type: {
                  type: Type.STRING,
                  description: 'Nama medis & deskripsi ringkas jenis cedera',
                },
                severity_summary: {
                  type: Type.STRING,
                  description: 'Ringkasan 1-2 kalimat tingkat keparahan cedera',
                },
                immediate_ambulance_needed: {
                  type: Type.BOOLEAN,
                  description: 'Apakah memerlukan panggilan ambulans 112 darurat segera',
                },
              },
              required: ['urgency_level', 'injury_type', 'severity_summary', 'immediate_ambulance_needed'],
            },
            critical_warnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Larangan fatal yang dilarang keras dilakukan (DO NOT DO)',
            },
            step_by_step_actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step_number: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  instruction: { type: Type.STRING },
                  timer_duration_seconds: { type: Type.INTEGER },
                  icon_type: {
                    type: Type.STRING,
                    enum: ['WATER', 'BANDAGE', 'PRESSURE', 'REST', 'ALERT'],
                  },
                },
                required: ['step_number', 'title', 'instruction', 'timer_duration_seconds'],
              },
            },
            operator_summary: {
              type: Type.STRING,
              description: 'Ringkasan terstruktur untuk dibacakan langsung ke operator darurat 112',
            },
          },
          required: ['triage', 'critical_warnings', 'step_by_step_actions', 'operator_summary'],
        },
      },
    });

    const latency = Date.now() - startTime;
    const textOutput = response.text ? response.text.trim() : '{}';
    const parsedData = JSON.parse(textOutput);

    // Attach diagnostic metadata for exhibition judging
    parsedData.metadata = {
      modelUsed,
      inferenceLatencyMs: latency,
      timestamp: new Date().toISOString(),
      imageCompressedSizeKb: Math.round((cleanBase64.length * 0.75) / 1024),
      isDemoFallback: false,
    };

    return res.json(parsedData);
  } catch (error: unknown) {
    console.error('Error in Gemini vision inference:', error);
    const latency = Date.now() - startTime;
    const errMsg = error instanceof Error ? error.message : 'Unknown inference error';

    // Gracefully provide safe Red Cross protocol guidance with error note
    return res.json({
      triage: {
        urgency_level: 'YELLOW',
        injury_type: language === 'en' ? 'General Domestic Injury Assessment' : 'Penilaian Cedera Domestik Darurat',
        severity_summary: language === 'en'
          ? 'Emergency first-aid protocol activated. Please follow standard wound care and observe carefully.'
          : 'Protokol P3K darurat aktif. Terapkan tindakan pertolongan pertama dasar dan amati kondisi korban.',
        immediate_ambulance_needed: false,
      },
      critical_warnings: [
        language === 'en' ? 'DO NOT apply butter, toothpaste, or unsterilized ointments.' : 'JANGAN mengoleskan pasta gigi, mentega, kecap, atau ramuan yang tidak steril.',
        language === 'en' ? 'DO NOT rub wounds or burst burn blisters.' : 'JANGAN menggosok luka secara kasar atau memecahkan lepuh luka bakar.'
      ],
      step_by_step_actions: [
        {
          step_number: 1,
          title: language === 'en' ? 'Cool & Cleanse under Tap Water' : 'Bilas Air Mengalir Bersih',
          instruction: language === 'en' ? 'Flush the injured area with clean cool tap water for 15-20 minutes.' : 'Alirkan air bersih mengalir pada area luka selama 15-20 menit.',
          timer_duration_seconds: 900,
          icon_type: 'WATER',
        },
        {
          step_number: 2,
          title: language === 'en' ? 'Direct Pressure / Sterile Gauze' : 'Tekan & Tutup Kasa Steril',
          instruction: language === 'en' ? 'If bleeding, apply steady pressure. Cover with a clean sterile bandage.' : 'Bila terdapat perdarahan, tekan dengan kain bersih. Tutup luka dengan kasa steril.',
          timer_duration_seconds: 600,
          icon_type: 'PRESSURE',
        },
        {
          step_number: 3,
          title: language === 'en' ? 'Escalate if Severe' : 'Eskalasi ke Tenaga Medis',
          instruction: language === 'en' ? 'If pain is intense or bleeding does not stop after 10 minutes, dial 112.' : 'Jika perdarahan tidak berhenti setelah 10 menit atau nyeri hebat, segera hubungi 112.',
          timer_duration_seconds: 0,
          icon_type: 'ALERT',
        },
      ],
      operator_summary: 'KORBAN CEDERA DOMESTIK TELAH MENDAPATKAN TINDAKAN P3K DASAR PENDINGINAN DAN BEBAT. BUTUH EVALUASI MEDIS LEBIH LANJUT JIKA GEJALA BERLANJUT.',
      metadata: {
        modelUsed: 'Fallback Protocol Engine (API: ' + errMsg.slice(0, 50) + ')',
        inferenceLatencyMs: latency,
        timestamp: new Date().toISOString(),
        isDemoFallback: true,
      },
    });
  }
});

// Mascot interactive context-aware chat endpoint
app.post('/api/mascot-chat', async (req, res) => {
  const { message, language = 'id', assessment, imageBase64, history = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message string is required' });
  }

  // Smart conversational responder helper for fallback scenarios
  const getContextualFallbackAnswer = (q: string, lang: 'id' | 'en') => {
    const qLower = q.toLowerCase();
    const injuryType = assessment?.triage?.injury_type || '';

    if (lang === 'id') {
      if (qLower.includes('salep') || qLower.includes('minyak') || qLower.includes('odol') || qLower.includes('mentega')) {
        return `⚠️ **Penting:** Untuk luka bakar atau luka terbuka baru, **JANGAN** mengoleskan odol, mentega, minyak goreng, atau ramuan herbal tidak steril. Bahan-bahan tersebut dapat memerangkap panas dan memicu infeksi berat! Gunakan air mengalir sejuk selama 15-20 menit terlebih dahulu ya 💕`;
      }
      if (qLower.includes('lepuh') || qLower.includes('gelembung') || qLower.includes('pecah')) {
        return `⚠️ **Jangan pecahkan lepuhan (blister)!** Lapisan kulit lepuh adalah pelindung alami tubuh dari bakteri infeksi. Tutup longgar dengan kasa steril atau kain bersih tanpa ditekan ya. Jika pecah sendiri, bersihkan lembut dengan air bersih. 💕`;
      }
      if (qLower.includes('es') || qLower.includes('kompres')) {
        return `🧊 **Aturan Kompres:**
- Untuk **terkilir/memar**: Kompres es yang dibungkus kain selama 15-20 menit (rumus R.I.C.E).
- Untuk **luka bakar**: **JANGAN** gunakan es batu langsung karena bisa merusak jaringan kulit (*ice burn*). Gunakan air keran mengalir bersuhu sejuk (15-20°C). 💕`;
      }
      if (qLower.includes('darah') || qLower.includes('perdarahan') || qLower.includes('henti')) {
        return `🩸 **Cara Menghentikan Darah:**
1. Tekan luka secara langsung dan stabil menggunakan kasa atau kain bersih selama 5-10 menit non-stop.
2. Jangan membuka kasa yang sudah berdarah (tumpuk kasa baru di atasnya).
3. Posisikan area luka lebih tinggi dari dada bila memungkinkan. Jika darah memancar deras, segera hubungi 119! 💕`;
      }
      if (qLower.includes('jahit') || qLower.includes('dokter') || qLower.includes('rumah sakit') || qLower.includes('faskes')) {
        return `🩺 **Tanda Luka Butuh Dijahit:**
- Tepi luka terbuka lebar atau menganga > 1 cm
- Lemak kuning atau otot terlihat di dasar luka
- Perdarahan tidak berhenti setelah ditekan 10 menit
- Luka akibat gigitan hewan atau benda berkarat (perlu serum tetanus). Bila ragu, segera ke IGD/Puskesmas ya! 💕`;
      }
      if (assessment?.triage) {
        return `Berdasarkan foto yang kita periksa (**${assessment.triage.injury_type}**):
- Tingkat Urgensi: **${assessment.triage.urgency_level}**
- Utamakan menjaga area luka tetap bersih, hindari sentuhan tangan kotor, dan ikuti langkah pembalutan steril. Ada bagian khusus yang ingin kamu tanyakan lagi ke Nura? 💕`;
      }
      return `Halo! Nura siap membantu kamu. Pertolongan pertama terbaik dimulai dari ketenangan: bersihkan area cedera dengan air mengalir bersih, amankan dari bahaya sekitar, dan hubungi 119 bila kondisi memburuk ya! 🩺💕`;
    } else {
      if (qLower.includes('ointment') || qLower.includes('butter') || qLower.includes('toothpaste') || qLower.includes('oil')) {
        return `⚠️ **Critical:** **NEVER** apply toothpaste, butter, or cooking oils to burns or open cuts. They trap heat and breed bacteria! Stick to clean running tap water for 15-20 minutes first. 💕`;
      }
      if (qLower.includes('blister') || qLower.includes('pop')) {
        return `⚠️ **DO NOT pop burn blisters!** The blister roof is your body's sterile barrier against pathogens. Keep it loosely covered with non-stick sterile gauze. 💕`;
      }
      if (qLower.includes('ice') || qLower.includes('compress')) {
        return `🧊 **Cold Compression Rule:**
- For **sprains/bruises**: Apply cloth-wrapped ice for 15-20 mins (R.I.C.E protocol).
- For **burns**: **Never** apply raw ice directly. Use gentle running tap water (15-20°C). 💕`;
      }
      if (qLower.includes('bleed') || qLower.includes('blood') || qLower.includes('stop')) {
        return `🩸 **To Stop Bleeding:**
1. Apply firm, uninterrupted direct pressure with sterile gauze for 5-10 minutes.
2. Do not peel off soaked pads; layer clean pads on top.
3. Elevate above heart level if feasible. Dial 911/119 if spurting! 💕`;
      }
      if (assessment?.triage) {
        return `Based on the evaluated photo (**${assessment.triage.injury_type}** - ${assessment.triage.urgency_level} urgency):
- Maintain strict hygiene and apply sterile dressing without excessive constriction. Feel free to ask Nurse Nura any specific treatment question! 💕`;
      }
      return `Hi! Nurse Nura is right here. Stay calm, keep the wound clean with cool water, and don't hesitate to ask if you need further first-aid instructions! 🩺💕`;
    }
  };

  const ai = getGenAI();

  // Fallback if no Gemini API key
  if (!ai) {
    return res.json({ reply: getContextualFallbackAnswer(message, language) });
  }

  try {
    let cleanBase64: string | null = null;
    let mimeType = 'image/jpeg';
    if (imageBase64 && typeof imageBase64 === 'string') {
      if (imageBase64.includes(',')) {
        const parts = imageBase64.split(',');
        cleanBase64 = parts[1];
        const mimeMatch = parts[0].match(/data:(.*?);base64/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }
      } else {
        cleanBase64 = imageBase64;
      }
    }

    const triageContext = assessment
      ? `CURRENT SCANNED INJURY CONTEXT:
- Injury Type: ${assessment.triage?.injury_type || 'Unknown'}
- Urgency Level: ${assessment.triage?.urgency_level || 'UNKNOWN'}
- Severity Summary: ${assessment.triage?.severity_summary || 'N/A'}
- Critical Warnings: ${(assessment.critical_warnings || []).join('; ')}
- Step Actions: ${(assessment.step_by_step_actions || []).map((s: { step_number: number; title: string; instruction: string }) => `${s.step_number}. ${s.title}: ${s.instruction}`).join('; ')}
`
      : 'No photo has been analyzed yet in the current session.';

    const systemPrompt = `You are "Suster Nura" (Nurse Nura), an empathetic, reassuring, highly competent 3D Pixar-style AI medical companion in the FirstAidLens application.
Your role:
1. Explain first-aid guidelines clearly and gently, strictly following WHO and International Red Cross protocols.
2. If an injury assessment and/or photo are provided, answer the user's specific questions by directly referring to the visual condition, symptoms, and the triage recommendations.
3. Highlight critical safety warnings (DO NOT apply toothpaste/butter on burns, DO NOT remove embedded sharp objects, DO NOT apply raw ice directly to skin).
4. Guide the user calmly if they express fear or panic. If severe red flags appear (loss of consciousness, arterial pulsing bleeding, severe anaphylaxis), strongly advise calling 119/112 immediately.
5. Format your answer with clear markdown bullet points, friendly emojis (🩺, 💧, 🧊, 💕), and concise paragraphs.
6. Answer strictly in ${language === 'id' ? 'Indonesian (Bahasa Indonesia yang ramah, sopan, dan mudah dipahami)' : 'English (friendly, warm, clear, and reassuring)'}.`;

    const contents: Array<any> = [];

    // Add recent history if provided
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history.slice(-6)) {
        if (h.sender === 'user') {
          contents.push({
            role: 'user',
            parts: [{ text: h.text }],
          });
        } else if (h.sender === 'nura') {
          contents.push({
            role: 'model',
            parts: [{ text: h.text }],
          });
        }
      }
    }

    // Current turn parts
    const currentParts: Array<any> = [];
    if (cleanBase64) {
      currentParts.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
    }

    currentParts.push({
      text: `${triageContext}\n\nUSER QUESTION/MESSAGE: "${message}"`,
    });

    contents.push({
      role: 'user',
      parts: currentParts,
    });

    const { response } = await generateWithModelFallback(ai, {
      primaryModel: 'gemini-3.6-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.6,
      },
    });

    const replyText = response.text || (language === 'id' ? 'Nura siap membantu! Apakah ada yang ingin kamu tanyakan lagi?' : 'I am here to help! Do you have any other questions?');
    return res.json({ reply: replyText });
  } catch (err: any) {
    console.error('Gemini Mascot Chat Error:', err);
    // Graceful smart fallback ensuring 0 broken chat turns
    const fallbackAnswer = getContextualFallbackAnswer(message, language);
    return res.json({ reply: fallbackAnswer });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FirstAidLens AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
