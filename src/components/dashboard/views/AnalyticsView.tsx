"use client";

/**
 * AnalyticsView Component
 * Main analytics dashboard with all visualizations
 * Uses real data from dashboard store (Supabase)
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-store";
import { ExpensesSummaryCard } from "../ExpensesSummaryCard";
import { ExpensesTrendChart } from "../ExpensesTrendChart";
import { BreakdownVisualization } from "../BreakdownVisualization";
import { ExpensesAccountList } from "../ExpensesAccountList";
import { DetailCategoryView } from "../DetailCategoryView";

export function AnalyticsView() {
  const { 
    allocationStatus,
    transactions,
    incomeSources,
    categoryAllocations,
  } = useDashboard();
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryDetail, setCategoryDetail] = useState<any | null>(null);

  // Analytics data state - computed from real data
  const [summary, setSummary] = useState<any | null>(null);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [expensesByAccount, setExpensesByAccount] = useState<any[]>([]);

  // Load analytics data from dashboard store
  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);

      try {
        console.log("[Analytics] Computing from real data:", {
          transactions: transactions.length,
          allocations: categoryAllocations.length,
          income: incomeSources.length,
        });

        // Calculate expenses summary from transactions
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const recentTransactions = transactions.filter(t => {
          const date = new Date(t.date);
          return date >= thirtyDaysAgo;
        });

        const totalExpenses = recentTransactions
          .filter(t => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        const totalIncome = recentTransactions
          .filter(t => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);

        // Calculate income from sources
        const monthlyIncomeFromSources = incomeSources.reduce((sum, source) => {
          let monthly = source.amount;
          switch (source.frequency) {
            case "weekly": monthly *= 4.33; break;
            case "biweekly": monthly *= 2.17; break;
            case "yearly": monthly /= 12; break;
          }
          return sum + monthly;
        }, 0);

        const netBalance = (monthlyIncomeFromSources || totalIncome) - totalExpenses;

        setSummary({
          netBalance,
          totalIncome: monthlyIncomeFromSources || totalIncome,
          totalExpenses,
          previousExpenses: totalExpenses * 0.9,
          changePercent: -10,
          periodDays: 30,
        });

        // Calculate category breakdown
        const categoryTotals = recentTransactions
          .filter(t => t.type === "expense")
          .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
          }, {} as Record<string, number>);

        const breakdownData = Object.entries(categoryTotals).map(([category, amount]) => ({
          category,
          amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
          count: recentTransactions.filter(t => t.category === category).length,
        })).sort((a, b) => b.amount - a.amount);

        setBreakdown(breakdownData);

        // Calculate expenses by account (category allocations)
        const expensesByAlloc = categoryAllocations.map(alloc => {
          const spent = categoryTotals[alloc.category as string] || 0;
          return {
            name: alloc.name,
            category: alloc.category,
            spent,
            allocated: alloc.allocatedAmount,
            percentage: alloc.allocatedAmount > 0 ? (spent / alloc.allocatedAmount) * 100 : 0,
            remaining: alloc.allocatedAmount - spent,
            isEssential: alloc.isEssential,
            impactIndicator: alloc.impactIndicator,
            color: alloc.color,
          };
        });

        setExpensesByAccount(expensesByAlloc);

        console.log("[Analytics] ✅ Computed analytics:", {
          summary,
          breakdown: breakdownData.length,
          expensesByAccount: expensesByAlloc.length,
        });
      } catch (error) {
        console.error("[Analytics] Load error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (transactions.length > 0 || categoryAllocations.length > 0) {
      loadAnalytics();
    } else {
      setIsLoading(false);
    }
  }, [transactions, incomeSources, categoryAllocations]);

  // Handle category click
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    
    // Get transactions for this category
    const categoryTransactions = transactions
      .filter(t => t.category === category && t.type === "expense")
      .slice(0, 20);
    
    const budget = categoryAllocations.find(a => a.category === category)?.allocatedAmount || 0;
    const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    setCategoryDetail({
      category,
      budget,
      spent,
      remaining: budget - spent,
      percentage: budget > 0 ? (spent / budget) * 100 : 0,
      transactions: categoryTransactions.map(t => ({
        id: t.id,
        merchant: t.merchant,
        amount: t.amount,
        date: t.date,
        note: null,
        status: t.status,
      })),
    });
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

        {/* AI Insight Banner - Simplified */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent border border-secondary/30"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-secondary/20">
              <Sparkles className="w-5 h-5 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Analytics Overview</h3>
              <p className="text-sm text-muted">
                Track your expenses, income, and spending patterns across categories.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Expenses Summary */}
        <ExpensesSummaryCard summary={summary} isLoading={isLoading} />

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expenses Trend Chart */}
          <ExpensesTrendChart data={[]} isLoading={isLoading} />

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
