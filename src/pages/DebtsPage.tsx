import React, { useState } from 'react';
import {
  Scale,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Trash2,
  X,
  CreditCard,
  Building,
  User,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { PageHeader } from '../components/common/PageHeader';
import { formatRupiah, formatTanggal, parseRupiahInput } from '../utils/format';
import { Debt } from '../types';

export const DebtsPage: React.FC = () => {
  const { debts, addDebt, payDebtInstallment, deleteDebt, accounts } = useFinance();

  const [activeTab, setActiveTab] = useState<'debt' | 'receivable'>('debt');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [payTargetDebt, setPayTargetDebt] = useState<Debt | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');

  // New debt form state
  const [newDebt, setNewDebt] = useState({
    title: '',
    type: 'debt' as 'debt' | 'receivable',
    personOrEntity: '',
    totalAmount: 10000000,
    remainingAmount: 10000000,
    monthlyInstallment: 1000000,
    dueDate: '2026-10-25',
    notes: '',
  });

  const filteredDebts = debts.filter((d) => d.type === activeTab);

  const totalOriginal = filteredDebts.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalRemaining = filteredDebts.reduce((sum, d) => sum + d.remainingAmount, 0);
  const totalPaid = totalOriginal - totalRemaining;
  const overallPercent = totalOriginal > 0 ? Math.round((totalPaid / totalOriginal) * 100) : 100;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDebt.title.trim() || !newDebt.personOrEntity.trim()) return;

    addDebt({
      ...newDebt,
      type: activeTab,
      status: 'active',
      remainingAmount: newDebt.totalAmount,
    });

    setIsAddOpen(false);
    setNewDebt({
      title: '',
      type: 'debt',
      personOrEntity: '',
      totalAmount: 10000000,
      remainingAmount: 10000000,
      monthlyInstallment: 1000000,
      dueDate: '2026-10-25',
      notes: '',
    });
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payTargetDebt || payAmount <= 0) return;

    payDebtInstallment(payTargetDebt.id, payAmount, selectedAccountId);
    setPayTargetDebt(null);
    setPayAmount(0);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        icon={<Scale className="w-6 h-6 text-mint-brand" />}
        title="Utang & Piutang"
        subtitle="Pantau sisa cicilan, piutang ke pihak lain, dan jadwalkan pembayaran tepat waktu"
        actions={
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 text-mint-brand" />
            <span>Tambah {activeTab === 'debt' ? 'Utang Baru' : 'Piutang Baru'}</span>
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex p-1 bg-stone-200/60 rounded-2xl w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('debt')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer min-h-[40px] ${
            activeTab === 'debt'
              ? 'bg-white text-rose-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4 shrink-0" />
          <span>Utang ({debts.filter((d) => d.type === 'debt').length})</span>
        </button>
        <button
          onClick={() => setActiveTab('receivable')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer min-h-[40px] ${
            activeTab === 'receivable'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4 shrink-0" />
          <span>Piutang ({debts.filter((d) => d.type === 'receivable').length})</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="card-bento p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              {activeTab === 'debt' ? 'Total Sisa Utang Keluarga' : 'Total Sisa Piutang yang Belum Diterima'}
            </p>
            <h3 className="font-mono font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1">
              {formatRupiah(totalRemaining)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Sudah terlunasi: <span className="font-mono font-semibold text-emerald-700">{formatRupiah(totalPaid)}</span> dari total {formatRupiah(totalOriginal)}
            </p>
          </div>

          <div className="text-right">
            <span className="font-mono font-bold text-2xl text-emerald-700">
              {overallPercent}%
            </span>
            <p className="text-xs text-slate-500 mt-0.5">Tingkat Pelunasan</p>
          </div>
        </div>

        <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(5, overallPercent))}%` }}
          />
        </div>
      </div>

      {/* Debts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredDebts.map((item) => {
          const isPaid = item.remainingAmount === 0 || item.status === 'paid';
          const paidAmount = item.totalAmount - item.remainingAmount;
          const percent = Math.min(100, Math.round((paidAmount / item.totalAmount) * 100));

          return (
            <div
              key={item.id}
              className={`card-bento p-5 flex flex-col justify-between space-y-4 transition ${
                isPaid ? 'bg-stone-50 border-emerald-300' : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs ${
                        item.type === 'debt' ? 'bg-rose-600' : 'bg-emerald-600'
                      }`}
                    >
                      {item.type === 'debt' ? <Building className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm text-slate-900 leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.type === 'debt' ? 'Pemberi Pinjaman' : 'Peminjam'}: <strong>{item.personOrEntity}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isPaid ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Lunas
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        Aktif
                      </span>
                    )}
                    <button
                      onClick={() => deleteDebt(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Sisa Nominal:</span>
                    <span className="font-mono font-bold text-base text-slate-900">
                      {formatRupiah(item.remainingAmount)}
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>Terbayar: {formatRupiah(paidAmount)} ({percent}%)</span>
                    <span>Total: {formatRupiah(item.totalAmount)}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-stone-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Angsuran Rutin</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {item.monthlyInstallment ? `${formatRupiah(item.monthlyInstallment)}/bln` : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Jatuh Tempo</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {item.dueDate ? formatTanggal(item.dueDate) : '-'}
                    </span>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-slate-500 italic mt-2">
                    "{item.notes}"
                  </p>
                )}
              </div>

              {!isPaid && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setPayTargetDebt(item);
                      setPayAmount(item.monthlyInstallment || item.remainingAmount);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-mint-brand" />
                    <span>{item.type === 'debt' ? 'Bayar Cicilan / Angsuran' : 'Catat Pelunasan Masuk'}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Debt Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-display font-bold text-base text-slate-900">
                Tambah {activeTab === 'debt' ? 'Utang Baru' : 'Piutang Baru'}
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
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Pinjaman / Judul
                </label>
                <input
                  type="text"
                  required
                  placeholder={activeTab === 'debt' ? 'Cicilan KPR, Kartu Kredit, dll' : 'Pinjaman Teman, dll'}
                  value={newDebt.title}
                  onChange={(e) => setNewDebt({ ...newDebt, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {activeTab === 'debt' ? 'Pihak Pemberi Pinjaman (Bank / Orang)' : 'Nama Peminjam (Debitur)'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bank Mandiri, Budi Santoso"
                  value={newDebt.personOrEntity}
                  onChange={(e) => setNewDebt({ ...newDebt, personOrEntity: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Pokok (Rp)</label>
                  <input
                    type="text"
                    required
                    value={newDebt.totalAmount ? newDebt.totalAmount.toLocaleString('id-ID') : ''}
                    onChange={(e) => setNewDebt({ ...newDebt, totalAmount: parseRupiahInput(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cicilan / Bulan (Rp)</label>
                  <input
                    type="text"
                    value={newDebt.monthlyInstallment ? newDebt.monthlyInstallment.toLocaleString('id-ID') : ''}
                    onChange={(e) => setNewDebt({ ...newDebt, monthlyInstallment: parseRupiahInput(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Jatuh Tempo Rutin</label>
                <input
                  type="date"
                  value={newDebt.dueDate}
                  onChange={(e) => setNewDebt({ ...newDebt, dueDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan</label>
                <input
                  type="text"
                  placeholder="Keterangan tenor, bunga, dll..."
                  value={newDebt.notes}
                  onChange={(e) => setNewDebt({ ...newDebt, notes: e.target.value })}
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
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Installment Modal */}
      {payTargetDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-display font-bold text-base text-slate-900">
                {payTargetDebt.type === 'debt' ? 'Bayar Cicilan Utang' : 'Penerimaan Piutang'}: {payTargetDebt.title}
              </h3>
              <button
                onClick={() => setPayTargetDebt(null)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nominal Pembayaran (Rp)
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={payAmount ? payAmount.toLocaleString('id-ID') : ''}
                  onChange={(e) => setPayAmount(parseRupiahInput(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono font-bold"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Sisa total: {formatRupiah(payTargetDebt.remainingAmount)}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {payTargetDebt.type === 'debt' ? 'Bayar Menggunakan Rekening' : 'Masuk ke Rekening'}
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
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
                  onClick={() => setPayTargetDebt(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                >
                  Catat & Potong Saldo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
