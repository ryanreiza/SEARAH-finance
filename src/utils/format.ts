/**
 * Formatting utilities for Keuangan Keluarga
 * Currency format standard: Rupiah (Rp1.250.000)
 */

export function formatRupiah(amount: number, withPrefix: boolean = true): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  
  // Format with dot thousand separator
  const formatted = absAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  if (!withPrefix) {
    return isNegative ? `-${formatted}` : formatted;
  }
  
  return isNegative ? `-Rp${formatted}` : `Rp${formatted}`;
}

export function parseRupiahInput(value: string): number {
  if (!value) return 0;
  // Strip non-digits except optional minus
  const cleaned = value.replace(/[^\d-]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatTanggal(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatTanggalLengkap(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatBulanTahun(monthKey: string): string {
  // monthKey format: "2026-10"
  if (!monthKey || !monthKey.includes('-')) return monthKey;
  try {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  } catch {
    return monthKey;
  }
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}
