import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Account,
  Category,
  Transaction,
  SavingsGoal,
  Debt,
  MonthlyBudgetPlan,
  BillReminder,
  AIChatMessage,
  UserProfile,
  ThemeName,
  AllocationStatus,
} from '../types';
import { generateId, getCurrentMonthKey } from '../utils/format';

export const DEFAULT_SEARAH_SYMBOL = '/assets/aistudio/image_9d6c892c.png';

interface FinanceContextType {
  // Data
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  debts: Debt[];
  billReminders: BillReminder[];
  monthlyPlans: Record<string, MonthlyBudgetPlan>;
  chatMessages: AIChatMessage[];
  userProfile: UserProfile;
  currentMonthKey: string;
  setCurrentMonthKey: (key: string) => void;

  // Custom Brand Symbol
  customSymbolUrl: string;
  updateCustomSymbol: (url: string) => void;
  resetCustomSymbol: () => void;

  // Actions: Transactions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Actions: Accounts
  addAccount: (acc: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, acc: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  transferFunds: (fromAccountId: string, toAccountId: string, amount: number, notes?: string) => void;

  // Actions: Categories
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Actions: Savings
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  adjustSavingsAmount: (goalId: string, deltaAmount: number, sourceAccountId?: string) => void;

  // Actions: Debts
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  payDebtInstallment: (debtId: string, amount: number, accountId: string) => void;

  // Actions: Bills
  addBillReminder: (bill: Omit<BillReminder, 'id'>) => void;
  updateBillReminder: (id: string, bill: Partial<BillReminder>) => void;
  deleteBillReminder: (id: string) => void;
  payBill: (billId: string, accountId: string) => void;

  // Actions: Monthly Budget & Allocations
  updateMonthlyPlan: (monthKey: string, plan: Partial<MonthlyBudgetPlan>) => void;
  toggleFixedExpense: (monthKey: string, expenseId: string) => void;
  copyPlanFromPreviousMonth: (targetMonthKey: string) => void;

  // Actions: AI Chat
  addChatMessage: (msg: Omit<AIChatMessage, 'id' | 'timestamp'>) => void;
  clearChatHistory: () => void;

  // Actions: Profile & Settings
  setTheme: (theme: ThemeName) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  importExternalTransactions: (newTransactions: Omit<Transaction, 'id' | 'createdAt'>[]) => number;
  resetAllData: () => void;

  // Computed / Helpers
  totalNetWorth: number;
  totalIncomeCurrentMonth: number;
  totalExpenseCurrentMonth: number;
  cashflowCurrentMonth: number;
  savingsRateCurrentMonth: number;
  urgentBillsCount: number;
  budgetAlerts: Array<{ categoryName: string; spent: number; budget: number; percent: number }>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Initial realistic Indonesian family demo data
const initialAccounts: Account[] = [
  {
    id: 'acc_bca',
    name: 'BCA Tahapan',
    type: 'bank',
    bankName: 'Bank Central Asia',
    accountNumber: '8291039821',
    balance: 14850000,
    initialBalance: 14850000,
    color: '#005696',
    isActive: true,
    icon: 'Landmark',
  },
  {
    id: 'acc_mandiri',
    name: 'Mandiri Payroll',
    type: 'bank',
    bankName: 'Bank Mandiri',
    accountNumber: '137001928372',
    balance: 8200000,
    initialBalance: 8200000,
    color: '#003366',
    isActive: true,
    icon: 'Building2',
  },
  {
    id: 'acc_jago',
    name: 'Bank Jago (Kantong Belanja)',
    type: 'bank',
    bankName: 'Bank Jago',
    accountNumber: '5039201948',
    balance: 3450000,
    initialBalance: 3450000,
    color: '#FF6B00',
    isActive: true,
    icon: 'Wallet',
  },
  {
    id: 'acc_gopay',
    name: 'GoPay Keluarga',
    type: 'ewallet',
    balance: 450000,
    initialBalance: 450000,
    color: '#00AA13',
    isActive: true,
    icon: 'Smartphone',
  },
  {
    id: 'acc_cash',
    name: 'Dompet Tunai Rumah',
    type: 'cash',
    balance: 1150000,
    initialBalance: 1150000,
    color: '#25B18B',
    isActive: true,
    icon: 'Coins',
  },
];

const initialCategories: Category[] = [
  // Income
  { id: 'cat_gaji', name: 'Gaji Pokok & Tunjangan', type: 'income', icon: 'Briefcase', color: '#1B8258', monthlyBudget: 18000000 },
  { id: 'cat_bonus', name: 'Bonus & Freelance', type: 'income', icon: 'Sparkles', color: '#25B18B', monthlyBudget: 3000000 },
  { id: 'cat_investasi_in', name: 'Bagi Hasil & Investasi', type: 'income', icon: 'TrendingUp', color: '#0284C7', monthlyBudget: 1000000 },
  // Expense
  { id: 'cat_makan', name: 'Makanan & Minuman', type: 'expense', icon: 'Utensils', color: '#EA580C', monthlyBudget: 3500000 },
  { id: 'cat_belanja', name: 'Belanja Harian & Dapur', type: 'expense', icon: 'ShoppingBag', color: '#D97706', monthlyBudget: 2800000 },
  { id: 'cat_tagihan', name: 'Tagihan & Utilitas', type: 'expense', icon: 'Zap', color: '#DC2626', monthlyBudget: 2200000 },
  { id: 'cat_transport', name: 'Transportasi & Bensin', type: 'expense', icon: 'Car', color: '#4F46E5', monthlyBudget: 1500000 },
  { id: 'cat_kesehatan', name: 'Kesehatan & Obat', type: 'expense', icon: 'HeartPulse', color: '#E11D48', monthlyBudget: 800000 },
  { id: 'cat_pendidikan', name: 'Pendidikan Anak', type: 'expense', icon: 'GraduationCap', color: '#7C3AED', monthlyBudget: 1800000 },
  { id: 'cat_hiburan', name: 'Hiburan & Santai', type: 'expense', icon: 'Film', color: '#059669', monthlyBudget: 1000000 },
  { id: 'cat_sedekah', name: 'Zakat & Sedekah', type: 'expense', icon: 'HandHeart', color: '#0D9488', monthlyBudget: 800000 },
  { id: 'cat_cicilan', name: 'Cicilan & Utang', type: 'expense', icon: 'CreditCard', color: '#9333EA', monthlyBudget: 3200000 },
  { id: 'cat_lain', name: 'Lain-lain', type: 'expense', icon: 'MoreHorizontal', color: '#64748B', monthlyBudget: 500000 },
];

const initialSavingsGoals: SavingsGoal[] = [
  {
    id: 'goal_darurat',
    name: 'Dana Darurat 6 Bulan',
    targetAmount: 50000000,
    currentAmount: 28500000,
    targetDate: '2027-06-30',
    accountId: 'acc_bca',
    color: '#005696',
    icon: 'ShieldCheck',
    notes: 'Pos aman keluarga jika terjadi hal tak terduga',
  },
  {
    id: 'goal_liburan',
    name: 'Liburan Keluarga Akhir Tahun',
    targetAmount: 15000000,
    currentAmount: 11200000,
    targetDate: '2026-12-20',
    accountId: 'acc_mandiri',
    color: '#25B18B',
    icon: 'Palmtree',
    notes: 'Tiket & akomodasi liburan keluarga',
  },
  {
    id: 'goal_pendidikan',
    name: 'Tabungan Pendidikan Anak',
    targetAmount: 35000000,
    currentAmount: 18000000,
    targetDate: '2027-07-01',
    accountId: 'acc_bca',
    color: '#7C3AED',
    icon: 'GraduationCap',
    notes: 'Biaya masuk jenjang sekolah berikutnya',
  },
];

const initialDebts: Debt[] = [
  {
    id: 'debt_kpr',
    title: 'Cicilan KPR Rumah',
    type: 'debt',
    personOrEntity: 'Bank Mandiri Syariah',
    totalAmount: 240000000,
    remainingAmount: 145000000,
    monthlyInstallment: 3200000,
    dueDate: '2026-10-10',
    accountId: 'acc_mandiri',
    status: 'active',
    notes: 'Tenor tersisa 48 bulan',
    createdAt: '2024-01-10',
  },
  {
    id: 'debt_piutang1',
    title: 'Pinjaman Modal Usaha Teman',
    type: 'receivable',
    personOrEntity: 'Budi Santoso',
    totalAmount: 3000000,
    remainingAmount: 1000000,
    monthlyInstallment: 500000,
    dueDate: '2026-10-28',
    status: 'active',
    notes: 'Dicicil 2 bulan lagi',
    createdAt: '2026-08-15',
  },
];

const initialBillReminders: BillReminder[] = [
  {
    id: 'bill_listrik',
    title: 'Listrik Pascabayar PLN',
    amount: 680000,
    dueDate: '2026-10-20',
    recurringMonthly: true,
    dayOfMonth: 20,
    categoryId: 'cat_tagihan',
    preferredAccountId: 'acc_bca',
    isPaid: false,
  },
  {
    id: 'bill_wifi',
    title: 'Internet WiFi Indihome',
    amount: 385000,
    dueDate: '2026-10-18',
    recurringMonthly: true,
    dayOfMonth: 18,
    categoryId: 'cat_tagihan',
    preferredAccountId: 'acc_jago',
    isPaid: true,
    paidDate: '2026-10-17',
  },
  {
    id: 'bill_bpjs',
    title: 'Iuran BPJS Kesehatan Keluarga',
    amount: 300000,
    dueDate: '2026-10-10',
    recurringMonthly: true,
    dayOfMonth: 10,
    categoryId: 'cat_kesehatan',
    preferredAccountId: 'acc_bca',
    isPaid: true,
    paidDate: '2026-10-09',
  },
  {
    id: 'bill_asuransi',
    title: 'Premi Asuransi Jiwa & Medis',
    amount: 1100000,
    dueDate: '2026-10-25',
    recurringMonthly: true,
    dayOfMonth: 25,
    categoryId: 'cat_kesehatan',
    preferredAccountId: 'acc_mandiri',
    isPaid: false,
  },
];

// Generate realistic transactions for current month (Oct 2026) and past months
function generateInitialTransactions(): Transaction[] {
  const currentKey = getCurrentMonthKey();
  const [year, month] = currentKey.split('-');
  
  return [
    {
      id: 'tx_1',
      title: 'Gaji Bulanan Oktober',
      amount: 18500000,
      type: 'income',
      categoryId: 'cat_gaji',
      accountId: 'acc_mandiri',
      date: `${year}-${month}-01`,
      notes: 'Transfer payroll kantor tepat waktu',
      createdAt: `${year}-${month}-01T08:00:00Z`,
    },
    {
      id: 'tx_2',
      title: 'Transfer Alokasi Tabungan Dana Darurat',
      amount: 2500000,
      type: 'transfer',
      categoryId: 'cat_investasi_in',
      accountId: 'acc_mandiri',
      toAccountId: 'acc_bca',
      date: `${year}-${month}-02`,
      notes: 'Disiplin menabung diawal bulan',
      createdAt: `${year}-${month}-02T09:30:00Z`,
    },
    {
      id: 'tx_3',
      title: 'Belanja Bulanan Superindo',
      amount: 1450000,
      type: 'expense',
      categoryId: 'cat_belanja',
      accountId: 'acc_bca',
      date: `${year}-${month}-03`,
      notes: 'Beras 10kg, minyak goreng, daging, sayuran segar',
      createdAt: `${year}-${month}-03T11:20:00Z`,
    },
    {
      id: 'tx_4',
      title: 'Cicilan KPR Rumah',
      amount: 3200000,
      type: 'expense',
      categoryId: 'cat_cicilan',
      accountId: 'acc_mandiri',
      date: `${year}-${month}-05`,
      notes: 'Autodebet Bank Mandiri',
      createdAt: `${year}-${month}-05T07:15:00Z`,
    },
    {
      id: 'tx_5',
      title: 'SPP & Buku Sekolah Anak',
      amount: 1650000,
      type: 'expense',
      categoryId: 'cat_pendidikan',
      accountId: 'acc_bca',
      date: `${year}-${month}-06`,
      notes: 'SPP semester berjalan',
      createdAt: `${year}-${month}-06T10:00:00Z`,
    },
    {
      id: 'tx_6',
      title: 'Bensin Pertamax Mobil',
      amount: 400000,
      type: 'expense',
      categoryId: 'cat_transport',
      accountId: 'acc_gopay',
      date: `${year}-${month}-08`,
      notes: 'SPBU Pertamina jalan arteri',
      createdAt: `${year}-${month}-08T14:30:00Z`,
    },
    {
      id: 'tx_7',
      title: 'BPJS Kesehatan 1 Keluarga',
      amount: 300000,
      type: 'expense',
      categoryId: 'cat_kesehatan',
      accountId: 'acc_bca',
      date: `${year}-${month}-09`,
      notes: 'Pembayaran rutin tagihan BPJS',
      createdAt: `${year}-${month}-09T16:00:00Z`,
    },
    {
      id: 'tx_8',
      title: 'Makan Malam Akhir Pekan',
      amount: 385000,
      type: 'expense',
      categoryId: 'cat_makan',
      accountId: 'acc_gopay',
      date: `${year}-${month}-12`,
      notes: 'Resto Sunda bersama keluarga',
      createdAt: `${year}-${month}-12T19:45:00Z`,
    },
    {
      id: 'tx_9',
      title: 'Bonus Proyek Lepas Website',
      amount: 3500000,
      type: 'income',
      categoryId: 'cat_bonus',
      accountId: 'acc_bca',
      date: `${year}-${month}-15`,
      notes: 'Pelunasan pekerjaan konsultasi desain',
      createdAt: `${year}-${month}-15T15:20:00Z`,
    },
    {
      id: 'tx_10',
      title: 'WiFi Indihome Rumah',
      amount: 385000,
      type: 'expense',
      categoryId: 'cat_tagihan',
      accountId: 'acc_jago',
      date: `${year}-${month}-17`,
      notes: 'Paket 50 Mbps',
      createdAt: `${year}-${month}-17T11:00:00Z`,
    },
    {
      id: 'tx_11',
      title: 'Kopi & Snack Santai Sore',
      amount: 78000,
      type: 'expense',
      categoryId: 'cat_makan',
      accountId: 'acc_cash',
      date: `${year}-${month}-19`,
      notes: 'Kopi Kenangan & roti',
      createdAt: `${year}-${month}-19T16:30:00Z`,
    },
    {
      id: 'tx_12',
      title: 'Belanja Buah & Vitamin Apotek',
      amount: 235000,
      type: 'expense',
      categoryId: 'cat_kesehatan',
      accountId: 'acc_jago',
      date: `${year}-${month}-21`,
      notes: 'Madu murni dan multivitamin',
      createdAt: `${year}-${month}-21T18:00:00Z`,
    },
  ];
}

function createDefaultMonthlyPlan(monthKey: string): MonthlyBudgetPlan {
  return {
    monthKey,
    targetIncome: 22000000,
    expectedTotalExpenseOverride: undefined,
    notes: 'Rencana anggaran keluarga seimbang 50/30/20',
    fixedExpenses: [
      { id: 'fe_kpr', title: 'Cicilan KPR Rumah', expectedAmount: 3200000, categoryId: 'cat_cicilan', dueDateDay: 10, isCompleted: true, completedDate: '2026-10-05' },
      { id: 'fe_spp', title: 'SPP Sekolah Anak', expectedAmount: 1650000, categoryId: 'cat_pendidikan', dueDateDay: 10, isCompleted: true, completedDate: '2026-10-06' },
      { id: 'fe_listrik', title: 'Listrik PLN', expectedAmount: 680000, categoryId: 'cat_tagihan', dueDateDay: 20, isCompleted: false },
      { id: 'fe_wifi', title: 'Internet Indihome', expectedAmount: 385000, categoryId: 'cat_tagihan', dueDateDay: 18, isCompleted: true, completedDate: '2026-10-17' },
      { id: 'fe_asuransi', title: 'Asuransi Jiwa & Medis', expectedAmount: 1100000, categoryId: 'cat_kesehatan', dueDateDay: 25, isCompleted: false },
      { id: 'fe_bpjs', title: 'BPJS Kesehatan', expectedAmount: 300000, categoryId: 'cat_kesehatan', dueDateDay: 10, isCompleted: true, completedDate: '2026-10-09' },
    ],
    allocations: [
      {
        id: 'alloc_needs',
        name: 'Kebutuhan Pokok (Needs 50%)',
        percentage: 50,
        targetAmount: 11000000,
        spentAmount: 6850000,
        status: 'in_progress',
      },
      {
        id: 'alloc_wants',
        name: 'Keinginan & Gaya Hidup (Wants 30%)',
        percentage: 30,
        targetAmount: 6600000,
        spentAmount: 1863000,
        status: 'in_progress',
      },
      {
        id: 'alloc_savings',
        name: 'Tabungan & Investasi (Savings 20%)',
        percentage: 20,
        targetAmount: 4400000,
        spentAmount: 3500000,
        status: 'approaching_limit',
      },
    ],
  };
}

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentMonthKey, setCurrentMonthKey] = useState<string>(getCurrentMonthKey());

  // Load state from localStorage with fallbacks
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('keu_keluarga_accounts');
    return saved ? JSON.parse(saved) : initialAccounts;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('keu_keluarga_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('keu_keluarga_transactions');
    return saved ? JSON.parse(saved) : generateInitialTransactions();
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('keu_keluarga_savings');
    return saved ? JSON.parse(saved) : initialSavingsGoals;
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('keu_keluarga_debts');
    return saved ? JSON.parse(saved) : initialDebts;
  });

  const [billReminders, setBillReminders] = useState<BillReminder[]>(() => {
    const saved = localStorage.getItem('keu_keluarga_bills');
    return saved ? JSON.parse(saved) : initialBillReminders;
  });

  const [monthlyPlans, setMonthlyPlans] = useState<Record<string, MonthlyBudgetPlan>>(() => {
    const saved = localStorage.getItem('keu_keluarga_monthly_plans');
    const plans = saved ? JSON.parse(saved) : {};
    const curKey = getCurrentMonthKey();
    if (!plans[curKey]) {
      plans[curKey] = createDefaultMonthlyPlan(curKey);
    }
    return plans;
  });

  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>(() => {
    const saved = localStorage.getItem('keu_keluarga_chat');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'msg_welcome',
            role: 'assistant',
            content: `Halo Ayah & Ibu! 👋 Selamat datang di SEARAH — AI Family Finance.

Prinsip kami: "Satu Tujuan. Keuangan Lebih Terarah". Saya siap mendampingi perjalanan finansial keluarga Anda: mencatat transaksi cepat lewat teks atau struk, menganalisis arus kas, hingga merealisasikan target tabungan bersama.

Apa rencana keuangan yang ingin kita diskusikan hari ini?`,
            timestamp: new Date().toISOString(),
          },
        ];
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('searah_profile') || localStorage.getItem('keu_keluarga_profile');
    return saved
      ? JSON.parse(saved)
      : {
          name: 'Ayah & Ibu',
          familyName: 'Keluarga SEARAH',
          email: 'keluarga@searah.app',
          currency: 'IDR',
          theme: 'warm',
          isSupabaseConnected: false,
        };
  });

  // Custom Brand Symbol (default: newly provided glowing ribbon S emblem)
  const [customSymbolUrl, setCustomSymbolUrl] = useState<string>(() => {
    return localStorage.getItem('searah_custom_symbol') || DEFAULT_SEARAH_SYMBOL;
  });

  const updateCustomSymbol = (url: string) => {
    setCustomSymbolUrl(url);
    try {
      localStorage.setItem('searah_custom_symbol', url);
    } catch (e) {
      console.warn('Failed to save symbol to localStorage:', e);
    }
  };

  const resetCustomSymbol = () => {
    setCustomSymbolUrl(DEFAULT_SEARAH_SYMBOL);
    try {
      localStorage.removeItem('searah_custom_symbol');
    } catch (e) {
      console.warn('Failed to reset symbol in localStorage:', e);
    }
  };

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('keu_keluarga_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('keu_keluarga_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('keu_keluarga_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('keu_keluarga_savings', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem('keu_keluarga_debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('keu_keluarga_bills', JSON.stringify(billReminders));
  }, [billReminders]);

  useEffect(() => {
    localStorage.setItem('keu_keluarga_monthly_plans', JSON.stringify(monthlyPlans));
  }, [monthlyPlans]);

  useEffect(() => {
    localStorage.setItem('keu_keluarga_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('keu_keluarga_profile', JSON.stringify(userProfile));
    // Apply theme class to documentElement
    const root = document.documentElement;
    root.classList.remove('theme-warm', 'theme-classic');
    root.classList.add(userProfile.theme === 'classic' ? 'theme-classic' : 'theme-warm');
  }, [userProfile]);

  // Actions: Transactions
  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: generateId('tx'),
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Real-time balance adjustment
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === newTx.accountId) {
          if (newTx.type === 'income') return { ...acc, balance: acc.balance + newTx.amount };
          if (newTx.type === 'expense' || newTx.type === 'transfer') return { ...acc, balance: acc.balance - newTx.amount };
        }
        if (newTx.type === 'transfer' && acc.id === newTx.toAccountId) {
          return { ...acc, balance: acc.balance + newTx.amount };
        }
        return acc;
      })
    );
  };

  const updateTransaction = (id: string, updatedFields: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updatedFields } : tx))
    );
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    // Reverse balance adjustment
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === target.accountId) {
          if (target.type === 'income') return { ...acc, balance: acc.balance - target.amount };
          if (target.type === 'expense' || target.type === 'transfer') return { ...acc, balance: acc.balance + target.amount };
        }
        if (target.type === 'transfer' && acc.id === target.toAccountId) {
          return { ...acc, balance: acc.balance - target.amount };
        }
        return acc;
      })
    );

    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Actions: Accounts
  const addAccount = (accData: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...accData,
      id: generateId('acc'),
    };
    setAccounts((prev) => [...prev, newAcc]);
  };

  const updateAccount = (id: string, accData: Partial<Account>) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...accData } : acc))
    );
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
  };

  const transferFunds = (fromAccountId: string, toAccountId: string, amount: number, notes?: string) => {
    if (fromAccountId === toAccountId || amount <= 0) return;
    addTransaction({
      title: 'Transfer Antar Rekening',
      amount,
      type: 'transfer',
      categoryId: 'cat_investasi_in',
      accountId: fromAccountId,
      toAccountId,
      date: new Date().toISOString().split('T')[0],
      notes: notes || 'Pindah saldo antar rekening',
    });
  };

  // Actions: Categories
  const addCategory = (catData: Omit<Category, 'id'>) => {
    setCategories((prev) => [...prev, { ...catData, id: generateId('cat') }]);
  };

  const updateCategory = (id: string, catData: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...catData } : cat))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Actions: Savings
  const addSavingsGoal = (goalData: Omit<SavingsGoal, 'id'>) => {
    setSavingsGoals((prev) => [...prev, { ...goalData, id: generateId('goal') }]);
  };

  const updateSavingsGoal = (id: string, goalData: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) =>
      prev.map((goal) => (goal.id === id ? { ...goal, ...goalData } : goal))
    );
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  const adjustSavingsAmount = (goalId: string, deltaAmount: number, sourceAccountId?: string) => {
    setSavingsGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === goalId) {
          const newAmount = Math.max(0, goal.currentAmount + deltaAmount);
          return { ...goal, currentAmount: newAmount };
        }
        return goal;
      })
    );

    // If source account specified, record transaction
    if (sourceAccountId && deltaAmount !== 0) {
      const goal = savingsGoals.find((g) => g.id === goalId);
      const isDeposit = deltaAmount > 0;
      addTransaction({
        title: isDeposit ? `Setoran Tabungan: ${goal?.name || ''}` : `Tarik Tabungan: ${goal?.name || ''}`,
        amount: Math.abs(deltaAmount),
        type: isDeposit ? 'expense' : 'income',
        categoryId: 'cat_investasi_in',
        accountId: sourceAccountId,
        date: new Date().toISOString().split('T')[0],
        notes: isDeposit ? 'Menambah saldo impian' : 'Penarikan dana tabungan',
      });
    }
  };

  // Actions: Debts
  const addDebt = (debtData: Omit<Debt, 'id' | 'createdAt'>) => {
    setDebts((prev) => [
      ...prev,
      {
        ...debtData,
        id: generateId('debt'),
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const updateDebt = (id: string, debtData: Partial<Debt>) => {
    setDebts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...debtData } : d))
    );
  };

  const deleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  const payDebtInstallment = (debtId: string, amount: number, accountId: string) => {
    const debt = debts.find((d) => d.id === debtId);
    if (!debt || amount <= 0) return;

    const newRemaining = Math.max(0, debt.remainingAmount - amount);
    const newStatus = newRemaining === 0 ? 'paid' : 'active';

    updateDebt(debtId, {
      remainingAmount: newRemaining,
      status: newStatus,
    });

    addTransaction({
      title: debt.type === 'debt' ? `Cicilan: ${debt.title}` : `Penerimaan Piutang: ${debt.title}`,
      amount,
      type: debt.type === 'debt' ? 'expense' : 'income',
      categoryId: debt.type === 'debt' ? 'cat_cicilan' : 'cat_bonus',
      accountId,
      date: new Date().toISOString().split('T')[0],
      notes: `Pelunasan parsial untuk ${debt.personOrEntity}. Sisa: Rp${newRemaining.toLocaleString('id-ID')}`,
    });
  };

  // Actions: Bills
  const addBillReminder = (billData: Omit<BillReminder, 'id'>) => {
    setBillReminders((prev) => [...prev, { ...billData, id: generateId('bill') }]);
  };

  const updateBillReminder = (id: string, billData: Partial<BillReminder>) => {
    setBillReminders((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...billData } : b))
    );
  };

  const deleteBillReminder = (id: string) => {
    setBillReminders((prev) => prev.filter((b) => b.id !== id));
  };

  const payBill = (billId: string, accountId: string) => {
    const bill = billReminders.find((b) => b.id === billId);
    if (!bill) return;

    updateBillReminder(billId, {
      isPaid: true,
      paidDate: new Date().toISOString().split('T')[0],
    });

    addTransaction({
      title: `Bayar Tagihan: ${bill.title}`,
      amount: bill.amount,
      type: 'expense',
      categoryId: bill.categoryId || 'cat_tagihan',
      accountId,
      date: new Date().toISOString().split('T')[0],
      notes: 'Pembayaran tagihan tepat waktu via pengingat',
    });
  };

  // Actions: Monthly Budget Plans & Allocations
  const updateMonthlyPlan = (monthKey: string, planData: Partial<MonthlyBudgetPlan>) => {
    setMonthlyPlans((prev) => {
      const existing = prev[monthKey] || createDefaultMonthlyPlan(monthKey);
      return {
        ...prev,
        [monthKey]: {
          ...existing,
          ...planData,
        },
      };
    });
  };

  const toggleFixedExpense = (monthKey: string, expenseId: string) => {
    setMonthlyPlans((prev) => {
      const plan = prev[monthKey] || createDefaultMonthlyPlan(monthKey);
      const updatedFixed = plan.fixedExpenses.map((fe) => {
        if (fe.id === expenseId) {
          const nextState = !fe.isCompleted;
          return {
            ...fe,
            isCompleted: nextState,
            completedDate: nextState ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return fe;
      });
      return {
        ...prev,
        [monthKey]: {
          ...plan,
          fixedExpenses: updatedFixed,
        },
      };
    });
  };

  const copyPlanFromPreviousMonth = (targetMonthKey: string) => {
    const [year, month] = targetMonthKey.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    const prevPlan = monthlyPlans[prevKey] || createDefaultMonthlyPlan(prevKey);

    const clonedPlan: MonthlyBudgetPlan = {
      ...prevPlan,
      monthKey: targetMonthKey,
      fixedExpenses: prevPlan.fixedExpenses.map((fe) => ({
        ...fe,
        id: generateId('fe'),
        isCompleted: false,
        completedDate: undefined,
      })),
    };

    setMonthlyPlans((prev) => ({
      ...prev,
      [targetMonthKey]: clonedPlan,
    }));
  };

  // Actions: AI Chat
  const addChatMessage = (msgData: Omit<AIChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: AIChatMessage = {
      ...msgData,
      id: generateId('msg'),
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  const clearChatHistory = () => {
    setChatMessages([
      {
        id: 'msg_welcome_fresh',
        role: 'assistant',
        content: 'Riwayat percakapan telah dibersihkan. Ada yang bisa saya bantu terkait perencanaan keuangan keluarga hari ini?',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  // Actions: Profile & Settings
  const setTheme = (theme: ThemeName) => {
    setUserProfile((prev) => ({ ...prev, theme }));
  };

  const updateUserProfile = (profileData: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...profileData }));
  };

  const importExternalTransactions = (newTxList: Omit<Transaction, 'id' | 'createdAt'>[]): number => {
    if (!newTxList.length) return 0;
    const mapped: Transaction[] = newTxList.map((tx) => ({
      ...tx,
      id: generateId('tx_migrated'),
      createdAt: new Date().toISOString(),
    }));

    setTransactions((prev) => [...mapped, ...prev]);
    return mapped.length;
  };

  const resetAllData = () => {
    setAccounts(initialAccounts);
    setCategories(initialCategories);
    setTransactions(generateInitialTransactions());
    setSavingsGoals(initialSavingsGoals);
    setDebts(initialDebts);
    setBillReminders(initialBillReminders);
    const curKey = getCurrentMonthKey();
    setMonthlyPlans({ [curKey]: createDefaultMonthlyPlan(curKey) });
    clearChatHistory();
  };

  // Computed Values
  const totalNetWorth = accounts.reduce((sum, a) => sum + (a.isActive ? a.balance : 0), 0);

  const currentMonthTransactions = transactions.filter((t) => t.date.startsWith(currentMonthKey));

  const totalIncomeCurrentMonth = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenseCurrentMonth = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const cashflowCurrentMonth = totalIncomeCurrentMonth - totalExpenseCurrentMonth;

  const savingsRateCurrentMonth =
    totalIncomeCurrentMonth > 0
      ? Math.max(0, Math.round((cashflowCurrentMonth / totalIncomeCurrentMonth) * 100))
      : 0;

  // Urgent bills: due within 3 days or overdue and unpaid
  const urgentBillsCount = billReminders.filter((b) => {
    if (b.isPaid) return false;
    const now = new Date();
    const due = new Date(b.dueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  }).length;

  // Budget alerts: categories that spent >= 85% of monthly budget
  const budgetAlerts = categories
    .filter((c) => c.type === 'expense' && (c.monthlyBudget || 0) > 0)
    .map((c) => {
      const spent = currentMonthTransactions
        .filter((t) => t.type === 'expense' && t.categoryId === c.id)
        .reduce((sum, t) => sum + t.amount, 0);
      const budget = c.monthlyBudget || 1;
      const percent = Math.round((spent / budget) * 100);
      return { categoryName: c.name, spent, budget, percent };
    })
    .filter((item) => item.percent >= 85);

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        categories,
        transactions,
        savingsGoals,
        debts,
        billReminders,
        monthlyPlans,
        chatMessages,
        userProfile,
        currentMonthKey,
        setCurrentMonthKey,

        addTransaction,
        updateTransaction,
        deleteTransaction,

        addAccount,
        updateAccount,
        deleteAccount,
        transferFunds,

        addCategory,
        updateCategory,
        deleteCategory,

        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        adjustSavingsAmount,

        addDebt,
        updateDebt,
        deleteDebt,
        payDebtInstallment,

        addBillReminder,
        updateBillReminder,
        deleteBillReminder,
        payBill,

        updateMonthlyPlan,
        toggleFixedExpense,
        copyPlanFromPreviousMonth,

        addChatMessage,
        clearChatHistory,

        setTheme,
        updateUserProfile,
        importExternalTransactions,
        resetAllData,

        customSymbolUrl,
        updateCustomSymbol,
        resetCustomSymbol,

        totalNetWorth,
        totalIncomeCurrentMonth,
        totalExpenseCurrentMonth,
        cashflowCurrentMonth,
        savingsRateCurrentMonth,
        urgentBillsCount,
        budgetAlerts,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
