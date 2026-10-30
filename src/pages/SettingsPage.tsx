import React, { useState, useRef } from 'react';
import {
  Settings,
  Palette,
  Database,
  Download,
  Upload,
  RotateCcw,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  UploadCloud,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useFinance, DEFAULT_SEARAH_SYMBOL } from '../context/FinanceContext';
import { PageHeader } from '../components/common/PageHeader';
import { ThemeName } from '../types';
import { SUPABASE_SCHEMA_SQL } from '../utils/supabaseSql';
import { PWAInstallButton } from '../components/common/PWAInstallButton';
import { SearahLogo } from '../components/common/SearahLogo';

export const SettingsPage: React.FC = () => {
  const {
    userProfile,
    setTheme,
    updateUserProfile,
    resetAllData,
    accounts,
    transactions,
    categories,
    savingsGoals,
    debts,
    billReminders,
    monthlyPlans,
    customSymbolUrl,
    updateCustomSymbol,
    resetCustomSymbol,
  } = useFinance();

  const [copiedSql, setCopiedSql] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState(userProfile.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(userProfile.supabaseAnonKey || '');
  const [isSavedSupabase, setIsSavedSupabase] = useState(false);

  // Custom S Symbol upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSymbolFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    // Validate type
    if (!file.type.startsWith('image/')) {
      setUploadError('File harus berupa format gambar (PNG, SVG, JPG, WebP).');
      return;
    }

    // Max 4MB
    if (file.size > 4 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 4 MB agar performa tetap cepat.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      updateCustomSymbol(result);
      setUploadSuccess('Simbol S berhasil diperbarui dan diterapkan ke seluruh aplikasi!');
      setTimeout(() => setUploadSuccess(null), 5000);
    };
    reader.onerror = () => {
      setUploadError('Gagal membaca file gambar.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Copy Supabase SQL schema to clipboard
  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Save Supabase credentials
  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      supabaseUrl,
      supabaseAnonKey,
      isSupabaseConnected: Boolean(supabaseUrl && supabaseAnonKey),
    });
    setIsSavedSupabase(true);
    setTimeout(() => setIsSavedSupabase(false), 3000);
  };

  // Full JSON backup export
  const handleExportFullBackup = () => {
    const fullBackup = {
      app: 'SEARAH - AI Family Finance',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      userProfile,
      accounts,
      categories,
      transactions,
      savingsGoals,
      debts,
      billReminders,
      monthlyPlans,
    };

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_SEARAH_Finance_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Restore JSON backup
  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.accounts) localStorage.setItem('keu_keluarga_accounts', JSON.stringify(data.accounts));
        if (data.categories) localStorage.setItem('keu_keluarga_categories', JSON.stringify(data.categories));
        if (data.transactions) localStorage.setItem('keu_keluarga_transactions', JSON.stringify(data.transactions));
        if (data.savingsGoals) localStorage.setItem('keu_keluarga_savings', JSON.stringify(data.savingsGoals));
        if (data.debts) localStorage.setItem('keu_keluarga_debts', JSON.stringify(data.debts));
        if (data.billReminders) localStorage.setItem('keu_keluarga_bills', JSON.stringify(data.billReminders));
        if (data.monthlyPlans) localStorage.setItem('keu_keluarga_monthly_plans', JSON.stringify(data.monthlyPlans));
        if (data.userProfile) localStorage.setItem('keu_keluarga_profile', JSON.stringify(data.userProfile));

        alert('Data berhasil dipulihkan! Halaman akan dimuat ulang.');
        window.location.reload();
      } catch (err) {
        alert('File JSON backup tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        icon={<Settings className="w-6 h-6 text-mint-brand" />}
        title="Pengaturan Aplikasi"
        subtitle="Personalisasi tema, integrasi database Supabase, dan pencadangan data keluarga"
      />

      {/* PWA Banner */}
      <PWAInstallButton variant="banner" />

      {/* SEARAH Brand Identity & Philosophy Showcase */}
      <div className="card-bento p-6 space-y-5 bg-gradient-to-br from-white via-[#F8FAFC] to-[#ECFDF5]/30 border-teal-500/20 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <SearahLogo variant="horizontal" size="lg" />
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Satu Tujuan. Keuangan Lebih Terarah.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Logo Philosophy */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Filosofi Logo: Dua Jalan, Satu Arah
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              Simbol <strong>SEARAH</strong> terinspirasi dari dua jalur kehidupan yang bertemu dan bergerak ke arah yang sama. Melambangkan pasangan suami-istri yang menyatukan visi, saling melengkapi, dan melangkah bersama menuju masa depan finansial yang kokoh.
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-brand" />Dua Jalur Pasangan</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-navy-brand" />Keselarasan</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />Tujuan Bersama</span>
            </div>
          </div>

          {/* Brand Colors */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Palet Warna Resmi SEARAH
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-6 h-6 rounded-lg bg-[#0B2747] shrink-0 shadow-xs" />
                <div>
                  <p className="font-bold text-slate-900">Navy (#0B2747)</p>
                  <p className="text-[10px] text-slate-500">Stabilitas & Percaya</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-6 h-6 rounded-lg bg-[#14B8A6] shrink-0 shadow-xs" />
                <div>
                  <p className="font-bold text-slate-900">Teal (#14B8A6)</p>
                  <p className="text-[10px] text-slate-500">Tumbuh & Optimis</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-6 h-6 rounded-lg bg-[#F8FAFC] border border-stone-300 shrink-0 shadow-xs" />
                <div>
                  <p className="font-bold text-slate-900">Putih Hangat (#F8FAFC)</p>
                  <p className="text-[10px] text-slate-500">Kejelasan & Tenang</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-6 h-6 rounded-lg bg-[#94A3B8] shrink-0 shadow-xs" />
                <div>
                  <p className="font-bold text-slate-900">Abu-abu (#94A3B8)</p>
                  <p className="text-[10px] text-slate-500">Keseimbangan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Theme Selection (Warm Cream vs Classic) */}
      <div className="card-bento p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-stone-200">
          <Palette className="w-5 h-5 text-slate-800" />
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">
              Pilihan Tema Desain (Design System)
            </h3>
            <p className="text-xs text-slate-500">
              Pilihan disimpan otomatis di browser untuk kenyamanan visual Anda
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Theme 1: Warm Cream + Navy + Mint */}
          <div
            onClick={() => setTheme('warm')}
            className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
              userProfile.theme === 'warm'
                ? 'border-slate-900 bg-[#FAF7F2] shadow-sm'
                : 'border-stone-200 hover:border-stone-400 bg-stone-50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-bold text-sm text-slate-900">
                  Warm Cream + Navy + Mint
                </span>
                {userProfile.theme === 'warm' && (
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-mint-brand flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                Nuansa private banking hangat, ramah keluarga, krem minimalis dengan aksen mint modern.
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <span className="w-6 h-6 rounded-full bg-[#FAF7F2] border border-stone-300" title="Krem Hangat" />
              <span className="w-6 h-6 rounded-full bg-[#192849]" title="Navy Brand" />
              <span className="w-6 h-6 rounded-full bg-[#25B18B]" title="Mint Accent" />
            </div>
          </div>

          {/* Theme 2: Classic Neutral Grey */}
          <div
            onClick={() => setTheme('classic')}
            className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
              userProfile.theme === 'classic'
                ? 'border-slate-900 bg-white shadow-sm'
                : 'border-stone-200 hover:border-stone-400 bg-stone-50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-bold text-sm text-slate-900">
                  Classic Clean Slate
                </span>
                {userProfile.theme === 'classic' && (
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                Nuansa abu terang netral monokromatik, kartu putih bersih dengan navy gelap yang elegan.
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <span className="w-6 h-6 rounded-full bg-[#F3F4F6] border border-stone-300" title="Abu Netral" />
              <span className="w-6 h-6 rounded-full bg-[#0F172A]" title="Dark Slate" />
              <span className="w-6 h-6 rounded-full bg-[#0D9488]" title="Teal Accent" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Supabase Integration & Production Deployment */}
      <div className="card-bento p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Koneksi Database Supabase (Cloud & Multi-Device)
              </h3>
              <p className="text-xs text-slate-500">
                Aplikasi siap dijual dan dipasang ke akun Supabase pembeli dengan Row Level Security (RLS)
              </p>
            </div>
          </div>

          <button
            onClick={handleCopySql}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-mint-brand" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'Skrip SQL Tersalin!' : 'Salin Skrip SQL Supabase'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Semua transaksi, rekening, anggaran, dan pesan chat terisolasi aman per pengguna (RLS). Untuk menghubungkan ke database Supabase Anda sendiri:
        </p>

        <form onSubmit={handleSaveSupabase} className="space-y-3 pt-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Supabase Anon Public API Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">
              {userProfile.isSupabaseConnected ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Terkoneksi ke Cloud Supabase
                </span>
              ) : (
                'Saat ini menggunakan penyimpanan Offline-First (LocalStorage & IndexedDB)'
              )}
            </span>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              {isSavedSupabase ? 'Tersimpan!' : 'Simpan Kredensial'}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Backup & Restore Data */}
      <div className="card-bento p-6 space-y-4">
        <h3 className="font-display font-bold text-base text-slate-900 pb-2 border-b border-stone-200">
          Cadangkan & Pulihkan Data (Backup / Restore)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-700" />
              Unduh Backup Penuh (JSON)
            </h4>
            <p className="text-xs text-slate-600">
              Simpan seluruh data transaksi, rekening, impian tabungan, dan cicilan utang ke dalam satu file aman di perangkat Anda.
            </p>
            <button
              onClick={handleExportFullBackup}
              className="mt-2 px-4 py-2 bg-white hover:bg-stone-100 border border-stone-300 text-slate-800 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
            >
              Unduh File Backup JSON
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              Pulihkan Data dari File
            </h4>
            <p className="text-xs text-slate-600">
              Unggah file JSON backup yang pernah Anda unduh sebelumnya untuk mengembalikan seluruh catatan finansial.
            </p>
            <label className="inline-block mt-2 px-4 py-2 bg-white hover:bg-stone-100 border border-stone-300 text-slate-800 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs">
              <span>Pilih File Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 4. Reset Data Section */}
      <div className="card-bento p-6 border-rose-200 bg-rose-50/20 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-xs text-rose-800">
              Reset ke Data Awal Demo
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Mengembalikan seluruh data rekening, transaksi, dan target ke kondisi awal keluarga Indonesia.
            </p>
          </div>

          {resetConfirm ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  resetAllData();
                  setResetConfirm(false);
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Ya, Reset Sekarang
              </button>
              <button
                onClick={() => setResetConfirm(false)}
                className="px-3 py-1.5 bg-stone-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setResetConfirm(true)}
              className="px-4 py-2 border border-rose-300 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Reset Data Demo
            </button>
          )}
        </div>
      </div>

      {/* 5. Kustomisasi Simbol S (Upload Gambar) */}
      <div className="card-bento p-6 space-y-6 bg-white border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-[#0B2747]">
                Kustomisasi Simbol S (Upload Gambar)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ganti simbol S "Dua Jalan, Satu Arah" dengan gambar atau logo pilihan keluarga Anda.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200 w-fit flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Live Sync Logo
          </span>
        </div>

        {/* Feedback alerts */}
        {uploadSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}
        {uploadError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Preview & Upload Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Previews in different contexts */}
          <div className="lg:col-span-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pratinjau Simbol S Terpilih
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Dark Preview (Sidebar / Top Navbar) */}
              <div className="p-4 rounded-2xl bg-[#0B2747] text-white flex flex-col items-center justify-center text-center gap-2.5 border border-[#1E3A5F] shadow-sm">
                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center p-1.5">
                  <img
                    src={customSymbolUrl}
                    alt="Pratinjau Gelap"
                    className="w-full h-full object-contain select-none"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = DEFAULT_SEARAH_SYMBOL;
                    }}
                  />
                </div>
                <span className="text-[11px] font-medium text-slate-300">
                  Latar Gelap (Sidebar)
                </span>
              </div>

              {/* Light Preview (Cards & Header) */}
              <div className="p-4 rounded-2xl bg-stone-100/80 text-slate-800 flex flex-col items-center justify-center text-center gap-2.5 border border-stone-200 shadow-2xs">
                <div className="w-14 h-14 rounded-xl bg-white shadow-2xs flex items-center justify-center p-1.5 border border-stone-200/60">
                  <img
                    src={customSymbolUrl}
                    alt="Pratinjau Terang"
                    className="w-full h-full object-contain select-none"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = DEFAULT_SEARAH_SYMBOL;
                    }}
                  />
                </div>
                <span className="text-[11px] font-medium text-slate-600">
                  Latar Terang (Kartu)
                </span>
              </div>
            </div>

            {/* Combined Logo Preview */}
            <div className="p-4 rounded-2xl bg-[#071A30] border border-[#1E3A5F] flex flex-col items-center justify-center gap-2">
              <span className="text-[10px] text-teal-300 uppercase tracking-widest font-semibold">
                Tampilan Logo Lengkap
              </span>
              <SearahLogo variant="monochrome-white" size="lg" />
            </div>
          </div>

          {/* Right: Upload controls and Presets */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Unggah Gambar Simbol Baru
            </h4>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleSymbolFileChange}
              accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
              className="hidden"
            />

            {/* Drop / Click Target */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50/60 hover:bg-teal-50/30 group"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-white border border-slate-200 text-teal-600 flex items-center justify-center shadow-2xs group-hover:scale-110 transition">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm text-[#0B2747] mt-3">
                Klik untuk memilih file gambar dari perangkat
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Format didukung: PNG (transparan disarankan), SVG, JPG, WebP (maks. 4MB).
              </p>
            </div>

            {/* Action buttons & Presets */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-xs cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  Unggah Gambar Simbol
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetCustomSymbol();
                    setUploadSuccess('Simbol telah direset ke gambar default!');
                    setTimeout(() => setUploadSuccess(null), 4000);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  Reset ke Simbol Asli
                </button>
              </div>

              {/* Quick Presets */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                  Atau gunakan pilihan cepat:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateCustomSymbol(DEFAULT_SEARAH_SYMBOL);
                      setUploadSuccess('Simbol Ribbon Cyan aktif!');
                      setTimeout(() => setUploadSuccess(null), 3000);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-2 transition cursor-pointer ${
                      customSymbolUrl === DEFAULT_SEARAH_SYMBOL
                        ? 'bg-teal-50 text-teal-800 border-teal-300 font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={DEFAULT_SEARAH_SYMBOL}
                      alt="Preset Ribbon Cyan"
                      className="w-4 h-4 object-contain rounded-xs"
                    />
                    <span>Simbol Ribbon Cyan (Default)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateCustomSymbol('/assets/aistudio/Panduan_Identitas_Merek_SEARAH_Finansial_Keluarga_ebc15f68.png');
                      setUploadSuccess('Simbol diperbarui ke Emblem Panduan Brand!');
                      setTimeout(() => setUploadSuccess(null), 3000);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-2 transition cursor-pointer ${
                      customSymbolUrl === '/assets/aistudio/Panduan_Identitas_Merek_SEARAH_Finansial_Keluarga_ebc15f68.png'
                        ? 'bg-teal-50 text-teal-800 border-teal-300 font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-teal-500" />
                    <span>Emblem Panduan Brand</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Brand Identity & Filosofi SEARAH */}
      <div className="card-bento p-6 space-y-5 bg-gradient-to-br from-white to-slate-50 border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h3 className="font-display font-bold text-base text-[#0B2747]">
              Identitas Merek & Logotype SEARAH
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tipografi 'Sans Serif Geometris' dengan custom logotype huruf "A" berbentuk segitiga tanpa palang horizontal (Lambda / mata panah ke atas).
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200 w-fit">
            Sans Serif Geometris (Custom 'A')
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <SearahLogo variant="horizontal" size="lg" showTagline />
            <p className="text-xs text-slate-600 max-w-md leading-relaxed mt-2">
              <strong className="text-[#0B2747]">Custom Logotype "A":</strong> Huruf "A" dimodifikasi khusus berbentuk segitiga tajam tanpa garis horizontal, merepresentasikan simbol mata panah ke atas atau huruf Yunani Lambda (Λ) — lambang pertumbuhan, progresivitas, dan visi finansial keluarga yang terus terarah ke masa depan.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] w-full md:w-auto shrink-0">
            <div className="p-2.5 rounded-xl bg-[#0B2747] text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#0B2747] border border-white/40" />
              <div>
                <p className="font-bold">Navy</p>
                <p className="text-[10px] text-slate-300">#0B2747</p>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#14B8A6] text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#14B8A6] border border-white/40" />
              <div>
                <p className="font-bold">Teal</p>
                <p className="text-[10px] text-teal-100">#14B8A6</p>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-800 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F8FAFC] border border-slate-300" />
              <div>
                <p className="font-bold">Putih Hangat</p>
                <p className="text-[10px] text-slate-500">#F8FAFC</p>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#94A3B8]" />
              <div>
                <p className="font-bold">Abu-abu</p>
                <p className="text-[10px] text-slate-500">#94A3B8</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
