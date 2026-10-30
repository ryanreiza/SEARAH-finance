export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'ewallet' | 'cash' | 'investment';
  bankName?: string;
  accountNumber?: string;
  balance: number;
  initialBalance: number;
  color: string;
  isActive: boolean;
  icon?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  monthlyBudget?: number;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  toAccountId?: string; // For transfers
  date: string; // YYYY-MM-DD
  notes?: string;
  receiptUrl?: string;
  receiptItems?: Array<{ name: string; qty: number; price: number }>;
  tags?: string[];
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  accountId?: string;
  category?: string;
  notes?: string;
  color: string;
  icon: string;
}

export interface Debt {
  id: string;
  title: string;
  type: 'debt' | 'receivable'; // debt = utang saya, receivable = piutang orang lain
  personOrEntity: string;
  totalAmount: number;
  remainingAmount: number;
  monthlyInstallment?: number;
  dueDate?: string;
  accountId?: string;
  status: 'active' | 'paid';
  notes?: string;
  createdAt: string;
}

export type AllocationStatus = 'in_progress' | 'approaching_limit' | 'achieved' | 'exceeded';

export interface MonthlyAllocation {
  id: string;
  name: string; // e.g. "Kebutuhan Pokok (50%)", "Keinginan & Lifestyle (30%)", "Tabungan & Investasi (20%)"
  percentage: number;
  targetAmount: number;
  spentAmount: number;
  status: AllocationStatus;
}

export interface FixedExpenseTarget {
  id: string;
  title: string;
  expectedAmount: number;
  categoryId: string;
  dueDateDay: number; // Day of month (e.g. 5, 20)
  isCompleted: boolean; // "Sudah Dilakukan / Dibayar"
  completedDate?: string;
  notes?: string;
}

export interface MonthlyBudgetPlan {
  monthKey: string; // "2026-10"
  targetIncome: number;
  fixedExpenses: FixedExpenseTarget[];
  allocations: MonthlyAllocation[];
  expectedTotalExpenseOverride?: number;
  notes?: string;
}

export interface BillReminder {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  recurringMonthly: boolean;
  dayOfMonth: number;
  categoryId: string;
  preferredAccountId?: string;
  isPaid: boolean;
  paidDate?: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  contextSummary?: string;
}

export type ThemeName = 'warm' | 'classic';

export interface UserProfile {
  name: string;
  familyName: string;
  email: string;
  currency: string;
  theme: ThemeName;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  isSupabaseConnected: boolean;
}
