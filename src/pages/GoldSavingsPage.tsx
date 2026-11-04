import React, { useState } from 'react';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Scale,
  RefreshCw,
  Edit3,
  Check,
  AlertCircle,
  Info,
  Calendar,
  Wallet,
  ArrowRight,
  X,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah, formatTanggal } from '../utils/format';
import { PageHeader } from '../components/common/PageHeader';

export const GoldSavingsPage: React.FC = () => {
  const {
    goldPortfolio,
    goldTransactions,
    accounts,
    buyGold,
    sellGold,
    updateGoldMarketPrice,
  } = useFinance();

  // Modals state
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Buy form state
  const [buyGrams, setBuyGrams] = useState<string>('1.000');
  const [buyPricePerGram, setBuyPricePerGram] = useState<number>(goldPortfolio.currentMarketPrice);
  const [buyAccountId, setBuyAccountId] = useState<string>(accounts[0]?.id || '');
  const [buyDate, setBuyDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [buyNotes, setBuyNotes] = useState<string>('');

  // Sell form state
  const [sellGrams, setSellGrams] = useState<string>('1.000');
  const [sellPricePerGram, setSellPricePerGram] = useState<number>(goldPortfolio.currentMarketPrice);
  const [sellAccountId, setSellAccountId] = useState<string>(accounts[0]?.id || '');
  const [sellDate, setSellDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sellNotes, setSellNotes] = useState<string>('');

  // Price editor state
  const [tempMarketPrice, setTempMarketPrice] = useState<number>(goldPortfolio.currentMarketPrice);

  // Filter state
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Notifications helper
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Calculations
  const totalValuation = Math.round(goldPortfolio.totalGrams * goldPortfolio.currentMarketPrice);
  const avgCostPerGram =
    goldPortfolio.totalGrams > 0
      ? Math.round(goldPortfolio.totalCostBasis / goldPortfolio.totalGrams)
      : 0;
  const unrealizedProfit = totalValuation - goldPortfolio.totalCostBasis;
  const unrealizedProfitPercent =
    goldPortfolio.totalCostBasis > 0
      ? ((unrealizedProfit / goldPortfolio.totalCostBasis) * 100).toFixed(2)
      : '0.00';

  // Buy form calculations
  const parsedBuyGrams = parseFloat(buyGrams.replace(',', '.')) || 0;
  const totalBuyCost = Math.round(parsedBuyGrams * buyPricePerGram);
  const selectedBuyAccount = accounts.find((a) => a.id === buyAccountId);
  const isBuyAccountBalanceSufficient = selectedBuyAccount
    ? selectedBuyAccount.balance >= totalBuyCost
    : false;

  // Sell form calculations
  const parsedSellGrams = parseFloat(sellGrams.replace(',', '.')) || 0;
  const totalSellReceived = Math.round(parsedSellGrams * sellPricePerGram);
  const sellModalPokok = Math.round(parsedSellGrams * avgCostPerGram);
  const sellEstimatedProfit = totalSellReceived - sellModalPokok;
  const sellEstimatedProfitPercent =
    sellModalPokok > 0 ? ((sellEstimatedProfit / sellModalPokok) * 100).toFixed(1) : '0.0';
  const isSellGramsValid = parsedSellGrams > 0 && parsedSellGrams <= goldPortfolio.totalGrams + 0.0001;

  // Handlers
  const handleOpenBuyModal = () => {
    setBuyPricePerGram(goldPortfolio.currentMarketPrice);
    setBuyAccountId(accounts[0]?.id || '');
    setBuyDate(new Date().toISOString().split('T')[0]);
    setIsBuyModalOpen(true);
  };

  const handleOpenSellModal = () => {
    if (goldPortfolio.totalGrams <= 0) {
      showNotification('error', 'Anda belum memiliki saldo emas untuk dijual.');
      return;
    }
    setSellPricePerGram(goldPortfolio.currentMarketPrice);
    setSellGrams(Math.min(1.0, goldPortfolio.totalGrams).toFixed(3));
    setSellAccountId(accounts[0]?.id || '');
    setSellDate(new Date().toISOString().split('T')[0]);
    setIsSellModalOpen(true);
  };

  const handleConfirmBuy = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedBuyGrams <= 0) {
      showNotification('error', 'Jumlah gram emas harus lebih dari 0');
      return;
    }
    if (!buyAccountId) {
      showNotification('error', 'Silakan pilih rekening bank sumber dana');
      return;
    }

    const res = buyGold({
      grams: parsedBuyGrams,
      pricePerGram: buyPricePerGram,
      accountId: buyAccountId,
      date: buyDate,
      notes: buyNotes,
    });

    if (res.success) {
      setIsBuyModalOpen(false);
      setBuyNotes('');
      showNotification(
        'success',
        `Berhasil membeli ${parsedBuyGrams.toFixed(3)} gram emas seharga ${formatRupiah(totalBuyCost)}. Saldo rekening telah dipotong secara realtime.`
      );
    } else {
      showNotification('error', res.error || 'Gagal melakukan pembelian emas.');
    }
  };

  const handleConfirmSell = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedSellGrams <= 0) {
      showNotification('error', 'Jumlah gram yang dijual harus lebih dari 0');
      return;
    }
    if (!isSellGramsValid) {
      showNotification(
        'error',
        `Saldo emas Anda tidak mencukupi (Tersedia: ${goldPortfolio.totalGrams.toFixed(3)}g)`
      );
      return;
    }
    if (!sellAccountId) {
      showNotification('error', 'Silakan pilih rekening bank penerima hasil jual');
      return;
    }

    const res = sellGold({
      grams: parsedSellGrams,
      pricePerGram: sellPricePerGram,
      accountId: sellAccountId,
      date: sellDate,
      notes: sellNotes,
    });

    if (res.success) {
      setIsSellModalOpen(false);
      setSellNotes('');
      const profitText =
        (res.realizedProfit || 0) >= 0
          ? `Laba: +${formatRupiah(res.realizedProfit || 0)}`
          : `Rugi: -${formatRupiah(Math.abs(res.realizedProfit || 0))}`;
      showNotification(
        'success',
        `Berhasil menjual ${parsedSellGrams.toFixed(3)} gram emas! Kas masuk ${formatRupiah(totalSellReceived)} telah ditambahkan ke rekening (${profitText}).`
      );
    } else {
      showNotification('error', res.error || 'Gagal memproses penjualan emas.');
    }
  };

  const handleSaveMarketPrice = () => {
    if (tempMarketPrice > 0) {
      updateGoldMarketPrice(tempMarketPrice);
      setIsPriceModalOpen(false);
      showNotification('success', `Harga acuan pasar diperbarui menjadi ${formatRupiah(tempMarketPrice)}/gram`);
    }
  };

  // Filtered transactions
  const filteredTransactions = goldTransactions.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAccount = tx.accountName?.toLowerCase().includes(q);
      const matchNotes = tx.notes?.toLowerCase().includes(q);
      const matchGrams = tx.grams.toString().includes(q);
      return matchAccount || matchNotes || matchGrams;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-16 right-4 z-50 p-4 rounded-2xl shadow-xl border flex items-center gap-3 max-w-md animate-in slide-in-from-top-4 duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-900/90 text-white border-emerald-700'
              : 'bg-rose-900/90 text-white border-rose-700'
          }`}
        >
          {notification.type === 'success' ? (
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <p className="text-xs font-medium leading-relaxed">{notification.message}</p>
          <button
            onClick={() => setNotification(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white shrink-0 ml-auto cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        icon={<Coins className="w-6 h-6 text-amber-300" />}
        title="Tabungan Emas Keluarga"
        subtitle="Kelola tabungan emas fisik/digital tahan inflasi, terhubung langsung dengan rekening bank Anda"
        gradientClass="from-amber-600 to-amber-900 text-white"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleOpenSellModal}
              disabled={goldPortfolio.totalGrams <= 0}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                goldPortfolio.totalGrams > 0
                  ? 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
              <span>Jual Emas</span>
            </button>
            <button
              onClick={handleOpenBuyModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-extrabold transition shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>Beli Emas Baru</span>
            </button>
          </div>
        }
      />

      {/* Benchmark Market Price Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0B2747] via-[#0E355C] to-[#124E5B] text-white shadow-sm border border-[#1E3A5F] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-teal-200 font-semibold">Harga Acuan Emas Hari Ini</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-medium border border-white/15">
                Dapat Diubah
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-mono text-xl sm:text-2xl font-black text-amber-300 tracking-tight">
                {formatRupiah(goldPortfolio.currentMarketPrice)}
              </span>
              <span className="text-xs text-slate-300">/ gram</span>
            </div>
            <p className="text-[11px] text-teal-100/80 mt-0.5">
              Estimasi Harga Buyback (Penjualan): ~{formatRupiah(Math.round(goldPortfolio.currentMarketPrice * 0.92))}/gram
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            onClick={() => {
              setTempMarketPrice(goldPortfolio.currentMarketPrice);
              setIsPriceModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-300" />
            <span>Ubah Acuan Pasar</span>
          </button>
        </div>
      </div>

      {/* Portfolio Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Grams */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Simpanan Emas
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#0B2747]">
              {goldPortfolio.totalGrams.toFixed(3)}
            </span>
            <span className="text-xs font-bold text-slate-600">gram</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Setara {(goldPortfolio.totalGrams * 1000).toFixed(0)} miligram emas murni 24K
          </p>
        </div>

        {/* Card 2: Market Valuation */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Nilai Pasar Terkini
          </span>
          <div className="font-mono text-xl sm:text-2xl font-extrabold text-[#0B2747] truncate">
            {formatRupiah(totalValuation)}
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            {goldPortfolio.totalGrams.toFixed(3)}g × {formatRupiah(goldPortfolio.currentMarketPrice)}
          </p>
        </div>

        {/* Card 3: Cost Basis & Average Buy Price */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Modal Pokok Tersimpan
          </span>
          <div className="font-mono text-xl sm:text-2xl font-extrabold text-slate-800 truncate">
            {formatRupiah(goldPortfolio.totalCostBasis)}
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            Rata-rata beli: <span className="font-mono font-bold">{formatRupiah(avgCostPerGram)}/g</span>
          </p>
        </div>

        {/* Card 4: Floating Gain/Loss */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Imbal Hasil Berjalan
          </span>
          <div className="flex items-center gap-1.5">
            {unrealizedProfit >= 0 ? (
              <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <TrendingDown className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span
              className={`font-mono text-xl sm:text-2xl font-extrabold truncate ${
                unrealizedProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {unrealizedProfit >= 0 ? '+' : ''}
              {formatRupiah(unrealizedProfit)}
            </span>
          </div>
          <p
            className={`text-[11px] font-bold ${
              unrealizedProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {unrealizedProfit >= 0 ? '+' : ''}
            {unrealizedProfitPercent}% dari modal pokok
          </p>
        </div>
      </div>

      {/* Realized Gains Summary Bar */}
      {goldPortfolio.realizedProfitTotal !== 0 && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700">
              Total Keuntungan Bersih yang Sudah Terealisasi (Pencairan Kas ke Rekening):
            </span>
          </div>
          <span className="font-mono font-extrabold text-sm text-emerald-700">
            +{formatRupiah(goldPortfolio.realizedProfitTotal)}
          </span>
        </div>
      )}

      {/* Transaction History Section */}
      <div className="card-bento p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h3 className="font-display font-bold text-base text-[#0B2747]">
              Riwayat Transaksi Emas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Mutasi pembelian (kas keluar) dan penjualan (kas masuk) tabungan emas
            </p>
          </div>

          {/* Filter Type Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({goldTransactions.length})
            </button>
            <button
              onClick={() => setFilterType('buy')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterType === 'buy' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Beli
            </button>
            <button
              onClick={() => setFilterType('sell')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterType === 'sell' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Jual
            </button>
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Coins className="w-12 h-12 text-slate-300 mx-auto stroke-[1.5]" />
            <p className="text-sm font-bold text-slate-700">Belum Ada Transaksi Emas</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Mulai tabung gram emas pertama Anda. Pembelian akan otomatis memotong saldo rekening bank dan menambah portofolio emas.
            </p>
            <button
              onClick={handleOpenBuyModal}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Beli Emas Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTransactions.map((tx) => {
              const isBuy = tx.type === 'buy';
              return (
                <div
                  key={tx.id}
                  className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Left: Icon & Description */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isBuy ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isBuy ? (
                        <ArrowDownRight className="w-5 h-5 text-amber-700" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-emerald-700" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            isBuy
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isBuy ? 'Beli Emas' : 'Jual Emas'}
                        </span>
                        <span className="font-mono font-bold text-xs text-slate-900">
                          {tx.grams.toFixed(3)} gram
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">{formatTanggal(tx.date)}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Rekening: <span className="font-semibold text-slate-800">{tx.accountName}</span> @{' '}
                        <span className="font-mono font-semibold">{formatRupiah(tx.pricePerGram)}/g</span>
                      </p>
                      {tx.notes && <p className="text-[11px] text-slate-400 mt-0.5 italic">{tx.notes}</p>}
                    </div>
                  </div>

                  {/* Right: Cash Flow & Profit Calculation */}
                  <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="font-mono font-extrabold text-sm sm:text-base text-slate-900">
                      {isBuy ? '-' : '+'}
                      {formatRupiah(tx.totalAmount)}
                    </div>
                    {!isBuy && tx.realizedProfit !== undefined && (
                      <div
                        className={`text-[11px] font-bold ${
                          tx.realizedProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {tx.realizedProfit >= 0 ? 'Laba: +' : 'Rugi: '}
                        {formatRupiah(tx.realizedProfit)} ({tx.realizedProfitPercent}%)
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400 block">
                      {isBuy ? 'Kas Rekening Berkurang' : 'Kas Rekening Bertambah'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. MODAL BELI EMAS                                        */}
      {/* ========================================================= */}
      {isBuyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 text-slate-800 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-[#0B2747]">Beli Tabungan Emas</h3>
                  <p className="text-[11px] text-slate-500">Uang diambil dari rekening bank, gram emas bertambah</p>
                </div>
              </div>
              <button
                onClick={() => setIsBuyModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBuy} className="mt-4 space-y-4">
              {/* Gram Input & Quick Buttons */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Jumlah Emas (Gram):</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    required
                    value={buyGrams}
                    onChange={(e) => setBuyGrams(e.target.value)}
                    placeholder="Contoh: 1.000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    gram
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {[0.5, 1.0, 2.0, 5.0, 10.0].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBuyGrams(preset.toFixed(3))}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                    >
                      +{preset}g
                    </button>
                  ))}
                </div>
              </div>

              {/* Price per Gram Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Harga Beli per Gram (Dapat Disesuaikan):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    Rp
                  </span>
                  <input
                    type="number"
                    step="1000"
                    min="100000"
                    required
                    value={buyPricePerGram}
                    onChange={(e) => setBuyPricePerGram(parseInt(e.target.value, 10) || 0)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Source Account Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Potong Dari Rekening Sumber Dana:
                </label>
                <select
                  value={buyAccountId}
                  onChange={(e) => setBuyAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} — Saldo: {formatRupiah(acc.balance)}
                    </option>
                  ))}
                </select>
                {selectedBuyAccount && (
                  <p
                    className={`text-[11px] ${
                      isBuyAccountBalanceSufficient ? 'text-emerald-600 font-medium' : 'text-rose-600 font-bold'
                    }`}
                  >
                    Saldo tersedia: {formatRupiah(selectedBuyAccount.balance)}
                    {!isBuyAccountBalanceSufficient && ' (Saldo tidak cukup untuk pembelian ini)'}
                  </p>
                )}
              </div>

              {/* Date & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Tanggal Transaksi:</label>
                  <input
                    type="date"
                    value={buyDate}
                    onChange={(e) => setBuyDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Catatan (Opsional):</label>
                  <input
                    type="text"
                    value={buyNotes}
                    onChange={(e) => setBuyNotes(e.target.value)}
                    placeholder="Contoh: Tabungan gaji bulanan"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Total Summary Preview Box */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
                  <span>Total Kas yang Akan Dipotong:</span>
                  <span className="font-mono text-base font-black text-amber-950">
                    {formatRupiah(totalBuyCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-amber-800/90 pt-1 border-t border-amber-200/80">
                  <span>Saldo Emas Baru:</span>
                  <span className="font-mono font-bold">
                    {(goldPortfolio.totalGrams + parsedBuyGrams).toFixed(3)} gram
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBuyModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!isBuyAccountBalanceSufficient || parsedBuyGrams <= 0}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-slate-950 font-extrabold text-xs transition shadow-md cursor-pointer disabled:cursor-not-allowed"
                >
                  Konfirmasi Pembelian Emas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MODAL JUAL EMAS                                        */}
      {/* ========================================================= */}
      {isSellModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 text-slate-800 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-[#0B2747]">Jual Tabungan Emas</h3>
                  <p className="text-[11px] text-slate-500">Gram emas berkurang, kas masuk sebagai pemasukan baru</p>
                </div>
              </div>
              <button
                onClick={() => setIsSellModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSell} className="mt-4 space-y-4">
              {/* Gram Input & Quick Percentage Buttons */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">Jumlah Emas yang Dijual:</label>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Tersedia: <strong className="font-mono text-slate-800">{goldPortfolio.totalGrams.toFixed(3)}g</strong>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    max={goldPortfolio.totalGrams}
                    required
                    value={sellGrams}
                    onChange={(e) => setSellGrams(e.target.value)}
                    placeholder="Contoh: 1.000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    gram
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {[0.25, 0.5, 0.75, 1.0].map((ratio) => {
                    const label = ratio === 1.0 ? '100% (Semua)' : `${ratio * 100}%`;
                    const gramVal = (goldPortfolio.totalGrams * ratio).toFixed(3);
                    return (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setSellGrams(gramVal)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                      >
                        {label} ({gramVal}g)
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price per Gram Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Harga Jual per Gram (Dapat Disesuaikan):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    Rp
                  </span>
                  <input
                    type="number"
                    step="1000"
                    min="100000"
                    required
                    value={sellPricePerGram}
                    onChange={(e) => setSellPricePerGram(parseInt(e.target.value, 10) || 0)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Destination Account */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Tujuan Masuk Kas Hasil Penjualan:
                </label>
                <select
                  value={sellAccountId}
                  onChange={(e) => setSellAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} — Saldo Sekarang: {formatRupiah(acc.balance)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Tanggal Penjualan:</label>
                  <input
                    type="date"
                    value={sellDate}
                    onChange={(e) => setSellDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Catatan:</label>
                  <input
                    type="text"
                    value={sellNotes}
                    onChange={(e) => setSellNotes(e.target.value)}
                    placeholder="Contoh: Pencairan untuk bayar cicilan"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Breakdown Laba / Rugi Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span>Kas Masuk ke Rekening Bank:</span>
                  <span className="font-mono text-base font-black text-emerald-950">
                    +{formatRupiah(totalSellReceived)}
                  </span>
                </div>
                <div className="space-y-1 pt-2 border-t border-emerald-200/80 text-[11px]">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Modal Pokok Dikurangi:</span>
                    <span className="font-mono font-semibold">{formatRupiah(sellModalPokok)}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold">
                    <span>Estimasi Laba/Rugi Bersih:</span>
                    <span
                      className={`font-mono ${
                        sellEstimatedProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {sellEstimatedProfit >= 0 ? '+' : ''}
                      {formatRupiah(sellEstimatedProfit)} ({sellEstimatedProfit >= 0 ? '+' : ''}
                      {sellEstimatedProfitPercent}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSellModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!isSellGramsValid}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold text-xs transition shadow-md cursor-pointer disabled:cursor-not-allowed"
                >
                  Konfirmasi Penjualan Emas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. MODAL UBAH HARGA ACUAN PASAR                           */}
      {/* ========================================================= */}
      {isPriceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 text-slate-800 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-600" />
                <h3 className="font-display font-bold text-sm text-[#0B2747]">
                  Ubah Harga Acuan Pasar
                </h3>
              </div>
              <button
                onClick={() => setIsPriceModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-500">
                Sesuaikan harga emas per gram saat ini (misal harga Antam atau Pegadaian hari ini). Valuasi portofolio Anda akan dihitung ulang secara realtime.
              </p>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Harga Acuan (Rp/Gram):</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    Rp
                  </span>
                  <input
                    type="number"
                    step="1000"
                    min="500000"
                    value={tempMarketPrice}
                    onChange={(e) => setTempMarketPrice(parseInt(e.target.value, 10) || 0)}
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 font-mono text-sm font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPriceModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveMarketPrice}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  Simpan Harga
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
