import React, { useState, useRef } from 'react';
import {
  X,
  MessageSquare,
  Mic,
  Camera,
  Edit3,
  Sparkles,
  ArrowRight,
  Upload,
  Check,
  AlertCircle,
  Loader2,
  Calendar,
  Wallet,
  Tag,
  FileText,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah, parseRupiahInput } from '../../utils/format';

interface QuickInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'chat' | 'voice' | 'camera' | 'manual';
}

export const QuickInputModal: React.FC<QuickInputModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'chat',
}) => {
  const { accounts, categories, addTransaction } = useFinance();
  const [activeTab, setActiveTab] = useState<'chat' | 'voice' | 'camera' | 'manual'>(initialTab);

  // Parsed draft state
  const [draft, setDraft] = useState<{
    title: string;
    amount: number;
    type: 'income' | 'expense' | 'transfer';
    categoryId: string;
    accountId: string;
    toAccountId?: string;
    date: string;
    notes: string;
    receiptItems?: Array<{ name: string; qty: number; price: number }>;
  }>({
    title: '',
    amount: 0,
    type: 'expense',
    categoryId: categories[0]?.id || '',
    accountId: accounts[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Chat tab state
  const [chatInput, setChatInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseSuccessMsg, setParseSuccessMsg] = useState('');

  // Voice tab state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // Camera / Receipt OCR tab state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [detectedReceipt, setDetectedReceipt] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status feedback toast inside modal
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!isOpen) return null;

  // Local regex extractor as client-side backup
  const parseLocalClientTransaction = (rawText: string) => {
    const lower = rawText.toLowerCase();
    let type: 'income' | 'expense' | 'transfer' = 'expense';
    if (lower.includes('gaji') || lower.includes('dapat') || lower.includes('pemasukan') || lower.includes('terima') || lower.includes('bonus')) {
      type = 'income';
    } else if (lower.includes('transfer ke') || lower.includes('kirim ke')) {
      type = 'transfer';
    }

    let amount = 0;
    const jtMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta)/);
    const rbMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:rb|k|ribu)/);
    const numMatch = lower.match(/(?:rp\.?|rp\s*)?(\d{1,3}(?:\.\d{3})+|\d+)/);

    if (jtMatch) {
      amount = Math.round(parseFloat(jtMatch[1].replace(',', '.')) * 1000000);
    } else if (rbMatch) {
      amount = Math.round(parseFloat(rbMatch[1].replace(',', '.')) * 1000);
    } else if (numMatch) {
      amount = parseInt(numMatch[1].replace(/\./g, ''), 10) || 0;
    }

    const matchedAcc = accounts.find((a) => lower.includes(a.name.toLowerCase())) || accounts[0];
    const matchedCat = categories.find((c) => lower.includes(c.name.toLowerCase())) || categories[0];

    return {
      title: rawText.length > 40 ? rawText.slice(0, 40) : rawText,
      amount: amount || 20000,
      type,
      categoryId: matchedCat?.id || categories[0]?.id || '',
      accountId: matchedAcc?.id || accounts[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      notes: `Input cepat: "${rawText}"`,
    };
  };

  // Process text from Chat or Voice via backend / fallback
  const processNaturalLanguageText = async (rawText: string) => {
    if (!rawText.trim()) return;
    setIsParsing(true);
    setParseSuccessMsg('');

    try {
      const response = await fetch('/api/ai/parse-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: rawText,
          accounts: accounts.map((a) => a.name),
          categories: categories.map((c) => c.name),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.transaction) {
        const tx = data.transaction;
        // Match account ID
        const matchedAcc = accounts.find((a) => a.name.toLowerCase() === (tx.account || '').toLowerCase()) || accounts[0];
        // Match category ID
        const matchedCat = categories.find((c) => c.name.toLowerCase() === (tx.category || '').toLowerCase()) || categories[0];

        setDraft({
          title: tx.title || rawText,
          amount: tx.amount || 25000,
          type: tx.type || 'expense',
          categoryId: matchedCat?.id || categories[0]?.id || '',
          accountId: matchedAcc?.id || accounts[0]?.id || '',
          date: tx.date || new Date().toISOString().split('T')[0],
          notes: tx.notes || `Input via AI: "${rawText}"`,
        });

        setParseSuccessMsg(`✨ Transaksi berhasil dideteksi: ${tx.title} (${formatRupiah(tx.amount || 25000)})`);
      }
    } catch (err) {
      console.warn('Network parse note, activating instant local parser:', err);
      const localFallback = parseLocalClientTransaction(rawText);
      setDraft(localFallback);
      setParseSuccessMsg(`✨ Transaksi dideteksi: ${localFallback.title} (${formatRupiah(localFallback.amount)})`);
    } finally {
      setIsParsing(false);
    }
  };

  // Voice recording handler
  const handleToggleVoice = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Browser Anda belum mendukung rekaman suara langsung. Silakan gunakan tab Chat WA.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
        setVoiceTranscript('');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setVoiceTranscript(transcript);
      };

      recognition.onerror = (e: any) => {
        console.error('Speech error', e);
        setIsRecording(false);
        showToast('Suara tidak terdengar jelas, silakan coba lagi.');
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (voiceTranscript) {
          processNaturalLanguageText(voiceTranscript);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsRecording(false);
      showToast('Gagal mengaktifkan mikrofon.');
    }
  };

  // Receipt OCR file handler
  const handleReceiptImageUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setIsOcrProcessing(true);
      setDetectedReceipt(null);

      try {
        const response = await fetch('/api/ai/parse-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: file.type || 'image/jpeg',
            accounts: accounts.map((a) => a.name),
            categories: categories.map((c) => c.name),
          }),
        });

        const data = await response.json();
        const r = data.receipt;
        if (r) {
          setDetectedReceipt(r);
          const matchedAcc = accounts.find((a) => a.name.toLowerCase().includes((r.accountSuggestion || '').toLowerCase())) || accounts[0];
          const matchedCat = categories.find((c) => c.name.toLowerCase().includes((r.category || '').toLowerCase())) || categories[1]; // Belanja harian

          setDraft({
            title: r.merchant ? `Belanja ${r.merchant}` : 'Belanja Struk',
            amount: r.totalAmount || 0,
            type: 'expense',
            categoryId: matchedCat?.id || categories[0]?.id,
            accountId: matchedAcc?.id || accounts[0]?.id,
            date: r.date || new Date().toISOString().split('T')[0],
            notes: r.notes || (r.items ? r.items.map((i: any) => `${i.name} (${i.qty}x)`).join(', ') : 'Struk Belanjaan OCR'),
            receiptItems: r.items || [],
          });
          setParseSuccessMsg(`✨ OCR Sukses: ${r.merchant} • ${formatRupiah(r.totalAmount)}`);
        }
      } catch (err) {
        console.error(err);
        showToast('Gagal memproses struk dengan OCR. Silakan isi form manual.');
      } finally {
        setIsOcrProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit final transaction
  const handleSubmitFinal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) {
      showToast('Mohon masukkan judul transaksi.');
      return;
    }
    if (draft.amount <= 0) {
      showToast('Nominal transaksi harus lebih dari Rp 0.');
      return;
    }

    addTransaction({
      title: draft.title.trim(),
      amount: draft.amount,
      type: draft.type,
      categoryId: draft.categoryId,
      accountId: draft.accountId,
      toAccountId: draft.type === 'transfer' ? draft.toAccountId : undefined,
      date: draft.date,
      notes: draft.notes,
      receiptItems: draft.receiptItems,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-navy-brand text-teal-brand flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-navy-brand">
                Catat Transaksi Cepat • SEARAH AI
              </h2>
              <p className="text-xs text-slate-500">
                Pilih metode: Chat WA, Voice Note, Foto Struk, atau Form Manual
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-stone-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-4 p-2 bg-stone-100/90 border-b border-stone-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-white text-slate-900 shadow-xs border border-stone-200/60 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Chat WA</span>
            <span className="sm:hidden">Chat</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('voice')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-white text-slate-900 shadow-xs border border-stone-200/60 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Mic className="w-4 h-4 text-rose-500" />
            <span className="hidden sm:inline">Voice Note</span>
            <span className="sm:hidden">Suara</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-white text-slate-900 shadow-xs border border-stone-200/60 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Foto Struk (OCR)</span>
            <span className="sm:hidden">Struk</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-white text-slate-900 shadow-xs border border-stone-200/60 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Form Manual</span>
            <span className="sm:hidden">Manual</span>
          </button>
        </div>

        {/* Scrollable Tab Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: CHAT WA STYLE */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  Ketik Santai Seperti Chat WhatsApp:
                </p>
                <p className="text-emerald-800">
                  Contoh: <em>"Beli kopi kenangan 25rb pakai gopay"</em> atau <em>"Gaji bulanan 18.5jt masuk BCA"</em> atau <em>"Bensin mobil 200 ribu tunai"</em>.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      processNaturalLanguageText(chatInput);
                    }
                  }}
                  placeholder="Ketik pengeluaran atau pemasukan Anda di sini..."
                  className="flex-1 px-4 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm bg-stone-50/50"
                />
                <button
                  type="button"
                  disabled={isParsing || !chatInput.trim()}
                  onClick={() => processNaturalLanguageText(chatInput)}
                  className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-mint-brand" />}
                  <span>Ekstrak</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: VOICE NOTE */}
          {activeTab === 'voice' && (
            <div className="space-y-4 text-center py-2">
              <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs text-rose-900">
                <p className="font-semibold mb-1">🎙️ Diktekan Transaksi Keuangan Anda</p>
                <p className="text-rose-700">
                  Ucapkan misalnya: <em>"Makan siang soto ayam 35 ribu pakai dompet tunai"</em>
                </p>
              </div>

              <div className="flex flex-col items-center justify-center py-4">
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition transform hover:scale-105 cursor-pointer ${
                    isRecording
                      ? 'bg-rose-600 animate-pulse ring-8 ring-rose-200'
                      : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                >
                  <Mic className={`w-8 h-8 ${isRecording ? 'text-white' : 'text-rose-400'}`} />
                </button>
                <p className="mt-3 text-xs font-semibold text-slate-600">
                  {isRecording ? 'Sedang mendengarkan... Tekan untuk selesai' : 'Tekan mikrofon untuk mulai bicara'}
                </p>
                {voiceTranscript && (
                  <div className="mt-3 p-3 bg-stone-100 rounded-xl text-xs text-slate-800 font-medium max-w-md italic">
                    "{voiceTranscript}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: RECEIPT OCR */}
          {activeTab === 'camera' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-blue-700" />
                  Foto Struk Belanjaan & Pengenalan Teks Otomatis (OCR)
                </p>
                <p className="text-blue-800">
                  Ambil foto struk Indomaret, Alfamart, restoran, atau supermarket. Sistem AI akan mengekstrak merchant, total belanja, tanggal, dan rincian item belanjaan.
                </p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleReceiptImageUpload(file);
                }}
              />

              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-300 hover:border-slate-800 rounded-2xl p-6 text-center cursor-pointer transition bg-stone-50 hover:bg-stone-100/60 flex flex-col items-center justify-center gap-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-stone-200 flex items-center justify-center text-slate-700">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Ambil Foto Struk atau Pilih Gambar
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Format JPG, PNG, WEBP (Bisa langsung pakai kamera HP)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                  <div className="relative w-full sm:w-36 h-36 rounded-xl overflow-hidden bg-stone-200 shrink-0 border border-stone-300">
                    <img src={imagePreview} alt="Struk" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setDetectedReceipt(null);
                      }}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-black text-white rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex-1 space-y-2 text-xs">
                    {isOcrProcessing ? (
                      <div className="flex items-center gap-2 py-8 text-slate-600 font-medium">
                        <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
                        <span>Menganalisis teks struk dengan AI Vision...</span>
                      </div>
                    ) : detectedReceipt ? (
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {detectedReceipt.merchant || 'Struk Terdeteksi'}
                        </p>
                        <p className="text-emerald-700 font-mono font-bold text-base mt-0.5">
                          Total: {formatRupiah(detectedReceipt.totalAmount)}
                        </p>
                        <p className="text-slate-500 mt-1">Tanggal: {detectedReceipt.date}</p>
                        {detectedReceipt.items && detectedReceipt.items.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-stone-200 space-y-1 max-h-24 overflow-y-auto">
                            <p className="font-semibold text-slate-700">Item Belanjaan ({detectedReceipt.items.length}):</p>
                            {detectedReceipt.items.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between text-slate-600">
                                <span>{item.name} {item.qty > 1 ? `x${item.qty}` : ''}</span>
                                <span className="font-mono">{formatRupiah(item.price)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold text-slate-800 underline mt-4"
                      >
                        Ganti Foto Struk Lain
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PARSE STATUS BANNER */}
          {parseSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{parseSuccessMsg}</span>
            </div>
          )}

          {/* VERIFY / FORM REVIEW */}
          <form id="quick-tx-form" onSubmit={handleSubmitFinal} className="space-y-4 pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tinjau & Konfirmasi Data Transaksi
              </h3>
              {/* Type Switcher */}
              <div className="flex p-0.5 bg-stone-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, type: 'expense' })}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    draft.type === 'expense' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, type: 'income' })}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    draft.type === 'income' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pemasukan
                </button>
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, type: 'transfer' })}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    draft.type === 'transfer' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Transfer
                </button>
              </div>
            </div>

            {/* Title & Amount Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Transaksi
                </label>
                <input
                  type="text"
                  required
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Contoh: Belanja Mingguan Superindo"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal (Rupiah)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    required
                    value={draft.amount ? draft.amount.toLocaleString('id-ID') : ''}
                    onChange={(e) => {
                      const val = parseRupiahInput(e.target.value);
                      setDraft({ ...draft, amount: val });
                    }}
                    placeholder="0"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Account & Category / Target Account */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-slate-500" />
                  {draft.type === 'transfer' ? 'Dari Rekening' : 'Rekening / Dompet'}
                </label>
                <select
                  value={draft.accountId}
                  onChange={(e) => setDraft({ ...draft, accountId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs bg-white"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatRupiah(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>

              {draft.type === 'transfer' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                    Ke Rekening Tujuan
                  </label>
                  <select
                    value={draft.toAccountId || accounts[1]?.id || ''}
                    onChange={(e) => setDraft({ ...draft, toAccountId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs bg-white"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-500" />
                    Kategori
                  </label>
                  <select
                    value={draft.categoryId}
                    onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs bg-white"
                  >
                    {categories
                      .filter((c) => (draft.type === 'income' ? c.type === 'income' : c.type === 'expense'))
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            {/* Date & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Tanggal Transaksi
                </label>
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  Catatan / Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  value={draft.notes}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                  placeholder="Catatan tambahan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer with Toast and Actions */}
        <div className="px-5 py-4 border-t border-stone-200 bg-stone-50/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          {toastMessage ? (
            <div className="text-xs font-semibold text-rose-600 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 hidden sm:block">
              Perubahan langsung mengupdate saldo & analitik keuangan keluarga.
            </div>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              form="quick-tx-form"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Check className="w-4 h-4 text-mint-brand" />
              <span>Simpan Transaksi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
