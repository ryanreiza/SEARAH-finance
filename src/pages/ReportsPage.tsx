import React, { useState, useEffect } from 'react';
import {
  PieChart as PieIcon,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { PageHeader } from '../components/common/PageHeader';
import { formatRupiah, formatBulanTahun } from '../utils/format';

export const ReportsPage: React.FC = () => {
  const {
    currentMonthKey,
    categories,
    transactions,
    totalIncomeCurrentMonth,
    totalExpenseCurrentMonth,
    cashflowCurrentMonth,
    savingsRateCurrentMonth,
    accounts,
    debts,
  } = useFinance();

  const [aiAdvice, setAiAdvice] = useState<any>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  // Filter current month transactions
  const currentMonthTransactions = transactions.filter((t) =>
    t.date.startsWith(currentMonthKey)
  );

  // Compute Budget vs Actual for BarChart
  const budgetVsActualData = categories
    .filter((c) => c.type === 'expense' && (c.monthlyBudget || 0) > 0)
    .map((c) => {
      const actual = currentMonthTransactions
        .filter((t) => t.type === 'expense' && t.categoryId === c.id)
        .reduce((sum, t) => sum + t.amount, 0);

      const budget = c.monthlyBudget || 0;
      const percent = Math.round((actual / budget) * 100);

      return {
        name: c.name.length > 12 ? `${c.name.substring(0, 10)}..` : c.name,
        fullName: c.name,
        Anggaran: budget,
        Aktual: actual,
        percent,
        color: c.color,
      };
    })
    .sort((a, b) => b.Aktual - a.Aktual);

  // Fetch AI Financial Health & Savings Optimization Advice
  const fetchAiAdvice = async () => {
    setIsLoadingAdvice(true);
    try {
      const response = await fetch('/api/ai/financial-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          financialData: {
            income: totalIncomeCurrentMonth,
            expense: totalExpenseCurrentMonth,
            savingsRate: savingsRateCurrentMonth,
            accountsCount: accounts.length,
            debtsCount: debts.length,
            categories: budgetVsActualData.map((d) => ({
              category: d.fullName,
              budget: d.Anggaran,
              spent: d.Aktual,
            })),
          },
        }),
      });

      const data = await response.json();
      if (data.analysis) {
        setAiAdvice(data.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  useEffect(() => {
    fetchAiAdvice();
  }, [currentMonthKey]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        icon={<PieIcon className="w-6 h-6 text-mint-brand" />}
        title="Laporan & Rekomendasi Penghematan"
        subtitle={`Analisis mendalam budget vs actual serta rekomendasi optimasi pengeluaran keluarga (${formatBulanTahun(currentMonthKey)})`}
        actions={
          <button
            onClick={fetchAiAdvice}
            disabled={isLoadingAdvice}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAdvice ? 'animate-spin' : ''}`} />
            <span>Perbarui Analisis AI</span>
          </button>
        }
      />

      {/* AI Financial Health & Savings Optimization Card */}
      <div className="card-bento p-6 sm:p-7 border-emerald-500/30 bg-gradient-to-br from-white to-emerald-50/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-navy-brand text-teal-brand flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-base text-slate-900">
                  Rekomendasi Cerdas SEARAH AI
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                  {aiAdvice?.healthStatus || 'Finansial Baik'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Satu Tujuan. Keuangan Lebih Terarah • Berdasarkan evaluasi arus kas keluarga bulan ini
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-2 bg-white px-4 py-2 rounded-2xl border border-stone-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold">Skor Kesehatan:</span>
            <span className="font-mono font-extrabold text-2xl text-emerald-700">
              {aiAdvice?.financialHealthScore || 85}/100
            </span>
          </div>
        </div>

        {/* Savings Opportunities */}
        <div className="mt-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Peluang Penghematan Pos Pengeluaran:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {aiAdvice?.savingsOpportunities && aiAdvice.savingsOpportunities.length > 0 ? (
              aiAdvice.savingsOpportunities.map((op: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{op.category}</span>
                      <span className="font-mono text-xs font-bold text-emerald-700">
                        Hemat ~{formatRupiah(op.potentialSavingMonthly)}/bln
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{op.tip}</p>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">Makanan & Minuman</span>
                      <span className="font-mono text-xs font-bold text-emerald-700">
                        Hemat ~Rp450.000/bln
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Batas pengeluaran kopi & jajan harian dapat dikurangi 1-2 kali seminggu untuk dialihkan ke tabungan.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">Belanja Harian & Dapur</span>
                      <span className="font-mono text-xs font-bold text-emerald-700">
                        Hemat ~Rp300.000/bln
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Belanja kebutuhan pokok dalam kemasan besar (bulk) saat promo awal bulan lebih hemat dibanding belanja eceran.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Budget vs Actual Comparison Chart */}
      <div className="card-bento p-6">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">
              Grafik Komparasi: Anggaran vs Realisasi per Kategori
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualisasi batas anggaran (biru navy) dibanding biaya yang telah keluar (merah/oranye)
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={budgetVsActualData}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            >
              <XAxis dataKey="name" fontSize={11} stroke="#64748b" tickLine={false} />
              <YAxis
                fontSize={10}
                stroke="#64748b"
                tickLine={false}
                tickFormatter={(v) => `${Math.round(v / 1000000)}jt`}
              />
              <Tooltip
                formatter={(val: any) => formatRupiah(Number(val))}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  color: '#fff',
                  border: '1px solid #334155',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Anggaran" fill="#1e293b" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Aktual" fill="#f87171" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progress Bar Detail List */}
      <div className="card-bento p-6 space-y-4">
        <h3 className="font-display font-bold text-sm text-slate-900 pb-2 border-b border-stone-200">
          Status Batas Anggaran & Progress Bar Berwarna
        </h3>

        <div className="space-y-4">
          {budgetVsActualData.map((item, idx) => {
            const isDanger = item.percent > 100;
            const isWarning = item.percent > 85 && item.percent <= 100;

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.fullName}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500">
                      {formatRupiah(item.Aktual)} / {formatRupiah(item.Anggaran)}
                    </span>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded-md text-[10px] ${
                        isDanger
                          ? 'bg-rose-100 text-rose-800'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.percent}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDanger
                        ? 'bg-rose-600'
                        : isWarning
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, item.percent)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
