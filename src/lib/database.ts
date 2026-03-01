/**
 * Database Services
 * CRUD operations for Supabase tables
 * Uses admin client to bypass RLS for server-side operations
 */

"use server";

import { getSupabaseAdmin, handleSupabaseError, isSupabaseConfigured } from "@/lib/supabase";
import type {
  IncomeSourceInsert,
  IncomeSourceUpdate,
  CategoryAllocationInsert,
  CategoryAllocationUpdate,
  FinancialGoalInsert,
  FinancialGoalUpdate,
  TransactionInsert,
  TransactionUpdate,
  BudgetInsightInsert,
  NotificationInsert,
  OCRReceiptInsert,
} from "@/lib/database.types";

// Check if database is enabled
const DB_ENABLED = isSupabaseConfigured() && process.env.NEXT_PUBLIC_ENABLE_DATABASE === "true";

/**
 * ============================================
 * INCOME SOURCES
 * ============================================
 */

export async function getIncomeSources(userId: string) {
  if (!DB_ENABLED) return [];

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("income_sources")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("[DB] Get income sources error:", error);
    return [];
  }
}

export async function createIncomeSource(data: IncomeSourceInsert) {
  if (!DB_ENABLED) return { success: false, error: "Database not configured" };

  try {
    const supabase = getSupabaseAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: result, error } = await (supabase as any)
      .from("income_sources")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    console.error("[DB] Create income source error:", error);
    return { success: false, error: handleSupabaseError(error) };
  }
}

export async function updateIncomeSource(id: string, data: IncomeSourceUpdate) {
  if (!DB_ENABLED) return { success: false, error: "Database not configured" };

  try {
    const supabase = getSupabaseAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: result, error } = await (supabase as any)
      .from("income_sources")
      .update(data)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    console.error("[DB] Update income source error:", error);
    return { success: false, error: handleSupabaseError(error) };
  }
}

export async function deleteIncomeSource(id: string) {
  if (!DB_ENABLED) return { success: false, error: "Database not configured" };

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("income_sources")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("[DB] Delete income source error:", error);
    return { success: false, error: handleSupabaseError(error) };
  }
}

/**
 * ============================================
 * CATEGORY ALLOCATIONS
 * ============================================
 */

export async function getCategoryAllocations(userId: string) {
  if (!DB_ENABLED) return [];

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("category_allocations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("[DB] Get category allocations error:", error);
    return [];
  }
}

export async function createCategoryAllocation(data: CategoryAllocationInsert) {
  if (!DB_ENABLED) return { success: false, error: "Database not configured" };

  try {
    const supabase = getSupabaseAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: result, error } = await (supabase as any)
      .from("category_allocations")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    console.error("[DB] Create category allocation error:", error);
    return { success: false, error: handleSupabaseError(error) };
  }
}

export async function updateCategoryAllocation(id: string, data: CategoryAllocationUpdate) {
  if (!DB_ENABLED) return { success: false, error: "Database not configured" };

  try {
    const supabase = getSupabaseAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: result, error } = await (supabase as any)
      .from("category_allocations")
      .update(data)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    console.error("[DB] Update category allocation error:", error);
    return { success: false, error: handleSupabaseError(error) };
  }
}

export async function deleteCategoryAllocation(id: string) {
  if (!DB_ENABLED) return { success: false, error: "Database not configured" };

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("category_allocations")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("[DB] Delete category allocation error:", error);
    return { success: false, error: handleSupabaseError(error) };
  }
}

/**
 * ============================================
 * FINANCIAL GOALS
 * ============================================
 */

export async function getFinancialGoals(userId: string) {
  if (!DB_ENABLED) return [];

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("financial_goals")
      .select("*")
      .eq("user_id", userId)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("[DB] Get financial goals error:", error);
    return [];
  }
}

export async function createFinancialGoal(data: FinancialGoalInsert) {
  if (!DB_ENABLED) return { success: false, error: "Database not configured" };

  try {
    const supabase = getSupabaseAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: result, error } = await (supabase as any)
      .from("financial_goals")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    console.error("[DB] Create financial goal error:", error);
    return { success: false, error: handleSupabaseError(error) };
  }
}

export async function updateFinancialGoal(id: string, data: FinancialGoalUpdate) {
  if (!DB_ENABLED) return { success: false, error: "Database not configured" };

  try {
    const supabase = getSupabaseAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: result, error } = await (supabase as any)
      .from("financial_goals")
      .update(data)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    console.error("[DB] Update financial goal error:", error);
    return { success: false, error: handleSupabaseError(error) };
  }
}

/**
 * ============================================
 * TRANSACTIONS
 * ============================================
 */

export async function getTransactions(userId: string, limit: number = 50) {
  if (!DB_ENABLED) return [];

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("[DB] Get transactions error:", error);
    return [];
  }
}

export async function getTransactionById(id: string) {
  if (!DB_ENABLED) return null;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("[DB] Get transaction by ID error:", error);
    return null;
  }
}

export async function createTransaction(data: TransactionInsert) {
  if (!DB_ENABLED) return { success: false, error: "Database not configured" };

  try {
    const supabase = getSupabaseAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: result, error } = await (supabase as any)
      .from("transactions")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    console.error("[DB] Create transaction error:", error);
    return { success: false, error: handleSupabaseError(error) };
  }
}

export async function updateTransaction(id: string, data: TransactionUpdate) {
  if (!DB_ENABLED) return { success: false, error: "Database not configured" };

  try {
    const supabase = getSupabaseAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: result, error } = await (supabase as any)
      .from("transactions")
      .update(data)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    console.error("[DB] Update transaction error:", error);
    return { success: false, error: handleSupabaseError(error) };
  }
}

export async function deleteTransaction(id: string) {
  if (!DB_ENABLED) return { success: false, error: "Database not configured" };

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("[DB] Delete transaction error:", error);
    return { success: false, error: handleSupabaseError(error) };
  }
}

/**
 * ============================================
 * BUDGET INSIGHTS
 * ============================================
 */

export async function getBudgetInsights(userId: string, unreadOnly: boolean = false) {
  if (!DB_ENABLED) return [];

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("budget_insights")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("[DB] Get budget insights error:", error);
    return [];
  }
}

export async function createBudgetInsight(data: BudgetInsightInsert) {
  if (!DB_ENABLED) return { success: false, error: "Database not configured" };

  try {
    const supabase = getSupabaseAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: result, error } = await (supabase as any)
      .from("budget_insights")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    console.error("[DB] Create budget insight error:", error);
    return { success: false, error: handleSupabaseError(error) };
  }
}

export async function markInsightRead(id: string) {
  if (!DB_ENABLED) return { success: false, error: "Database not configured" };

  try {
    const supabase = getSupabaseAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: result, error } = await (supabase as any)
      .from("budget_insights")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    console.error("[DB] Mark insight read error:", error);
    return { success: false, error: handleSupabaseError(error) };
  }
}

/**
 * ============================================
 * NOTIFICATIONS
 * ============================================
 */

export async function getNotifications(userId: string, unreadOnly: boolean = false) {
  if (!DB_ENABLED) return [];

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("[DB] Get notifications error:", error);
    return [];
  }
}

export async function createNotification(data: NotificationInsert) {
  if (!DB_ENABLED) return { success: false, error: "Database not configured" };

  try {
    const supabase = getSupabaseAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: result, error } = await (supabase as any)
      .from("notifications")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    console.error("[DB] Create notification error:", error);
    return { success: false, error: handleSupabaseError(error) };
  }
}

export async function markNotificationRead(id: string) {
  if (!DB_ENABLED) return { success: false, error: "Database not configured" };

  try {
    const supabase = getSupabaseAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("[DB] Mark notification read error:", error);
    return { success: false, error: handleSupabaseError(error) };
  }
}

export async function deleteNotification(id: string) {
  if (!DB_ENABLED) return { success: false, error: "Database not configured" };

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("[DB] Delete notification error:", error);
    return { success: false, error: handleSupabaseError(error) };
  }
}

/**
 * ============================================
 * OCR RECEIPTS
 * ============================================
 */

export async function createOCRReceipt(data: OCRReceiptInsert) {
  if (!DB_ENABLED) return { success: false, error: "Database not configured" };

  try {
    const supabase = getSupabaseAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: result, error } = await (supabase as any)
      .from("ocr_receipts")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    console.error("[DB] Create OCR receipt error:", error);
    return { success: false, error: handleSupabaseError(error) };
  }
}

/**
 * ============================================
 * ALLOCATION STATUS (using database function)
 * ============================================
 */

export async function getAllocationStatus(userId: string) {
  if (!DB_ENABLED) return null;

  try {
    const supabase = getSupabaseAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .rpc("get_allocation_status", { p_user_id: userId });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("[DB] Get allocation status error:", error);
    return null;
  }
}

/**
 * ============================================
 * MONTHLY INCOME (using database function)
 * ============================================
 */

export async function getMonthlyIncome(userId: string) {
  if (!DB_ENABLED) return 0;

  try {
    const supabase = getSupabaseAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .rpc("get_monthly_income", { p_user_id: userId });

    if (error) throw error;
    return data || 0;
  } catch (error) {
    console.error("[DB] Get monthly income error:", error);
    return 0;
  }
}
