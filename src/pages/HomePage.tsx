import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Wallet,
  ReceiptText,
  Coins,
  Landmark,
  Target,
  CalendarClock,
  PieChart,
  Bot,
  Plus,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Check,
  Trash2,
  Sparkles,
  CreditCard,
  Building,
  Smartphone,
  ExternalLink,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  PiggyBank,
  FileSpreadsheet,
  Layers,
  CalendarDays,
  Settings,
  UploadCloud,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah, formatTanggal } from '../utils/format';
import { FamilyAgendaItem } from '../types';

interface HomePageProps {
  onNavigate: (tabId: string) => void;
  onOpenQuickInput?: (tab?: 'chat' | 'voice' | 'camera' | 'manual') => void;
  onOpenMigration?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenQuickInput, onOpenMigration }) => {
  const {
    userProfile,
    accounts,
    transactions,
    billReminders,
    payBill,
    goldPortfolio,
    familyAgenda,
    addAgendaItem,
    toggleAgendaItem,
    deleteAgendaItem,
    totalNetWorth,
    totalExpenseCurrentMonth,
    totalIncomeCurrentMonth,
  } = useFinance();

  // Search input state (like Adari reference)
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Expanded features grid state (Toggle 8 to 14 features)
  const [isAllFeaturesExpanded, setIsAllFeaturesExpanded] = useState(false);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global search multi-category matches
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();

    const allFeaturesList = [
      { id: 'dashboard', name: 'Keuangan', desc: 'Dashboard ringkasan & analisa arus kas', icon: LayoutDashboard },
      { id: 'transactions', name: 'Transaksi', desc: 'Catatan buku kas & mutasi keluar masuk', icon: ReceiptText },
      { id: 'gold-savings', name: 'Emas', desc: 'Portofolio tabungan emas fisik realtime', icon: Coins },
      { id: 'accounts', name: 'Rekening', desc: 'Kelola saldo bank, e-wallet & dompet tunai', icon: Landmark },
      { id: 'monthly-targets', name: 'Anggaran', desc: 'Target alokasi 50/30/20 & batas pengeluaran', icon: Target },
      { id: 'debts', name: 'Tagihan', desc: 'Jadwal jatuh tempo tagihan & sisa cicilan', icon: CalendarClock },
      { id: 'reports', name: 'Laporan', desc: 'Analisis grafik & evaluasi Budget vs Actual', icon: PieChart },
      { id: 'ai-assistant', name: 'Asisten AI', desc: 'Konsultasi cerdas penasihat keuangan searta', icon: Bot },
      { id: 'savings', name: 'Tabungan', desc: 'Target dana darurat & impian masa depan', icon: PiggyBank },
      { id: 'monthly-summary', name: 'Bulanan', desc: 'Komparasi rencana pengeluaran bulanan', icon: FileSpreadsheet },
      { id: 'categories', name: 'Kategori', desc: 'Kelola pos belanja kebutuhan & gaya hidup', icon: Layers },
      { id: 'yearly', name: 'Tahunan', desc: 'Rekap kinerja keuangan sepanjang 12 bulan', icon: CalendarDays },
      { id: 'migration', name: 'Migrasi', desc: 'Impor & ekspor backup file Excel/JSON', icon: UploadCloud, isMigration: true },
      { id: 'settings', name: 'Pengaturan', desc: 'Profil keluarga, tema warna & keamanan', icon: Settings },
    ];

    const matchedFeatures = allFeaturesList.filter(
      (f) => f.name.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q)
    );

    const matchedAccounts = accounts.filter(
      (a) => a.name.toLowerCase().includes(q) || (a.bankName && a.bankName.toLowerCase().includes(q))
    );

    const matchedTransactions = transactions
      .filter((t) => t.title.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q)))
      .slice(0, 5);

    const matchedBills = billReminders.filter((b) => b.title.toLowerCase().includes(q));
    const matchedAgendas = familyAgenda.filter((a) => a.title.toLowerCase().includes(q) || a.categoryName.toLowerCase().includes(q));

    const totalCount =
      matchedFeatures.length +
      matchedAccounts.length +
      matchedTransactions.length +
      matchedBills.length +
      matchedAgendas.length;

    return {
      features: matchedFeatures,
      accounts: matchedAccounts,
      transactions: matchedTransactions,
      bills: matchedBills,
      agendas: matchedAgendas,
      totalCount,
    };
  }, [searchQuery, accounts, transactions, billReminders, familyAgenda]);

  // Real-time clock & date state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Time-based Indonesian greeting
  const greeting = useMemo(() => {
    const hours = currentTime.getHours();
    if (hours >= 4 && hours < 11) return 'Selamat pagi';
    if (hours >= 11 && hours < 15) return 'Selamat siang';
    if (hours >= 15 && hours < 18) return 'Selamat sore';
    return 'Selamat malam';
  }, [currentTime]);

  // Formatted date string (e.g., "Rabu, 4 November")
  const formattedDayDateFull = useMemo(() => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const dayName = days[currentTime.getDay()];
    const dateNum = currentTime.getDate();
    const monthName = months[currentTime.getMonth()];
    return `${dayName}, ${dateNum} ${monthName}`;
  }, [currentTime]);

  // Formatted time string (e.g., "22.03")
  const formattedTime = useMemo(() => {
    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    return `${hours}.${minutes}`;
  }, [currentTime]);

  // Today's expense calculation
  const todayDateStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const todayExpense = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense' && t.date === todayDateStr)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, todayDateStr]);

  // Liquid cash balance (bank, cash, ewallet)
  const liquidCash = useMemo(() => {
    return accounts
      .filter((a) => a.type === 'bank' || a.type === 'cash' || a.type === 'ewallet')
      .reduce((sum, a) => sum + a.balance, 0);
  }, [accounts]);

  // Gold valuation
  const goldValuation = Math.round(goldPortfolio.totalGrams * goldPortfolio.currentMarketPrice);

  // Agenda stats
  const completedAgendaCount = familyAgenda.filter((a) => a.isCompleted).length;
  const totalAgendaCount = familyAgenda.length;

  // Unpaid bills sorted by due date
  const upcomingBills = useMemo(() => {
    return billReminders
      .filter((b) => !b.isPaid)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [billReminders]);

  // Modals state
  const [isAddAgendaModalOpen, setIsAddAgendaModalOpen] = useState(false);
  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [newAgendaCategory, setNewAgendaCategory] = useState('Jadwal Maintenance');
  const [newAgendaDate, setNewAgendaDate] = useState(todayDateStr);
  const [newAgendaPriority, setNewAgendaPriority] = useState<'normal' | 'high'>('normal');

  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [selectedPayAccount, setSelectedPayAccount] = useState<string>(accounts[0]?.id || '');

  const [activeBottomTab, setActiveBottomTab] = useState<'finance' | 'agenda'>('finance');
  const [selectedWalletId, setSelectedWalletId] = useState<string>('all');

  // Filter agenda by search
  const filteredAgenda = useMemo(() => {
    if (!searchQuery.trim()) return familyAgenda;
    const q = searchQuery.toLowerCase();
    return familyAgenda.filter(
      (a) => a.title.toLowerCase().includes(q) || a.categoryName.toLowerCase().includes(q)
    );
  }, [familyAgenda, searchQuery]);

  // Handler: Add agenda
  const handleSaveAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgendaTitle.trim()) return;

    addAgendaItem({
      title: newAgendaTitle.trim(),
      categoryName: newAgendaCategory,
      dueDate: newAgendaDate,
      isCompleted: false,
      priority: newAgendaPriority,
    });

    setNewAgendaTitle('');
    setIsAddAgendaModalOpen(false);
  };

  // Handler: Pay bill
  const handleConfirmPayBill = () => {
    if (!payingBillId || !selectedPayAccount) return;
    payBill(payingBillId, selectedPayAccount);
    setPayingBillId(null);
  };

  const billToPay = billReminders.find((b) => b.id === payingBillId);

  // Calculate days until due
  const getDaysUntilDue = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: `${Math.abs(diffDays)} hari lewat`, isOverdue: true };
    if (diffDays === 0) return { label: 'Hari ini', isToday: true };
    if (diffDays === 1) return { label: 'Besok', isSoon: true };
    return { label: `${diffDays} hari lagi`, isSoon: diffDays <= 3 };
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#061527] pb-24 lg:pb-12 text-slate-800 dark:text-slate-100 antialiased transition-colors">
      <div className="max-w-4xl mx-auto px-3.5 sm:px-6 pt-2 sm:pt-4 space-y-4 sm:space-y-5">

        {/* 1. GREETING CARD ADAPTIF ULTRA-MINIMALIS (NAVY SEARTA #0B2747 + BIAS CAHAYA TEAL #14B8A6) */}
        {/* Tidak ada logo/nama web, langsung sapaan dinamis waktu + 2 kotak ringkas berdampingan */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B2747] via-[#09223D] to-[#041323] text-white shadow-xl shadow-[#0B2747]/25 border border-teal-500/25 p-4 sm:p-5 transition-all">
          {/* Bias Cahaya Teal #14B8A6: Top-Right Luminous Orb */}
          <div className="absolute -top-16 -right-12 w-64 h-64 rounded-full bg-[#14B8A6]/25 blur-3xl pointer-events-none" />
          {/* Bias Cahaya Teal #14B8A6: Bottom-Left Radiant Flare */}
          <div className="absolute -bottom-16 -left-12 w-56 h-56 rounded-full bg-[#14B8A6]/20 blur-2xl pointer-events-none" />
          {/* Central Diagonal Teal Light Beam */}
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-28 bg-gradient-to-r from-transparent via-[#14B8A6]/15 to-transparent blur-xl -rotate-12 pointer-events-none" />
          {/* Top subtle highlight rim */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#14B8A6]/60 to-transparent pointer-events-none" />

          {/* Sapaan Dinamis Waktu + Nama + Tanggal & Jam (Persis Adari) */}
          <div className="relative z-10 mb-3.5">
            <p className="text-xs sm:text-sm font-medium text-slate-300">
              {greeting},
            </p>
            <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight mt-0.5">
              {userProfile.name || userProfile.familyName || 'Keluarga searta'}
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-300/80 mt-1 font-mono tabular-nums">
              <span>{formattedDayDateFull}</span>
              <span>·</span>
              <span className="font-semibold text-teal-300">{formattedTime}</span>
            </div>
          </div>

          {/* Dua Kotak Ringkas Berdampingan (Kas Hari Ini & Kas Likuid/Emas) */}
          <div className="relative z-10 grid grid-cols-2 gap-2 sm:gap-3">
            {/* Kotak Kiri: Kas Hari Ini & Status */}
            <div className="bg-white/10 dark:bg-white/[0.06] backdrop-blur-md border border-teal-500/20 hover:border-teal-400/40 rounded-2xl p-2.5 sm:p-3.5 transition-all shadow-[0_4px_16px_-4px_rgba(20,184,166,0.12)]">
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-teal-200/90 mb-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  Kas Hari Ini
                </span>
                <Clock className="w-3.5 h-3.5 text-teal-300" />
              </div>
              <div className="text-base sm:text-xl font-bold font-mono tabular-nums text-white truncate">
                {formatRupiah(todayExpense)}
              </div>
              <p className="text-[10px] text-teal-300/90 mt-0.5 truncate">
                {todayExpense === 0 ? '✓ Arus Kas Sehat' : 'Keluar hari ini'}
              </p>
            </div>

            {/* Kotak Kanan: Kas Likuid & Tabungan Emas */}
            <div className="bg-white/10 dark:bg-white/[0.06] backdrop-blur-md border border-teal-500/20 hover:border-teal-400/40 rounded-2xl p-2.5 sm:p-3.5 transition-all shadow-[0_4px_16px_-4px_rgba(20,184,166,0.12)]">
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-teal-200/90 mb-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Kas & Emas
                </span>
                <Coins className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <div className="text-base sm:text-xl font-bold font-mono tabular-nums text-white truncate">
                {formatRupiah(liquidCash)}
              </div>
              <p className="text-[10px] text-amber-300/90 mt-0.5 truncate">
                {goldPortfolio.totalGrams.toFixed(3)} gr Emas Fisik
              </p>
            </div>
          </div>
        </div>

        {/* 2. PENCARIAN KILAT (PERSIS REFERENSI ADARI) DENGAN DROPDOWN HASIL INSTAN */}
        <div className="relative z-30" ref={searchContainerRef}>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white dark:bg-[#0B2747]/60 border border-slate-200/90 dark:border-[#1E3A5F]/80 rounded-2xl shadow-2xs focus-within:ring-2 focus-within:ring-teal-500 transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari fitur, transaksi, rekening, agenda..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchFocused(false);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Floating Instant Search Results Dropdown */}
          {isSearchFocused && searchResults && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#071A30] border border-slate-200 dark:border-[#1E3A5F] rounded-2xl shadow-2xl p-3 max-h-96 overflow-y-auto space-y-3 animate-in fade-in zoom-in-95">
              {searchResults.totalCount === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Tidak ditemukan hasil untuk "{searchQuery}". Coba kata kunci nama toko, fitur, atau rekening.
                </div>
              ) : (
                <>
                  {/* Matching Features */}
                  {searchResults.features.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 px-1">
                        Fitur & Menu ({searchResults.features.length})
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {searchResults.features.map((feat) => {
                          const IconComp = feat.icon;
                          return (
                            <button
                              key={feat.id}
                              onClick={() => {
                                setIsSearchFocused(false);
                                setSearchQuery('');
                                if (feat.isMigration) {
                                  onOpenMigration?.();
                                } else {
                                  onNavigate(feat.id);
                                }
                              }}
                              className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-[#0B2747]/80 hover:bg-teal-50 dark:hover:bg-[#103863] border border-slate-200/80 dark:border-[#1E3A5F]/60 text-left transition cursor-pointer group"
                            >
                              <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#071A30] text-teal-600 dark:text-teal-300 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-[#1E3A5F]">
                                <IconComp className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {feat.name}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {feat.desc}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Matching Accounts */}
                  {searchResults.accounts.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 px-1">
                        Rekening & Dompet ({searchResults.accounts.length})
                      </div>
                      <div className="space-y-1">
                        {searchResults.accounts.map((acc) => (
                          <div
                            key={acc.id}
                            onClick={() => {
                              setIsSearchFocused(false);
                              setSearchQuery('');
                              onNavigate('accounts');
                            }}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#0B2747]/80 hover:bg-slate-100 dark:hover:bg-[#103863] text-left transition cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Landmark className="w-4 h-4 text-blue-500" />
                              <span className="text-xs font-bold text-slate-900 dark:text-white">{acc.name}</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {formatRupiah(acc.balance)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Transactions */}
                  {searchResults.transactions.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                        Transaksi Buku Kas ({searchResults.transactions.length})
                      </div>
                      <div className="space-y-1">
                        {searchResults.transactions.map((tx) => (
                          <div
                            key={tx.id}
                            onClick={() => {
                              setIsSearchFocused(false);
                              setSearchQuery('');
                              onNavigate('transactions');
                            }}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#0B2747]/80 hover:bg-slate-100 dark:hover:bg-[#103863] text-left transition cursor-pointer"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                {tx.title}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {formatTanggal(tx.date)} {tx.notes && `· ${tx.notes}`}
                              </div>
                            </div>
                            <span
                              className={`text-xs font-mono font-bold shrink-0 ${
                                tx.type === 'income'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : tx.type === 'expense'
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-blue-600 dark:text-blue-400'
                              }`}
                            >
                              {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Bills & Agenda */}
                  {(searchResults.bills.length > 0 || searchResults.agendas.length > 0) && (
                    <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 px-1">
                        Tagihan & Agenda ({searchResults.bills.length + searchResults.agendas.length})
                      </div>
                      <div className="space-y-1">
                        {searchResults.bills.map((bill) => (
                          <div
                            key={bill.id}
                            onClick={() => {
                              setIsSearchFocused(false);
                              setSearchQuery('');
                              setPayingBillId(bill.id);
                            }}
                            className="flex items-center justify-between p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-left transition cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <CalendarClock className="w-4 h-4 text-amber-600" />
                              <span className="text-xs font-semibold text-slate-900 dark:text-white">{bill.title}</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-amber-900 dark:text-amber-200">
                              {formatRupiah(bill.amount)}
                            </span>
                          </div>
                        ))}
                        {searchResults.agendas.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              toggleAgendaItem(item.id);
                            }}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#0B2747]/80 text-left transition cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Check className={`w-3.5 h-3.5 ${item.isCompleted ? 'text-emerald-500' : 'text-slate-400'}`} />
                              <span className={`text-xs ${item.isCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                {item.title}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">{item.dueDate}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* 3. FITUR UTAMA: GRID MENU 8 HINGGA 14 IKON PINTAS (EXPANDABLE) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
              <span>Fitur Utama</span>
              <span className="text-[10px] font-normal text-slate-400">
                ({isAllFeaturesExpanded ? '14 fitur aktif' : '8 pintas'})
              </span>
            </h2>
            <button
              onClick={() => setIsAllFeaturesExpanded(!isAllFeaturesExpanded)}
              className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 inline-flex items-center gap-1 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-teal-50 dark:hover:bg-[#0B2747]"
            >
              <span>{isAllFeaturesExpanded ? 'Tutup sebagian' : 'Lihat semua (14)'}</span>
              {isAllFeaturesExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2 sm:gap-2.5 transition-all">
            {/* 1. Keuangan */}
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex flex-col items-center justify-center py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl sm:rounded-2xl bg-white dark:bg-[#071A30]/80 hover:bg-slate-50 dark:hover:bg-[#0B2747] border border-slate-200/90 dark:border-[#1E3A5F]/80 shadow-2xs hover:shadow-xs transition-all group active:scale-95 cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.6]" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-200 mt-0.5 text-center whitespace-nowrap leading-tight">
                Keuangan
              </span>
            </button>

            {/* 2. Transaksi */}
            <button
              onClick={() => onNavigate('transactions')}
              className="flex flex-col items-center justify-center py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl sm:rounded-2xl bg-white dark:bg-[#071A30]/80 hover:bg-slate-50 dark:hover:bg-[#0B2747] border border-slate-200/90 dark:border-[#1E3A5F]/80 shadow-2xs hover:shadow-xs transition-all group active:scale-95 cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:scale-110 transition-transform">
                <ReceiptText className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.6]" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-200 mt-0.5 text-center whitespace-nowrap leading-tight">
                Transaksi
              </span>
            </button>

            {/* 3. Emas */}
            <button
              onClick={() => onNavigate('gold-savings')}
              className="flex flex-col items-center justify-center py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl sm:rounded-2xl bg-white dark:bg-[#071A30]/80 hover:bg-slate-50 dark:hover:bg-[#0B2747] border border-slate-200/90 dark:border-[#1E3A5F]/80 shadow-2xs hover:shadow-xs transition-all group active:scale-95 cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:scale-110 transition-transform">
                <Coins className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.6]" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-200 mt-0.5 text-center whitespace-nowrap leading-tight">
                Emas
              </span>
            </button>

            {/* 4. Rekening */}
            <button
              onClick={() => onNavigate('accounts')}
              className="flex flex-col items-center justify-center py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl sm:rounded-2xl bg-white dark:bg-[#071A30]/80 hover:bg-slate-50 dark:hover:bg-[#0B2747] border border-slate-200/90 dark:border-[#1E3A5F]/80 shadow-2xs hover:shadow-xs transition-all group active:scale-95 cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:scale-110 transition-transform">
                <Landmark className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.6]" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-200 mt-0.5 text-center whitespace-nowrap leading-tight">
                Rekening
              </span>
            </button>

            {/* 5. Anggaran */}
            <button
              onClick={() => onNavigate('monthly-targets')}
              className="flex flex-col items-center justify-center py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl sm:rounded-2xl bg-white dark:bg-[#071A30]/80 hover:bg-slate-50 dark:hover:bg-[#0B2747] border border-slate-200/90 dark:border-[#1E3A5F]/80 shadow-2xs hover:shadow-xs transition-all group active:scale-95 cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:scale-110 transition-transform">
                <Target className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.6]" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-200 mt-0.5 text-center whitespace-nowrap leading-tight">
                Anggaran
              </span>
            </button>

            {/* 6. Tagihan (Ikon CalendarClock Sinkron) */}
            <button
              onClick={() => onNavigate('debts')}
              className="flex flex-col items-center justify-center py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl sm:rounded-2xl bg-white dark:bg-[#071A30]/80 hover:bg-slate-50 dark:hover:bg-[#0B2747] border border-slate-200/90 dark:border-[#1E3A5F]/80 shadow-2xs hover:shadow-xs transition-all group active:scale-95 cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:scale-110 transition-transform">
                <CalendarClock className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.6]" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-200 mt-0.5 text-center whitespace-nowrap leading-tight">
                Tagihan
              </span>
            </button>

            {/* 7. Laporan */}
            <button
              onClick={() => onNavigate('reports')}
              className="flex flex-col items-center justify-center py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl sm:rounded-2xl bg-white dark:bg-[#071A30]/80 hover:bg-slate-50 dark:hover:bg-[#0B2747] border border-slate-200/90 dark:border-[#1E3A5F]/80 shadow-2xs hover:shadow-xs transition-all group active:scale-95 cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:scale-110 transition-transform">
                <PieChart className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.6]" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-200 mt-0.5 text-center whitespace-nowrap leading-tight">
                Laporan
              </span>
            </button>

            {/* 8. Asisten */}
            <button
              onClick={() => onNavigate('ai-assistant')}
              className="flex flex-col items-center justify-center py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl sm:rounded-2xl bg-white dark:bg-[#071A30]/80 hover:bg-slate-50 dark:hover:bg-[#0B2747] border border-slate-200/90 dark:border-[#1E3A5F]/80 shadow-2xs hover:shadow-xs transition-all group active:scale-95 cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:scale-110 transition-transform">
                <Bot className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.6]" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-200 mt-0.5 text-center whitespace-nowrap leading-tight">
                Asisten
              </span>
            </button>

            {/* FITUR 9 - 14 (MUNCUL KETIKA EXPANDED) */}
            {isAllFeaturesExpanded && (
              <>
                {/* 9. Tabungan Impian */}
                <button
                  onClick={() => onNavigate('savings')}
                  className="flex flex-col items-center justify-center py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl sm:rounded-2xl bg-white dark:bg-[#071A30]/80 hover:bg-slate-50 dark:hover:bg-[#0B2747] border border-slate-200/90 dark:border-[#1E3A5F]/80 shadow-2xs hover:shadow-xs transition-all group active:scale-95 cursor-pointer animate-in fade-in"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:scale-110 transition-transform">
                    <PiggyBank className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.6]" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-200 mt-0.5 text-center whitespace-nowrap leading-tight">
                    Tabungan
                  </span>
                </button>

                {/* 10. Ringkasan Bulanan */}
                <button
                  onClick={() => onNavigate('monthly-summary')}
                  className="flex flex-col items-center justify-center py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl sm:rounded-2xl bg-white dark:bg-[#071A30]/80 hover:bg-slate-50 dark:hover:bg-[#0B2747] border border-slate-200/90 dark:border-[#1E3A5F]/80 shadow-2xs hover:shadow-xs transition-all group active:scale-95 cursor-pointer animate-in fade-in"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.6]" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-200 mt-0.5 text-center whitespace-nowrap leading-tight">
                    Bulanan
                  </span>
                </button>

                {/* 11. Kategori */}
                <button
                  onClick={() => onNavigate('categories')}
                  className="flex flex-col items-center justify-center py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl sm:rounded-2xl bg-white dark:bg-[#071A30]/80 hover:bg-slate-50 dark:hover:bg-[#0B2747] border border-slate-200/90 dark:border-[#1E3A5F]/80 shadow-2xs hover:shadow-xs transition-all group active:scale-95 cursor-pointer animate-in fade-in"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:scale-110 transition-transform">
                    <Layers className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.6]" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-200 mt-0.5 text-center whitespace-nowrap leading-tight">
                    Kategori
                  </span>
                </button>

                {/* 12. Tahunan */}
                <button
                  onClick={() => onNavigate('yearly')}
                  className="flex flex-col items-center justify-center py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl sm:rounded-2xl bg-white dark:bg-[#071A30]/80 hover:bg-slate-50 dark:hover:bg-[#0B2747] border border-slate-200/90 dark:border-[#1E3A5F]/80 shadow-2xs hover:shadow-xs transition-all group active:scale-95 cursor-pointer animate-in fade-in"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:scale-110 transition-transform">
                    <CalendarDays className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.6]" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-200 mt-0.5 text-center whitespace-nowrap leading-tight">
                    Tahunan
                  </span>
                </button>

                {/* 13. Migrasi Data */}
                <button
                  onClick={() => onOpenMigration?.()}
                  className="flex flex-col items-center justify-center py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl sm:rounded-2xl bg-white dark:bg-[#071A30]/80 hover:bg-slate-50 dark:hover:bg-[#0B2747] border border-slate-200/90 dark:border-[#1E3A5F]/80 shadow-2xs hover:shadow-xs transition-all group active:scale-95 cursor-pointer animate-in fade-in"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.6]" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-200 mt-0.5 text-center whitespace-nowrap leading-tight">
                    Migrasi
                  </span>
                </button>

                {/* 14. Pengaturan */}
                <button
                  onClick={() => onNavigate('settings')}
                  className="flex flex-col items-center justify-center py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl sm:rounded-2xl bg-white dark:bg-[#071A30]/80 hover:bg-slate-50 dark:hover:bg-[#0B2747] border border-slate-200/90 dark:border-[#1E3A5F]/80 shadow-2xs hover:shadow-xs transition-all group active:scale-95 cursor-pointer animate-in fade-in"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:scale-110 transition-transform">
                    <Settings className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.6]" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-200 mt-0.5 text-center whitespace-nowrap leading-tight">
                    Pengaturan
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 4. MODUL KONTEN BAWAH DENGAN WARNA OVERLAY MENYESUAIKAN GREETING CARD (NAVY-SLATE OVERLAY) */}
        {/* Soft tinted backdrop bernuansa tenang dan menyatu harmonis */}
        <div className="space-y-4">

          {/* A. AGENDA HARI INI (FAMILY FINANCIAL TO-DO LIST) */}
          <div className="bg-[#F4F6F9] dark:bg-[#071A30]/60 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-[#1E3A5F]/70 shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Agenda Hari ini
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  {completedAgendaCount}/{totalAgendaCount} selesai
                </span>
              </div>

              <button
                onClick={() => setIsAddAgendaModalOpen(true)}
                className="w-8 h-8 rounded-full bg-white dark:bg-[#0B2747] hover:bg-teal-50 dark:hover:bg-[#103863] text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors border border-slate-200 dark:border-[#1E3A5F] shadow-2xs"
                title="Tambah agenda baru"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {filteredAgenda.length === 0 ? (
                <div className="py-5 text-center text-xs text-slate-400">
                  {searchQuery ? 'Tidak ada agenda yang cocok.' : 'Belum ada agenda hari ini. Klik + untuk menambahkan.'}
                </div>
              ) : (
                filteredAgenda.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleAgendaItem(item.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer border select-none ${
                      item.isCompleted
                        ? 'bg-slate-100/70 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800 text-slate-400'
                        : 'bg-white dark:bg-[#0B2747]/70 hover:bg-slate-50 dark:hover:bg-[#0B2747] border-slate-200/90 dark:border-[#1E3A5F]/70 text-slate-800 dark:text-slate-100 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAgendaItem(item.id);
                        }}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          item.isCompleted
                            ? 'bg-slate-800 dark:bg-teal-600 text-white'
                            : 'border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                        }`}
                      >
                        {item.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="min-w-0">
                        <div
                          className={`text-xs sm:text-sm font-semibold truncate ${
                            item.isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.categoryName} {item.dueDate && `· ${formatTanggal(item.dueDate)}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pl-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAgendaItem(item.id);
                        }}
                        className="text-slate-300 dark:text-slate-600 hover:text-rose-500 p-1 rounded-lg transition-colors"
                        title="Hapus agenda"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* B. AKAN JATUH TEMPO (TAGIHAN PRIORITAS) */}
          <div className="bg-[#F4F6F9] dark:bg-[#071A30]/60 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-[#1E3A5F]/70 shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Akan jatuh tempo
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Pengingat tagihan dan cicilan prioritas
                </p>
              </div>

              <button
                onClick={() => onNavigate('debts')}
                className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline transition-colors inline-flex items-center gap-1"
              >
                Lihat Semua ({upcomingBills.length}) <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingBills.length === 0 ? (
              <div className="py-6 text-center bg-white dark:bg-[#0B2747]/40 rounded-2xl border border-dashed border-slate-200 dark:border-[#1E3A5F]">
                <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Semua tagihan sudah lunas!</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Tidak ada tagihan yang menunggu pembayaran.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingBills.slice(0, 3).map((bill) => {
                  const dueInfo = getDaysUntilDue(bill.dueDate);
                  return (
                    <div
                      key={bill.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#0B2747]/60 border border-slate-200/90 dark:border-[#1E3A5F]/70 hover:border-slate-300 transition-all gap-2.5 shadow-2xs"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#103863] text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 border border-slate-200 dark:border-[#1E3A5F] mt-0.5">
                          <ReceiptText className="w-4 h-4" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                              {bill.title}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                dueInfo.isOverdue
                                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                                  : dueInfo.isToday
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {dueInfo.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Jatuh tempo: {formatTanggal(bill.dueDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                        <div className="text-left sm:text-right">
                          <div className="text-[10px] text-slate-400">Nominal</div>
                          <div className="text-xs sm:text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                            {formatRupiah(bill.amount)}
                          </div>
                        </div>

                        <button
                          onClick={() => setPayingBillId(bill.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-700 rounded-xl transition-colors shrink-0 shadow-2xs"
                        >
                          Bayar
                        </button>
                      </div>
                    </div>
                  );
                })}

                {upcomingBills.length > 3 && (
                  <button
                    onClick={() => onNavigate('debts')}
                    className="w-full py-2 rounded-xl bg-white dark:bg-[#0B2747]/60 hover:bg-slate-50 dark:hover:bg-[#0B2747] text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors border border-slate-200 dark:border-[#1E3A5F] text-center"
                  >
                    Lihat lebih lengkap ({upcomingBills.length}) →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* C. DUAL TAB RINGKASAN: RINGKASAN KEUANGAN vs AGENDA MINGGU INI */}
          <div className="bg-[#F4F6F9] dark:bg-[#071A30]/60 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-[#1E3A5F]/70 shadow-xs">
            <div className="flex items-center p-1 bg-slate-200/80 dark:bg-[#0B2747] rounded-2xl mb-4 max-w-sm">
              <button
                onClick={() => setActiveBottomTab('finance')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  activeBottomTab === 'finance'
                    ? 'bg-white dark:bg-[#103863] text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Ringkasan Keuangan
              </button>
              <button
                onClick={() => setActiveBottomTab('agenda')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  activeBottomTab === 'agenda'
                    ? 'bg-white dark:bg-[#103863] text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Agenda Minggu ini
              </button>
            </div>

            {activeBottomTab === 'finance' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0B2747]/60 border border-slate-200/90 dark:border-[#1E3A5F]">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">
                      Pemasukan Bulan Ini
                    </div>
                    <div className="text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(totalIncomeCurrentMonth)}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Payroll, bisnis, dan pemasukan lain
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0B2747]/60 border border-slate-200/90 dark:border-[#1E3A5F]">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">
                      Pengeluaran Bulan Ini
                    </div>
                    <div className="text-lg font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
                      {formatRupiah(totalExpenseCurrentMonth)}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Kebutuhan, cicilan, dan tagihan
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0B2747]/60 border border-slate-200/90 dark:border-[#1E3A5F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Total Kekayaan Bersih (Net Worth)
                    </span>
                    <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                      {formatRupiah(totalNetWorth)}
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="px-3.5 py-1.5 bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors shrink-0 shadow-2xs"
                  >
                    Buka Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1 mb-1">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    To-do List & Pengingat Keuangan ({familyAgenda.filter((a) => !a.isCompleted).length} aktif)
                  </span>
                  <button
                    onClick={() => setIsAddAgendaModalOpen(true)}
                    className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Agenda</span>
                  </button>
                </div>

                {familyAgenda.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 bg-white dark:bg-[#0B2747]/40 rounded-2xl border border-dashed border-slate-200 dark:border-[#1E3A5F]">
                    Belum ada agenda mingguan. Klik Tambah Agenda untuk membuat to-do list keuangan keluarga.
                  </div>
                ) : (
                  familyAgenda.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleAgendaItem(item.id)}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer select-none ${
                        item.isCompleted
                          ? 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 text-slate-400'
                          : 'bg-white dark:bg-[#0B2747]/60 hover:bg-slate-50 dark:hover:bg-[#0B2747] border-slate-200/90 dark:border-[#1E3A5F] text-slate-900 dark:text-slate-100 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAgendaItem(item.id);
                          }}
                          className={`w-4.5 h-4.5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                            item.isCompleted
                              ? 'bg-slate-800 dark:bg-teal-600 text-white'
                              : 'border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                          }`}
                        >
                          {item.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        <div className="min-w-0">
                          <div className={`text-xs font-semibold truncate ${item.isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                            {item.title}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {item.categoryName} {item.dueDate && `· ${formatTanggal(item.dueDate)}`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pl-2">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                          item.priority === 'high'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {item.priority === 'high' ? 'Prioritas' : 'Rutin'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAgendaItem(item.id);
                          }}
                          className="text-slate-300 dark:text-slate-600 hover:text-rose-500 p-1 rounded-lg transition-colors cursor-pointer"
                          title="Hapus agenda"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* D. WALLET & DOMPET AKTIF (HORIZONTAL CAROUSEL) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                WALLET & DOMPET AKTIF
              </h2>
              <button
                onClick={() => onNavigate('accounts')}
                className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline transition-colors inline-flex items-center gap-1"
              >
                + Kelola Rekening
              </button>
            </div>

            <div className="flex items-stretch gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
              {/* All Wallets */}
              <div
                onClick={() => setSelectedWalletId('all')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer min-w-[200px] sm:min-w-[220px] shrink-0 snap-start select-none ${
                  selectedWalletId === 'all'
                    ? 'bg-slate-900 dark:bg-[#0B2747] text-white border-slate-900 dark:border-[#1E3A5F] shadow-md'
                    : 'bg-white dark:bg-[#071A30]/80 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-[#1E3A5F]/70'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className={selectedWalletId === 'all' ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}>
                    Semua Wallet
                  </span>
                  <Wallet className="w-4 h-4 opacity-75" />
                </div>
                <div className="text-base sm:text-lg font-bold font-mono tabular-nums">
                  {formatRupiah(liquidCash)}
                </div>
                <div className={`text-[10px] mt-0.5 ${selectedWalletId === 'all' ? 'text-teal-300' : 'text-slate-400'}`}>
                  {accounts.length} rekening aktif
                </div>
              </div>

              {/* Individual accounts */}
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  onClick={() => setSelectedWalletId(acc.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer min-w-[200px] sm:min-w-[220px] shrink-0 snap-start select-none ${
                    selectedWalletId === acc.id
                      ? 'bg-slate-900 dark:bg-[#0B2747] text-white border-slate-900 dark:border-[#1E3A5F] shadow-md'
                      : 'bg-white dark:bg-[#071A30]/80 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-[#1E3A5F]/70'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className={`truncate font-semibold ${selectedWalletId === acc.id ? 'text-slate-200' : 'text-slate-700 dark:text-slate-200'}`}>
                      {acc.name}
                    </span>
                    {acc.type === 'bank' ? (
                      <Building className="w-4 h-4 opacity-75" />
                    ) : acc.type === 'ewallet' ? (
                      <Smartphone className="w-4 h-4 opacity-75" />
                    ) : (
                      <CreditCard className="w-4 h-4 opacity-75" />
                    )}
                  </div>
                  <div className="text-base sm:text-lg font-bold font-mono tabular-nums">
                    {formatRupiah(acc.balance)}
                  </div>
                  <div className={`text-[10px] mt-0.5 ${selectedWalletId === acc.id ? 'text-teal-300' : 'text-slate-400'}`}>
                    {acc.accountNumber || acc.type.toUpperCase()}
                  </div>
                </div>
              ))}

              {/* Gold card in carousel */}
              <div
                onClick={() => onNavigate('gold-savings')}
                className="p-3.5 rounded-2xl border border-amber-300/80 dark:border-amber-600/40 bg-gradient-to-br from-amber-50 to-yellow-100/60 dark:from-[#0B2747] dark:to-amber-950/30 text-slate-900 dark:text-slate-100 transition-all cursor-pointer min-w-[200px] sm:min-w-[220px] shrink-0 snap-start hover:shadow-xs select-none"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-amber-900 dark:text-amber-300">Tabungan Emas</span>
                  <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-amber-950 dark:text-amber-200">
                  {goldPortfolio.totalGrams.toFixed(3)} gr
                </div>
                <div className="text-[10px] text-amber-800 dark:text-amber-400 mt-0.5">
                  ≈ {formatRupiah(goldValuation)}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* MODAL: TAMBAH AGENDA */}
      {isAddAgendaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#071A30] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-[#1E3A5F]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Tambah Agenda Keluarga</h3>
              <button
                onClick={() => setIsAddAgendaModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAgenda} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Agenda / Kegiatan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Service berkala, bayar SPP"
                  value={newAgendaTitle}
                  onChange={(e) => setNewAgendaTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B2747] text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori
                  </label>
                  <select
                    value={newAgendaCategory}
                    onChange={(e) => setNewAgendaCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B2747] text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Jadwal Maintenance">Jadwal Maintenance</option>
                    <option value="Jadwal Bayar & Belanja">Jadwal Bayar & Belanja</option>
                    <option value="Evaluasi Keuangan">Evaluasi Keuangan</option>
                    <option value="Keluarga & Anak">Keluarga & Anak</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={newAgendaDate}
                    onChange={(e) => setNewAgendaDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B2747] text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Prioritas
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      checked={newAgendaPriority === 'normal'}
                      onChange={() => setNewAgendaPriority('normal')}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    Biasa
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      checked={newAgendaPriority === 'high'}
                      onChange={() => setNewAgendaPriority('high')}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    Prioritas Tinggi
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddAgendaModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-700 rounded-xl shadow-xs"
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BAYAR TAGIHAN CEPAT */}
      {payingBillId && billToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#071A30] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-[#1E3A5F]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Konfirmasi Pembayaran</h3>
              <button
                onClick={() => setPayingBillId(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-[#0B2747] border border-teal-200 dark:border-[#1E3A5F]">
                <div className="text-xs text-teal-800 dark:text-teal-300 font-medium">Tagihan yang akan dibayar:</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{billToPay.title}</div>
                <div className="text-lg font-bold font-mono tabular-nums text-teal-900 dark:text-teal-200 mt-1">
                  {formatRupiah(billToPay.amount)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Rekening Sumber Dana:
                </label>
                <select
                  value={selectedPayAccount}
                  onChange={(e) => setSelectedPayAccount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B2747] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — Saldo: {formatRupiah(a.balance)}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Saldo rekening akan otomatis dipotong dan dicatat sebagai transaksi pengeluaran di buku kas.
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPayingBillId(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayBill}
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-700 rounded-xl shadow-xs"
                >
                  Konfirmasi Bayar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
