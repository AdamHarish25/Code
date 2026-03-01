/**
 * Onboarding Server Actions
 * Save onboarding data to Supabase database
 */

"use server";

import { getSupabaseAdmin } from "@/lib/supabase";
import { OnboardingData } from "@/types/onboarding";

/**
 * Save complete onboarding data to database
 */
export async function saveOnboardingData(
  userId: string,
  data: OnboardingData
) {
  try {
    if (!userId) {
      return {
        success: false,
        error: "User ID is required",
      };
    }

    const supabase = getSupabaseAdmin();

    // First, get the user's email from auth
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !userData.user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const email = userData.user.email || "";

    // Start a transaction-like process
    const operations = [];

    // 1. Create profile if not exists (using upsert with email)
    if (data.investmentPath) {
      operations.push(
        (supabase as any)
          .from("profiles")
          .upsert({
            id: userId,
            email: email,
            investment_path: data.investmentPath,
            updated_at: new Date().toISOString(),
          })
      );
    }

    // 2. Update user metadata
    operations.push(
      supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          onboarding_completed: true,
          investment_path: data.investmentPath,
          completed_at: new Date().toISOString(),
        },
      })
    );

    // 3. Insert goals
    if (data.goals && data.goals.length > 0) {
      const goalsToInsert = data.goals.map((goal) => ({
        user_id: userId,
        name: goal.name,
        target_amount: goal.targetAmount,
        target_date: goal.targetDate || null,
        priority: goal.priority,
      }));

      operations.push(
        (supabase as any).from("financial_goals").insert(goalsToInsert)
      );
    }

    // 4. Insert income sources
    if (data.incomeSources && data.incomeSources.length > 0) {
      const incomeToInsert = data.incomeSources.map((source) => ({
        user_id: userId,
        name: source.type === "salary" ? "Salary" : source.type === "freelancing" ? "Freelance" : source.type,
        amount: source.amount,
        frequency: source.frequency,
        type: source.type === "freelancing" ? "freelance" : source.type,
        is_active: true,
      }));

      operations.push(
        (supabase as any).from("income_sources").insert(incomeToInsert)
      );
    }

    // 5. Insert expense categories
    if (data.expenses && data.expenses.length > 0) {
      const expensesToInsert = data.expenses.map((expense) => ({
        user_id: userId,
        name: expense.category.charAt(0).toUpperCase() + expense.category.slice(1),
        category: expense.category,
        allocated_amount: expense.amount,
        spent_amount: 0,
        is_essential: expense.isEssential,
        impact_indicator: "high" as const,
        color: "#6B7280",
      }));

      operations.push(
        (supabase as any).from("category_allocations").insert(expensesToInsert)
      );
    }

    // Execute all operations
    const results = await Promise.all(operations);

    // Check for errors
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if ("error" in result && result.error) {
        console.error(`[Onboarding] Operation ${i} failed:`, result.error);
        return {
          success: false,
          error: `Failed to save data: ${result.error.message}`,
        };
      }
    }

    console.log(`[Onboarding] Data saved successfully for user ${userId}`);

    return {
      success: true,
      message: "Onboarding data saved successfully",
    };
  } catch (error) {
    console.error("[Onboarding] Save error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get onboarding data for user
 */
export async function getOnboardingData(userId: string) {
  try {
    if (!userId) {
      return null;
    }

    const supabase = getSupabaseAdmin();

    const [profile, goals, income, expenses] = await Promise.all([
      (supabase as any)
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single(),
      (supabase as any)
        .from("financial_goals")
        .select("*")
        .eq("user_id", userId),
      (supabase as any)
        .from("income_sources")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true),
      (supabase as any)
        .from("category_allocations")
        .select("*")
        .eq("user_id", userId),
    ]);

    return {
      investmentPath: (profile as any).data?.investment_path,
      goals: (goals as any).data || [],
      incomeSources: (income as any).data || [],
      expenses: (expenses as any).data || [],
    };
  } catch (error) {
    console.error("[Onboarding] Get data error:", error);
    return null;
  }
}

/**
 * Check if user has completed onboarding
 */
export async function checkOnboardingComplete(userId: string): Promise<boolean> {
  try {
    if (!userId) return false;

    const supabase = getSupabaseAdmin();

    // Check profiles table for investment_path
    const { data } = await (supabase as any)
      .from("profiles")
      .select("investment_path")
      .eq("id", userId)
      .single();

    if (data?.investment_path) {
      return true;
    }

    // Fallback: check user metadata
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    return !!userData.user?.user_metadata?.onboarding_completed;
  } catch (error) {
    console.error("[Onboarding] Check complete error:", error);
    return false;
  }
}
