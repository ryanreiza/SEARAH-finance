import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCircle2,
  Moon,
  Sun,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatBulanTahun, formatBulanTahunSingkat, formatRupiah } from '../../utils/format';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { SearahLogo } from '../common/SearahLogo';

interface HeaderProps {
  currentTab?: string;
  onOpenQuickInput: () => void;
  onOpenDataMigration: () => void;
  onNavigateToTab: (tabId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenQuickInput,
  onOpenDataMigration,
  onNavigateToTab,
}) => {
  const {
    currentMonthKey,
    setCurrentMonthKey,
    budgetAlerts,
    billReminders,
    payBill,
    accounts,
    isDarkMode,
    toggleDarkMode,
  } = useFinance();

  const isHome = currentTab === 'home';
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);

  // Close alerts popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (alertRef.current && !alertRef.current.contains(event.target as Node)) {
        setIsAlertOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute urgent and upcoming bills
  const unpaidBills = billReminders.filter((b) => !b.isPaid);

  const totalAlertsCount = budgetAlerts.length + unpaidBills.length;

  const handlePrevMonth = () => {
    const [y, m] = currentMonthKey.split('-').map(Number);
    const date = new Date(y, m - 2, 1);
    const prevKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonthKey(prevKey);
  };

  const handleNextMonth = () => {
    const [y, m] = currentMonthKey.split('-').map(Number);
    const date = new Date(y, m, 1);
    const nextKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonthKey(nextKey);
  };

  return (
    <header className="sticky top-0 z-40 glass-header px-2.5 sm:px-6 md:px-8 py-2 sm:py-3 flex items-center justify-between transition-colors safe-area-pt gap-2">
      {/* Left: Brand Logo (Menu Paling Atas) & Month Navigator */}
      <div className="flex items-center gap-1.5 sm:gap-3.5 min-w-0 shrink-0">
        {/* Brand Logo in Top Menu Bar */}
        <div
          className="flex items-center cursor-pointer group select-none transition-transform active:scale-95 shrink-0"
          onClick={() => onNavigateToTab('home')}
          title="Ke Beranda searta"
        >
          {/* Single Brand Logo in Top Menu Bar */}
          <SearahLogo variant="horizontal" size="sm" />
        </div>

        {/* Month Selector with compact mobile styling - Hidden on Beranda */}
        {!isHome && (
          <>
            <div className="hidden sm:block h-6 w-px bg-slate-200 mx-0.5 shrink-0" />

            <div className="flex items-center bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-0.5 sm:p-1 shadow-2xs shrink-0">
              <button
                onClick={handlePrevMonth}
                className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer min-w-[26px] min-h-[26px] sm:min-w-[28px] sm:min-h-[28px] flex items-center justify-center"
                title="Bulan Sebelumnya"
                aria-label="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <div className="px-1.5 sm:px-3 flex items-center gap-1 sm:gap-2">
                <Calendar className="w-3.5 h-3.5 text-teal-600 hidden sm:inline shrink-0" />
                <span className="text-[11px] sm:text-sm font-display font-bold text-[#0B2747] tracking-tight whitespace-nowrap">
                  <span className="sm:hidden">{formatBulanTahunSingkat(currentMonthKey)}</span>
                  <span className="hidden sm:inline">{formatBulanTahun(currentMonthKey)}</span>
                </span>
              </div>
              <button
                onClick={handleNextMonth}
                className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer min-w-[26px] min-h-[26px] sm:min-w-[28px] sm:min-h-[28px] flex items-center justify-center"
                title="Bulan Berikutnya"
                aria-label="Bulan Berikutnya"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Brand Tagline in Header for wide screens */}
            <div className="hidden xl:flex items-center gap-2 text-xs font-semibold text-slate-500 border-l border-slate-200 pl-4">
              <span className="w-2 h-2 rounded-full bg-[#14B8A6]" />
              <span>Satu Tujuan. Keuangan Lebih Terarah.</span>
            </div>
          </>
        )}
      </div>

      {/* Right: Actions, Alerts Popover, PWA Button, Quick Add (Desktop) */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* PWA Install Button (Compact icon on mobile, full on desktop) */}
        <PWAInstallButton variant="header" />

        {/* Budget & Bill Alerts Popover */}
        <div className="relative" ref={alertRef}>
          <button
            onClick={() => setIsAlertOpen(!isAlertOpen)}
            className="relative p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white/90 hover:bg-stone-100 border border-stone-200 text-slate-700 transition cursor-pointer shadow-xs min-w-[34px] min-h-[34px] sm:min-w-0 sm:min-h-0 flex items-center justify-center shrink-0"
            title="Pemberitahuan Anggaran & Tagihan"
            aria-label="Notifikasi dan Pengingat"
          >
            <Bell className="w-4 h-4" />
            {totalAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 sm:w-5 sm:h-5 bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {totalAlertsCount}
              </span>
            )}
          </button>

          {isAlertOpen && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-20px)] max-w-sm sm:w-96 rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-stone-200 p-4 text-slate-800 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-slate-800" />
                  <h4 className="font-display font-bold text-sm text-slate-900">
                    Pusat Pengingat & Anggaran
                  </h4>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {totalAlertsCount} Notifikasi
                </span>
              </div>

              <div className="mt-3 space-y-3 max-h-72 overflow-y-auto pr-1">
                {/* Budget Alerts */}
                {budgetAlerts.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                      Peringatan Batas Anggaran
                    </p>
                    {budgetAlerts.map((b, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{b.categoryName}</p>
                          <p className="text-slate-600 mt-0.5">
                            Terpakai <span className="font-mono font-bold">{formatRupiah(b.spent)}</span> dari limit {formatRupiah(b.budget)} ({b.percent}%)
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Unpaid Bills Reminders */}
                {unpaidBills.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                      Pengingat Tagihan Bulanan Belum Dibayar
                    </p>
                    {unpaidBills.map((bill) => (
                      <div
                        key={bill.id}
                        className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs text-rose-900 flex items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900">{bill.title}</p>
                          <p className="font-mono text-emerald-800 font-bold">
                            {formatRupiah(bill.amount)}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Jatuh tempo: {bill.dueDate}
                          </p>
                        </div>
                        <button
                          onClick={() => payBill(bill.id, bill.preferredAccountId || accounts[0]?.id)}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-semibold transition shrink-0 cursor-pointer"
                        >
                          Bayar
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {totalAlertsCount === 0 && (
                  <div className="py-6 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-xs font-semibold text-slate-800">
                      Semua Aman & Terkendali!
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Tidak ada anggaran yang membengkak dan seluruh tagihan telah dibayar.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Night / Day Mode Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white/90 hover:bg-stone-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-stone-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer shadow-xs min-w-[34px] min-h-[34px] flex items-center justify-center shrink-0"
          title={isDarkMode ? 'Mode Terang (Day Mode)' : 'Mode Gelap (Night Mode)'}
          aria-label="Ubah Mode Gelap / Terang"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Quick Add Button - Desktop Only (Hidden on Beranda as requested) */}
        {!isHome && (
          <button
            onClick={onOpenQuickInput}
            className="hidden sm:flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md transition transform active:scale-95 cursor-pointer shrink-0"
            title="Catat Transaksi"
          >
            <Plus className="w-4 h-4 text-mint-brand" />
            <span>Catat Transaksi</span>
          </button>
        )}
      </div>
    </header>
  );
};
