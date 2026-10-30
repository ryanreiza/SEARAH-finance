import React, { useState } from 'react';
import {
  PiggyBank,
  Plus,
  Target,
  Calendar,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { PageHeader } from '../components/common/PageHeader';
import { formatRupiah, formatTanggal, parseRupiahInput } from '../utils/format';
import { SavingsGoal } from '../types';

export const SavingsPage: React.FC = () => {
  const {
    savingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    adjustSavingsAmount,
    accounts,
  } = useFinance();

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [adjustGoal, setAdjustGoal] = useState<SavingsGoal | null>(null);
  const [adjustType, setAdjustType] = useState<'deposit' | 'withdraw'>('deposit');
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [selectedAccId, setSelectedAccId] = useState(accounts[0]?.id || '');

  // Add goal form
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: 10000000,
    currentAmount: 0,
    targetDate: '2027-12-31',
    color: '#25B18B',
    icon: 'PiggyBank',
    notes: '',
  });

  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalAccumulated = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalPercent = totalTarget > 0 ? Math.round((totalAccumulated / totalTarget) * 100) : 0;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name.trim()) return;

    addSavingsGoal({
      ...newGoal,
      accountId: accounts[0]?.id,
    });

    setIsAddOpen(false);
    setNewGoal({
      name: '',
      targetAmount: 10000000,
      currentAmount: 0,
      targetDate: '2027-12-31',
      color: '#25B18B',
      icon: 'PiggyBank',
      notes: '',
    });
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustGoal || adjustAmount <= 0) return;

    const delta = adjustType === 'deposit' ? adjustAmount : -adjustAmount;
    adjustSavingsAmount(adjustGoal.id, delta, selectedAccId);

    setAdjustGoal(null);
    setAdjustAmount(0);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        icon={<PiggyBank className="w-6 h-6 text-mint-brand" />}
        title="Tabungan & Dana Impian"
        subtitle="Rencanakan dan kumpulkan dana darurat, liburan, pendidikan, dan masa depan keluarga"
        actions={
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 text-mint-brand" />
            <span>Target Impian Baru</span>
          </button>
        }
      />

      {/* Hero Overview */}
      <div className="card-hero p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-white/70 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-mint-brand" />
              Total Tabungan Terkumpul
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <h2 className="font-mono font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                {formatRupiah(totalAccumulated)}
              </h2>
              <span className="text-xs text-white/75 font-medium">
                dari target {formatRupiah(totalTarget)}
              </span>
            </div>
          </div>

          <div className="text-right sm:text-right">
            <span className="font-mono font-extrabold text-3xl sm:text-4xl text-mint-brand">
              {totalPercent}%
            </span>
            <p className="text-xs text-white/70 mt-0.5">Tercapai Secara Kumulatif</p>
          </div>
        </div>

        <div className="mt-6 w-full h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, Math.max(3, totalPercent))}%` }}
          />
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {savingsGoals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const isCompleted = goal.currentAmount >= goal.targetAmount;

          return (
            <div
              key={goal.id}
              className="card-bento p-5 flex flex-col justify-between space-y-4 hover:border-slate-400 transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs font-bold"
                      style={{ backgroundColor: goal.color || '#25B18B' }}
                    >
                      <PiggyBank className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-slate-900 leading-tight">
                        {goal.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        Target: {formatTanggal(goal.targetDate)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteSavingsGoal(goal.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="font-mono font-extrabold text-xl text-slate-900">
                      {formatRupiah(goal.currentAmount)}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        isCompleted ? 'text-emerald-600' : 'text-slate-600'
                      }`}
                    >
                      {percent}%
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>Kurang: {formatRupiah(remaining)}</span>
                    <span>Target: {formatRupiah(goal.targetAmount)}</span>
                  </div>
                </div>

                {goal.notes && (
                  <p className="text-[11px] text-slate-600 italic bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 mt-3">
                    "{goal.notes}"
                  </p>
                )}
              </div>

              {/* Actions: Setor & Tarik */}
              <div className="pt-3 border-t border-stone-200 flex items-center gap-2">
                <button
                  onClick={() => {
                    setAdjustGoal(goal);
                    setAdjustType('deposit');
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5 text-mint-brand" />
                  Setor Dana
                </button>
                <button
                  onClick={() => {
                    setAdjustGoal(goal);
                    setAdjustType('withdraw');
                  }}
                  className="px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Tarik Dana Tabungan"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Tarik
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-display font-bold text-base text-slate-900">
                Buat Target Tabungan Baru
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Impian</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: DP Rumah, Dana Darurat, Umroh"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Nominal (Rp)</label>
                <input
                  type="text"
                  required
                  value={newGoal.targetAmount ? newGoal.targetAmount.toLocaleString('id-ID') : ''}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: parseRupiahInput(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Saldo Awal (Rp)</label>
                  <input
                    type="text"
                    value={newGoal.currentAmount ? newGoal.currentAmount.toLocaleString('id-ID') : ''}
                    onChange={(e) => setNewGoal({ ...newGoal, currentAmount: parseRupiahInput(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Tanggal</label>
                  <input
                    type="date"
                    required
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan / Motivasi</label>
                <input
                  type="text"
                  placeholder="Alasan menabung untuk impian ini..."
                  value={newGoal.notes}
                  onChange={(e) => setNewGoal({ ...newGoal, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Amount Modal (Setor / Tarik) */}
      {adjustGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-display font-bold text-base text-slate-900">
                {adjustType === 'deposit' ? 'Setor ke Tabungan' : 'Tarik dari Tabungan'}: {adjustGoal.name}
              </h3>
              <button
                onClick={() => setAdjustGoal(null)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nominal {adjustType === 'deposit' ? 'Setoran' : 'Penarikan'} (Rp)
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={adjustAmount ? adjustAmount.toLocaleString('id-ID') : ''}
                  onChange={(e) => setAdjustAmount(parseRupiahInput(e.target.value))}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {adjustType === 'deposit' ? 'Dipotong dari Rekening' : 'Dimasukkan ke Rekening'}
                </label>
                <select
                  value={selectedAccId}
                  onChange={(e) => setSelectedAccId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatRupiah(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustGoal(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                >
                  Konfirmasi {adjustType === 'deposit' ? 'Setoran' : 'Penarikan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
