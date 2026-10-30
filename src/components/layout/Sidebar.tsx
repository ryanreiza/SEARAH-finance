import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Landmark,
  Layers,
  PiggyBank,
  Scale,
  Target,
  FileSpreadsheet,
  PieChart,
  CalendarDays,
  Bot,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah } from '../../utils/format';
import { SearahLogo } from '../common/SearahLogo';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { totalNetWorth, userProfile } = useFinance();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transaksi', icon: ReceiptText },
    { id: 'accounts', label: 'Rekening Bank', icon: Landmark },
    { id: 'categories', label: 'Kategori', icon: Layers },
    { id: 'savings', label: 'Tabungan', icon: PiggyBank },
    { id: 'debts', label: 'Utang & Cicilan', icon: Scale },
    { id: 'monthly-targets', label: 'Target Bulanan', icon: Target },
    { id: 'monthly-summary', label: 'Ringkasan Bulanan', icon: FileSpreadsheet },
    { id: 'reports', label: 'Laporan & Analitik', icon: PieChart },
    { id: 'yearly', label: 'Tahunan', icon: CalendarDays },
    { id: 'ai-assistant', label: 'Penasihat AI', icon: Bot, badge: 'AI' },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 h-screen sticky top-0 bg-[#0B2747] text-[#F8FAFC] border-r border-[#1E3A5F] select-none z-30">
      {/* Brand Header with SEARAH Logo */}
      <div className="p-6 pb-4 border-b border-[#1E3A5F]/80">
        <div className="cursor-pointer" onClick={() => onSelectTab('dashboard')}>
          <SearahLogo variant="monochrome-white" size="md" />
        </div>
        <p className="text-[11px] font-medium text-teal-300/80 mt-2 tracking-tight">
          Satu Tujuan. Keuangan Lebih Terarah.
        </p>
      </div>

      {/* Net Worth Snapshot in Sidebar */}
      <div className="px-5 py-3 mx-4 my-3 rounded-2xl bg-[#071A30] border border-[#1E3A5F]/90 shadow-inner">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-medium">Total Kekayaan Bersih</span>
          <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse" />
        </div>
        <div className="font-mono font-extrabold text-base text-white mt-0.5 tracking-tight">
          {formatRupiah(totalNetWorth)}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto pr-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#14B8A6]/20 to-[#14B8A6]/5 text-[#2DD4BF] border border-[#14B8A6]/40 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-[#12365F]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#2DD4BF]' : 'text-slate-400 group-hover:text-teal-300'
                  }`}
                />
                <span className="tracking-tight">{item.label}</span>
              </div>

              {item.badge ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#14B8A6]/20 text-[#2DD4BF] border border-[#14B8A6]/40 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  {item.badge}
                </span>
              ) : isActive ? (
                <div className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* User Family Profile Footer (Halo, Ayah & Ibu) */}
      <div className="p-4 border-t border-[#1E3A5F]/80 flex items-center justify-between bg-[#071A30]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#14B8A6] to-teal-700 flex items-center justify-center text-white font-display font-extrabold text-xs shadow-xs">
            S
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white leading-tight truncate">
              Ayah & Ibu
            </p>
            <p className="text-[10px] text-teal-300/80 truncate">
              Keluarga SEARAH
            </p>
          </div>
        </div>
        <button
          onClick={() => onSelectTab('settings')}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#12365F] transition cursor-pointer"
          title="Buka Pengaturan"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
