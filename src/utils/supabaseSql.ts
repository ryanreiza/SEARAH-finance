/**
 * Supabase SQL Schema Generator with Row Level Security (RLS)
 * Siap dijalankan di SQL Editor Supabase untuk deployer aplikasi SEARAH (AI Family Finance).
 */

export const SUPABASE_SCHEMA_SQL = `-- ========================================================
-- SEARAH (AI FAMILY FINANCE) - SKEMA DATABASE SUPABASE DENGAN RLS
-- Moto: Satu Tujuan. Keuangan Lebih Terarah.
-- ========================================================

-- Aktifkan ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL PROFILES (PENGGUNA & KELUARGA)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Ayah & Ibu',
  family_name TEXT DEFAULT 'Keluarga SEARAH',
  currency TEXT DEFAULT 'IDR',
  theme TEXT DEFAULT 'warm',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id);

-- 2. TABEL REKENING BANK & DOMPET DIGITAL (ACCOUNTS)
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bank', 'ewallet', 'cash', 'investment')),
  bank_name TEXT,
  account_number TEXT,
  balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  initial_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#0B2747',
  is_active BOOLEAN DEFAULT TRUE,
  icon TEXT DEFAULT 'Landmark',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own accounts"
  ON public.accounts FOR ALL
  USING (auth.uid() = user_id);

-- 3. TABEL KATEGORI (CATEGORIES)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT NOT NULL DEFAULT 'Tag',
  color TEXT NOT NULL DEFAULT '#25B18B',
  monthly_budget NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own categories"
  ON public.categories FOR ALL
  USING (auth.uid() = user_id);

-- 4. TABEL TRANSAKSI (TRANSACTIONS)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  to_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  receipt_url TEXT,
  receipt_items JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own transactions"
  ON public.transactions FOR ALL
  USING (auth.uid() = user_id);

-- 5. TABEL TARGET TABUNGAN (SAVINGS GOALS)
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC(15, 2) NOT NULL,
  current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  target_date DATE NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  color TEXT DEFAULT '#25B18B',
  icon TEXT DEFAULT 'PiggyBank',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own savings goals"
  ON public.savings_goals FOR ALL
  USING (auth.uid() = user_id);

-- 6. TABEL UTANG & PIUTANG (DEBTS)
CREATE TABLE IF NOT EXISTS public.debts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('debt', 'receivable')),
  person_or_entity TEXT NOT NULL,
  total_amount NUMERIC(15, 2) NOT NULL,
  remaining_amount NUMERIC(15, 2) NOT NULL,
  monthly_installment NUMERIC(15, 2) DEFAULT 0,
  due_date DATE,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paid')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own debts"
  ON public.debts FOR ALL
  USING (auth.uid() = user_id);

-- 7. TABEL PENGINGAT TAGIHAN (BILL REMINDERS)
CREATE TABLE IF NOT EXISTS public.bill_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  due_date DATE NOT NULL,
  day_of_month INT DEFAULT 1,
  recurring_monthly BOOLEAN DEFAULT TRUE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  preferred_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  paid_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bill_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own bills"
  ON public.bill_reminders FOR ALL
  USING (auth.uid() = user_id);

-- 8. TABEL PESAN PENASIHAT AI (AI CHAT MESSAGES)
CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  context_summary TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own AI messages"
  ON public.ai_chat_messages FOR ALL
  USING (auth.uid() = user_id);

-- 9. REALTIME SUBSCRIPTIONS
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bill_reminders;
`;
