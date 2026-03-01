/**
 * Analytics Server Actions
 * AI-powered analytics and data visualization with Qwen AI
 */

"use server";

import { getSupabaseClient } from "@/lib/supabase";
import { generateInsight, optimizeBudget } from "@/lib/qwen-client";

/**
 * Analytics Data Types
 */
export interface ExpensesSummary {
  netBalance: number;
  totalIncome: number;
  totalExpenses: number;
  previousExpenses: number;
  changePercent: number;
  periodDays: number;
  startDate: string;
  endDate: string;
}

export interface TrendData {
  year: number;
  income: number;
  expenses: number;
  net: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface ExpensesByAccount {
  name: string;
  category: string;
  spent: number;
  allocated: number;
  percentage: number;
  remaining: number;
  isEssential: boolean;
  impactIndicator: "low" | "medium" | "high";
  color: string;
}

export interface CategoryDetail {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
  transactions: Array<{
    id: string;
    merchant: string;
    amount: number;
    date: string;
    note: string | null;
    status: string;
  }>;
}

export interface AIInsight {
  summary: string;
  trend: string;
  forecast: string;
  recommendations: string[];
}

/**
 * Get expenses summary with period comparison
 */
export async function getExpensesSummary(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<ExpensesSummary | null> {
  try {
    const supabase = getSupabaseClient();
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const end = endDate || new Date().toISOString().split("T")[0];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .rpc("get_expenses_summary", {
        p_user_id: userId,
        p_start_date: start,
        p_end_date: end,
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("[Analytics] Get expenses summary error:", error);
    return null;
  }
}

/**
 * Get income vs expenses trend by year
 */
export async function getIncomeExpensesTrend(
  userId: string,
  years?: number[]
): Promise<TrendData[]> {
  try {
    const supabase = getSupabaseClient();
    const trendYears = years || [2024, 2025, 2026];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .rpc("get_income_expenses_trend", {
        p_user_id: userId,
        p_years: trendYears,
      });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("[Analytics] Get trend error:", error);
    return [];
  }
}

/**
 * Get category breakdown for period
 */
export async function getCategoryBreakdown(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<CategoryBreakdown[]> {
  try {
    const supabase = getSupabaseClient();
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const end = endDate || new Date().toISOString().split("T")[0];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .rpc("get_category_breakdown", {
        p_user_id: userId,
        p_start_date: start,
        p_end_date: end,
      });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("[Analytics] Get category breakdown error:", error);
    return [];
  }
}

/**
 * Get expenses by account/category with budget comparison
 */
export async function getExpensesByAccount(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<ExpensesByAccount[]> {
  try {
    const supabase = getSupabaseClient();
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const end = endDate || new Date().toISOString().split("T")[0];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .rpc("get_expenses_by_account", {
        p_user_id: userId,
        p_start_date: start,
        p_end_date: end,
      });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("[Analytics] Get expenses by account error:", error);
    return [];
  }
}

/**
 * Get transactions for specific category
 */
export async function getCategoryTransactions(
  userId: string,
  category: string,
  startDate?: string,
  endDate?: string,
  limit?: number
): Promise<CategoryDetail | null> {
  try {
    const supabase = getSupabaseClient();
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const end = endDate || new Date().toISOString().split("T")[0];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .rpc("get_category_transactions", {
        p_user_id: userId,
        p_category: category,
        p_start_date: start,
        p_end_date: end,
        p_limit: limit || 50,
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("[Analytics] Get category transactions error:", error);
    return null;
  }
}

/**
 * Generate AI insight for analytics
 */
export async function generateAnalyticsInsight(
  summary: ExpensesSummary | null,
  trend: TrendData[],
  breakdown: CategoryBreakdown[]
): Promise<AIInsight> {
  try {
    if (!summary || trend.length === 0) {
      return {
        summary: "Insufficient data for analysis.",
        trend: "No trend data available.",
        forecast: "Unable to forecast with current data.",
        recommendations: ["Start tracking your transactions for better insights."],
      };
    }

    // Build context for AI
    const context = {
      netBalance: summary.netBalance,
      totalIncome: summary.totalIncome,
      totalExpenses: summary.totalExpenses,
      changePercent: summary.changePercent,
      topCategories: breakdown.slice(0, 3).map((c) => ({
        category: c.category,
        percentage: c.percentage,
      })),
      trendData: trend.map((t) => ({
        year: t.year,
        net: t.net,
      })),
    };

    // Generate summary using Qwen
    const summaryPrompt = `Analyze this financial data and provide a ONE sentence summary:
- Net Balance: Rp ${context.netBalance.toLocaleString()}
- Total Income: Rp ${context.totalIncome.toLocaleString()}
- Total Expenses: Rp ${context.totalExpenses.toLocaleString()}
- Expense Change: ${context.changePercent > 0 ? "+" : ""}${context.changePercent}%
- Top Categories: ${context.topCategories.map((c) => `${c.category} (${c.percentage}%)`).join(", ")}

Provide a concise, actionable insight (max 20 words). Example: "Your spending increased 20% this month, primarily in food and transport, but your net balance remains healthy."`;

    const trendPrompt = `Analyze this trend and provide ONE sentence about the pattern:
${context.trendData.map((t) => `- ${t.year}: Net Rp ${t.net.toLocaleString()}`).join("\n")}

Describe the trend (max 15 words). Example: "Steady income growth with controlled expenses over the past 3 years."`;

    const forecastPrompt = `Based on this data, predict next month's net balance:
- Current Net: Rp ${context.netBalance.toLocaleString()}
- Monthly Change: ${context.changePercent > 0 ? "+" : ""}${context.changePercent}%
- Income: Rp ${context.totalIncome.toLocaleString()}

Provide a brief forecast (max 15 words). Example: "Expected net balance of Rp ${Math.round(context.netBalance * 1.05).toLocaleString()} next month, assuming similar spending patterns."`;

    // Generate insights in parallel
    const [summaryInsight, trendInsight, forecastInsight] = await Promise.all([
      generateInsight({ income: context.totalIncome, expenses: context.totalExpenses }),
      generateInsight({}),
      generateInsight({ income: context.totalIncome }),
    ]);

    return {
      summary: summaryInsight || `Your net balance is Rp ${context.netBalance.toLocaleString()} with ${context.changePercent > 0 ? "increasing" : "decreasing"} expenses.`,
      trend: trendInsight || "Financial trend shows stable patterns.",
      forecast: forecastInsight || "Continue current patterns for steady growth.",
      recommendations: generateRecommendations(summary, breakdown),
    };
  } catch (error) {
    console.error("[Analytics] Generate AI insight error:", error);
    return {
      summary: "Unable to generate insight at this time.",
      trend: "Trend analysis unavailable.",
      forecast: "Forecast unavailable.",
      recommendations: ["Continue tracking your transactions."],
    };
  }
}

/**
 * Generate recommendations based on data
 */
function generateRecommendations(
  summary: ExpensesSummary,
  breakdown: CategoryBreakdown[]
): string[] {
  const recommendations: string[] = [];

  // Check expense change
  if (summary.changePercent > 20) {
    recommendations.push(
      `Your expenses increased by ${summary.changePercent}%. Review your spending in top categories.`
    );
  } else if (summary.changePercent < -10) {
    recommendations.push(
      "Great job! You've reduced expenses compared to last period."
    );
  }

  // Check top categories
  const topCategory = breakdown[0];
  if (topCategory && topCategory.percentage > 40) {
    recommendations.push(
      `${topCategory.category} takes ${topCategory.percentage}% of your budget. Consider optimizing this category.`
    );
  }

  // Check net balance
  if (summary.netBalance < 0) {
    recommendations.push(
      "Your expenses exceed income. Review your budget allocations."
    );
  } else if (summary.netBalance > summary.totalIncome * 0.3) {
    recommendations.push(
      "Excellent savings rate! Consider increasing investments."
    );
  }

  // Default recommendation if none generated
  if (recommendations.length === 0) {
    recommendations.push(
      "Your financial health looks good. Continue monitoring your spending."
    );
  }

  return recommendations.slice(0, 3);
}

/**
 * Forecast next month's balance using AI
 */
export async function forecastNextMonth(
  userId: string,
  currentSummary: ExpensesSummary
): Promise<{ forecast: number; confidence: number; reasoning: string }> {
  try {
    // Simple forecasting based on current data
    // In production, use more sophisticated ML models
    const growthRate = 1 + (currentSummary.changePercent / 100);
    const forecastedExpenses = currentSummary.totalExpenses * growthRate;
    const forecastedNet = currentSummary.totalIncome - forecastedExpenses;

    return {
      forecast: Math.round(forecastedNet),
      confidence: 0.75, // Base confidence
      reasoning: `Based on ${currentSummary.changePercent > 0 ? "increasing" : "decreasing"} expense trend of ${Math.abs(currentSummary.changePercent)}%.`,
    };
  } catch (error) {
    console.error("[Analytics] Forecast error:", error);
    return {
      forecast: currentSummary.netBalance,
      confidence: 0.5,
      reasoning: "Unable to calculate forecast.",
    };
  }
}
