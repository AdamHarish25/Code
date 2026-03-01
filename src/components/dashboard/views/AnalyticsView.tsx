"use client";

/**
 * AnalyticsView Component
 * Main analytics dashboard with all visualizations
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-store";
import {
  getExpensesSummary,
  getIncomeExpensesTrend,
  getCategoryBreakdown,
  getExpensesByAccount,
  getCategoryTransactions,
  generateAnalyticsInsight,
  ExpensesSummary,
  TrendData,
  CategoryBreakdown,
  ExpensesByAccount,
  CategoryDetail,
  AIInsight,
} from "@/actions/analytics";
import { ExpensesSummaryCard } from "../ExpensesSummaryCard";
import { ExpensesTrendChart } from "../ExpensesTrendChart";
import { BreakdownVisualization } from "../BreakdownVisualization";
import { ExpensesAccountList } from "../ExpensesAccountList";
import { DetailCategoryView } from "../DetailCategoryView";

export function AnalyticsView() {
  const { allocationStatus } = useDashboard();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryDetail, setCategoryDetail] = useState<CategoryDetail | null>(null);

  // Analytics data state
  const [summary, setSummary] = useState<ExpensesSummary | null>(null);
  const [trend, setTrend] = useState<TrendData[]>([]);
  const [breakdown, setBreakdown] = useState<CategoryBreakdown[]>([]);
  const [expensesByAccount, setExpensesByAccount] = useState<ExpensesByAccount[]>([]);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);

      try {
        // Use placeholder user ID (replace with actual auth)
        const userId = "current-user-id";

        // Load all analytics data in parallel
        const [summaryData, trendData, breakdownData, expensesData] = await Promise.all([
          getExpensesSummary(userId),
          getIncomeExpensesTrend(userId),
          getCategoryBreakdown(userId),
          getExpensesByAccount(userId),
        ]);

        setSummary(summaryData);
        setTrend(trendData);
        setBreakdown(breakdownData);
        setExpensesByAccount(expensesData);

        // Generate AI insight
        const insight = await generateAnalyticsInsight(
          summaryData,
          trendData,
          breakdownData
        );
        setAiInsight(insight);
      } catch (error) {
        console.error("[Analytics] Load error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  // Handle category click
  const handleCategoryClick = async (category: string) => {
    setSelectedCategory(category);
    setIsLoading(true);

    try {
      const userId = "current-user-id";
      const detail = await getCategoryTransactions(userId, category);
      setCategoryDetail(detail);
    } catch (error) {
      console.error("[Analytics] Load category detail error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedCategory(null);
    setCategoryDetail(null);
  };

  return (
    <>
      <div className="px-4 md:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-muted">
            Visual insights into your spending patterns
          </p>
        </div>

        {/* AI Insight Banner */}
        {aiInsight && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-secondary/20">
                <Sparkles className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">AI Insights</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary">
                    Powered by Qwen
                  </span>
                </div>
                <p className="text-sm text-muted mb-3">{aiInsight.summary}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <p className="text-xs text-muted mb-1">Trend Analysis</p>
                    <p className="text-sm">{aiInsight.trend}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <p className="text-xs text-muted mb-1">Forecast</p>
                    <p className="text-sm">{aiInsight.forecast}</p>
                  </div>
                </div>
                {aiInsight.recommendations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted mb-2">Recommendations</p>
                    <ul className="space-y-1">
                      {aiInsight.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Expenses Summary */}
        <ExpensesSummaryCard summary={summary} isLoading={isLoading} />

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expenses Trend Chart */}
          <ExpensesTrendChart data={trend} isLoading={isLoading} />

          {/* Category Breakdown */}
          <BreakdownVisualization data={breakdown} isLoading={isLoading} />
        </div>

        {/* Expenses by Account List */}
        <ExpensesAccountList
          data={expensesByAccount}
          isLoading={isLoading}
          onCategoryClick={handleCategoryClick}
        />
      </div>

      {/* Detail Category View Modal */}
      <AnimatePresence>
        {selectedCategory && (
          <DetailCategoryView
            category={selectedCategory}
            data={categoryDetail}
            isLoading={isLoading}
            onClose={handleCloseDetail}
            onBack={() => setSelectedCategory(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
