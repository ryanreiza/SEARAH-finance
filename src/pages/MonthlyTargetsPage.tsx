import React, { useState } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  Copy,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  PieChart,
  X,
  Trash2,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { PageHeader } from '../components/common/PageHeader';
import { BadgeStatus } from '../components/common/BadgeStatus';
import { formatRupiah, formatBulanTahun, parseRupiahInput } from '../utils/format';
import { FixedExpenseTarget, AllocationStatus } from '../types';

export const MonthlyTargetsPage: React.FC = () => {
  const {
    currentMonthKey,
    monthlyPlans,
    updateMonthlyPlan,
    toggleFixedExpense,
    copyPlanFromPreviousMonth,
    categories,
    totalIncomeCurrentMonth,
    totalExpenseCurrentMonth,
  } = useFinance();

  const plan = monthlyPlans[currentMonthKey] || {
    monthKey: currentMonthKey,
    targetIncome: 20000000,
    fixedExpenses: [],
    allocations: [
      { id: '1', name: 'Kebutuhan Pokok (50%)', percentage: 50, targetAmount: 10000000, spentAmount: 6500000, status: 'in_progress' },
      { id: '2', name: 'Keinginan & Gaya Hidup (30%)', percentage: 30, targetAmount: 6000000, spentAmount: 2100000, status: 'in_progress' },
      { id: '3', name: 'Tabungan & Investasi (20%)', percentage: 20, targetAmount: 4000000, spentAmount: 3500000, status: 'approaching_limit' },
    ],
  };

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [copySuccessToast, setCopySuccessToast] = useState(false);

  // New fixed expense form
  const [newExpense, setNewExpense] = useState({
    title: '',
    expectedAmount: 500000,
    categoryId: categories[0]?.id || '',
    dueDateDay: 10,
    notes: '',
  });

  const fixedExpenses = plan.fixedExpenses || [];
  const completedFixedCount = fixedExpenses.filter((e) => e.isCompleted).length;
  const totalFixedAmount = fixedExpenses.reduce((sum, e) => sum + e.expectedAmount, 0);
  const completedFixedAmount = fixedExpenses
    .filter((e) => e.isCompleted)
    .reduce((sum, e) => sum + e.expectedAmount, 0);

  const handleCopyFromPrevious = () => {
    copyPlanFromPreviousMonth(currentMonthKey);
    setCopySuccessToast(true);
    setTimeout(() => setCopySuccessToast(false), 3000);
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.title.trim()) return;

    const newTarget: FixedExpenseTarget = {
      id: `fe_${Date.now()}`,
      title: newExpense.title.trim(),
      expectedAmount: newExpense.expectedAmount,
      categoryId: newExpense.categoryId,
      dueDateDay: newExpense.dueDateDay,
      isCompleted: false,
      notes: newExpense.notes,
    };

    updateMonthlyPlan(currentMonthKey, {
      fixedExpenses: [...fixedExpenses, newTarget],
    });

    setIsAddExpenseOpen(false);
    setNewExpense({
      title: '',
      expectedAmount: 500000,
      categoryId: categories[0]?.id || '',
      dueDateDay: 10,
      notes: '',
    });
  };

  const handleDeleteExpense = (id: string) => {
    updateMonthlyPlan(currentMonthKey, {
      fixedExpenses: fixedExpenses.filter((e) => e.id !== id),
    });
  };

  // Compute allocation status dynamically based on current spent
  const getAllocationStatus = (spent: number, target: number): AllocationStatus => {
    if (target <= 0) return 'in_progress';
    const ratio = spent / target;
    if (ratio >= 1.05) return 'exceeded'; // Melebihi target
    if (ratio >= 0.85) return 'approaching_limit'; // Mendekati batas
    if (ratio >= 0.5) return 'in_progress'; // Sedang proses
    return 'in_progress';
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        icon={<Target className="w-6 h-6 text-mint-brand" />}
        title="Target Bulanan & Alokasi"
        subtitle={`Perencanaan target pemasukan, checklist pengeluaran tetap, dan alokasi 50/30/20 (${formatBulanTahun(currentMonthKey)})`}
        actions={
          <>
            <button
              onClick={handleCopyFromPrevious}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
              title="Salin list dari bulan lalu"
            >
              <Copy className="w-4 h-4 text-slate-600" />
              <span>Salin dari Bulan Lalu</span>
            </button>
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 text-mint-brand" />
              <span>Tambah Pengeluaran Tetap</span>
            </button>
          </>
        }
      />

      {copySuccessToast && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Rencana dan daftar pengeluaran tetap berhasil disalin dari bulan sebelumnya!</span>
        </div>
      )}

      {/* Target Pemasukan Bulanan Hero Metric */}
      <div className="card-bento p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Target Pemasukan Bulan Ini
            </span>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="font-mono font-extrabold text-2xl sm:text-3xl text-slate-900">
                {formatRupiah(plan.targetIncome)}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Realisasi: <strong className="font-mono text-emerald-700">{formatRupiah(totalIncomeCurrentMonth)}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Ubah Target:</span>
            <input
              type="text"
              value={plan.targetIncome.toLocaleString('id-ID')}
              onChange={(e) => {
                const val = parseRupiahInput(e.target.value);
                updateMonthlyPlan(currentMonthKey, { targetIncome: val });
              }}
              className="w-36 px-3 py-1.5 rounded-xl border border-stone-300 font-mono text-xs font-bold text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Target Alokasi Keuangan (4 Status Badge) */}
      <div className="card-bento p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">
              Target Alokasi Keuangan (Pola 50 / 30 / 20)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Standar perbankan keluarga: 50% Kebutuhan, 30% Keinginan, 20% Tabungan/Investasi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plan.allocations.map((alloc) => {
            const dynamicStatus = getAllocationStatus(alloc.spentAmount, alloc.targetAmount);
            const percent = Math.min(100, Math.round((alloc.spentAmount / alloc.targetAmount) * 100));

            return (
              <div
                key={alloc.id}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-display font-bold text-xs text-slate-900">
                    {alloc.name}
                  </h4>
                  <BadgeStatus status={dynamicStatus} />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500">Terpakai:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatRupiah(alloc.spentAmount)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        dynamicStatus === 'exceeded'
                          ? 'bg-rose-500'
                          : dynamicStatus === 'approaching_limit'
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Target: {formatRupiah(alloc.targetAmount)}</span>
                    <span>{percent}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pengeluaran Tetap Bulanan Checklist ("Sudah Dilakukan") */}
      <div className="card-bento p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">
              Pengeluaran Tetap Bulanan (Checklist Rutin)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tandai jika sudah dilakukan / dibayar agar tidak terlewat
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600">
              Sudah Dilakukan: <strong className="text-emerald-700">{completedFixedCount}</strong> / {fixedExpenses.length}
            </span>
            <div className="text-xs font-mono font-bold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
              {formatRupiah(completedFixedAmount)} / {formatRupiah(totalFixedAmount)}
            </div>
          </div>
        </div>

        {fixedExpenses.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <p className="text-xs font-semibold">Belum ada pengeluaran tetap yang dibuat.</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Tambahkan cicilan KPR, SPP, listrik, WiFi, atau gunakan tombol "Salin dari Bulan Lalu".
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {fixedExpenses.map((expense) => (
              <div
                key={expense.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-stone-50/80 px-2 rounded-xl transition"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={expense.isCompleted}
                    onChange={() => toggleFixedExpense(currentMonthKey, expense.id)}
                    className="w-5 h-5 rounded-lg text-emerald-600 focus:ring-emerald-500 border-stone-300 cursor-pointer"
                  />
                  <div>
                    <p
                      className={`text-xs sm:text-sm font-bold ${
                        expense.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {expense.title}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>Jatuh tempo: Tanggal {expense.dueDateDay}</span>
                      {expense.isCompleted && expense.completedDate && (
                        <span className="text-emerald-700 font-semibold">
                          • Selesai ({expense.completedDate})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono font-bold text-xs sm:text-sm ${
                      expense.isCompleted ? 'text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {formatRupiah(expense.expectedAmount)}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="p-1 text-slate-300 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Add Fixed Expense */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-display font-bold text-base text-slate-900">
                Tambah Pengeluaran Tetap Bulanan
              </h3>
              <button
                onClick={() => setIsAddExpenseOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Kewajiban Tetap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Cicilan KPR, Listrik PLN, SPP Sekolah"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimasi Nominal (Rp)</label>
                <input
                  type="text"
                  required
                  value={newExpense.expectedAmount ? newExpense.expectedAmount.toLocaleString('id-ID') : ''}
                  onChange={(e) => setNewExpense({ ...newExpense, expectedAmount: parseRupiahInput(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={newExpense.categoryId}
                    onChange={(e) => setNewExpense({ ...newExpense, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jatuh Tempo (Tgl 1-31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={newExpense.dueDateDay}
                    onChange={(e) => setNewExpense({ ...newExpense, dueDateDay: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Nomor pelanggan, nama rekening autodebet..."
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                >
                  Simpan ke Rencana
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
