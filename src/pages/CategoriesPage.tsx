import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  X,
  Tag,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { PageHeader } from '../components/common/PageHeader';
import { formatRupiah, parseRupiahInput } from '../utils/format';
import { Category } from '../types';

export const CategoriesPage: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useFinance();
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const [newCat, setNewCat] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#25B18B',
    monthlyBudget: 1000000,
    icon: 'Tag',
  });

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;

    addCategory({
      ...newCat,
      type: activeTab,
    });

    setIsAddOpen(false);
    setNewCat({
      name: '',
      type: 'expense',
      color: '#25B18B',
      monthlyBudget: 1000000,
      icon: 'Tag',
    });
  };

  const colorPalette = [
    '#EA580C', '#D97706', '#DC2626', '#4F46E5', '#E11D48',
    '#7C3AED', '#059669', '#0D9488', '#9333EA', '#0284C7',
    '#1B8258', '#25B18B', '#005696', '#64748B',
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        icon={<Layers className="w-6 h-6 text-mint-brand" />}
        title="Kategori Keuangan"
        subtitle="Atur pos anggaran pemasukan dan pengeluaran keluarga"
        actions={
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 text-mint-brand" />
            <span>Tambah Kategori</span>
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex p-1 bg-stone-200/60 rounded-2xl w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('expense')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer min-h-[40px] ${
            activeTab === 'expense'
              ? 'bg-white text-rose-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 shrink-0" />
          <span>Pengeluaran ({categories.filter((c) => c.type === 'expense').length})</span>
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer min-h-[40px] ${
            activeTab === 'income'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowDownRight className="w-4 h-4 shrink-0" />
          <span>Pemasukan ({categories.filter((c) => c.type === 'income').length})</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="card-bento p-4 flex flex-col justify-between hover:border-slate-400 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs font-bold"
                  style={{ backgroundColor: cat.color }}
                >
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-xs sm:text-sm text-slate-900">
                    {cat.name}
                  </h4>
                  <span className="text-[11px] text-slate-500 capitalize">
                    {cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={() => setEditingCat(cat)}
                  className="p-1 hover:text-slate-800 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="p-1 hover:text-rose-600 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Batas Anggaran Bulanan
              </span>
              <p className="font-mono font-bold text-sm text-slate-900 mt-0.5">
                {formatRupiah(cat.monthlyBudget || 0)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-display font-bold text-base text-slate-900">
                Tambah Kategori {activeTab === 'income' ? 'Pemasukan' : 'Pengeluaran'}
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Belanja Supermarket, Kopi Harian"
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Plafon Anggaran Bulanan (Rp)</label>
                <input
                  type="text"
                  value={newCat.monthlyBudget ? newCat.monthlyBudget.toLocaleString('id-ID') : ''}
                  onChange={(e) => setNewCat({ ...newCat, monthlyBudget: parseRupiahInput(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Pilih Warna Aksen</label>
                <div className="flex flex-wrap gap-2">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCat({ ...newCat, color })}
                      className={`w-7 h-7 rounded-xl transition cursor-pointer ${
                        newCat.color === color ? 'ring-2 ring-slate-900 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
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
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-display font-bold text-base text-slate-900">
                Edit Kategori: {editingCat.name}
              </h3>
              <button
                onClick={() => setEditingCat(null)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama</label>
                <input
                  type="text"
                  value={editingCat.name}
                  onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Batas Bulanan (Rp)</label>
                <input
                  type="text"
                  value={editingCat.monthlyBudget ? editingCat.monthlyBudget.toLocaleString('id-ID') : ''}
                  onChange={(e) => setEditingCat({ ...editingCat, monthlyBudget: parseRupiahInput(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Warna</label>
                <div className="flex flex-wrap gap-2">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEditingCat({ ...editingCat, color })}
                      className={`w-7 h-7 rounded-xl transition cursor-pointer ${
                        editingCat.color === color ? 'ring-2 ring-slate-900 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateCategory(editingCat.id, editingCat);
                    setEditingCat(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
