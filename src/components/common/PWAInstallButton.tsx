import React, { useState } from 'react';
import { Download, Smartphone, X, Check } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'button' | 'banner' }> = ({
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  if (isInstalled) {
    if (variant === 'button') {
      return (
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
          <Check className="w-4 h-4 text-emerald-600" />
          Aplikasi PWA Sudah Terpasang
        </div>
      );
    }
    return null;
  }

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 4000);
    }
  };

  if (isInstallable) {
    if (variant === 'banner') {
      return (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-navy-brand to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-elegant">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-mint-brand">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-semibold text-sm">Pasang di Layar Utama (PWA)</p>
              <p className="text-xs text-white/70">Akses cepat tanpa browser, bekerja offline dan hemat kuota.</p>
            </div>
          </div>
          <button
            onClick={handleInstall}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-mint-brand hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold transition shadow-glow-mint whitespace-nowrap cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Install Sekarang
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={handleInstall}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-mint-brand/10 hover:bg-mint-brand/20 text-emerald-800 border border-emerald-300 text-xs font-semibold transition cursor-pointer"
        title="Pasang aplikasi di HP / Laptop"
      >
        <Download className="w-3.5 h-3.5 text-emerald-700" />
        <span className="hidden sm:inline">Install PWA</span>
        <span className="sm:hidden">Install</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install di iOS</span>
          <span className="sm:hidden">iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-slate-800 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-display font-bold text-base text-slate-900">
                  Pasang di iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0">
                    1
                  </div>
                  <p>
                    Buka website ini di <strong>Safari</strong>, lalu tekan tombol <strong>Bagikan / Share</strong> (ikon kotak dengan panah ke atas) di bilah bawah.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0">
                    2
                  </div>
                  <p>
                    Gulir ke bawah dan pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0">
                    3
                  </div>
                  <p>
                    Tekan <strong>Tambah</strong> di sudut kanan atas. Aplikasi Keuangan Keluarga akan langsung muncul di layar iPhone Anda!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
