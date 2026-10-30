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
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatBulanTahun, formatRupiah } from '../../utils/format';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { SearahLogo } from '../common/SearahLogo';

interface HeaderProps {
  onOpenQuickInput: () => void;
  onOpenDataMigration: () => void;
  onNavigateToTab: (tabId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
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
  } = useFinance();

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
    <header className="sticky top-0 z-40 glass-header px-4 sm:px-8 py-3 flex items-center justify-between transition-colors">
      {/* Left: Brand Logo (Menu Paling Atas) & Month Navigator */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Brand Logo in Top Menu Bar */}
        <div
          className="flex items-center cursor-pointer group select-none transition-transform active:scale-95"
          onClick={() => onNavigateToTab('dashboard')}
          title="Ke Dashboard SEARAH"
        >
          <SearahLogo variant="horizontal" size="sm" />
        </div>

        <div className="hidden sm:block h-6 w-px bg-slate-200 mx-0.5" />

        {/* Month Selector with subtle buttons */}
        <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-2xs">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-2.5 sm:px-3 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-teal-600 hidden sm:inline" />
            <span className="text-xs sm:text-sm font-display font-bold text-[#0B2747] tracking-tight whitespace-nowrap">
              {formatBulanTahun(currentMonthKey)}
            </span>
          </div>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Brand Tagline in Header for wide screens */}
        <div className="hidden xl:flex items-center gap-2 text-xs font-semibold text-slate-500 border-l border-slate-200 pl-4">
          <span className="w-2 h-2 rounded-full bg-[#14B8A6]" />
          <span>Satu Tujuan. Keuangan Lebih Terarah.</span>
        </div>
      </div>

      {/* Right: Actions, Alerts Popover, PWA Button, Quick Add */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* PWA Install Button */}
        <PWAInstallButton variant="header" />

        {/* Budget & Bill Alerts Popover (Complies with UX rule: alert anggaran hanya via popover di header) */}
        <div className="relative" ref={alertRef}>
          <button
            onClick={() => setIsAlertOpen(!isAlertOpen)}
            className="relative p-2.5 rounded-2xl bg-white/90 hover:bg-stone-100 border border-stone-200 text-slate-700 transition cursor-pointer shadow-xs"
            title="Pemberitahuan Anggaran & Tagihan"
          >
            <Bell className="w-4 h-4" />
            {totalAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {totalAlertsCount}
              </span>
            )}
          </button>

          {isAlertOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white shadow-2xl border border-stone-200 p-4 text-slate-800 z-50 animate-in fade-in zoom-in-95">
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

        {/* Quick Add Button */}
        <button
          onClick={onOpenQuickInput}
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md transition transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-mint-brand" />
          <span className="hidden sm:inline">Catat Transaksi</span>
          <span className="sm:hidden">Catat</span>
        </button>
      </div>
    </header>
  );
};
