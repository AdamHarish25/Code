-- =====================================================
-- Duitly Database Migration - RLS Fix for Onboarding
-- Version: 3.2.1
-- Last Updated: March 1, 2026
-- 
-- Purpose: Fix RLS policies to allow onboarding completion
-- =====================================================

-- Run this in Supabase SQL Editor if you already have the tables created

-- =====================================================
-- 1. Add INSERT policy for profiles (if not exists)
-- =====================================================

-- Drop existing policies first if they exist
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- 2. Verify policies are in place
-- =====================================================

-- Check profiles policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- =====================================================
-- Manual Fix (Optional - Run if existing users can't onboard)
-- =====================================================

-- This creates profiles for existing users who don't have one
-- Uncomment and run if needed:

/*
INSERT INTO public.profiles (id, email, updated_at)
SELECT 
  u.id,
  u.email,
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
*/

-- =====================================================
-- Done!
-- =====================================================
