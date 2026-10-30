import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Edit2,
  Check,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { PageHeader } from '../components/common/PageHeader';
import { formatRupiah, formatBulanTahun, parseRupiahInput } from '../utils/format';

export const MonthlySummaryPage: React.FC = () => {
  const {
    currentMonthKey,
    monthlyPlans,
    updateMonthlyPlan,
    categories,
    transactions,
    totalExpenseCurrentMonth,
  } = useFinance();

  const plan = monthlyPlans[currentMonthKey];
  const fixedExpenses = plan?.fixedExpenses || [];
  const autoCalculatedExpected = fixedExpenses.reduce((sum, e) => sum + e.expectedAmount, 0) + 7500000; // base monthly variable needs

  const expectedAmount = plan?.expectedTotalExpenseOverride !== undefined
    ? plan.expectedTotalExpenseOverride
    : autoCalculatedExpected;

  const [isEditingOverride, setIsEditingOverride] = useState(false);
  const [overrideValue, setOverrideValue] = useState(expectedAmount);

  const variance = expectedAmount - totalExpenseCurrentMonth;
  const isSurplus = variance >= 0;

  // Breakdown by category
  const currentMonthTransactions = transactions.filter((t) =>
    t.date.startsWith(currentMonthKey)
  );

  const categoryComparison = categories
    .filter((c) => c.type === 'expense')
    .map((cat) => {
      const actual = currentMonthTransactions
        .filter((t) => t.type === 'expense' && t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);

      // Expected amount derived from monthly budget or fixed expenses in this category
      const fixedInCat = fixedExpenses
        .filter((f) => f.categoryId === cat.id)
        .reduce((sum, f) => sum + f.expectedAmount, 0);

      const expected = cat.monthlyBudget || (fixedInCat > 0 ? fixedInCat : 500000);
      const diff = expected - actual;
      const percent = Math.round((actual / (expected || 1)) * 100);

      return {
        cat,
        expected,
        actual,
        diff,
        percent,
      };
    })
    .sort((a, b) => b.actual - a.actual);

  const handleSaveOverride = () => {
    updateMonthlyPlan(currentMonthKey, {
      expectedTotalExpenseOverride: overrideValue,
    });
    setIsEditingOverride(false);
  };

  const handleResetToAuto = () => {
    updateMonthlyPlan(currentMonthKey, {
      expectedTotalExpenseOverride: undefined,
    });
    setOverrideValue(autoCalculatedExpected);
    setIsEditingOverride(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        icon={<FileSpreadsheet className="w-6 h-6 text-mint-brand" />}
        title="Ringkasan Pengeluaran Bulanan"
        subtitle={`Komparasi pengeluaran yang diharapkan vs realisasi aktual (${formatBulanTahun(currentMonthKey)})`}
      />

      {/* Hero Comparison Card */}
      <div className="card-bento p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Expected */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Yang Diharapkan (Expected)
              </span>
              {!isEditingOverride ? (
                <button
                  onClick={() => {
                    setOverrideValue(expectedAmount);
                    setIsEditingOverride(true);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  Override Manual
                </button>
              ) : null}
            </div>

            {isEditingOverride ? (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={overrideValue.toLocaleString('id-ID')}
                  onChange={(e) => setOverrideValue(parseRupiahInput(e.target.value))}
                  className="w-36 px-2.5 py-1.5 rounded-xl border border-stone-300 font-mono text-sm font-bold"
                />
                <button
                  onClick={handleSaveOverride}
                  className="p-1.5 bg-slate-900 text-white rounded-lg"
                  title="Simpan"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleResetToAuto}
                  className="p-1.5 bg-stone-200 text-slate-700 rounded-lg text-xs"
                  title="Kembalikan Otomatis"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="font-mono font-extrabold text-2xl sm:text-3xl text-slate-900">
                {formatRupiah(expectedAmount)}
              </p>
            )}

            <p className="text-[11px] text-slate-500">
              {plan?.expectedTotalExpenseOverride !== undefined
                ? '⚡ Menggunakan nilai override manual pengguna'
                : '✨ Terisi otomatis dari Target Bulanan & kewajiban tetap'}
            </p>
          </div>

          {/* Actual */}
          <div className="space-y-1 border-t md:border-t-0 md:border-l border-stone-200 pt-4 md:pt-0 md:pl-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Realisasi Aktual Terjadi
            </span>
            <p className="font-mono font-extrabold text-2xl sm:text-3xl text-rose-600">
              {formatRupiah(totalExpenseCurrentMonth)}
            </p>
            <p className="text-[11px] text-slate-500">
              Total pengeluaran tercatat dari transaksi bulan ini
            </p>
          </div>

          {/* Variance */}
          <div className="space-y-1 border-t md:border-t-0 md:border-l border-stone-200 pt-4 md:pt-0 md:pl-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Status Selisih (Variance)
            </span>
            <div className="flex items-center gap-2">
              <p
                className={`font-mono font-extrabold text-2xl sm:text-3xl ${
                  isSurplus ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {formatRupiah(Math.abs(variance))}
              </p>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  isSurplus
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isSurplus ? 'Hemat' : 'Over'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {isSurplus
                ? '🎉 Pengeluaran masih berada di bawah ekspektasi bulanan'
                : '⚠️ Pengeluaran melampaui estimasi yang diharapkan'}
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Detail Table */}
      <div className="card-bento overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <h3 className="font-display font-bold text-sm text-slate-900">
            Perincian Komparasi per Kategori Pengeluaran
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {categoryComparison.length} Kategori Terpantau
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-stone-100/80 text-slate-700 font-bold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Yang Diharapkan</th>
                <th className="py-3 px-4 text-right">Aktual Terjadi</th>
                <th className="py-3 px-4 text-right">Selisih</th>
                <th className="py-3 px-4 text-center w-36">Rasio & Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {categoryComparison.map(({ cat, expected, actual, diff, percent }) => {
                const isOver = diff < 0;

                return (
                  <tr key={cat.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span>{cat.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                      {formatRupiah(expected)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(actual)}
                    </td>
                    <td
                      className={`py-3.5 px-4 text-right font-mono font-bold ${
                        isOver ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      {isOver ? `-${formatRupiah(Math.abs(diff))}` : `+${formatRupiah(diff)}`}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono font-semibold">
                          <span className={percent > 100 ? 'text-rose-600' : 'text-slate-600'}>
                            {percent}%
                          </span>
                          <span className={isOver ? 'text-rose-600' : 'text-emerald-700'}>
                            {isOver ? 'Melebihi' : 'Aman'}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              percent > 100
                                ? 'bg-rose-500'
                                : percent > 85
                                ? 'bg-amber-500'
                                : 'bg-emerald-600'
                            }`}
                            style={{ width: `${Math.min(100, percent)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
