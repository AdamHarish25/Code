/**
 * Dashboard Data Fetching
 * Client-side compatible functions to fetch data from Supabase
 */

import { supabase } from "@/lib/supabase";

/**
 * Fetch all dashboard data for a user
 */
export async function fetchDashboardData() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
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
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(50),
      supabase
        .from("income_sources")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("category_allocations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("financial_goals")
        .select("*")
        .eq("user_id", userId)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("budget_insights")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
      (supabase as any)
        .rpc("get_allocation_status", { p_user_id: userId }),
    ]);

    // Handle errors gracefully
    const transactions = transactionsRes.error ? [] : transactionsRes.data || [];
    const incomeSources = incomeSourcesRes.error ? [] : incomeSourcesRes.data || [];
    const categoryAllocations = allocationsRes.error ? [] : allocationsRes.data || [];
    const financialGoals = goalsRes.error ? [] : goalsRes.data || [];
    const budgetInsights = insightsRes.error ? [] : insightsRes.data || [];
    const notifications = notificationsRes.error ? [] : notificationsRes.data || [];
    const allocationStatus = allocationStatusRes.error ? null : allocationStatusRes.data;

    return {
      transactions,
      incomeSources,
      categoryAllocations,
      financialGoals,
      budgetInsights,
      notifications,
      allocationStatus,
    };
  } catch (error) {
    console.error("[Dashboard] Fetch data error:", error);
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

/**
 * Fetch transactions only
 */
export async function fetchTransactions(limit: number = 50) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("[Dashboard] Fetch transactions error:", error);
    return [];
  }
}

/**
 * Fetch income sources only
 */
export async function fetchIncomeSources() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("income_sources")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("[Dashboard] Fetch income sources error:", error);
    return [];
  }
}

/**
 * Fetch category allocations only
 */
export async function fetchCategoryAllocations() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("category_allocations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("[Dashboard] Fetch category allocations error:", error);
    return [];
  }
}

/**
 * Fetch financial goals only
 */
export async function fetchFinancialGoals() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("financial_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("[Dashboard] Fetch financial goals error:", error);
    return [];
  }
}

/**
 * Fetch allocation status
 */
export async function fetchAllocationStatus() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await (supabase as any)
      .rpc("get_allocation_status", { p_user_id: user.id });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("[Dashboard] Fetch allocation status error:", error);
    return null;
  }
}

/**
 * Create a new transaction
 */
export async function createTransaction(data: {
  user_id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  merchant?: string;
  note?: string;
  paylabs_transaction_id?: string;
}) {
  try {
    const { data: result, error } = await (supabase as any)
      .from("transactions")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    console.error("[Dashboard] Create transaction error:", error);
    return { success: false, error };
  }
}

/**
 * Create a new income source
 */
export async function createIncomeSource(data: {
  user_id: string;
  name: string;
  amount: number;
  frequency: "weekly" | "biweekly" | "monthly" | "yearly";
  type: string;
  is_active?: boolean;
}) {
  try {
    const { data: result, error } = await (supabase as any)
      .from("income_sources")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    console.error("[Dashboard] Create income source error:", error);
    return { success: false, error };
  }
}

/**
 * Create a new category allocation
 */
export async function createCategoryAllocation(data: {
  user_id: string;
  name: string;
  category: string;
  allocated_amount: number;
  is_essential?: boolean;
  impact_indicator?: "high" | "medium" | "low";
  color?: string;
}) {
  try {
    const { data: result, error } = await (supabase as any)
      .from("category_allocations")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    console.error("[Dashboard] Create category allocation error:", error);
    return { success: false, error };
  }
}

/**
 * Create a new financial goal
 */
export async function createFinancialGoal(data: {
  user_id: string;
  name: string;
  target_amount: number;
  priority?: "low" | "medium" | "high";
  target_date?: string;
}) {
  try {
    const { data: result, error } = await (supabase as any)
      .from("financial_goals")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    console.error("[Dashboard] Create financial goal error:", error);
    return { success: false, error };
  }
}
