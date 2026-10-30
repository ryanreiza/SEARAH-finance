import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  Filter,
  Calendar,
  Wallet,
  Loader2,
  User,
  Lightbulb,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { PageHeader } from '../components/common/PageHeader';
import { formatRupiah } from '../utils/format';

export const AIAssistantPage: React.FC = () => {
  const {
    chatMessages,
    addChatMessage,
    clearChatHistory,
    accounts,
    categories,
    transactions,
    currentMonthKey,
    totalIncomeCurrentMonth,
    totalExpenseCurrentMonth,
    cashflowCurrentMonth,
    savingsGoals,
    debts,
  } = useFinance();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Filters for AI Context
  const [dateRangeFilter, setDateRangeFilter] = useState<'current_month' | 'last_3_months' | 'all'>('current_month');
  const [accountFilter, setAccountFilter] = useState<string>('all');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  // Suggested prompt chips
  const suggestedPrompts = [
    '💡 Bagaimana cara menghemat Rp1.000.000 bulan ini?',
    '📊 Evaluasi apakah cicilan utang keluarga masih dalam batas aman?',
    '🛡️ Apakah dana darurat keluarga saat ini sudah mencukupi?',
    '🛒 Analisis pos belanja apa yang paling banyak menguras saldo?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isTyping) return;

    // Add user message
    addChatMessage({
      role: 'user',
      content: text.trim(),
    });

    setInputPrompt('');
    setIsTyping(true);

    try {
      // Build financial context
      const filteredTx = transactions.filter((t) => {
        if (dateRangeFilter === 'current_month') return t.date.startsWith(currentMonthKey);
        if (accountFilter !== 'all') return t.accountId === accountFilter;
        return true;
      });

      const contextPayload = {
        filter: { dateRange: dateRangeFilter, account: accountFilter },
        totalSaldoKekayaan: accounts.reduce((sum, a) => sum + (a.isActive ? a.balance : 0), 0),
        pemasukanBulanIni: totalIncomeCurrentMonth,
        pengeluaranBulanIni: totalExpenseCurrentMonth,
        arusKasBersih: cashflowCurrentMonth,
        rekening: accounts.map((a) => ({ nama: a.name, saldo: a.balance })),
        kategoriTeratas: categories.slice(0, 6).map((c) => c.name),
        daftarUtang: debts.map((d) => ({
          judul: d.title,
          sisa: d.remainingAmount,
          angsuran: d.monthlyInstallment,
        })),
        targetTabungan: savingsGoals.map((s) => ({
          nama: s.name,
          terkumpul: s.currentAmount,
          target: s.targetAmount,
        })),
        jumlahTransaksiTerpantau: filteredTx.length,
      };

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, { role: 'user', content: text.trim() }],
          context: contextPayload,
        }),
      });

      const data = await response.json();
      if (data.reply) {
        addChatMessage({
          role: 'assistant',
          content: data.reply,
        });
      }
    } catch (err) {
      console.error('Error sending message to AI', err);
      addChatMessage({
        role: 'assistant',
        content: 'Maaf, terjadi gangguan jaringan saat menghubungi server AI. Secara umum, pastikan pengeluaran bulanan Anda tidak melebihi 70% dari total pemasukan agar keuangan keluarga tetap sehat.',
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-300 flex flex-col h-[calc(100vh-100px)]">
      <PageHeader
        icon={<Sparkles className="w-6 h-6 text-teal-brand" />}
        title="SEARAH AI Assistant"
        subtitle="Satu Tujuan. Keuangan Lebih Terarah • Konsultasi cerdas, evaluasi anggaran, dan strategi finansial keluarga"
        actions={
          <button
            onClick={clearChatHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-slate-600 text-xs font-semibold transition cursor-pointer"
            title="Bersihkan Riwayat Obrolan"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Bersihkan Chat</span>
          </button>
        }
      />

      {/* Filter Context Bar */}
      <div className="card-bento p-3 flex flex-wrap items-center justify-between gap-3 bg-stone-50/80 text-xs">
        <div className="flex items-center gap-2 text-slate-500 font-semibold">
          <Filter className="w-3.5 h-3.5 text-teal-brand" />
          <span>Konteks Analisis SEARAH AI:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Date range filter */}
          <div className="flex items-center gap-1.5 bg-white border border-stone-200 px-2.5 py-1 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value as any)}
              className="text-xs bg-transparent text-slate-800 font-semibold focus:outline-none"
            >
              <option value="current_month">Bulan Ini Saja</option>
              <option value="last_3_months">3 Bulan Terakhir</option>
              <option value="all">Seluruh Riwayat Transaksi</option>
            </select>
          </div>

          {/* Account filter */}
          <div className="flex items-center gap-1.5 bg-white border border-stone-200 px-2.5 py-1 rounded-xl">
            <Wallet className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="text-xs bg-transparent text-slate-800 font-semibold focus:outline-none"
            >
              <option value="all">Semua Rekening</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="card-bento flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 flex flex-col">
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                  isUser
                    ? 'bg-navy-brand text-white'
                    : 'bg-gradient-to-tr from-teal-500 to-teal-400 text-slate-950 font-bold'
                }`}
              >
                {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-5 h-5 text-slate-950" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-navy-brand text-white rounded-tr-none'
                    : 'bg-stone-100/90 text-slate-800 rounded-tl-none border border-stone-200/80 space-y-2'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <span
                  className={`block text-[10px] mt-1 ${
                    isUser ? 'text-white/60 text-right' : 'text-slate-400'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-500 to-teal-400 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-slate-950" />
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-100 border border-stone-200 text-xs text-slate-600 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
              <span>SEARAH AI sedang menganalisis data keuangan keluarga...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-slate-700 whitespace-nowrap shrink-0 transition cursor-pointer font-medium text-[11px]"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl border border-stone-300 shadow-sm">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Tanyakan apapun seputar keuangan keluarga, anggaran, atau tips hemat..."
          className="flex-1 px-3 py-2 text-xs sm:text-sm focus:outline-none bg-transparent"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputPrompt.trim() || isTyping}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5 text-mint-brand" />
          <span className="hidden sm:inline">Kirim</span>
        </button>
      </div>
    </div>
  );
};
