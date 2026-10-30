import React, { useState } from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Target,
  Bot,
  MoreHorizontal,
  Landmark,
  Layers,
  PiggyBank,
  Scale,
  FileSpreadsheet,
  PieChart,
  CalendarDays,
  Settings,
  X,
} from 'lucide-react';
import { SearahLogo } from '../common/SearahLogo';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transaksi', icon: ReceiptText },
    { id: 'monthly-targets', label: 'Target', icon: Target },
    { id: 'ai-assistant', label: 'Tanya AI', icon: Bot, isSpecial: true },
  ];

  const moreTabs = [
    { id: 'accounts', label: 'Rekening Bank', icon: Landmark, desc: 'Kelola saldo & transfer akun' },
    { id: 'categories', label: 'Kategori', icon: Layers, desc: 'Pemasukan & pengeluaran' },
    { id: 'savings', label: 'Tabungan', icon: PiggyBank, desc: 'Target dan progres impian' },
    { id: 'debts', label: 'Utang & Piutang', icon: Scale, desc: 'Pantau sisa cicilan' },
    { id: 'monthly-summary', label: 'Ringkasan Bulanan', icon: FileSpreadsheet, desc: 'Expected vs Actual' },
    { id: 'reports', label: 'Laporan & Grafik', icon: PieChart, desc: 'Budget vs Actual & rekomendasi' },
    { id: 'yearly', label: 'Tahunan', icon: CalendarDays, desc: 'Rekap 12 bulan' },
    { id: 'settings', label: 'Pengaturan', icon: Settings, desc: 'Tema, Supabase, backup data' },
  ];

  return (
    <>
      {/* Mobile Drawer for other tabs */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end lg:hidden animate-in fade-in">
          <div className="bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto p-4 sm:p-5 pb-10 shadow-2xl space-y-3.5 safe-area-pb">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <SearahLogo variant="horizontal" size="sm" />
                <span className="text-xs font-semibold text-slate-400 border-l border-slate-200 pl-2">Menu Lengkap</span>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-slate-500 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PWA Install Promo in Drawer */}
            <div className="bg-gradient-to-r from-[#0B2747] to-[#0d3b66] rounded-2xl p-3 text-white flex items-center justify-between gap-3 shadow-sm border border-white/10">
              <div className="min-w-0">
                <p className="font-bold text-xs text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse" />
                  Install SEARAH di HP
                </p>
                <p className="text-[10px] text-teal-100/80 truncate">
                  Akses instan dari layar utama Android & iPhone
                </p>
              </div>
              <PWAInstallButton variant="button" />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
              {moreTabs.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      setIsMoreOpen(false);
                    }}
                    className={`flex items-start gap-3 p-3 rounded-2xl text-left border transition min-h-[44px] cursor-pointer ${
                      isActive
                        ? 'bg-navy-brand text-white border-navy-brand shadow-sm'
                        : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-slate-800'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-teal-brand text-navy-brand font-bold' : 'bg-white text-slate-700 shadow-2xs'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-display font-bold text-xs truncate leading-tight">
                        {item.label}
                      </p>
                      <p
                        className={`text-[10px] mt-0.5 line-clamp-1 ${
                          isActive ? 'text-white/70' : 'text-slate-500'
                        }`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-nav border-t border-stone-200/80 px-2 py-2 flex items-center justify-around lg:hidden safe-area-pb">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl min-w-[56px] min-h-[44px] transition-all cursor-pointer ${
                isActive
                  ? 'text-navy-brand font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition ${
                  isActive ? 'bg-navy-brand text-teal-brand shadow-xs' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setIsMoreOpen(true)}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl min-w-[56px] min-h-[44px] transition-all cursor-pointer ${
            isMoreOpen || moreTabs.some((t) => t.id === currentTab)
              ? 'text-navy-brand font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition ${
              moreTabs.some((t) => t.id === currentTab) ? 'bg-navy-brand text-teal-brand' : ''
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Lainnya</span>
        </button>
      </nav>
    </>
  );
};
