import React, { useState } from 'react';
import {
  Landmark,
  Plus,
  ArrowRightLeft,
  Building2,
  Wallet,
  Smartphone,
  Coins,
  TrendingUp,
  Edit2,
  Trash2,
  Check,
  X,
  Power,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { PageHeader } from '../components/common/PageHeader';
import { formatRupiah, parseRupiahInput } from '../utils/format';
import { Account } from '../types';

export const AccountsPage: React.FC = () => {
  const { accounts, addAccount, updateAccount, deleteAccount, transferFunds } = useFinance();

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState<Account | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [newAcc, setNewAcc] = useState({
    name: '',
    type: 'bank' as Account['type'],
    bankName: '',
    accountNumber: '',
    balance: 0,
    color: '#005696',
    isActive: true,
  });

  const [transferData, setTransferData] = useState({
    fromId: accounts[0]?.id || '',
    toId: accounts[1]?.id || '',
    amount: 0,
    notes: 'Transfer antar rekening keluarga',
  });

  const getAccountIcon = (type: Account['type']) => {
    switch (type) {
      case 'bank':
        return <Building2 className="w-5 h-5" />;
      case 'ewallet':
        return <Smartphone className="w-5 h-5" />;
      case 'cash':
        return <Coins className="w-5 h-5" />;
      case 'investment':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Wallet className="w-5 h-5" />;
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAcc.name.trim()) return;

    addAccount({
      ...newAcc,
      initialBalance: newAcc.balance,
    });

    setIsAddOpen(false);
    setNewAcc({
      name: '',
      type: 'bank',
      bankName: '',
      accountNumber: '',
      balance: 0,
      color: '#005696',
      isActive: true,
    });
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferData.amount <= 0 || transferData.fromId === transferData.toId) return;

    transferFunds(
      transferData.fromId,
      transferData.toId,
      transferData.amount,
      transferData.notes
    );
    setIsTransferOpen(false);
  };

  const totalBank = accounts
    .filter((a) => a.type === 'bank' && a.isActive)
    .reduce((sum, a) => sum + a.balance, 0);

  const totalEwallet = accounts
    .filter((a) => a.type === 'ewallet' && a.isActive)
    .reduce((sum, a) => sum + a.balance, 0);

  const totalCash = accounts
    .filter((a) => a.type === 'cash' && a.isActive)
    .reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        icon={<Landmark className="w-6 h-6 text-mint-brand" />}
        title="Rekening & Dompet Digital"
        subtitle="Kelola rekening bank, saldo e-wallet, uang tunai, dan transfer antar akun"
        actions={
          <>
            <button
              onClick={() => setIsTransferOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4 text-blue-600" />
              <span>Transfer Dana</span>
            </button>
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 text-mint-brand" />
              <span>Tambah Rekening</span>
            </button>
          </>
        }
      />

      {/* Category Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-metric flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total di Bank</p>
            <p className="font-mono font-bold text-lg text-slate-900 mt-0.5">
              {formatRupiah(totalBank)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="card-metric flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total di E-Wallet</p>
            <p className="font-mono font-bold text-lg text-slate-900 mt-0.5">
              {formatRupiah(totalEwallet)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
        </div>

        <div className="card-metric flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Uang Tunai / Cash</p>
            <p className="font-mono font-bold text-lg text-slate-900 mt-0.5">
              {formatRupiah(totalCash)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className={`card-bento p-5 flex flex-col justify-between transition-all ${
              !acc.isActive ? 'opacity-60 bg-stone-100/70' : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: acc.color }}
                  >
                    {getAccountIcon(acc.type)}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-900 leading-tight">
                      {acc.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 capitalize">
                      {acc.bankName || acc.type} {acc.accountNumber ? `• ${acc.accountNumber}` : ''}
                    </p>
                  </div>
                </div>

                {/* Status Toggle */}
                <button
                  onClick={() => updateAccount(acc.id, { isActive: !acc.isActive })}
                  className={`p-1.5 rounded-xl border text-xs transition cursor-pointer ${
                    acc.isActive
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-stone-200 border-stone-300 text-slate-500'
                  }`}
                  title={acc.isActive ? 'Rekening Aktif' : 'Rekening Nonaktif'}
                >
                  <Power className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-5">
                <span className="text-[11px] text-slate-500 font-medium">Saldo Tersedia</span>
                <p className="font-mono font-extrabold text-2xl text-slate-900 mt-0.5">
                  {formatRupiah(acc.balance)}
                </p>
              </div>
            </div>

            {/* Actions: Edit & Adaptive Delete */}
            <div className="pt-4 mt-4 border-t border-stone-200 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Saldo Awal: {formatRupiah(acc.initialBalance)}
              </span>

              {deleteConfirmId === acc.id ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      deleteAccount(acc.id);
                      setDeleteConfirmId(null);
                    }}
                    className="px-2 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold"
                  >
                    Yakin Hapus
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-2 py-1 bg-stone-200 text-slate-700 rounded-lg text-[10px]"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingAcc(acc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-stone-100 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(acc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Account */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-display font-bold text-base text-slate-900">
                Tambah Rekening / Dompet
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
                <label className="block font-semibold text-slate-700 mb-1">Nama Akun / Label</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BCA Tabungan, GoPay, Dompet Tunai"
                  value={newAcc.name}
                  onChange={(e) => setNewAcc({ ...newAcc, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Akun</label>
                  <select
                    value={newAcc.type}
                    onChange={(e) => setNewAcc({ ...newAcc, type: e.target.value as Account['type'] })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  >
                    <option value="bank">Bank</option>
                    <option value="ewallet">E-Wallet</option>
                    <option value="cash">Tunai / Cash</option>
                    <option value="investment">Investasi</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Bank (Opsional)</label>
                  <input
                    type="text"
                    placeholder="BCA, Mandiri, BRI, dll"
                    value={newAcc.bankName}
                    onChange={(e) => setNewAcc({ ...newAcc, bankName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Rekening (Opsional)</label>
                <input
                  type="text"
                  placeholder="1234567890"
                  value={newAcc.accountNumber}
                  onChange={(e) => setNewAcc({ ...newAcc, accountNumber: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Saldo Awal (Rp)</label>
                <input
                  type="text"
                  value={newAcc.balance ? newAcc.balance.toLocaleString('id-ID') : ''}
                  onChange={(e) => setNewAcc({ ...newAcc, balance: parseRupiahInput(e.target.value) })}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono font-bold"
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
                  Simpan Rekening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Transfer Funds */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                <h3 className="font-display font-bold text-base text-slate-900">
                  Transfer Antar Rekening
                </h3>
              </div>
              <button
                onClick={() => setIsTransferOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dari Rekening Sumber</label>
                <select
                  value={transferData.fromId}
                  onChange={(e) => setTransferData({ ...transferData, fromId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatRupiah(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ke Rekening Tujuan</label>
                <select
                  value={transferData.toId}
                  onChange={(e) => setTransferData({ ...transferData, toId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white"
                >
                  {accounts
                    .filter((a) => a.id !== transferData.fromId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatRupiah(acc.balance)})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nominal Transfer (Rp)</label>
                <input
                  type="text"
                  required
                  value={transferData.amount ? transferData.amount.toLocaleString('id-ID') : ''}
                  onChange={(e) => setTransferData({ ...transferData, amount: parseRupiahInput(e.target.value) })}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan</label>
                <input
                  type="text"
                  value={transferData.notes}
                  onChange={(e) => setTransferData({ ...transferData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                >
                  Kirim Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
