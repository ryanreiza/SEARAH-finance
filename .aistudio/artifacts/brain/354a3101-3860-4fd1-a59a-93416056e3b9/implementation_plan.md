# Rencana Implementasi: Audit & Aktivasi Menyeluruh Aplikasi searta

Audit ini bertujuan untuk mengaktifkan seluruh menu, fungsi interaktif, sinkronisasi ikon, dan penyempurnaan palet warna resmi searta agar aplikasi 100% siap digunakan.

---

## 1. Peningkatan Pencarian Kilat Beranda (Global Instant Search)
- **Kondisi saat ini**: Input pencarian hanya memfilter daftar agenda lokal sederhana.
- **Peningkatan**:
  - Hubungkan input pencarian ke pencarian global multi-kategori:
    - 🚀 **Fitur & Menu**: Navigasi instan ke halaman target (Keuangan, Emas, Transaksi, Laporan, dll.).
    - 💳 **Rekening & Dompet**: Hasil pencarian rekening (BCA, Mandiri, Dompet Tunai) beserta saldo realtime.
    - 📝 **Transaksi Keuangan**: Pencarian transaksi berdasarkan judul, nominal, dan catatan.
    - 📅 **Agenda & Tagihan**: Item to-do list keluarga dan tagihan jatuh tempo yang cocok.
  - Tampilkan floating dropdown yang rapi, elegan, responsif terhadap klik luar (click outside), dan tombol bersihkan (X).

---

## 2. Fitur Utama: Grid Menu yang Dapat Diperluas (8 ke 14 Fitur)
- **Kondisi saat ini**: Tombol "Lihat semua" hanya mengarahkan ke dashboard keuangan.
- **Peningkatan**:
  - Jadikan tombol "Lihat semua v" berfungsi sebagai **toggle ekspansi grid**:
    - Mode ringkas (default): 8 ikon pintas utama (Keuangan, Transaksi, Emas, Rekening, Anggaran, Tagihan, Laporan, Asisten).
    - Mode lengkap (saat diklik): Menampilkan seluruh 14 fitur searta (termasuk Tabungan Impian, Ringkasan Bulanan, Kategori, Rekap Tahunan, Migrasi Data, Pengaturan) dengan animasi halus.
  - Ikon panah berubah menjadi `ChevronUp` dengan label "Tutup sebagian ^".
  - Tetap konsisten dengan gaya monokrom elegan dan label 1 kata utuh tanpa terpotong.

---

## 3. Sinkronisasi Ikon Menu (Perbaikan Ikon Tidak Sinkron)
- **Tagihan**: Ganti ikon `Scale` (timbangan) menjadi `CalendarClock` (kalender pengingat jatuh tempo & cicilan) pada `HomePage.tsx`, `Sidebar.tsx`, dan `BottomNav.tsx`.
- **Keuangan**: Pastikan penggunaan ikon `LayoutDashboard` selaras di seluruh komponen Beranda, Sidebar, dan Bottom Navigation.

---

## 4. Aktivasi Dinamis "Agenda Minggu Ini"
- **Kondisi saat ini**: Tab "Agenda Minggu ini" di bagian bawah Beranda berisi teks statis contoh.
- **Peningkatan**:
  - Hubungkan dengan data `familyAgenda` keluarga.
  - Tampilkan kegiatan terjadwal untuk minggu berjalan, dengan kemampuan toggle selesai (checklist) dan tombol tambah agenda rutin keluarga secara langsung.

---

## 5. Penyempurnaan Palet Warna Resmi & Night/Day Mode (Dark Mode)
- **Kondisi saat ini**: Variabel CSS di `index.css` belum memiliki mapping khusus untuk kelas `.dark`, sehingga latar belakang utama tetap terang saat tombol Night Mode di header ditekan.
- **Peningkatan**:
  - Tambahkan definisi variabel CSS untuk `.dark`:
    - Background: `#061527` / `#071A30` (Navy Pekat Resmi)
    - Card Surface: `#0B2747` / `#09223D` dengan border halus `#1E3A5F`
    - Text: `#F8FAFC` & `#94A3B8`
    - Glass header & navigation dengan dark backdrop filter.
  - Pastikan tombol Night/Day mode di Header memberikan pengalaman visual yang konsisten dan nyaman di seluruh halaman.

---

## Verifikasi & Pengujian
- Jalankan `lint_applet` untuk memastikan tidak ada kesalahan TypeScript.
- Jalankan `compile_applet` untuk memverifikasi proses build produksi.
- Uji interaksi pencarian, ekspansi 14 grid fitur, tombol bayar tagihan, dan perpindahan mode malam.
