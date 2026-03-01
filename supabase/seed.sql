-- =====================================================
-- Duitly Database Seed Data
-- For development and testing purposes
-- Run after schema.sql
-- =====================================================

-- Note: Replace 'YOUR-USER-ID-HERE' with actual Supabase user ID

-- -----------------------------------------------------
-- Sample Income Sources
-- -----------------------------------------------------
INSERT INTO public.income_sources (user_id, name, amount, frequency, type, is_active) VALUES
  ('YOUR-USER-ID-HERE', 'Software Engineer Salary', 15000000, 'monthly', 'salary', true),
  ('YOUR-USER-ID-HERE', 'Freelance Web Development', 5000000, 'monthly', 'freelance', true),
  ('YOUR-USER-ID-HERE', 'Stock Dividends', 2000000, 'monthly', 'investment', true),
  ('YOUR-USER-ID-HERE', 'Tech Blog Ad Revenue', 1500000, 'monthly', 'side-hustle', true);

-- -----------------------------------------------------
-- Sample Category Allocations (Budget)
-- -----------------------------------------------------
INSERT INTO public.category_allocations (user_id, name, category, allocated_amount, spent_amount, is_essential, impact_indicator, color) VALUES
  -- Essential Categories (50%)
  ('YOUR-USER-ID-HERE', 'Rent & Utilities', 'housing', 5000000, 0, true, 'high', '#3B82F6'),
  ('YOUR-USER-ID-HERE', 'Food and Beverage', 'food', 3000000, 0, true, 'high', '#F97316'),
  ('YOUR-USER-ID-HERE', 'Public Transport', 'transport', 1000000, 0, true, 'medium', '#EAB308'),
  ('YOUR-USER-ID-HERE', 'Healthcare', 'healthcare', 1000000, 0, true, 'high', '#EF4444'),
  
  -- Non-Essential Categories (30%)
  ('YOUR-USER-ID-HERE', 'Entertainment', 'entertainment', 1500000, 0, false, 'low', '#A855F7'),
  ('YOUR-USER-ID-HERE', 'Shopping', 'shopping', 1500000, 0, false, 'low', '#EC4899'),
  
  -- Savings & Investment (20%)
  ('YOUR-USER-ID-HERE', 'Emergency Fund', 'savings', 3000000, 0, true, 'high', '#22C55E'),
  ('YOUR-USER-ID-HERE', 'Investment', 'investment', 2500000, 0, true, 'high', '#10B981');

-- -----------------------------------------------------
-- Sample Financial Goals
-- -----------------------------------------------------
INSERT INTO public.financial_goals (user_id, name, description, target_amount, current_amount, target_date, priority, icon, is_completed) VALUES
  ('YOUR-USER-ID-HERE', 'Emergency Fund', 'Build 6 months of living expenses', 50000000, 15000000, '2027-12-31', 'high', 'shield', false),
  ('YOUR-USER-ID-HERE', 'Vacation to Japan', 'Dream trip with family', 30000000, 5000000, '2027-06-30', 'medium', 'airplane', false),
  ('YOUR-USER-ID-HERE', 'New Laptop', 'For work and development', 25000000, 10000000, '2026-12-31', 'low', 'laptop', false),
  ('YOUR-USER-ID-HERE', 'House Down Payment', 'Initial payment for first home', 200000000, 25000000, '2029-12-31', 'high', 'home', false);

-- -----------------------------------------------------
-- Sample Transactions
-- -----------------------------------------------------
INSERT INTO public.transactions (user_id, type, category, account, amount, merchant, date, note, input_method, status, ai_category, ai_confidence) VALUES
  -- Income Transactions
  ('YOUR-USER-ID-HERE', 'income', 'salary', 'salary', 15000000, 'PT Tech Company', '2026-02-25', 'February 2026 Salary', 'manual', 'completed', 'salary', 0.95),
  ('YOUR-USER-ID-HERE', 'income', 'freelance', 'freelance', 5000000, 'Client Project', '2026-02-20', 'Website redesign project', 'manual', 'completed', 'freelance', 0.90),
  
  -- Expense Transactions
  ('YOUR-USER-ID-HERE', 'expense', 'housing', 'rent', 5000000, 'Apartment Management', '2026-03-01', 'Monthly rent', 'manual', 'completed', 'housing', 0.98),
  ('YOUR-USER-ID-HERE', 'expense', 'food', 'food', 150000, 'Grocery Store', '2026-03-01', 'Weekly groceries', 'manual', 'completed', 'food', 0.95),
  ('YOUR-USER-ID-HERE', 'expense', 'food', 'food', 75000, 'Starbucks', '2026-03-02', 'Morning coffee', 'photo', 'completed', 'food', 0.92),
  ('YOUR-USER-ID-HERE', 'expense', 'transport', 'transport', 100000, 'Pertamina Gas Station', '2026-03-02', 'Fuel', 'photo', 'completed', 'transport', 0.88),
  ('YOUR-USER-ID-HERE', 'expense', 'entertainment', 'entertainment', 100000, 'Netflix Subscription', '2026-03-01', 'Monthly subscription', 'manual', 'completed', 'entertainment', 0.99),
  ('YOUR-USER-ID-HERE', 'expense', 'shopping', 'shopping', 500000, 'Uniqlo', '2026-03-03', 'New clothes', 'upload', 'completed', 'shopping', 0.85);

-- -----------------------------------------------------
-- Sample Budget Insights (AI-generated)
-- -----------------------------------------------------
INSERT INTO public.budget_insights (user_id, title, content, type, is_read) VALUES
  ('YOUR-USER-ID-HERE', 'Great Savings Rate!', 'Your savings rate of 23% is above the recommended 20%. Keep up the excellent work!', 'achievement', false),
  ('YOUR-USER-ID-HERE', 'Budget Alert', 'You''ve spent 85% of your food budget with 2 weeks remaining. Consider cooking at home more often.', 'alert', false),
  ('YOUR-USER-ID-HERE', 'Investment Opportunity', 'With your current surplus, consider increasing your investment allocation by 5%.', 'opportunity', true),
  ('YOUR-USER-ID-HERE', 'Weekly Tip', 'Track all your expenses daily to build better financial awareness and catch unnecessary spending.', 'advice', true);

-- -----------------------------------------------------
-- Sample Notifications
-- -----------------------------------------------------
INSERT INTO public.notifications (user_id, type, title, message, is_read) VALUES
  ('YOUR-USER-ID-HERE', 'success', 'Transaction Added', 'Expense of Rp 75,000 at Starbucks has been recorded', false),
  ('YOUR-USER-ID-HERE', 'warning', 'Budget Alert', 'Food budget is 80% utilized', false),
  ('YOUR-USER-ID-HERE', 'info', 'AI Insight Ready', 'Your weekly financial insight is ready to view', true),
  ('YOUR-USER-ID-HERE', 'success', 'Goal Progress', 'You''ve reached 30% of your Emergency Fund goal!', true);

-- -----------------------------------------------------
-- Verify Data
-- -----------------------------------------------------
-- Run these queries to verify seed data:

-- Check total monthly income
SELECT public.get_monthly_income('YOUR-USER-ID-HERE') as monthly_income;

-- Check allocation status
SELECT public.get_allocation_status('YOUR-USER-ID-HERE') as allocation_status;

-- Count records
SELECT 
  (SELECT COUNT(*) FROM income_sources WHERE user_id = 'YOUR-USER-ID-HERE') as income_sources,
  (SELECT COUNT(*) FROM category_allocations WHERE user_id = 'YOUR-USER-ID-HERE') as allocations,
  (SELECT COUNT(*) FROM financial_goals WHERE user_id = 'YOUR-USER-ID-HERE') as goals,
  (SELECT COUNT(*) FROM transactions WHERE user_id = 'YOUR-USER-ID-HERE') as transactions;

-- =====================================================
-- END OF SEED DATA
-- =====================================================
