import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Database,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { parseCSVData, ParsedImportItem } from '../../utils/excel';
import { formatRupiah } from '../../utils/format';

interface DataMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataMigrationModal: React.FC<DataMigrationModalProps> = ({ isOpen, onClose }) => {
  const { importExternalTransactions, accounts, categories } = useFinance();
  const [csvContent, setCsvContent] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedImportItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvContent(text);
      analyzeData(text);
    };
    reader.readAsText(file);
  };

  const analyzeData = (text: string) => {
    setIsAnalyzing(true);
    setImportedCount(null);
    try {
      const items = parseCSVData(text);
      setParsedItems(items);
    } catch (err) {
      console.error('Error parsing CSV', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedItems.length) return;

    // Map each item to Category ID and Account ID
    const defaultAccId = accounts[0]?.id || 'acc_bca';
    const defaultCatId = categories[0]?.id || 'cat_lain';

    const mappedTransactions = parsedItems.map((item) => {
      const matchedAcc = accounts.find((a) =>
        a.name.toLowerCase().includes(item.account.toLowerCase())
      );
      const matchedCat = categories.find((c) =>
        c.name.toLowerCase().includes(item.category.toLowerCase())
      );

      return {
        title: item.title,
        amount: item.amount,
        type: item.type,
        categoryId: matchedCat ? matchedCat.id : defaultCatId,
        accountId: matchedAcc ? matchedAcc.id : defaultAccId,
        date: item.date,
        notes: item.notes || 'Data dari migrasi aplikasi lama',
      };
    });

    const count = importExternalTransactions(mappedTransactions);
    setImportedCount(count);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const sampleCsvTemplate = `Tanggal,Judul Transaksi,Nominal,Kategori,Rekening,Tipe
2026-10-01,Gaji Bulanan,18500000,Gaji Pokok,BCA Tahapan,Pemasukan
2026-10-02,Belanja Bulanan Sayur & Beras,1250000,Belanja Harian,Mandiri Payroll,Pengeluaran
2026-10-03,Bensin Pertamax Mobil,350000,Transportasi,GoPay,Pengeluaran
2026-10-04,Makan Siang Resto,180000,Makanan & Minuman,Dompet Tunai,Pengeluaran`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-mint-brand flex items-center justify-center font-bold shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-slate-900">
                Migrasi Data Keuangan Lama
              </h2>
              <p className="text-xs text-slate-500">
                Pindahkan catatan dari Money Lover, Wallet, Cashew, atau file CSV/Excel lain secara otomatis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-stone-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {importedCount !== null ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">
                Migrasi Berhasil!
              </h3>
              <p className="text-sm text-slate-600">
                Berhasil mengimpor <strong>{importedCount} transaksi</strong> ke dalam sistem Keuangan Keluarga.
              </p>
            </div>
          ) : (
            <>
              {/* File upload box */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv,.txt,.tsv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-slate-800 rounded-2xl p-6 text-center cursor-pointer transition bg-stone-50/70 hover:bg-stone-100/60 flex flex-col items-center justify-center gap-2.5"
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-stone-200 flex items-center justify-center text-slate-800">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {fileName ? `File terpilih: ${fileName}` : 'Pilih File CSV / Export dari Aplikasi Lain'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mendukung ekspor dari Money Lover, Wallet by BudgetBakers, Cashew, Catatan Keuangan, atau format Excel CSV
                  </p>
                </div>
              </div>

              {/* Paste raw text alternative */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Atau Tempel Teks CSV Secara Langsung:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setCsvContent(sampleCsvTemplate);
                      analyzeData(sampleCsvTemplate);
                    }}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
                  >
                    Coba Data Contoh
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={csvContent}
                  onChange={(e) => {
                    setCsvContent(e.target.value);
                    analyzeData(e.target.value);
                  }}
                  placeholder="Tanggal,Judul,Nominal,Kategori,Rekening,Tipe..."
                  className="w-full p-3 text-xs font-mono rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-stone-50/50"
                />
              </div>

              {/* Parsed Preview Table */}
              {parsedItems.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Hasil Deteksi Otomatis ({parsedItems.length} Transaksi)
                    </p>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Kolom Cocok Otomatis
                    </span>
                  </div>

                  <div className="max-h-60 overflow-y-auto rounded-xl border border-stone-200 bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-stone-100 text-slate-700 font-bold sticky top-0">
                        <tr>
                          <th className="p-2.5 border-b border-stone-200">Tanggal</th>
                          <th className="p-2.5 border-b border-stone-200">Judul</th>
                          <th className="p-2.5 border-b border-stone-200">Tipe</th>
                          <th className="p-2.5 border-b border-stone-200">Kategori</th>
                          <th className="p-2.5 border-b border-stone-200">Rekening</th>
                          <th className="p-2.5 border-b border-stone-200 text-right">Nominal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {parsedItems.slice(0, 15).map((item, idx) => (
                          <tr key={idx} className="hover:bg-stone-50">
                            <td className="p-2.5 text-slate-500">{item.date}</td>
                            <td className="p-2.5 font-semibold text-slate-900">{item.title}</td>
                            <td className="p-2.5">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  item.type === 'income'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {item.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-600">{item.category}</td>
                            <td className="p-2.5 text-slate-600">{item.account}</td>
                            <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                              {formatRupiah(item.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedItems.length > 15 && (
                    <p className="text-[11px] text-slate-400 text-center italic">
                      Menampilkan 15 dari {parsedItems.length} transaksi yang akan diimpor.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {importedCount === null && (
          <div className="px-6 py-4 border-t border-stone-200 bg-stone-50/90 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              disabled={!parsedItems.length}
              onClick={handleConfirmImport}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-md"
            >
              <Sparkles className="w-4 h-4 text-mint-brand" />
              <span>Impor {parsedItems.length} Transaksi Sekarang</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
