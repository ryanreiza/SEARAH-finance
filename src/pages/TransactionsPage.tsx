import React, { useState } from 'react';
import {
  ReceiptText,
  Plus,
  Download,
  Search,
  Filter,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRightLeft,
  Calendar,
  Wallet,
  Tag,
  Check,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { PageHeader } from '../components/common/PageHeader';
import { formatRupiah, formatTanggal } from '../utils/format';
import { exportTransactionsToExcel } from '../utils/excel';
import { Transaction } from '../types';

interface TransactionsPageProps {
  onOpenQuickInput: () => void;
  onOpenMigration: () => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onOpenQuickInput,
  onOpenMigration,
}) => {
  const { transactions, categories, accounts, deleteTransaction, updateTransaction } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');

  // Edit modal state
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (selectedType !== 'all' && tx.type !== selectedType) return false;
    if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) return false;
    if (selectedAccount !== 'all' && tx.accountId !== selectedAccount) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = tx.title.toLowerCase().includes(q);
      const matchNotes = (tx.notes || '').toLowerCase().includes(q);
      if (!matchTitle && !matchNotes) return false;
    }
    return true;
  });

  // Calculate filtered totals
  const filteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleExportExcel = async () => {
    await exportTransactionsToExcel(filteredTransactions, categories, accounts);
  };

  const catMap = new Map(categories.map((c) => [c.id, c]));
  const accMap = new Map(accounts.map((a) => [a.id, a]));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        icon={<ReceiptText className="w-6 h-6 text-mint-brand" />}
        title="Daftar Transaksi"
        subtitle="Riwayat lengkap pemasukan, pengeluaran, dan transfer keluarga"
        actions={
          <>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>Ekspor Excel</span>
            </button>
            <button
              onClick={onOpenMigration}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span>Migrasi Data</span>
            </button>
            <button
              onClick={onOpenQuickInput}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 text-mint-brand" />
              <span>Tambah Transaksi</span>
            </button>
          </>
        }
      />

      {/* Summary Bar for Filtered Results */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-metric flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Pemasukan</p>
            <p className="font-mono font-bold text-lg text-emerald-700 mt-0.5">
              {formatRupiah(filteredIncome)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        <div className="card-metric flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Pengeluaran</p>
            <p className="font-mono font-bold text-lg text-rose-600 mt-0.5">
              {formatRupiah(filteredExpense)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="card-metric flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Selisih Periode Terpilih</p>
            <p
              className={`font-mono font-bold text-lg mt-0.5 ${
                filteredIncome - filteredExpense >= 0 ? 'text-slate-900' : 'text-rose-600'
              }`}
            >
              {formatRupiah(filteredIncome - filteredExpense)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-slate-700 flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-bento p-3 sm:p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul atau catatan..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs bg-stone-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap text-xs">
          {/* Type tabs */}
          <div className="grid grid-cols-4 p-0.5 bg-stone-100 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold text-center transition cursor-pointer text-[11px] sm:text-xs ${
                selectedType === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setSelectedType('expense')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold text-center transition cursor-pointer text-[11px] sm:text-xs ${
                selectedType === 'expense' ? 'bg-white text-rose-700 shadow-xs font-bold' : 'text-slate-500'
              }`}
            >
              Keluar
            </button>
            <button
              onClick={() => setSelectedType('income')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold text-center transition cursor-pointer text-[11px] sm:text-xs ${
                selectedType === 'income' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-500'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => setSelectedType('transfer')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold text-center transition cursor-pointer text-[11px] sm:text-xs ${
                selectedType === 'transfer' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-500'
              }`}
            >
              Transfer
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Account Filter */}
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="flex-1 sm:flex-initial px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">Semua Rekening</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 sm:flex-initial px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Container */}
      <div className="card-bento overflow-hidden">
        {/* Mobile Card View (block on <sm) */}
        <div className="block sm:hidden divide-y divide-stone-100">
          {filteredTransactions.length === 0 ? (
            <div className="py-10 px-4 text-center text-slate-500">
              <p className="font-semibold text-sm text-slate-800">Tidak ada transaksi yang cocok</p>
              <p className="text-xs mt-1 text-slate-400">
                Gunakan tombol "+ Tambah" atau sesuaikan filter pencarian.
              </p>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const cat = catMap.get(tx.categoryId);
              const acc = accMap.get(tx.accountId);
              const toAcc = tx.toAccountId ? accMap.get(tx.toAccountId) : null;

              return (
                <div key={tx.id} className="p-3.5 space-y-2.5 active:bg-stone-50/80 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div
                        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white mt-0.5 text-xs font-bold"
                        style={{ backgroundColor: cat?.color || '#0B2747' }}
                      >
                        {tx.type === 'income' ? '↓' : tx.type === 'expense' ? '↑' : '⇄'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 text-xs leading-snug break-words">
                          {tx.title}
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5 text-[11px] text-slate-500">
                          <span>{formatTanggal(tx.date)}</span>
                          <span>•</span>
                          <span className="font-medium text-slate-700">
                            {tx.type === 'transfer' ? `${acc?.name} → ${toAcc?.name || 'Lain'}` : acc?.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={`font-mono font-bold text-xs ${
                          tx.type === 'income'
                            ? 'text-emerald-700'
                            : tx.type === 'expense'
                            ? 'text-rose-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                        {formatRupiah(tx.amount)}
                      </p>
                      <span className="inline-block mt-0.5 text-[10px] font-medium text-slate-500 bg-stone-100 px-2 py-0.5 rounded-md">
                        {cat?.name || 'Umum'}
                      </span>
                    </div>
                  </div>

                  {tx.notes && (
                    <p className="text-[11px] text-slate-500 pl-10.5 line-clamp-2">
                      {tx.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[11px]">
                    <div>
                      {tx.receiptItems && tx.receiptItems.length > 0 && (
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          Struk ({tx.receiptItems.length} item)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-slate-400">
                      {deleteConfirmId === tx.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              deleteTransaction(tx.id);
                              setDeleteConfirmId(null);
                            }}
                            className="px-2 py-1 rounded-md bg-rose-600 text-white text-[10px] font-bold"
                          >
                            Hapus
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 rounded-md bg-stone-200 text-slate-700 text-[10px]"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingTx(tx)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-stone-100 cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                            aria-label="Edit Transaksi"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(tx.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                            aria-label="Hapus Transaksi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View (hidden on <sm) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-stone-100/80 text-slate-700 font-bold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Judul & Catatan</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Rekening</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-sm">Tidak ada transaksi yang cocok</p>
                    <p className="text-xs mt-1 text-slate-400">
                      Gunakan tombol "+ Tambah Transaksi" atau sesuaikan filter pencarian.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const cat = catMap.get(tx.categoryId);
                  const acc = accMap.get(tx.accountId);
                  const toAcc = tx.toAccountId ? accMap.get(tx.toAccountId) : null;

                  return (
                    <tr key={tx.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {formatTanggal(tx.date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-xs sm:text-sm">{tx.title}</p>
                        {tx.notes && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {tx.notes}
                          </p>
                        )}
                        {tx.receiptItems && tx.receiptItems.length > 0 && (
                          <span className="inline-block mt-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            Struk ({tx.receiptItems.length} item)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-stone-100 text-slate-700 border border-stone-200">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cat?.color || '#94a3b8' }}
                          />
                          {cat?.name || 'Lain-lain'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        {tx.type === 'transfer' ? (
                          <span className="font-medium">
                            {acc?.name} → {toAcc?.name || 'Rekening Lain'}
                          </span>
                        ) : (
                          <span>{acc?.name || 'Dompet'}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap text-xs sm:text-sm">
                        <span
                          className={
                            tx.type === 'income'
                              ? 'text-emerald-700'
                              : tx.type === 'expense'
                              ? 'text-rose-600'
                              : 'text-blue-600'
                          }
                        >
                          {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                          {formatRupiah(tx.amount)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {deleteConfirmId === tx.id ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                deleteTransaction(tx.id);
                                setDeleteConfirmId(null);
                              }}
                              className="p-1 rounded-md bg-rose-600 text-white text-[10px] font-bold"
                              title="Hapus Permanen"
                            >
                              Hapus
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="p-1 rounded-md bg-stone-200 text-slate-700 text-[10px]"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 text-slate-400">
                            <button
                              onClick={() => setEditingTx(tx)}
                              className="p-1.5 rounded-lg hover:text-slate-800 hover:bg-stone-100 transition cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                              title="Edit Transaksi"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(tx.id)}
                              className="p-1.5 rounded-lg hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-display font-bold text-base text-slate-900">
                Edit Transaksi
              </h3>
              <button
                onClick={() => setEditingTx(null)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul</label>
                <input
                  type="text"
                  value={editingTx.title}
                  onChange={(e) => setEditingTx({ ...editingTx, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  value={editingTx.amount}
                  onChange={(e) => setEditingTx({ ...editingTx, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={editingTx.categoryId}
                    onChange={(e) => setEditingTx({ ...editingTx, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rekening</label>
                  <select
                    value={editingTx.accountId}
                    onChange={(e) => setEditingTx({ ...editingTx, accountId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={editingTx.date}
                  onChange={(e) => setEditingTx({ ...editingTx, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan</label>
                <input
                  type="text"
                  value={editingTx.notes || ''}
                  onChange={(e) => setEditingTx({ ...editingTx, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
              <button
                onClick={() => setEditingTx(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-slate-700 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  updateTransaction(editingTx.id, editingTx);
                  setEditingTx(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
