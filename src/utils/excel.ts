import ExcelJS from 'exceljs';
import { Transaction, Category, Account } from '../types';

export async function exportTransactionsToExcel(
  transactions: Transaction[],
  categories: Category[],
  accounts: Account[],
  filename: string = 'Laporan_Transaksi_SEARAH_Finance.xlsx'
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SEARAH - AI Family Finance';
  workbook.lastModifiedBy = 'SEARAH';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet('Daftar Transaksi', {
    views: [{ showGridLines: true }],
  });

  // Map category and account lookup
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const accMap = new Map(accounts.map((a) => [a.id, a.name]));

  // Title block
  worksheet.mergeCells('A1:G1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'SEARAH • LAPORAN TRANSAKSI KEUANGAN KELUARGA';
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF0B2747' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 30;

  worksheet.mergeCells('A2:G2');
  const subCell = worksheet.getCell('A2');
  subCell.value = `Satu Tujuan. Keuangan Lebih Terarah | Diekspor: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB | Total: ${transactions.length} transaksi`;
  subCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF555555' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(2).height = 20;

  // Header row
  const headerRow = worksheet.getRow(4);
  headerRow.values = [
    'No',
    'Tanggal',
    'Judul Transaksi',
    'Tipe',
    'Kategori',
    'Rekening',
    'Nominal (Rp)',
    'Catatan',
  ];
  headerRow.height = 25;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0B2747' }, // SEARAH Navy Brand #0B2747
    };
    cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Add data rows
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((tx, idx) => {
    const rowNum = 5 + idx;
    const row = worksheet.getRow(rowNum);
    const catName = catMap.get(tx.categoryId) || 'Lain-lain';
    const accName = accMap.get(tx.accountId) || 'Dompet Tunai';
    const typeLabel = tx.type === 'income' ? 'Pemasukan' : tx.type === 'expense' ? 'Pengeluaran' : 'Transfer';

    if (tx.type === 'income') totalIncome += tx.amount;
    if (tx.type === 'expense') totalExpense += tx.amount;

    row.values = [
      idx + 1,
      tx.date,
      tx.title,
      typeLabel,
      catName,
      accName,
      tx.amount,
      tx.notes || '',
    ];

    row.getCell(1).alignment = { horizontal: 'center' };
    row.getCell(2).alignment = { horizontal: 'center' };
    row.getCell(4).alignment = { horizontal: 'center' };
    
    // Amount formatting in Rupiah
    const amountCell = row.getCell(7);
    amountCell.numFmt = '#,##0';
    amountCell.alignment = { horizontal: 'right' };
    if (tx.type === 'income') {
      amountCell.font = { color: { argb: 'FF1B8258' }, bold: true };
    } else if (tx.type === 'expense') {
      amountCell.font = { color: { argb: 'FFD34836' } };
    }

    // Zebra striping
    if (idx % 2 === 1) {
      row.eachCell({ includeEmpty: true }, (cell) => {
        if (!cell.fill) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9F8F5' },
          };
        }
      });
    }

    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE0DDD7' } },
        bottom: { style: 'thin', color: { argb: 'FFE0DDD7' } },
        left: { style: 'thin', color: { argb: 'FFE0DDD7' } },
        right: { style: 'thin', color: { argb: 'FFE0DDD7' } },
      };
    });
  });

  // Summary footer
  const lastRowNum = 5 + transactions.length + 1;
  const summaryIncomeRow = worksheet.getRow(lastRowNum);
  summaryIncomeRow.getCell(6).value = 'Total Pemasukan:';
  summaryIncomeRow.getCell(6).font = { bold: true };
  summaryIncomeRow.getCell(6).alignment = { horizontal: 'right' };
  const totIncCell = summaryIncomeRow.getCell(7);
  totIncCell.value = totalIncome;
  totIncCell.numFmt = '#,##0';
  totIncCell.font = { bold: true, color: { argb: 'FF1B8258' } };

  const summaryExpenseRow = worksheet.getRow(lastRowNum + 1);
  summaryExpenseRow.getCell(6).value = 'Total Pengeluaran:';
  summaryExpenseRow.getCell(6).font = { bold: true };
  summaryExpenseRow.getCell(6).alignment = { horizontal: 'right' };
  const totExpCell = summaryExpenseRow.getCell(7);
  totExpCell.value = totalExpense;
  totExpCell.numFmt = '#,##0';
  totExpCell.font = { bold: true, color: { argb: 'FFD34836' } };

  const summaryNetRow = worksheet.getRow(lastRowNum + 2);
  summaryNetRow.getCell(6).value = 'Selisih Bersih (Arus Kas):';
  summaryNetRow.getCell(6).font = { bold: true };
  summaryNetRow.getCell(6).alignment = { horizontal: 'right' };
  const netCell = summaryNetRow.getCell(7);
  netCell.value = totalIncome - totalExpense;
  netCell.numFmt = '#,##0';
  netCell.font = { bold: true, color: { argb: 'FF0B2747' }, size: 12 };

  // Set column widths
  worksheet.columns = [
    { width: 6 },  // No
    { width: 14 }, // Tanggal
    { width: 32 }, // Judul
    { width: 15 }, // Tipe
    { width: 22 }, // Kategori
    { width: 18 }, // Rekening
    { width: 20 }, // Nominal
    { width: 35 }, // Catatan
  ];

  // Write and trigger download in browser
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Data Migration Parser from other apps (Money Lover, Catatan Keuangan, Wallet, CSV)
export interface ParsedImportItem {
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  account: string;
  date: string;
  notes?: string;
}

export function parseCSVData(csvText: string): ParsedImportItem[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Detect delimiter (, or ;)
  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') ? ';' : ',';

  // Helper to split CSV row handling quoted fields
  const parseRow = (rowStr: string) => {
    const regex = new RegExp(`(?:${delimiter}|^)(?:"([^"]*)"|([^"${delimiter}]*))`, 'g');
    const row: string[] = [];
    let match;
    while ((match = regex.exec(rowStr)) !== null) {
      row.push(match[1] !== undefined ? match[1] : match[2] || '');
      if (regex.lastIndex >= rowStr.length) break;
    }
    return row.map((c) => c.trim());
  };

  const headers = parseRow(lines[0]).map((h) => h.toLowerCase().replace(/['"]/g, ''));

  // Detect column indexes
  let dateIdx = headers.findIndex((h) => h.includes('tgl') || h.includes('date') || h.includes('tanggal') || h.includes('waktu'));
  let titleIdx = headers.findIndex((h) => h.includes('judul') || h.includes('note') || h.includes('keterangan') || h.includes('deskripsi') || h.includes('transaksi') || h.includes('payee') || h.includes('description'));
  let amountIdx = headers.findIndex((h) => h.includes('nominal') || h.includes('jumlah') || h.includes('amount') || h.includes('harga') || h.includes('total') || h.includes('nilai'));
  let catIdx = headers.findIndex((h) => h.includes('kategori') || h.includes('category'));
  let accIdx = headers.findIndex((h) => h.includes('rekening') || h.includes('akun') || h.includes('account') || h.includes('dompet') || h.includes('wallet'));
  let typeIdx = headers.findIndex((h) => h.includes('tipe') || h.includes('type') || h.includes('jenis'));

  // Fallbacks if not detected
  if (dateIdx === -1) dateIdx = 0;
  if (titleIdx === -1) titleIdx = 1;
  if (amountIdx === -1) amountIdx = 2;

  const results: ParsedImportItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseRow(lines[i]);
    if (cols.length <= 1) continue;

    const rawDate = cols[dateIdx] || new Date().toISOString().split('T')[0];
    const rawTitle = cols[titleIdx] || 'Transaksi Migrasi';
    const rawAmountStr = cols[amountIdx] || '0';
    const rawCat = catIdx >= 0 && cols[catIdx] ? cols[catIdx] : 'Lain-lain';
    const rawAcc = accIdx >= 0 && cols[accIdx] ? cols[accIdx] : 'Dompet Tunai';
    const rawType = typeIdx >= 0 && cols[typeIdx] ? cols[typeIdx].toLowerCase() : '';

    // Parse amount
    const cleanedAmount = rawAmountStr.replace(/[^\d.-]/g, '');
    let amount = Math.abs(parseFloat(cleanedAmount) || 0);

    // Determine type
    let type: 'income' | 'expense' | 'transfer' = 'expense';
    if (rawType.includes('masuk') || rawType.includes('income') || rawType.includes('pemasukan') || rawAmountStr.includes('+')) {
      type = 'income';
    } else if (rawType.includes('transfer') || rawType.includes('pindah')) {
      type = 'transfer';
    } else if (parseFloat(cleanedAmount) > 0 && rawAmountStr.startsWith('+')) {
      type = 'income';
    }

    // Normalize Date to YYYY-MM-DD
    let normalizedDate = new Date().toISOString().split('T')[0];
    try {
      if (rawDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        normalizedDate = rawDate;
      } else if (rawDate.match(/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}$/)) {
        const parts = rawDate.split(/[\/-]/);
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        normalizedDate = `${year}-${month}-${day}`;
      } else {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          normalizedDate = d.toISOString().split('T')[0];
        }
      }
    } catch {
      // keep fallback
    }

    if (amount > 0) {
      results.push({
        title: rawTitle,
        amount,
        type,
        category: rawCat,
        account: rawAcc,
        date: normalizedDate,
        notes: 'Hasil migrasi data aplikasi lama',
      });
    }
  }

  return results;
}
