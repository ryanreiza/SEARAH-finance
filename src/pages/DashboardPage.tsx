import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Scale,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Camera,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah } from '../utils/format';
import { SearahLambdaA, SearahBrandLogotype } from '../components/common/SearahLogo';

interface DashboardPageProps {
  onOpenQuickInput: (initialTab?: 'chat' | 'voice' | 'camera' | 'manual') => void;
  onNavigate: (tabId: string) => void;
  onOpenMigration: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenQuickInput,
  onNavigate,
  onOpenMigration,
}) => {
  const {
    totalNetWorth,
    totalIncomeCurrentMonth,
    totalExpenseCurrentMonth,
    cashflowCurrentMonth,
    savingsRateCurrentMonth,
    savingsGoals,
    debts,
    categories,
    transactions,
    currentMonthKey,
    billReminders,
  } = useFinance();

  // Generate 6-month historical cashflow data for AreaChart
  const getSixMonthCashflow = () => {
    const months = [];
    const [curYear, curMonth] = currentMonthKey.split('-').map(Number);

    for (let i = 5; i >= 0; i--) {
      const d = new Date(curYear, curMonth - 1 - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthName = d.toLocaleDateString('id-ID', { month: 'short' });

      const mTransactions = transactions.filter((t) => t.date.startsWith(key));
      const income = mTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = mTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      months.push({
        name: monthName,
        income: income || (i === 0 ? totalIncomeCurrentMonth : 17000000 + (5 - i) * 800000),
        expense: expense || (i === 0 ? totalExpenseCurrentMonth : 11000000 + (5 - i) * 600000),
        cashflow: (income || 17000000) - (expense || 11000000),
      });
    }
    return months;
  };

  const cashflowData = getSixMonthCashflow();

  // Expense composition for Donut chart
  const currentMonthTransactions = transactions.filter((t) =>
    t.date.startsWith(currentMonthKey)
  );

  const expenseBreakdown = categories
    .filter((c) => c.type === 'expense')
    .map((cat) => {
      const total = currentMonthTransactions
        .filter((t) => t.type === 'expense' && t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        name: cat.name,
        value: total,
        color: cat.color || '#3b82f6',
      };
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  // If no expenses yet this month, show fallback demo slices
  const chartData = expenseBreakdown.length > 0 ? expenseBreakdown : [
    { name: 'Kebutuhan Pokok', value: 5500000, color: '#EA580C' },
    { name: 'Cicilan KPR', value: 3200000, color: '#9333EA' },
    { name: 'Belanja Dapur', value: 2400000, color: '#D97706' },
    { name: 'Pendidikan', value: 1650000, color: '#7C3AED' },
    { name: 'Transportasi', value: 900000, color: '#4F46E5' },
  ];

  // Debt statistics
  const activeDebts = debts.filter((d) => d.type === 'debt' && d.status === 'active');
  const totalDebtOriginal = activeDebts.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalDebtRemaining = activeDebts.reduce((sum, d) => sum + d.remainingAmount, 0);
  const debtProgressPercent =
    totalDebtOriginal > 0
      ? Math.round(((totalDebtOriginal - totalDebtRemaining) / totalDebtOriginal) * 100)
      : 100;

  // Savings goals overview
  const totalSavingsTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSavingsCurrent = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const savingsProgressPercent =
    totalSavingsTarget > 0
      ? Math.round((totalSavingsCurrent / totalSavingsTarget) * 100)
      : 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* SEARAH Brand Greeting Banner as shown in Brand Guide */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0B2747] via-[#0D3B66] to-[#0A4D5C] text-white shadow-md relative overflow-hidden border border-[#1E3A5F]">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse" />
            <SearahBrandLogotype size="xs" variant="monochrome-white" showSubtitle={true} />
          </div>
          <h1 className="font-display font-extrabold text-xl sm:text-3xl tracking-tight text-white mt-1">
            Halo, Ayah & Ibu
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 font-medium">
            Mari wujudkan rencana keuangan keluarga — <span className="text-teal-300 font-semibold italic">"Satu Tujuan. Keuangan Lebih Terarah."</span>
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onOpenQuickInput('chat')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#14B8A6] hover:bg-teal-500 text-[#071A30] font-bold text-xs transition flex items-center justify-center gap-2 shadow-glow-teal cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#071A30]" />
            <span>Catat Transaksi AI</span>
          </button>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#14B8A6]/25 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Bento Grid Top: Hero Balance Card + Arus Kas Bulan Ini */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Hero Card: Net Worth & 6-Month Cashflow Trend (2 cols) */}
        <div className="lg:col-span-2 card-hero p-4 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-teal-300 font-bold flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-[#14B8A6]" />
                Total Kekayaan Bersih
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-teal-200 text-[11px] font-semibold backdrop-blur-xs border border-white/10 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#14B8A6]" />
                Real-Time SEARAH
              </span>
            </div>

            <div className="mt-2 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
              <h2 className="font-mono font-extrabold text-2xl sm:text-4xl text-white tracking-tight break-all">
                {formatRupiah(totalNetWorth)}
              </h2>
              <span className="text-xs text-white/75 font-medium">
                di seluruh rekening & dompet digital
              </span>
            </div>
          </div>

          {/* 6-Month AreaChart */}
          <div className="mt-5 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-white/80 mb-2">
              <span className="font-semibold text-[11px] sm:text-xs">Tren Arus Kas 6 Bulan</span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Masuk
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400" /> Keluar
                </span>
              </div>
            </div>

            <div className="h-36 sm:h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashflowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="heroIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="heroExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${Math.round(v / 1000000)}jt`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      border: '1px solid #334155',
                      fontSize: '12px',
                      color: '#f8fafc',
                    }}
                    formatter={(val: any) => [formatRupiah(Number(val)), '']}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#34d399"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#heroIncomeGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#f87171"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#heroExpenseGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Card Metric: Arus Kas Bulan Ini (1 col) */}
        <div className="card-bento p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <span className="font-display font-bold text-sm text-slate-800">
              Arus Kas Bulan Ini
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                cashflowCurrentMonth >= 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {cashflowCurrentMonth >= 0 ? 'Surplus Finansial' : 'Defisit'}
            </span>
          </div>

          <div className="my-4 space-y-4">
            <div>
              <p className="text-xs text-slate-500">Selisih Bersih (Net Cashflow)</p>
              <p
                className={`font-mono font-bold text-2xl mt-0.5 ${
                  cashflowCurrentMonth >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {formatRupiah(cashflowCurrentMonth)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                  <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" /> Pemasukan
                </span>
                <p className="font-mono font-bold text-sm text-slate-900 mt-1">
                  {formatRupiah(totalIncomeCurrentMonth)}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100">
                <span className="text-[11px] font-semibold text-rose-800 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" /> Pengeluaran
                </span>
                <p className="font-mono font-bold text-sm text-slate-900 mt-1">
                  {formatRupiah(totalExpenseCurrentMonth)}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Catat Bar */}
          <div className="pt-3 border-t border-stone-200 flex gap-2">
            <button
              onClick={() => onOpenQuickInput('chat')}
              className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-mint-brand" />
              Catat Cepat
            </button>
            <button
              onClick={() => onOpenQuickInput('camera')}
              className="px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              title="Foto Struk & OCR"
            >
              <Camera className="w-3.5 h-3.5 text-blue-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Bento Grid Middle: Donat Pengeluaran, Tingkat Menabung, Progress Utang */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Donat Komposisi Pengeluaran */}
        <div className="card-bento p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <span className="font-display font-bold text-sm text-slate-800">
              Komposisi Pengeluaran
            </span>
            <button
              onClick={() => onNavigate('categories')}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              Kategori
            </button>
          </div>

          <div className="h-44 relative my-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => formatRupiah(Number(val))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
              <p className="font-mono font-bold text-xs text-slate-800">
                {formatRupiah(totalExpenseCurrentMonth)}
              </p>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-stone-200 text-xs">
            {chartData.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 truncate max-w-[150px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-mono font-semibold text-slate-900">
                  {formatRupiah(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Tingkat Menabung (Savings Rate) */}
        <div className="card-bento p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <span className="font-display font-bold text-sm text-slate-800">
              Tingkat Menabung
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Target: 20%+
            </span>
          </div>

          <div className="my-auto py-3 text-center space-y-2">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-emerald-500/20 bg-emerald-50/50">
              <span className="font-mono font-extrabold text-3xl text-emerald-800">
                {savingsRateCurrentMonth}%
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-700">
              {savingsRateCurrentMonth >= 20
                ? '🏆 Luar biasa! Alokasi tabungan sehat di atas standar'
                : '💡 Terus tingkatkan porsi tabungan dari pemasukan'}
            </p>
            <p className="text-[11px] text-slate-500">
              Disisihkan dari pemasukan bersih bulan ini
            </p>
          </div>

          <button
            onClick={() => onNavigate('savings')}
            className="w-full py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-slate-800 text-xs font-semibold transition cursor-pointer"
          >
            Lihat Target Tabungan
          </button>
        </div>

        {/* 3. Progress Utang & Kewajiban */}
        <div className="card-bento p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <span className="font-display font-bold text-sm text-slate-800">
              Progress Pelunasan Utang
            </span>
            <span className="text-xs font-mono font-bold text-slate-600">
              {debtProgressPercent}% Lunas
            </span>
          </div>

          <div className="my-auto py-3 space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium text-slate-600">
                <span>Sisa Kewajiban Pokok</span>
                <span className="font-mono font-bold text-rose-700">
                  {formatRupiah(totalDebtRemaining)}
                </span>
              </div>
              <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, debtProgressPercent))}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">
                {activeDebts.length > 0 ? activeDebts[0].title : 'Tidak ada utang aktif'}
              </p>
              {activeDebts.length > 0 && (
                <p className="text-[11px]">
                  Cicilan: {formatRupiah(activeDebts[0].monthlyInstallment || 0)}/bln (Jatuh tempo: {activeDebts[0].dueDate || 'Tgl 10'})
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('debts')}
            className="w-full py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-slate-800 text-xs font-semibold transition cursor-pointer"
          >
            Kelola Utang & Piutang
          </button>
        </div>
      </div>

      {/* Bento Grid Bottom: Target Tabungan & Aksi Cepat Finansial */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Target Tabungan (2 cols) */}
        <div className="lg:col-span-2 card-bento p-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-emerald-600" />
              <h3 className="font-display font-bold text-sm text-slate-800">
                Target Tabungan & Dana Impian ({savingsGoals.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('savings')}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
            >
              Lihat Semua
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savingsGoals.slice(0, 2).map((goal) => {
              const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              return (
                <div key={goal.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-slate-900 truncate">{goal.name}</p>
                    <span className="font-mono text-xs font-bold text-emerald-700">{percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{formatRupiah(goal.currentAmount)}</span>
                    <span>Target: {formatRupiah(goal.targetAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions (1 col) */}
        <div className="card-bento p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <span className="font-display font-bold text-sm text-slate-800">
              Aksi Cepat Finansial
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 my-3">
            <button
              onClick={() => onOpenQuickInput('chat')}
              className="p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-left transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
                <Receipt className="w-4 h-4" />
              </div>
              <p className="font-bold text-xs text-slate-900">Chat WA</p>
              <p className="text-[10px] text-slate-500">Catat santai</p>
            </button>

            <button
              onClick={() => onOpenQuickInput('camera')}
              className="p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-left transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-2">
                <Camera className="w-4 h-4" />
              </div>
              <p className="font-bold text-xs text-slate-900">Foto Struk</p>
              <p className="text-[10px] text-slate-500">OCR AI otomatis</p>
            </button>

            <button
              onClick={() => onNavigate('ai-assistant')}
              className="p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-left transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-2">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="font-bold text-xs text-slate-900">Tanya AI</p>
              <p className="text-[10px] text-slate-500">Saran hemat</p>
            </button>

            <button
              onClick={onOpenMigration}
              className="p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-left transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <p className="font-bold text-xs text-slate-900">Migrasi Data</p>
              <p className="text-[10px] text-slate-500">Dari app lain</p>
            </button>
          </div>

          <div className="pt-2 text-center">
            <span className="text-[11px] text-slate-400">
              Satu Tujuan. Keuangan Lebih Terarah.
            </span>
          </div>
        </div>
      </div>

      {/* Nilai Merek SEARAH: Modern, Terpercaya, Berkelanjutan, Kolaboratif */}
      <div className="card-bento p-6 bg-gradient-to-br from-white to-[#F8FAFC]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-2">
          <div>
            <h3 className="font-display font-extrabold text-sm text-[#0B2747] tracking-tight">
              Pilar & Nilai Finansial Keluarga SEARAH
            </h3>
            <p className="text-xs text-slate-500">
              Prinsip pengelolaan keuangan keluarga harmonis dan terarah
            </p>
          </div>
          <span className="text-xs font-bold text-[#14B8A6] uppercase tracking-wider">
            Dua Jalan, Satu Arah
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#14B8A6] flex items-center justify-center font-bold text-xs">
              ✦
            </div>
            <h4 className="font-bold text-xs text-[#0B2747]">Modern</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Tampil relevan dan up-to-date di era digital dengan otomatisasi cerdas AI.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0B2747] flex items-center justify-center font-bold text-xs">
              🛡️
            </div>
            <h4 className="font-bold text-xs text-[#0B2747]">Terpercaya</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Keamanan data dan transparansi anggaran keluarga adalah prioritas utama.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
              🌱
            </div>
            <h4 className="font-bold text-xs text-[#0B2747]">Berkelanjutan</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Mendampingi keluarga dalam jangka panjang dari dana darurat hingga pensiun.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
              🤝
            </div>
            <h4 className="font-bold text-xs text-[#0B2747]">Kolaboratif</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Karena keuangan adalah perjalanan bersama: menyatukan tujuan, saling melengkapi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
