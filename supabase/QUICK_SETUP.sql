-- =====================================================
-- Duitly - Quick Database Setup
-- Run this in Supabase SQL Editor to create all tables
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS (if not exists)
-- =====================================================

-- Transaction types
DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('income', 'expense');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Transaction status
DO $$ BEGIN
    CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Investment paths
DO $$ BEGIN
    CREATE TYPE investment_path AS ENUM ('conservative', 'active-compounder');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Goal priorities
DO $$ BEGIN
    CREATE TYPE goal_priority AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Impact indicators
DO $$ BEGIN
    CREATE TYPE impact_indicator AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Notification types
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('success', 'warning', 'error', 'info');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Insight types
DO $$ BEGIN
    CREATE TYPE insight_type AS ENUM ('advice', 'alert', 'opportunity', 'achievement');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- TABLES
-- =====================================================

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  investment_path investment_path DEFAULT 'conservative',
  currency TEXT DEFAULT 'IDR',
  timezone TEXT DEFAULT 'Asia/Jakarta',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Income Sources table
CREATE TABLE IF NOT EXISTS public.income_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'yearly')),
  type TEXT NOT NULL CHECK (type IN ('salary', 'freelance', 'investment', 'side-hustle', 'other')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Category Allocations table
CREATE TABLE IF NOT EXISTS public.category_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  allocated_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (allocated_amount >= 0),
  spent_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (spent_amount >= 0),
  is_essential BOOLEAN DEFAULT false,
  impact_indicator impact_indicator DEFAULT 'medium',
  color TEXT DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial Goals table
CREATE TABLE IF NOT EXISTS public.financial_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(12, 2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  target_date DATE,
  priority goal_priority DEFAULT 'medium',
  icon TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  category TEXT NOT NULL,
  account TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  merchant TEXT,
  date DATE NOT NULL,
  note TEXT,
  attachment_url TEXT,
  input_method input_method DEFAULT 'manual',
  status transaction_status DEFAULT 'pending',
  paylabs_transaction_id TEXT UNIQUE,
  paylabs_gateway_id TEXT,
  paylabs_response JSONB,
  ai_category TEXT,
  ai_confidence DECIMAL(3, 2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget Insights table
CREATE TABLE IF NOT EXISTS public.budget_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type insight_type NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_income_sources_user_id ON public.income_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_income_sources_active ON public.income_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_category_allocations_user_id ON public.category_allocations(user_id);
CREATE INDEX IF NOT EXISTS idx_category_allocations_category ON public.category_allocations(category);
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON public.financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_priority ON public.financial_goals(priority);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_budget_insights_user_id ON public.budget_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own income sources" ON public.income_sources;
DROP POLICY IF EXISTS "Users can insert own income sources" ON public.income_sources;
DROP POLICY IF EXISTS "Users can update own income sources" ON public.income_sources;
DROP POLICY IF EXISTS "Users can delete own income sources" ON public.income_sources;

DROP POLICY IF EXISTS "Users can view own allocations" ON public.category_allocations;
DROP POLICY IF EXISTS "Users can manage own allocations" ON public.category_allocations;

DROP POLICY IF EXISTS "Users can manage own goals" ON public.financial_goals;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;

DROP POLICY IF EXISTS "Users can view own insights" ON public.budget_insights;
DROP POLICY IF EXISTS "Users can update own insights" ON public.budget_insights;

DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Income sources policies
CREATE POLICY "Users can view own income sources"
  ON public.income_sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own income sources"
  ON public.income_sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own income sources"
  ON public.income_sources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own income sources"
  ON public.income_sources FOR DELETE
  USING (auth.uid() = user_id);

-- Category allocations policies
CREATE POLICY "Users can view own allocations"
  ON public.category_allocations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own allocations"
  ON public.category_allocations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Financial goals policies
CREATE POLICY "Users can manage own goals"
  ON public.financial_goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Budget insights policies
CREATE POLICY "Users can view own insights"
  ON public.budget_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON public.budget_insights FOR UPDATE
  USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can manage own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Get monthly income function
CREATE OR REPLACE FUNCTION public.get_monthly_income(p_user_id UUID)
RETURNS DECIMAL(12, 2) AS $$
DECLARE
  v_total DECIMAL(12, 2) := 0;
BEGIN
  SELECT COALESCE(SUM(
    CASE
      WHEN frequency = 'weekly' THEN amount * 4.33
      WHEN frequency = 'biweekly' THEN amount * 2.17
      WHEN frequency = 'monthly' THEN amount
      WHEN frequency = 'yearly' THEN amount / 12
      ELSE amount
    END
  ), 0) INTO v_total
  FROM public.income_sources
  WHERE user_id = p_user_id AND is_active = true;

  RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get allocation status function
CREATE OR REPLACE FUNCTION public.get_allocation_status(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_total_income DECIMAL(12, 2);
  v_total_allocated DECIMAL(12, 2);
  v_remaining DECIMAL(12, 2);
  v_percentage DECIMAL(5, 2);
  v_status TEXT;
  v_message TEXT;
BEGIN
  -- Get total monthly income
  v_total_income := public.get_monthly_income(p_user_id);

  -- Get total allocated
  SELECT COALESCE(SUM(allocated_amount), 0) INTO v_total_allocated
  FROM public.category_allocations
  WHERE user_id = p_user_id;

  -- Calculate remaining and percentage
  v_remaining := v_total_income - v_total_allocated;
  v_percentage := CASE WHEN v_total_income > 0
    THEN (v_total_allocated / v_total_income) * 100
    ELSE 0
  END;

  -- Determine status
  IF v_percentage >= 95 AND v_percentage <= 105 THEN
    v_status := 'balanced';
    v_message := 'Budget is well-balanced!';
  ELSIF v_percentage < 95 THEN
    IF (100 - v_percentage) > 30 THEN
      v_status := 'critical';
      v_message := ROUND(100 - v_percentage, 0) || '% income belum dialokasikan';
    ELSE
      v_status := 'warning';
      v_message := ROUND(100 - v_percentage, 0) || '% income belum dialokasikan';
    END IF;
  ELSE
    v_status := 'critical';
    v_message := 'Over-allocated! Reduce spending in some categories.';
  END IF;

  RETURN jsonb_build_object(
    'totalIncome', v_total_income,
    'totalAllocated', v_total_allocated,
    'remainingToAllocate', v_remaining,
    'allocationPercentage', v_percentage,
    'status', v_status,
    'message', v_message
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get expenses summary function (for Analytics)
CREATE OR REPLACE FUNCTION public.get_expenses_summary(
  p_user_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
  v_total_income DECIMAL(12, 2) := 0;
  v_total_expenses DECIMAL(12, 2) := 0;
  v_net_balance DECIMAL(12, 2) := 0;
  v_prev_expenses DECIMAL(12, 2) := 0;
  v_change_percent DECIMAL(5, 2) := 0;
  v_period_days INTEGER;
BEGIN
  v_period_days := (p_end_date - p_start_date) + 1;

  -- Get total income for period
  SELECT COALESCE(SUM(
    CASE
      WHEN frequency = 'weekly' THEN amount * (v_period_days::DECIMAL / 7)
      WHEN frequency = 'biweekly' THEN amount * (v_period_days::DECIMAL / 14)
      WHEN frequency = 'monthly' THEN amount * (v_period_days::DECIMAL / 30)
      WHEN frequency = 'yearly' THEN amount * (v_period_days::DECIMAL / 365)
      ELSE amount
    END
  ), 0) INTO v_total_income
  FROM public.income_sources
  WHERE user_id = p_user_id AND is_active = true;

  -- Get total expenses for period
  SELECT COALESCE(SUM(amount), 0) INTO v_total_expenses
  FROM public.transactions
  WHERE user_id = p_user_id
    AND type = 'expense'
    AND date BETWEEN p_start_date AND p_end_date
    AND status = 'completed';

  -- Calculate net balance
  v_net_balance := v_total_income - v_total_expenses;

  -- Get previous period expenses for comparison
  SELECT COALESCE(SUM(amount), 0) INTO v_prev_expenses
  FROM public.transactions
  WHERE user_id = p_user_id
    AND type = 'expense'
    AND date BETWEEN (p_start_date - (p_end_date - p_start_date + 1)) AND (p_start_date - 1)
    AND status = 'completed';

  -- Calculate percentage change
  IF v_prev_expenses > 0 THEN
    v_change_percent := ((v_total_expenses - v_prev_expenses) / v_prev_expenses) * 100;
  END IF;

  RETURN jsonb_build_object(
    'netBalance', v_net_balance,
    'totalIncome', v_total_income,
    'totalExpenses', v_total_expenses,
    'previousExpenses', v_prev_expenses,
    'changePercent', ROUND(v_change_percent, 2),
    'periodDays', v_period_days,
    'startDate', p_start_date,
    'endDate', p_end_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get income vs expenses trend function (for Analytics)
CREATE OR REPLACE FUNCTION public.get_income_expenses_trend(
  p_user_id UUID,
  p_years INTEGER[] DEFAULT ARRAY[2024, 2025, 2026]
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB := '[]'::jsonb;
  v_year INTEGER;
  v_income DECIMAL(12, 2);
  v_expenses DECIMAL(12, 2);
BEGIN
  FOREACH v_year IN ARRAY p_years
  LOOP
    -- Get income for year
    SELECT COALESCE(SUM(
      CASE
        WHEN frequency = 'weekly' THEN amount * 52
        WHEN frequency = 'biweekly' THEN amount * 26
        WHEN frequency = 'monthly' THEN amount * 12
        WHEN frequency = 'yearly' THEN amount
        ELSE amount
      END
    ), 0) INTO v_income
    FROM public.income_sources
    WHERE user_id = p_user_id AND is_active = true;

    -- Get expenses for year
    SELECT COALESCE(SUM(amount), 0) INTO v_expenses
    FROM public.transactions
    WHERE user_id = p_user_id
      AND type = 'expense'
      AND EXTRACT(YEAR FROM date) = v_year
      AND status = 'completed';

    v_result := v_result || jsonb_build_array(
      jsonb_build_object(
        'year', v_year,
        'income', v_income,
        'expenses', v_expenses,
        'net', v_income - v_expenses
      )
    );
  END LOOP;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get category breakdown function (for Analytics)
CREATE OR REPLACE FUNCTION public.get_category_breakdown(
  p_user_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
  v_total DECIMAL(12, 2);
  v_result JSONB := '[]'::jsonb;
BEGIN
  -- Get total expenses
  SELECT COALESCE(SUM(amount), 0) INTO v_total
  FROM public.transactions
  WHERE user_id = p_user_id
    AND type = 'expense'
    AND date BETWEEN p_start_date AND p_end_date
    AND status = 'completed';

  -- Get breakdown by category
  RETURN (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'category', category,
          'amount', SUM(amount),
          'percentage', ROUND((SUM(amount) / NULLIF(v_total, 0)) * 100, 2),
          'count', COUNT(*)
        ) ORDER BY SUM(amount) DESC
      ),
      '[]'::jsonb
    )
    FROM public.transactions
    WHERE user_id = p_user_id
      AND type = 'expense'
      AND date BETWEEN p_start_date AND p_end_date
      AND status = 'completed'
    GROUP BY category
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get expenses by account/category function (for Analytics)
CREATE OR REPLACE FUNCTION public.get_expenses_by_account(
  p_user_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'name', ca.name,
          'category', ca.category,
          'spent', COALESCE(t.spent, 0),
          'allocated', ca.allocated_amount,
          'percentage', ROUND((COALESCE(t.spent, 0) / NULLIF(ca.allocated_amount, 0)) * 100, 2),
          'remaining', ca.allocated_amount - COALESCE(t.spent, 0),
          'isEssential', ca.is_essential,
          'impactIndicator', ca.impact_indicator,
          'color', ca.color
        ) ORDER BY COALESCE(t.spent, 0) DESC
      ),
      '[]'::jsonb
    )
    FROM public.category_allocations ca
    LEFT JOIN (
      SELECT category, SUM(amount) as spent
      FROM public.transactions
      WHERE user_id = p_user_id
        AND type = 'expense'
        AND date BETWEEN p_start_date AND p_end_date
        AND status = 'completed'
      GROUP BY category
    ) t ON ca.category = t.category
    WHERE ca.user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to all tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_income_sources_updated_at ON public.income_sources;
CREATE TRIGGER update_income_sources_updated_at
  BEFORE UPDATE ON public.income_sources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_category_allocations_updated_at ON public.category_allocations;
CREATE TRIGGER update_category_allocations_updated_at
  BEFORE UPDATE ON public.category_allocations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_financial_goals_updated_at ON public.financial_goals;
CREATE TRIGGER update_financial_goals_updated_at
  BEFORE UPDATE ON public.financial_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- DONE!
-- =====================================================
