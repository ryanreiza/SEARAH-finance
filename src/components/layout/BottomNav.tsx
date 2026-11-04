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
  Plus,
  Coins,
} from 'lucide-react';
import { SearahLogo } from '../common/SearahLogo';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenQuickInput?: (tab?: 'chat' | 'voice' | 'camera' | 'manual') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickInput,
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Left slots (Ringkasan & Transaksi)
  const leftTabs = [
    { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transaksi', icon: ReceiptText },
  ];

  // Right slots (Tanya AI)
  const rightTabs = [
    { id: 'ai-assistant', label: 'Tanya AI', icon: Bot, isSpecial: true },
  ];

  // All other features in Drawer
  const moreTabs = [
    { id: 'monthly-targets', label: 'Target Anggaran', icon: Target, desc: 'Target 50/30/20 & batas pengeluaran' },
    { id: 'accounts', label: 'Rekening Bank', icon: Landmark, desc: 'Kelola saldo & transfer akun' },
    { id: 'categories', label: 'Kategori', icon: Layers, desc: 'Pemasukan & pengeluaran' },
    { id: 'savings', label: 'Tabungan', icon: PiggyBank, desc: 'Target dan progres impian' },
    { id: 'gold-savings', label: 'Tabungan Emas', icon: Coins, desc: 'Gram, beli & jual emas realtime' },
    { id: 'debts', label: 'Utang & Piutang', icon: Scale, desc: 'Pantau sisa cicilan' },
    { id: 'monthly-summary', label: 'Ringkasan Bulanan', icon: FileSpreadsheet, desc: 'Expected vs Actual' },
    { id: 'reports', label: 'Laporan & Grafik', icon: PieChart, desc: 'Budget vs Actual & rekomendasi' },
    { id: 'yearly', label: 'Tahunan', icon: CalendarDays, desc: 'Rekap 12 bulan' },
    { id: 'settings', label: 'Pengaturan', icon: Settings, desc: 'Tema, identitas, backup data' },
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
                <div className="font-bold text-xs text-white flex items-center gap-1.5 flex-wrap">
                  <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse shrink-0" />
                  <span>Install</span>
                  <img
                    src="/assets/aistudio/searta_white.png"
                    alt="searta"
                    className="h-3.5 w-auto object-contain select-none"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://i.ibb.co.com/JRt2gFkq/searta.png';
                    }}
                  />
                  <span>di HP</span>
                </div>
                <p className="text-[10px] text-teal-100/80 truncate">
                  Akses instan dari layar utama Android & iPhone
                </p>
              </div>
              <PWAInstallButton variant="button" />
            </div>

            {/* Quick Add shortcut inside Drawer */}
            <button
              onClick={() => {
                setIsMoreOpen(false);
                onOpenQuickInput?.('chat');
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0B2747] text-white shadow-sm border border-slate-800 hover:opacity-95 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-xs">Catat Transaksi Cepat</p>
                  <p className="text-[10px] text-teal-200/80">Ketik WA, Suara, atau Foto Struk AI</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-[#14B8A6] text-[#071A30] text-[10px] font-extrabold">
                Buka (+)
              </span>
            </button>

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

      {/* Sticky Bottom Bar with Center Docked FAB */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-1.5 py-1.5 flex items-center justify-around lg:hidden safe-area-pb shadow-[0_-4px_25px_rgba(0,0,0,0.06)]">
        {/* Left Slots: Ringkasan & Transaksi */}
        {leftTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl min-w-[54px] min-h-[44px] transition-all cursor-pointer ${
                isActive
                  ? 'text-[#0B2747] font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition ${
                  isActive ? 'bg-[#0B2747] text-[#14B8A6] shadow-xs' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}

        {/* CENTER DOCKED FAB (Tombol '+' Catat Transaksi Khusus Mobile) */}
        <div className="relative -mt-6 flex flex-col items-center z-10 shrink-0">
          <button
            onClick={() => onOpenQuickInput?.('chat')}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#071A30] via-[#0B2747] to-[#14B8A6] text-white flex items-center justify-center shadow-[0_8px_20px_-2px_rgba(20,184,166,0.45)] border-[3.5px] border-white active:scale-90 hover:scale-105 transition-all cursor-pointer group"
            aria-label="Catat Transaksi Cepat (+)"
            title="Catat Transaksi Cepat (+)"
          >
            <Plus className="w-7 h-7 text-[#5EEAD4] group-hover:rotate-90 transition-transform duration-300 stroke-[2.75]" />
          </button>
          <span className="text-[10px] font-bold text-[#0B2747] tracking-tight mt-0.5 select-none">
            Catat
          </span>
        </div>

        {/* Right Slots: Tanya AI */}
        {rightTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl min-w-[54px] min-h-[44px] transition-all cursor-pointer ${
                isActive
                  ? 'text-[#0B2747] font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition ${
                  isActive ? 'bg-[#0B2747] text-[#14B8A6] shadow-xs' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}

        {/* Right Slots: Lainnya (Drawer Menu) */}
        <button
          onClick={() => setIsMoreOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl min-w-[54px] min-h-[44px] transition-all cursor-pointer ${
            isMoreOpen || moreTabs.some((t) => t.id === currentTab)
              ? 'text-[#0B2747] font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition ${
              moreTabs.some((t) => t.id === currentTab) ? 'bg-[#0B2747] text-[#14B8A6] shadow-xs' : ''
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
