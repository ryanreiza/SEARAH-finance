# Sistem Tabungan Emas (Gold Portfolio & Smart Savings)

Integrasi modul tabungan emas cerdas di aplikasi searta untuk mengonversi kas tabungan menjadi gram emas secara realtime, melacak imbal hasil pasar, dan mencatat transaksi penjualan kembali sebagai pemasukan baru lengkap dengan kalkulasi laba/rugi dan modal pokok.

### User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan konfirmasi pada tahap klarifikasi:
> - **Penentuan Harga**: Harga acuan pasar dinamis (misal: harga Antam/Pegadaian terstandar ~Rp1.450.000/g) yang dapat diedit langsung (*custom input*) di setiap form transaksi.
> - **Penempatan Navigasi**: Menu mandiri "Tabungan Emas" di Drawer Mobile dan Sidebar Desktop, serta widget ringkasan portofolio di Dashboard utama.
> - **Kalkulasi Laba/Rugi**: Saat penjualan emas, sistem menghitung harga perolehan rata-rata tertimbang (*Weighted Average Cost Basis*), memisahkan **Modal Pokok** dan **Laba/Rugi Bersih**, serta mencatatnya ke mutasi kas dan riwayat investasi.

---

### 1. Overview & Core Concept

- **Apa yang Dibangun**:
  Modul manajemen tabungan emas digital keluarga yang terintegrasi penuh dengan sistem kas searta.
  - **Beli Emas**: Mengurangi saldo rekening bank yang dipilih, mencatat pengeluaran pos investasi, dan menambah saldo gram emas serta modal perolehan di portofolio.
  - **Jual Emas**: Mengurangi saldo gram emas, menghitung imbal hasil investasi (untung/rugi), dan menambahkan kas hasil penjualan sebagai pemasukan baru ke rekening bank tujuan.
- **Nilai Tambah**:
  Keluarga dapat melindungi nilai kekayaan (*wealth preservation*) dari inflasi dengan aset emas riil, sambil tetap memantau likuiditas dan nilai pasar portofolio secara realtime dalam satu aplikasi keuangan terpadu.

---

### 2. User Experience & Visual Design

#### A. Key User Flows
1. **Melihat Ringkasan di Dashboard**:
   - Kartu "Portofolio Emas Keluarga": Total gram, nilai konversi rupiah saat ini, rata-rata harga beli, serta indikator keuntungan (*unrealized gain/loss* hijau/merah).
   - Tombol aksi cepat: `+ Beli Emas` dan `Jual Emas`.
2. **Halaman Khusus Tabungan Emas (`GoldSavingsPage`)**:
   - **Metrik Utama**: Total Simpanan (Gram), Nilai Portofolio (Rp), Harga Rata-rata Beli/Gram, Laba/Rugi Kumulatif Terkumpul (*Realized Gain*).
   - **Harga Acuan Pasar**: Kartu interaktif pembaruan harga emas hari ini (dengan opsi klik untuk ubah harga acuan).
   - **Form Beli Emas Modal**: Input gram / nominal rupiah, pilih rekening sumber dana, tanggal, dan catatan.
   - **Form Jual Emas Modal**: Input gram yang ingin dijual, harga jual per gram, rekening tujuan kas masuk. Sistem menampilkan pratinjau otomatis:
     $$\text{Modal Pokok} = \text{Gram} \times \text{Rata-rata Harga Beli}$$
     $$\text{Laba/Rugi} = \text{Hasil Jual} - \text{Modal Pokok}$$
   - **Riwayat Transaksi Emas**: Tabel dan kartu mutasi beli/jual dengan label gram, harga per gram, rekening, serta tag laba/rugi.
3. **Sinkronisasi Kas Transaksi**:
   - Transaksi beli otomatis masuk ke daftar transaksi dengan kategori `Investasi / Emas`.
   - Transaksi jual otomatis masuk ke daftar transaksi pemasukan dengan kategori `Penjualan Emas` dan rincian keuntungan di kolom catatan.

#### B. Visual Identity & Theme
- **Warna Aksen Khusus Emas**: Amber hangat & emas elegan (`#D97706`, `#F59E0B`, `#FEF3C7`) dipadukan harmonis dengan warna dasar navy searta (`#0B2747`) dan mint brand (`#14B8A6`).
- **Tipografi Tabular**: Semua angka gram (3 angka desimal `0.000g`) dan nilai Rupiah menggunakan `font-mono tabular-nums` untuk mencegah pergeseran layout.
- **Desain Bebas Pill Statis**: Mengikuti panduan desain tanpa kapsul warna-warni kaku; menggunakan teks bersih dengan bobot visual yang berjarak rapi.

---

### 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Metode Akuntansi Persediaan (Weighted Average Cost)**
  - *Pendekatan*: Setiap pembelian emas memperbarui harga modal rata-rata per gram secara tertimbang:
    $$\text{AvgCost}_{\text{baru}} = \frac{\text{Total Cost Sebelumnya} + \text{Nominal Beli Baru}}{\text{Total Gram Sebelumnya} + \text{Gram Beli Baru}}$$
  - *Alasan*: Metode ini paling adil, transparan, dan umum digunakan oleh platform tabungan emas resmi (seperti Pegadaian/Antam) untuk menghitung laba/rugi saat emas dicairkan secara bertahap.
- **Keputusan 2: Keterhubungan Penuh dengan Buku Kas Umum (Double-Entry Feel)**
  - *Pendekatan*: Pembelian dan penjualan emas tidak berdiri sendiri sebagai catatan terisolasi, melainkan terhubung langsung ke mutasi rekening bank dan arus kas bulanan.
  - *Alasan*: Menjamin saldo uang tunai di rekening bank selalu akurat (*real-time reconciled*).
- **Keputusan 3: Penempatan Akses Menu**
  - *Pendekatan*: Menu khusus di Drawer Mobile, Sidebar Desktop, serta widget ringkasan di Dashboard.
  - *Alasan*: Menjaga kesederhanaan 5 tombol navigasi bawah (Ringkasan, Transaksi, Center Docked FAB '+', Tanya AI, Lainnya) tetap simetris dan tidak sesak di handphone.

---

### 4. Technical Architecture & Data Strategy

#### A. Arsitektur Komponen & Alur Data

```
┌─────────────────────────────────────────────────────────────┐
│                       FinanceContext                        │
│  - accounts: Account[]                                      │
│  - transactions: Transaction[]                              │
│  - goldPortfolio: GoldPortfolio                             │
│  - goldTransactions: GoldTransaction[]                      │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
    ┌──────────────────────┐      ┌─────────────────────────┐
    │     Beli Emas        │      │        Jual Emas        │
    │  - Rekening (-Rp)    │      │  - Rekening (+Rp)       │
    │  - Portofolio (+g)   │      │  - Portofolio (-g)      │
    │  - Mutasi Pengeluaran│      │  - Mutasi Pemasukan     │
    │  - Update Avg Cost   │      │  - Hitung Realized PnL  │
    └──────────────────────┘      └─────────────────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                           Views                             │
│  - GoldSavingsPage: Portofolio, Beli/Jual, Riwayat          │
│  - DashboardPage: Widget Portofolio Emas & Quick Action     │
│  - Sidebar & BottomNav: Menu Tabungan Emas                  │
└─────────────────────────────────────────────────────────────┘
```

#### B. Model Data Baru (`src/types/index.ts`)

```typescript
export interface GoldTransaction {
  id: string;
  type: 'buy' | 'sell';
  date: string;
  grams: number;
  pricePerGram: number;
  totalAmount: number;
  accountId: string;
  accountName: string;
  costBasisPerGram?: number;   // Harga modal beli saat dijual
  realizedProfit?: number;      // Laba/rugi bersih (khusus sell)
  realizedProfitPercent?: number;
  linkedTransactionId?: string; // ID transaksi di buku kas
  notes?: string;
  createdAt: string;
}

export interface GoldPortfolio {
  totalGrams: number;
  totalCostBasis: number;       // Total uang yang dikeluarkan untuk gram aktif
  currentMarketPrice: number;   // Harga acuan pasar per gram saat ini
  realizedProfitTotal: number;  // Akumulasi untung/rugi dari penjualan lampau
}
```

#### C. Langkah Eksekusi (Setelah Rencana Disetujui)
1. **Ekstensi Tipe Data**: Menambahkan `GoldTransaction` dan `GoldPortfolio` di `src/types/index.ts`.
2. **Ekstensi State & Logika Bisnis**: Menambahkan state `goldPortfolio` dan `goldTransactions` dengan persistensi LocalStorage di `FinanceContext.tsx`, serta method `buyGold` dan `sellGold`.
3. **Komponen Halaman `GoldSavingsPage`**: Menampilkan ringkasan gram, kalkulator beli/jual interaktif, dan riwayat mutasi.
4. **Widget Dashboard**: Menampilkan kartu ringkasan portofolio emas di `DashboardPage.tsx`.
5. **Navigasi**: Menghubungkan rute menu di `Sidebar.tsx`, `BottomNav.tsx` (Drawer), dan `App.tsx`.
6. **Verifikasi & Build**: Melakukan pemeriksaan linter dan kompilasi untuk memastikan integritas aplikasi.
