import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  X,
  Check,
  Share,
  PlusSquare,
  MoreVertical,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'button' | 'banner' | 'sidebar' | 'drawer';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>(isIOS ? 'ios' : 'android');
  const [justInstalled, setJustInstalled] = useState(false);

  // If already installed and running standalone:
  if (isInstalled) {
    if (variant === 'button' || variant === 'banner') {
      return (
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-200">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Aplikasi SEARAH Sudah Terpasang di HP</span>
        </div>
      );
    }
    return null;
  }

  const handleAction = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 4000);
        return;
      }
    }
    // Open the visual install guide modal for Android Chrome & iOS Safari
    setShowModal(true);
  };

  // 1. HEADER VARIANT (Compact for mobile and desktop topbar)
  const renderHeader = () => (
    <button
      onClick={handleAction}
      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-[#0B2747] border border-teal-500/30 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0 ${className}`}
      title="Download & Pasang SEARAH di HP (Android / iPhone)"
    >
      <Download className="w-3.5 h-3.5 text-teal-700 shrink-0" />
      <span className="hidden sm:inline">Download App</span>
      <span className="sm:hidden text-[11px]">Install</span>
    </button>
  );

  // 2. BANNER VARIANT (Used on Settings and Dashboard)
  const renderBanner = () => (
    <div className={`p-5 rounded-2xl bg-gradient-to-r from-[#071A30] via-[#0B2747] to-[#0D3B66] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-elegant border border-[#1E3A5F] ${className}`}>
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center p-2 shrink-0 border border-white/10 shadow-xs">
          <img
            src="/icon-192.png"
            alt="SEARAH App Icon"
            className="w-full h-full object-contain rounded-xl select-none"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-display font-bold text-sm sm:text-base text-white">
              Pasang Aplikasi SEARAH di HP Anda
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#14B8A6]/20 text-teal-300 border border-[#14B8A6]/40">
              PWA
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            Dapat diunduh langsung di <strong>Google Chrome (Android)</strong> dan <strong>Safari (iPhone)</strong> tanpa perlu App Store.
          </p>
        </div>
      </div>

      <button
        onClick={handleAction}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#14B8A6] hover:bg-teal-400 text-[#071A30] rounded-xl text-xs font-extrabold transition shadow-glow-teal whitespace-nowrap cursor-pointer active:scale-95 shrink-0"
      >
        <Download className="w-4 h-4 text-[#071A30]" />
        <span>Install Aplikasi Sekarang</span>
      </button>
    </div>
  );

  // 3. DRAWER / BUTTON VARIANT
  const renderButton = () => (
    <button
      onClick={handleAction}
      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 ${className}`}
    >
      <Download className="w-4 h-4 text-teal-400" />
      <span>Pasang di HP (Android & iPhone)</span>
    </button>
  );

  return (
    <>
      {variant === 'header' && renderHeader()}
      {variant === 'banner' && renderBanner()}
      {(variant === 'button' || variant === 'drawer') && renderButton()}

      {/* MULTI-PLATFORM DOWNLOAD MODAL (Android Chrome & iPhone Safari) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-stone-200 text-slate-800 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0B2747] p-1.5 flex items-center justify-center shadow-xs">
                  <img
                    src="/icon-192.png"
                    alt="Logo SEARAH"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 leading-tight">
                    Download Aplikasi SEARAH
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Akses instan dari Layar Utama HP Anda
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-slate-400 hover:text-slate-700 transition"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Direct Install Button if Browser Supports One-Click Install */}
            {isInstallable && (
              <div className="my-4 p-4 rounded-2xl bg-teal-50 border border-teal-200">
                <p className="text-xs text-teal-900 font-semibold mb-2">
                  Browser Anda mendukung pemasangan langsung:
                </p>
                <button
                  onClick={async () => {
                    const ok = await install();
                    if (ok) setShowModal(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Install Sekarang ke HP
                </button>
              </div>
            )}

            {/* Platform Selector Tabs */}
            <div className="grid grid-cols-2 p-1.5 bg-stone-100 rounded-2xl my-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'android'
                    ? 'bg-white text-[#0B2747] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Google Chrome (Android)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'ios'
                    ? 'bg-white text-[#0B2747] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Share className="w-4 h-4 text-blue-600" />
                <span>Safari (iPhone/iOS)</span>
              </button>
            </div>

            {/* TAB CONTENT: ANDROID CHROME */}
            {activeTab === 'android' && (
              <div className="space-y-3.5 text-xs text-slate-700">
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">
                      Buka di Browser Google Chrome
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Pastikan Anda mengakses tautan web ini melalui aplikasi <strong>Chrome</strong> di ponsel Android Anda.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      Tekan Menu Titik Tiga <MoreVertical className="w-4 h-4 text-slate-700 inline" />
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Ketuk ikon titik tiga (<strong>⋮</strong>) di pojok kanan atas layar Chrome.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">
                      Pilih "Install Aplikasi" atau "Tambahkan ke Layar Utama"
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Pilih <strong>"Install aplikasi"</strong> (atau <em>Add to Home screen</em>). Aplikasi <strong>SEARAH</strong> akan otomatis terpasang dengan logo resmi di daftar aplikasi Android Anda!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: IPHONE SAFARI */}
            {activeTab === 'ios' && (
              <div className="space-y-3.5 text-xs text-slate-700">
                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">
                      Buka di Browser Safari
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Pastikan web ini dibuka di browser <strong>Safari</strong> bawaan iPhone (bukan di dalam in-app browser).
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      Tekan Tombol Bagikan / Share <Share className="w-4 h-4 text-blue-600 inline" />
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Ketuk tombol <strong>Share</strong> (ikon kotak dengan panah ke atas) di bilah bawah layar iPhone Anda.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      Pilih "Tambah ke Layar Utama" <PlusSquare className="w-4 h-4 text-slate-700 inline" />
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Gulir ke bawah dan ketuk <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>, lalu tekan <strong>Tambah (Add)</strong> di pojok kanan atas.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Features */}
            <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Mendukung Mode Offline
              </span>
              <span>Tanpa Iklan • Aman & Ringan</span>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
            >
              Tutup Petunjuk
            </button>
          </div>
        </div>
      )}
    </>
  );
};
