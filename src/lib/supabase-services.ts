/**
 * Supabase Data Services
 * Comprehensive data fetching and mutation services for dashboard
 * All functions use proper TypeScript types from database.types.ts
 */

import { supabase } from "@/lib/supabase";
import type {
  Transaction,
  IncomeSource,
  CategoryAllocation,
  FinancialGoal,
  BudgetInsight,
  Notification,
  TransactionType,
  TransactionStatus,
  GoalPriority,
  ImpactIndicator,
  TransactionInsert,
  IncomeSourceInsert,
  CategoryAllocationInsert,
  FinancialGoalInsert,
  BudgetInsightInsert,
  NotificationInsert,
  InputMethod,
} from "@/lib/database.types";

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await (supabase as any).auth.getUser();
    if (error) {
      console.error("[Supabase] Auth error:", error.message);
      return null;
    }
    console.log("[Supabase] Current user:", user?.email || "No user", user?.id);
    return user;
  } catch (error) {
    console.error("[Supabase] getCurrentUser error:", error);
    return null;
  }
}

// =====================================================
// TRANSACTIONS SERVICES
// =====================================================

/**
 * Fetch transactions for the current user
 */
export async function fetchTransactions(limit: number = 100) {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await (supabase as any)
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[Supabase] Fetch transactions error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("[Supabase] Fetch transactions error:", error);
    return [];
  }
}

/**
 * Create a new transaction
 */
export async function createTransaction(data: {
  type: TransactionType;
  category: string;
  account: string;
  amount: number;
  date: string;
  merchant?: string;
  note?: string;
  input_method?: "manual" | "photo" | "upload";
  status?: TransactionStatus;
}): Promise<{ success: boolean; data?: Transaction; error?: unknown }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: new Error("Not authenticated") };
    }

    const insertData = {
      user_id: user.id,
      type: data.type,
      category: data.category,
      account: data.account,
      amount: data.amount,
      date: data.date,
      merchant: data.merchant,
      note: data.note,
      input_method: data.input_method || "manual" as InputMethod,
      status: data.status || "completed" as TransactionStatus,
    };

    const { data: result, error } = await (supabase as any)
      .from("transactions")
      .insert(insertData as any)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: result };
  } catch (error) {
    console.error("[Supabase] Create transaction error:", error);
    return { success: false, error };
  }
}

/**
 * Update a transaction
 */
export async function updateTransaction(
  id: string,
  updates: Partial<Transaction>
) {
  try {
    const { data: result, error } = await (supabase as any)
      .from("transactions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: result };
  } catch (error) {
    console.error("[Supabase] Update transaction error:", error);
    return { success: false, error };
  }
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(id: string) {
  try {
    const { error } = await (supabase as any)
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("[Supabase] Delete transaction error:", error);
    return { success: false, error };
  }
}

// =====================================================
// INCOME SOURCES SERVICES
// =====================================================

/**
 * Fetch income sources for the current user
 */
export async function fetchIncomeSources(activeOnly: boolean = true) {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    let query = supabase
      .from("income_sources")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[Supabase] Fetch income sources error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("[Supabase] Fetch income sources error:", error);
    return [];
  }
}

/**
 * Create a new income source
 */
export async function createIncomeSource(data: {
  name: string;
  amount: number;
  frequency: "weekly" | "biweekly" | "monthly" | "yearly";
  type: "salary" | "freelance" | "investment" | "side-hustle" | "other";
  is_active?: boolean;
}): Promise<{ success: boolean; data?: IncomeSource; error?: unknown }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: new Error("Not authenticated") };
    }

    const { data: result, error } = await (supabase as any)
      .from("income_sources")
      .insert({
        ...data,
        user_id: user.id,
        is_active: data.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: result };
  } catch (error) {
    console.error("[Supabase] Create income source error:", error);
    return { success: false, error };
  }
}

/**
 * Update an income source
 */
export async function updateIncomeSource(
  id: string,
  updates: Partial<IncomeSource>
) {
  try {
    const { data: result, error } = await (supabase as any)
      .from("income_sources")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: result };
  } catch (error) {
    console.error("[Supabase] Update income source error:", error);
    return { success: false, error };
  }
}

/**
 * Delete an income source
 */
export async function deleteIncomeSource(id: string) {
  try {
    const { error } = await (supabase as any)
      .from("income_sources")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("[Supabase] Delete income source error:", error);
    return { success: false, error };
  }
}

// =====================================================
// CATEGORY ALLOCATIONS SERVICES
// =====================================================

/**
 * Fetch category allocations for the current user
 */
export async function fetchCategoryAllocations() {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await (supabase as any)
      .from("category_allocations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Supabase] Fetch category allocations error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("[Supabase] Fetch category allocations error:", error);
    return [];
  }
}

/**
 * Create a new category allocation
 */
export async function createCategoryAllocation(data: {
  name: string;
  category: string;
  allocated_amount?: number;
  spent_amount?: number;
  is_essential?: boolean;
  impact_indicator?: ImpactIndicator;
  color?: string;
}): Promise<{ success: boolean; data?: CategoryAllocation; error?: unknown }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: new Error("Not authenticated") };
    }

    const { data: result, error } = await (supabase as any)
      .from("category_allocations")
      .insert({
        ...data,
        user_id: user.id,
        allocated_amount: data.allocated_amount ?? 0,
        spent_amount: data.spent_amount ?? 0,
        is_essential: data.is_essential ?? false,
        impact_indicator: data.impact_indicator ?? "medium",
        color: data.color ?? "#6B7280",
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: result };
  } catch (error) {
    console.error("[Supabase] Create category allocation error:", error);
    return { success: false, error };
  }
}

/**
 * Update a category allocation
 */
export async function updateCategoryAllocation(
  id: string,
  updates: Partial<CategoryAllocation>
) {
  try {
    const { data: result, error } = await (supabase as any)
      .from("category_allocations")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: result };
  } catch (error) {
    console.error("[Supabase] Update category allocation error:", error);
    return { success: false, error };
  }
}

/**
 * Delete a category allocation
 */
export async function deleteCategoryAllocation(id: string) {
  try {
    const { error } = await (supabase as any)
      .from("category_allocations")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("[Supabase] Delete category allocation error:", error);
    return { success: false, error };
  }
}

/**
 * Get allocation status using database function
 */
export async function getAllocationStatus() {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await (supabase as any)
      .rpc("get_allocation_status", { p_user_id: user.id });

    if (error) {
      console.error("[Supabase] Get allocation status error:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("[Supabase] Get allocation status error:", error);
    return null;
  }
}

// =====================================================
// FINANCIAL GOALS SERVICES
// =====================================================

/**
 * Fetch financial goals for the current user
 */
export async function fetchFinancialGoals() {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await (supabase as any)
      .from("financial_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Supabase] Fetch financial goals error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("[Supabase] Fetch financial goals error:", error);
    return [];
  }
}

/**
 * Create a new financial goal
 */
export async function createFinancialGoal(data: {
  name: string;
  description?: string;
  target_amount: number;
  current_amount?: number;
  target_date?: string;
  priority?: GoalPriority;
  icon?: string;
}): Promise<{ success: boolean; data?: FinancialGoal; error?: unknown }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: new Error("Not authenticated") };
    }

    const { data: result, error } = await (supabase as any)
      .from("financial_goals")
      .insert({
        ...data,
        user_id: user.id,
        current_amount: data.current_amount ?? 0,
        priority: data.priority ?? "medium",
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: result };
  } catch (error) {
    console.error("[Supabase] Create financial goal error:", error);
    return { success: false, error };
  }
}

/**
 * Update a financial goal
 */
export async function updateFinancialGoal(
  id: string,
  updates: Partial<FinancialGoal>
) {
  try {
    const { data: result, error } = await (supabase as any)
      .from("financial_goals")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: result };
  } catch (error) {
    console.error("[Supabase] Update financial goal error:", error);
    return { success: false, error };
  }
}

/**
 * Add progress to a financial goal
 */
export async function addGoalProgress(id: string, amount: number): Promise<{ success: boolean; data?: FinancialGoal; error?: unknown }> {
  try {
    // First get the current goal
    const { data: goal, error: fetchError } = await (supabase as any)
      .from("financial_goals")
      .select("current_amount, target_amount")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    const newAmount = Math.min((goal.current_amount || 0) + amount, goal.target_amount);

    const { data: result, error } = await (supabase as any)
      .from("financial_goals")
      .update({ current_amount: newAmount })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: result };
  } catch (error) {
    console.error("[Supabase] Add goal progress error:", error);
    return { success: false, error };
  }
}

/**
 * Delete a financial goal
 */
export async function deleteFinancialGoal(id: string) {
  try {
    const { error } = await (supabase as any)
      .from("financial_goals")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("[Supabase] Delete financial goal error:", error);
    return { success: false, error };
  }
}

// =====================================================
// BUDGET INSIGHTS SERVICES
// =====================================================

/**
 * Fetch budget insights for the current user
 */
export async function fetchBudgetInsights(limit: number = 10) {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await (supabase as any)
      .from("budget_insights")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[Supabase] Fetch budget insights error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("[Supabase] Fetch budget insights error:", error);
    return [];
  }
}

/**
 * Create a new budget insight
 */
export async function createBudgetInsight(data: {
  title: string;
  content: string;
  type: "advice" | "alert" | "opportunity" | "achievement";
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; data?: BudgetInsight; error?: unknown }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: new Error("Not authenticated") };
    }

    const { data: result, error } = await (supabase as any)
      .from("budget_insights")
      .insert({
        ...data,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: result };
  } catch (error) {
    console.error("[Supabase] Create budget insight error:", error);
    return { success: false, error };
  }
}

/**
 * Mark an insight as read
 */
export async function markInsightAsRead(id: string) {
  try {
    const { error } = await (supabase as any)
      .from("budget_insights")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("[Supabase] Mark insight as read error:", error);
    return { success: false, error };
  }
}

// =====================================================
// NOTIFICATIONS SERVICES
// =====================================================

/**
 * Fetch notifications for the current user
 */
export async function fetchNotifications(limit: number = 20) {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await (supabase as any)
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[Supabase] Fetch notifications error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("[Supabase] Fetch notifications error:", error);
    return [];
  }
}

/**
 * Create a new notification
 */
export async function createNotification(data: {
  type: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
  action_url?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; data?: Notification; error?: unknown }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: new Error("Not authenticated") };
    }

    const { data: result, error } = await (supabase as any)
      .from("notifications")
      .insert({
        ...data,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: result };
  } catch (error) {
    console.error("[Supabase] Create notification error:", error);
    return { success: false, error };
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(id: string) {
  try {
    const { error } = await (supabase as any)
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("[Supabase] Mark notification as read error:", error);
    return { success: false, error };
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(id: string) {
  try {
    const { error } = await (supabase as any)
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("[Supabase] Delete notification error:", error);
    return { success: false, error };
  }
}

// =====================================================
// ANALYTICS SERVICES
// =====================================================

/**
 * Get expenses summary using database function
 */
export async function getExpensesSummary(
  startDate?: string,
  endDate?: string
) {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const end = endDate || new Date().toISOString().split("T")[0];

    const { data, error } = await (supabase as any)
      .rpc("get_expenses_summary", {
        p_user_id: user.id,
        p_start_date: start,
        p_end_date: end,
      });

    if (error) {
      console.error("[Supabase] Get expenses summary error:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("[Supabase] Get expenses summary error:", error);
    return null;
  }
}

/**
 * Get income vs expenses trend using database function
 */
export async function getIncomeExpensesTrend(years?: number[]) {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await (supabase as any)
      .rpc("get_income_expenses_trend", {
        p_user_id: user.id,
        p_years: years || [2024, 2025, 2026],
      });

    if (error) {
      console.error("[Supabase] Get income expenses trend error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("[Supabase] Get income expenses trend error:", error);
    return [];
  }
}

/**
 * Get category breakdown using database function
 */
export async function getCategoryBreakdown(
  startDate?: string,
  endDate?: string
) {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const end = endDate || new Date().toISOString().split("T")[0];

    const { data, error } = await (supabase as any)
      .rpc("get_category_breakdown", {
        p_user_id: user.id,
        p_start_date: start,
        p_end_date: end,
      });

    if (error) {
      console.error("[Supabase] Get category breakdown error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("[Supabase] Get category breakdown error:", error);
    return [];
  }
}

/**
 * Get expenses by account using database function
 */
export async function getExpensesByAccount(
  startDate?: string,
  endDate?: string
) {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const end = endDate || new Date().toISOString().split("T")[0];

    const { data, error } = await (supabase as any)
      .rpc("get_expenses_by_account", {
        p_user_id: user.id,
        p_start_date: start,
        p_end_date: end,
      });

    if (error) {
      console.error("[Supabase] Get expenses by account error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("[Supabase] Get expenses by account error:", error);
    return [];
  }
}

/**
 * Get category transactions using database function
 */
export async function getCategoryTransactions(
  category: string,
  startDate?: string,
  endDate?: string,
  limit?: number
) {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const end = endDate || new Date().toISOString().split("T")[0];

    const { data, error } = await (supabase as any)
      .rpc("get_category_transactions", {
        p_user_id: user.id,
        p_category: category,
        p_start_date: start,
        p_end_date: end,
        p_limit: limit || 50,
      });

    if (error) {
      console.error("[Supabase] Get category transactions error:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("[Supabase] Get category transactions error:", error);
    return null;
  }
}

// =====================================================
// COMPREHENSIVE DASHBOARD DATA FETCH
// =====================================================

/**
 * Fetch all dashboard data in one call
 */
export async function fetchAllDashboardData() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.warn("[Supabase] No authenticated user for dashboard fetch");
      return {
        transactions: [],
        incomeSources: [],
        categoryAllocations: [],
        financialGoals: [],
        budgetInsights: [],
        notifications: [],
        allocationStatus: null,
      };
    }

    const userId = user.id;
    console.log("[Supabase] Fetching dashboard data for user:", userId);

    // Fetch all data in parallel
    const [
      transactionsRes,
      incomeSourcesRes,
      allocationsRes,
      goalsRes,
      insightsRes,
      notificationsRes,
      allocationStatusRes,
    ] = await Promise.all([
      (supabase as any)
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(100),
      (supabase as any)
        .from("income_sources")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      (supabase as any)
        .from("category_allocations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      (supabase as any)
        .from("financial_goals")
        .select("*")
        .eq("user_id", userId)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false }),
      (supabase as any)
        .from("budget_insights")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),
      (supabase as any)
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
      (supabase as any)
        .rpc("get_allocation_status", { p_user_id: userId }),
    ]);

    // Log errors for debugging
    if (transactionsRes.error) console.error("[Supabase] Transactions error:", transactionsRes.error);
    if (incomeSourcesRes.error) console.error("[Supabase] Income sources error:", incomeSourcesRes.error);
    if (allocationsRes.error) console.error("[Supabase] Allocations error:", allocationsRes.error);
    if (goalsRes.error) console.error("[Supabase] Goals error:", goalsRes.error);
    if (insightsRes.error) console.error("[Supabase] Insights error:", insightsRes.error);
    if (notificationsRes.error) console.error("[Supabase] Notifications error:", notificationsRes.error);
    if (allocationStatusRes.error) console.error("[Supabase] Allocation status error:", allocationStatusRes.error);

    const result = {
      transactions: transactionsRes.error ? [] : transactionsRes.data || [],
      incomeSources: incomeSourcesRes.error ? [] : incomeSourcesRes.data || [],
      categoryAllocations: allocationsRes.error ? [] : allocationsRes.data || [],
      financialGoals: goalsRes.error ? [] : goalsRes.data || [],
      budgetInsights: insightsRes.error ? [] : insightsRes.data || [],
      notifications: notificationsRes.error ? [] : notificationsRes.data || [],
      allocationStatus: allocationStatusRes.error ? null : allocationStatusRes.data,
    };

    console.log("[Supabase] ✅ Dashboard data fetched successfully");
    return result;
  } catch (error) {
    console.error("[Supabase] ❌ Fetch all dashboard data error:", error);
    return {
      transactions: [],
      incomeSources: [],
      categoryAllocations: [],
      financialGoals: [],
      budgetInsights: [],
      notifications: [],
      allocationStatus: null,
    };
  }
}
