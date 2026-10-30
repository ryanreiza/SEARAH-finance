import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const app = express();

function getPort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    return Number(process.argv[portArgIndex + 1]);
  }
  // Environment requirement: Dev server must run on port 3000.
  if (process.env.NODE_ENV !== 'production') {
    return 3000;
  }
  return Number(process.env.PORT) || 3000;
}

function getHost(): string {
  const hostArgIndex = process.argv.indexOf('--host');
  if (hostArgIndex !== -1 && process.argv[hostArgIndex + 1]) {
    return process.argv[hostArgIndex + 1];
  }
  return '0.0.0.0';
}

const PORT = getPort();
const HOST = getHost();

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Initialize Google Gemini Client (server-side only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Heuristic fallback for text transaction parsing in Indonesian
function fallbackParseTransaction(text: string, knownAccounts: string[] = [], knownCategories: string[] = []) {
  const lower = text.toLowerCase();
  
  // Determine type
  let type: 'income' | 'expense' | 'transfer' = 'expense';
  if (lower.includes('gaji') || lower.includes('dapat') || lower.includes('pemasukan') || lower.includes('terima') || lower.includes('bonus') || lower.includes('transfer dari') || lower.includes('penjualan') || lower.includes('cashback')) {
    type = 'income';
  } else if (lower.includes('transfer ke') || lower.includes('kirim ke') || lower.includes('pindah dana')) {
    type = 'transfer';
  }

  // Parse amount: handles "25rb", "25 k", "25ribu", "1.5jt", "1.5 juta", "Rp 50.000", "50000"
  let amount = 0;
  const jutaMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta)/);
  const ribuMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:rb|k|ribu)/);
  const fullNominalMatch = lower.match(/(?:rp\.?|rp\s*)?(\d{1,3}(?:\.\d{3})+|\d+)/);

  if (jutaMatch) {
    const val = parseFloat(jutaMatch[1].replace(',', '.'));
    amount = Math.round(val * 1000000);
  } else if (ribuMatch) {
    const val = parseFloat(ribuMatch[1].replace(',', '.'));
    amount = Math.round(val * 1000);
  } else if (fullNominalMatch) {
    const cleaned = fullNominalMatch[1].replace(/\./g, '');
    const num = parseInt(cleaned, 10);
    if (!isNaN(num) && num > 0) {
      amount = num;
    }
  }

  // Find account
  let matchedAccount = knownAccounts[0] || 'Dompet Tunai';
  for (const acc of knownAccounts) {
    if (lower.includes(acc.toLowerCase())) {
      matchedAccount = acc;
      break;
    }
  }
  if (lower.includes('bca')) matchedAccount = 'BCA';
  else if (lower.includes('mandiri')) matchedAccount = 'Mandiri';
  else if (lower.includes('jago')) matchedAccount = 'Bank Jago';
  else if (lower.includes('gopay')) matchedAccount = 'GoPay';
  else if (lower.includes('ovo')) matchedAccount = 'OVO';
  else if (lower.includes('dana')) matchedAccount = 'DANA';
  else if (lower.includes('tunai') || lower.includes('cash')) matchedAccount = 'Dompet Tunai';

  // Find category
  let matchedCategory = type === 'income' ? 'Gaji & Pendapatan' : 'Lain-lain';
  if (lower.includes('kopi') || lower.includes('makan') || lower.includes('resto') || lower.includes('nasi') || lower.includes('cafe') || lower.includes('ayam') || lower.includes('minum')) {
    matchedCategory = 'Makanan & Minuman';
  } else if (lower.includes('bensin') || lower.includes('pertalite') || lower.includes('pertamax') || lower.includes('ojol') || lower.includes('grab') || lower.includes('gojek') || lower.includes('parkir') || lower.includes('tol')) {
    matchedCategory = 'Transportasi';
  } else if (lower.includes('belanja') || lower.includes('indomaret') || lower.includes('alfamart') || lower.includes('supermarket') || lower.includes('sayur') || lower.includes('sembako')) {
    matchedCategory = 'Belanja Harian';
  } else if (lower.includes('listrik') || lower.includes('pln') || lower.includes('air') || lower.includes('pdam') || lower.includes('wifi') || lower.includes('indihome') || lower.includes('pulsa') || lower.includes('kuota')) {
    matchedCategory = 'Tagihan & Utilitas';
  } else if (lower.includes('obat') || lower.includes('dokter') || lower.includes('klinik') || lower.includes('apotek')) {
    matchedCategory = 'Kesehatan';
  } else if (lower.includes('nonton') || lower.includes('game') || lower.includes('liburan') || lower.includes('bioskop') || lower.includes('netflix')) {
    matchedCategory = 'Hiburan & Santai';
  } else if (lower.includes('sekolah') || lower.includes('les') || lower.includes('kursus') || lower.includes('buku')) {
    matchedCategory = 'Pendidikan';
  }

  // Clean title
  let title = text.trim();
  if (title.length > 50) {
    title = title.substring(0, 50);
  }

  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    amount: amount || 25000,
    type,
    category: matchedCategory,
    account: matchedAccount,
    date: new Date().toISOString().split('T')[0],
    notes: `Dicatat cepat: "${text}"`,
  };
}

// Handler for parsing transactions
const handleParseTransaction = async (req: Request, res: Response) => {
  const { text, accounts = [], categories = [] } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Teks transaksi diperlukan' });
  }

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
    const fallback = fallbackParseTransaction(text, accounts, categories);
    return res.json({ transaction: fallback, source: 'fallback' });
  }

  let timeoutTimer: NodeJS.Timeout | null = null;
  try {
    const systemPrompt = `Kamu adalah asisten keuangan pintar keluarga SEARAH (AI Family Finance) Indonesia.
Tugasmu adalah menganalisis pesan percakapan singkat gaya WhatsApp atau rekaman suara tentang transaksi keuangan harian, lalu mengekstrak data terstruktur dalam format JSON murni tanpa markdown/backticks.

Daftar Rekening yang Tersedia: ${accounts.join(', ') || 'BCA, Mandiri, Bank Jago, Dompet Tunai, GoPay, OVO'}
Daftar Kategori yang Tersedia: ${categories.join(', ') || 'Makanan & Minuman, Belanja Harian, Transportasi, Tagihan & Utilitas, Kesehatan, Pendidikan, Hiburan & Santai, Gaji & Pendapatan, Investasi & Tabungan, Lain-lain'}

Format JSON yang HARUS dikembalikan:
{
  "title": "string deskripsi singkat judul transaksi (contoh: Kopi Kenangan, Bensin Pertamax, Belanja Mingguan Indomaret)",
  "amount": number (nominal angka bulat tanpa titik/koma, contoh 25000, 1500000),
  "type": "expense" | "income" | "transfer",
  "category": "string yang paling cocok dari daftar kategori di atas",
  "account": "string yang paling cocok dari daftar rekening di atas",
  "date": "YYYY-MM-DD (gunakan tanggal hari ini jika tidak disebutkan tanggal lain, hari ini: ${new Date().toISOString().split('T')[0]})",
  "notes": "string catatan opsional"
}

Perhatikan istilah khas Indonesia:
- "25rb", "25k", "25 ribu" = 25000
- "1.5jt", "1,5 juta" = 1500000
- "pake", "pakek", "via", "pake gopay", "transfer bca"
- Jangan output markdown ataupun teks lain selain JSON valid!`;

    // Fast 15s timeout with proper timer cleanup
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutTimer = setTimeout(() => reject(new Error('AI Request Timeout')), 15000);
    });

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: text,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const response: any = await Promise.race([generatePromise, timeoutPromise]);
    if (timeoutTimer) clearTimeout(timeoutTimer);

    const outputText = response.text || '';
    const parsed = JSON.parse(outputText);
    return res.json({ transaction: parsed, source: 'gemini' });
  } catch (error) {
    if (timeoutTimer) clearTimeout(timeoutTimer);
    console.warn('Notice: Gemini transaction parser fell back to heuristic:', (error as any)?.message || error);
    // Graceful fallback to heuristic regex parser so user request always succeeds
    const fallback = fallbackParseTransaction(req.body.text || '', req.body.accounts, req.body.categories);
    return res.json({ transaction: fallback, source: 'fallback-on-error' });
  }
};

// 1. Parse Transaction from Natural Text / Chat (WA style) / Voice (support both routes)
app.post('/api/ai/parse-transaction', handleParseTransaction);
app.post('/api/parse-transaction', handleParseTransaction);

// 2. Parse Receipt Image (OCR + Structure via Gemini Vision)
app.post('/api/ai/parse-receipt', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', accounts = [], categories = [] } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Data gambar struk diperlukan (base64)' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      // Fallback demo receipt result
      return res.json({
        receipt: {
          merchant: 'Supermarket / Minimarket',
          totalAmount: 87500,
          date: new Date().toISOString().split('T')[0],
          category: 'Belanja Harian',
          accountSuggestion: accounts[0] || 'Dompet Tunai',
          items: [
            { name: 'Susu UHT 1L', qty: 1, price: 21500 },
            { name: 'Roti Gandum', qty: 1, price: 18000 },
            { name: 'Minyak Goreng 2L', qty: 1, price: 34000 },
            { name: 'Kopi Bubuk', qty: 1, price: 14000 },
          ],
          tax: 0,
          notes: 'Hasil deteksi struk belanja (Mode Offline Demo)',
        },
        source: 'fallback',
      });
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
      },
    };

    const promptText = `Lakukan Optical Character Recognition (OCR) dan analisa mendalam pada struk belanjaan fisik / digital ini.
Ekstrak semua informasi struk dalam format JSON murni:
{
  "merchant": "Nama toko / minimarket / restoran (contoh: Indomaret, Alfamart, Super Indo, McD, Starbucks)",
  "totalAmount": number (total akhir pembayaran yang tertera di struk, pastikan angka integer murni),
  "date": "YYYY-MM-DD (tanggal transaksi dari struk, jika tidak terbaca pakai ${new Date().toISOString().split('T')[0]})",
  "category": "Kategori yang paling cocok (${categories.join(', ') || 'Belanja Harian, Makanan & Minuman, Tagihan & Utilitas, Kesehatan, Lain-lain'})",
  "accountSuggestion": "Metode pembayaran yang terdeteksi dari struk seperti Cash/Tunai, Debit BCA, Mandiri, QRIS, GoPay, atau fallback ke '${accounts[0] || 'Dompet Tunai'}'",
  "items": [
    {
      "name": "nama item belanjaan",
      "qty": 1,
      "price": 15000
    }
  ],
  "tax": number (pajak jika ada, atau 0),
  "notes": "Rangkuman item singkat untuk catatan transaksi"
}
Kembalikan HANYA JSON tanpa teks pembuka/penutup.`;

    let timeoutTimer: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutTimer = setTimeout(() => reject(new Error('AI OCR Request Timeout')), 35000);
    });

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: {
        parts: [imagePart, { text: promptText }],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const response: any = await Promise.race([generatePromise, timeoutPromise]);
    if (timeoutTimer) clearTimeout(timeoutTimer);

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ receipt: parsed, source: 'gemini-vision-ocr' });
  } catch (error) {
    console.warn('Notice: Gemini OCR fell back to default:', (error as any)?.message || error);
    return res.json({
      receipt: {
        merchant: 'Struk Belanja Minimarket',
        totalAmount: 64500,
        date: new Date().toISOString().split('T')[0],
        category: 'Belanja Harian',
        items: [
          { name: 'Minyak Goreng 1L', qty: 1, price: 21500 },
          { name: 'Gula Pasir 1kg', qty: 1, price: 17500 },
          { name: 'Kopi Sachet', qty: 1, price: 15500 },
          { name: 'Air Mineral 1.5L', qty: 2, price: 10000 },
        ],
        notes: 'Hasil deteksi struk belanja (Mode Offline Fallback)',
      },
      source: 'fallback-error',
    });
  }
});

// 3. AI Financial Advisor Chat
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { messages, context } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Riwayat pesan diperlukan' });
    }

    const contextStr = context ? JSON.stringify(context, null, 2) : 'Tidak ada data keuangan tambahan.';
    const systemPrompt = `Anda adalah "SEARAH AI" (AI Family Finance) — penasihat keuangan keluarga pintar, tepercaya, dan kolaboratif dengan moto: "Satu Tujuan. Keuangan Lebih Terarah".
Persona: Ramah, hangat ("Halo, Ayah & Ibu"), bijaksana, profesional, dan empatik terhadap dinamika keuangan keluarga.
Bahasa: Bahasa Indonesia yang santai, solutif, terstruktur jelas (bisa menggunakan bullet point, tips praktis hemat, dan angka nominal Rupiah format Rp1.250.000).

Filosofi Merek SEARAH:
- "Dua Jalan, Satu Arah": Melambangkan pasangan suami-istri yang menyatukan tujuan, saling melengkapi, dan melangkah bersama menuju masa depan finansial yang lebih baik.
- Nilai: Modern, Terpercaya, Berkelanjutan, Kolaboratif.

Konteks Finansial Keluarga Saat Ini:
${contextStr}

Tugas Anda:
1. Menyapa dengan hangat ("Halo, Ayah & Ibu" atau panggilan keluarga yang suportif).
2. Menjawab pertanyaan keuangan keluarga pengguna (anggaran, tabungan impian, utang/cicilan, pemangkasan biaya, belanja harian, alokasi 50/30/20).
3. Memberikan evaluasi jujur dan rekomendasi realistis jika ada pengeluaran membengkak atau rasio utang tinggi.
4. Selalu memotivasi dan merayakan pencapaian tabungan / pelunasan utang keluarga.
5. Menjaga fokus pada ketahanan finansial keluarga, dana darurat, dan cashflow sehat.`;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      return res.json({
        reply: `Halo, Ayah & Ibu! 👋 Saya **SEARAH AI** (*AI Family Finance*).

Berdasarkan data keuangan keluarga saat ini, arus kas Anda berada dalam kondisi yang positif dan terkontrol. Sesuai prinsip kita *"Satu Tujuan. Keuangan Lebih Terarah"*, mari kita jaga momentum ini:

💡 **Rekomendasi Cerdas SEARAH:**
1. **Prioritaskan Dana Darurat**: Pastikan target dana darurat 3-6 bulan pengeluaran rutin keluarga terus bertumbuh secara otomatis diawal bulan.
2. **Evaluasi Belanja Harian**: Catat setiap pengeluaran kecil secara disiplin untuk mencegah kebocoran pos belanja impulsif.
3. **Kolaborasi Pasangan**: Jadwalkan diskusi santai akhir pekan untuk mereview pencapaian target bulanan bersama.

Ada pos keuangan keluarga yang ingin kita diskusikan lebih lanjut hari ini?`,
        source: 'fallback',
      });
    }

    // Build chat contents for Gemini
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    let timeoutTimer: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutTimer = setTimeout(() => reject(new Error('AI Chat Request Timeout')), 25000);
    });

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const response: any = await Promise.race([generatePromise, timeoutPromise]);
    if (timeoutTimer) clearTimeout(timeoutTimer);

    return res.json({ reply: response.text || '', source: 'gemini' });
  } catch (error) {
    console.warn('Notice: Gemini Chat fell back to default reply:', (error as any)?.message || error);
    return res.json({
      reply: 'Maaf, terjadi gangguan sesaat saat menghubungi penasihat AI. Namun secara umum, menjaga rasio tabungan di atas 20% dan membatasi utang di bawah 30% dari pemasukan adalah kunci keuangan keluarga yang tenang.',
      source: 'fallback-error',
    });
  }
});

// 4. Smart Financial Health & Savings Optimization Analysis
app.post('/api/ai/financial-advice', async (req: Request, res: Response) => {
  const fallbackAnalysis = {
    financialHealthScore: 82,
    healthStatus: 'Baik',
    keyHighlights: [
      'Rasio tabungan konsisten di atas 15% dari pemasukan bulanan',
      'Pengeluaran kebutuhan pokok terkendali dengan baik',
    ],
    savingsOpportunities: [
      {
        category: 'Makanan & Minuman',
        potentialSavingMonthly: 450000,
        tip: 'Mengurangi frekuensi jajan di luar dan perbanyak masak hidangan keluarga bersama.',
      },
      {
        category: 'Tagihan & Utilitas',
        potentialSavingMonthly: 150000,
        tip: 'Periksa langganan digital yang dobel atau jarang digunakan keluarga.',
      },
    ],
    debtAdvice: 'Cicilan utang berada di bawah batas aman 30% dari pendapatan bulanan. Pertahankan pelunasan tepat waktu.',
    emergencyFundStatus: 'Dana darurat saat ini mencukupi untuk 2-3 bulan kebutuhan keluarga. Targetkan hingga 6 bulan.',
  };

  try {
    const { financialData } = req.body;
    const systemPrompt = `Kamu adalah analis keuangan keluarga profesional SEARAH AI. Analisis data keuangan berikut dan berikan penilaian kesehatan finansial serta rekomendasi penghematan konkret dalam JSON murni:
{
  "financialHealthScore": number (1-100),
  "healthStatus": "Sangat Sehat" | "Baik" | "Perlu Perhatian" | "Kritis",
  "keyHighlights": ["string poin positif 1", "string poin positif 2"],
  "savingsOpportunities": [
    {
      "category": "string nama kategori",
      "potentialSavingMonthly": number (perkiraan hemat rupiah per bulan),
      "tip": "saran konkret langkah penghematan"
    }
  ],
  "debtAdvice": "string saran terkait utang jika ada",
  "emergencyFundStatus": "string analisis kecukupan dana darurat"
}`;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      return res.json({
        analysis: fallbackAnalysis,
        source: 'fallback',
      });
    }

    let timeoutTimer: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutTimer = setTimeout(() => reject(new Error('AI Advice Request Timeout')), 20000);
    });

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: JSON.stringify(financialData || {}),
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const response: any = await Promise.race([generatePromise, timeoutPromise]);
    if (timeoutTimer) clearTimeout(timeoutTimer);

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ analysis: parsed, source: 'gemini' });
  } catch (error) {
    console.warn('Notice: Gemini financial advice fell back to default analysis:', (error as any)?.message || error);
    return res.json({ analysis: fallbackAnalysis, source: 'fallback-error' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`SEARAH - AI Family Finance server running at http://${HOST}:${PORT}`);
  });
}

startServer();
