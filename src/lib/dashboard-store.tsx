"use client";

/**
 * Duitly Dashboard Store
 * React Context-based state management for dashboard data
 * Integrated with Supabase for real-time data
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import {
  Transaction,
  BudgetCategory,
  FinancialGoal,
  DashboardSummary,
  SmartInsight,
  NotificationCard,
  DashboardView,
  TransactionCategory,
  IncomeSourceDetail,
  CategoryAllocation,
  AllocationStatus,
} from "@/types/dashboard";
import { fetchDashboardData, createTransaction, createIncomeSource, createCategoryAllocation, createFinancialGoal } from "@/lib/dashboard-data";
import { supabase } from "@/lib/supabase";

interface DashboardState {
  currentView: DashboardView;
  transactions: Transaction[];
  budgetCategories: BudgetCategory[];
  goals: FinancialGoal[];
  summary: DashboardSummary;
  insights: SmartInsight[];
  notifications: NotificationCard[];
  isLoading: boolean;
  lastUpdated: Date | null;
  // Smart Budgeting
  incomeSources: IncomeSourceDetail[];
  categoryAllocations: CategoryAllocation[];
  allocationStatus: AllocationStatus | null;
}

interface DashboardContextType extends DashboardState {
  // Navigation
  setCurrentView: (view: DashboardView) => void;

  // Transactions
  addTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: string) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;

  // Budget
  updateBudgetCategory: (category: TransactionCategory, updates: Partial<BudgetCategory>) => void;
  setBudgetLimit: (category: TransactionCategory, limit: number) => void;

  // Goals
  updateGoal: (id: string, updates: Partial<FinancialGoal>) => void;
  addGoalProgress: (id: string, amount: number) => void;

  // Insights
  addInsight: (insight: Omit<SmartInsight, "id" | "timestamp" | "isRead">) => void;
  markInsightRead: (id: string) => void;

  // Notifications
  addNotification: (notification: Omit<NotificationCard, "id" | "timestamp" | "isRead">) => void;
  markNotificationRead: (id: string) => void;
  dismissNotification: (id: string) => void;

  // Smart Budgeting
  addIncomeSource: (source: Omit<IncomeSourceDetail, "id">) => void;
  updateIncomeSource: (id: string, updates: Partial<IncomeSourceDetail>) => void;
  removeIncomeSource: (id: string) => void;
  setCategoryAllocation: (allocation: Omit<CategoryAllocation, "id">) => void;
  updateCategoryAllocation: (id: string, updates: Partial<CategoryAllocation>) => void;
  removeCategoryAllocation: (id: string) => void;
  setAllocationStatus: (status: AllocationStatus) => void;
  updateAllocationSpent: (id: string, spentAmount: number) => void;

  // Data refresh
  refreshData: () => Promise<void>;
}

const initialSummary: DashboardSummary = {
  totalBalance: 0,
  monthlyIncome: 0,
  monthlyExpenses: 0,
  monthlySurplus: 0,
  budgetProgress: 0,
  savingsRate: 0,
};

const initialState: DashboardState = {
  currentView: "home",
  transactions: [],
  budgetCategories: [],
  goals: [],
  summary: initialSummary,
  insights: [],
  notifications: [],
  isLoading: false,
  lastUpdated: null,
  // Smart Budgeting
  incomeSources: [],
  categoryAllocations: [],
  allocationStatus: null,
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [state, setState] = useState<DashboardState>(initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load real data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchDashboardData();
      
      setState((prev) => ({
        ...prev,
        transactions: transformTransactions(data.transactions),
        incomeSources: transformIncomeSources(data.incomeSources),
        categoryAllocations: transformAllocations(data.categoryAllocations),
        goals: transformGoals(data.financialGoals),
        insights: transformInsights(data.budgetInsights),
        notifications: transformNotifications(data.notifications),
        allocationStatus: data.allocationStatus,
        summary: calculateSummaryFromData(
          transformTransactions(data.transactions),
          data.allocationStatus
        ),
        lastUpdated: new Date(),
      }));
      
      setIsInitialized(true);
    };

    loadData();
  }, []);

  // Subscribe to real-time changes
  useEffect(() => {
    if (!isInitialized) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Reload data when user signs in
        fetchDashboardData().then((data) => {
          setState((prev) => ({
            ...prev,
            transactions: transformTransactions(data.transactions),
            incomeSources: transformIncomeSources(data.incomeSources),
            categoryAllocations: transformAllocations(data.categoryAllocations),
            goals: transformGoals(data.financialGoals),
            lastUpdated: new Date(),
          }));
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isInitialized]);

  // Navigation
  const setCurrentView = useCallback((view: DashboardView) => {
    setState((prev) => ({ ...prev, currentView: view }));
  }, []);

  // Transactions
  const addTransaction = useCallback((transaction: Transaction) => {
    setState((prev) => {
      const newTransactions = [transaction, ...prev.transactions];
      const newSummary = calculateSummary(newTransactions, prev.budgetCategories);
      return {
        ...prev,
        transactions: newTransactions,
        summary: newSummary,
        lastUpdated: new Date(),
      };
    });
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setState((prev) => {
      const newTransactions = prev.transactions.filter((t) => t.id !== id);
      const newSummary = calculateSummary(newTransactions, prev.budgetCategories);
      return {
        ...prev,
        transactions: newTransactions,
        summary: newSummary,
        lastUpdated: new Date(),
      };
    });
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setState((prev) => {
      const newTransactions = prev.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      );
      const newSummary = calculateSummary(newTransactions, prev.budgetCategories);
      return {
        ...prev,
        transactions: newTransactions,
        summary: newSummary,
        lastUpdated: new Date(),
      };
    });
  }, []);

  // Budget
  const updateBudgetCategory = useCallback(
    (category: TransactionCategory, updates: Partial<BudgetCategory>) => {
      setState((prev) => {
        const newCategories = prev.budgetCategories.map((c) =>
          c.category === category ? { ...c, ...updates } : c
        );
        const newSummary = calculateSummary(prev.transactions, newCategories);
        return {
          ...prev,
          budgetCategories: newCategories,
          summary: newSummary,
          lastUpdated: new Date(),
        };
      });
    },
    []
  );

  const setBudgetLimit = useCallback((category: TransactionCategory, limit: number) => {
    setState((prev) => {
      const newCategories = prev.budgetCategories.map((c) =>
        c.category === category ? { ...c, limit } : { category, limit, spent: 0, isEssential: true, color: "#A3FF47" }
      );
      return {
        ...prev,
        budgetCategories: newCategories,
        lastUpdated: new Date(),
      };
    });
  }, []);

  // Goals
  const updateGoal = useCallback((id: string, updates: Partial<FinancialGoal>) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
      lastUpdated: new Date(),
    }));
  }, []);

  const addGoalProgress = useCallback((id: string, amount: number) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === id ? { ...g, currentAmount: Math.min(g.currentAmount + amount, g.targetAmount) } : g
      ),
      lastUpdated: new Date(),
    }));
  }, []);

  // Insights
  const addInsight = useCallback((insight: Omit<SmartInsight, "id" | "timestamp" | "isRead">) => {
    const newInsight: SmartInsight = {
      ...insight,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setState((prev) => ({
      ...prev,
      insights: [newInsight, ...prev.insights],
      lastUpdated: new Date(),
    }));
  }, []);

  const markInsightRead = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      insights: prev.insights.map((i) => (i.id === id ? { ...i, isRead: true } : i)),
      lastUpdated: new Date(),
    }));
  }, []);

  // Notifications
  const addNotification = useCallback(
    (notification: Omit<NotificationCard, "id" | "timestamp" | "isRead">) => {
      const newNotification: NotificationCard = {
        ...notification,
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setState((prev) => ({
        ...prev,
        notifications: [newNotification, ...prev.notifications],
        lastUpdated: new Date(),
      }));
    },
    []
  );

  const markNotificationRead = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      lastUpdated: new Date(),
    }));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== id),
      lastUpdated: new Date(),
    }));
  }, []);

  // Smart Budgeting
  const addIncomeSource = useCallback((source: Omit<IncomeSourceDetail, "id">) => {
    const newSource: IncomeSourceDetail = {
      ...source,
      id: Math.random().toString(36).substring(2, 9),
    };
    setState((prev) => {
      const newSources = [...prev.incomeSources, newSource];
      const totalIncome = calculateTotalIncome(newSources);
      return {
        ...prev,
        incomeSources: newSources,
        allocationStatus: prev.allocationStatus
          ? { ...prev.allocationStatus, totalIncome }
          : null,
        lastUpdated: new Date(),
      };
    });
  }, []);

  const updateIncomeSource = useCallback((id: string, updates: Partial<IncomeSourceDetail>) => {
    setState((prev) => {
      const newSources = prev.incomeSources.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      );
      const totalIncome = calculateTotalIncome(newSources);
      return {
        ...prev,
        incomeSources: newSources,
        allocationStatus: prev.allocationStatus
          ? { ...prev.allocationStatus, totalIncome }
          : null,
        lastUpdated: new Date(),
      };
    });
  }, []);

  const removeIncomeSource = useCallback((id: string) => {
    setState((prev) => {
      const newSources = prev.incomeSources.filter((s) => s.id !== id);
      const totalIncome = calculateTotalIncome(newSources);
      return {
        ...prev,
        incomeSources: newSources,
        allocationStatus: prev.allocationStatus
          ? { ...prev.allocationStatus, totalIncome }
          : null,
        lastUpdated: new Date(),
      };
    });
  }, []);

  const setCategoryAllocation = useCallback((allocation: Omit<CategoryAllocation, "id">) => {
    const newAllocation: CategoryAllocation = {
      ...allocation,
      id: Math.random().toString(36).substring(2, 9),
    };
    setState((prev) => {
      const newAllocations = [...prev.categoryAllocations, newAllocation];
      const totalAllocated = newAllocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
      const totalIncome = prev.allocationStatus?.totalIncome || 0;
      return {
        ...prev,
        categoryAllocations: newAllocations,
        allocationStatus: calculateAllocationStatus(totalIncome, totalAllocated),
        lastUpdated: new Date(),
      };
    });
  }, []);

  const updateCategoryAllocation = useCallback((id: string, updates: Partial<CategoryAllocation>) => {
    setState((prev) => {
      const newAllocations = prev.categoryAllocations.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      );
      const totalAllocated = newAllocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
      const totalIncome = prev.allocationStatus?.totalIncome || 0;
      return {
        ...prev,
        categoryAllocations: newAllocations,
        allocationStatus: calculateAllocationStatus(totalIncome, totalAllocated),
        lastUpdated: new Date(),
      };
    });
  }, []);

  const removeCategoryAllocation = useCallback((id: string) => {
    setState((prev) => {
      const newAllocations = prev.categoryAllocations.filter((a) => a.id !== id);
      const totalAllocated = newAllocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
      const totalIncome = prev.allocationStatus?.totalIncome || 0;
      return {
        ...prev,
        categoryAllocations: newAllocations,
        allocationStatus: calculateAllocationStatus(totalIncome, totalAllocated),
        lastUpdated: new Date(),
      };
    });
  }, []);

  const setAllocationStatus = useCallback((status: AllocationStatus) => {
    setState((prev) => ({
      ...prev,
      allocationStatus: status,
      lastUpdated: new Date(),
    }));
  }, []);

  const updateAllocationSpent = useCallback((id: string, spentAmount: number) => {
    setState((prev) => ({
      ...prev,
      categoryAllocations: prev.categoryAllocations.map((a) =>
        a.id === id ? { ...a, spentAmount } : a
      ),
      lastUpdated: new Date(),
    }));
  }, []);

  // Data refresh
  const refreshData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const data = await fetchDashboardData();
      setState((prev) => ({
        ...prev,
        transactions: transformTransactions(data.transactions),
        incomeSources: transformIncomeSources(data.incomeSources),
        categoryAllocations: transformAllocations(data.categoryAllocations),
        goals: transformGoals(data.financialGoals),
        allocationStatus: data.allocationStatus,
        summary: calculateSummaryFromData(
          transformTransactions(data.transactions),
          data.allocationStatus
        ),
        isLoading: false,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      console.error("[Dashboard] Refresh error:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        ...state,
        setCurrentView,
        addTransaction,
        removeTransaction,
        updateTransaction,
        updateBudgetCategory,
        setBudgetLimit,
        updateGoal,
        addGoalProgress,
        addInsight,
        markInsightRead,
        addNotification,
        markNotificationRead,
        dismissNotification,
        // Smart Budgeting
        addIncomeSource,
        updateIncomeSource,
        removeIncomeSource,
        setCategoryAllocation,
        updateCategoryAllocation,
        removeCategoryAllocation,
        setAllocationStatus,
        updateAllocationSpent,
        refreshData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

// Helper function to calculate dashboard summary
function calculateSummary(
  transactions: Transaction[],
  budgetCategories: BudgetCategory[]
): DashboardSummary {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === "income" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = monthlyTransactions
    .filter((t) => t.type === "expense" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlySurplus = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (monthlySurplus / monthlyIncome) * 100 : 0;

  const totalBudget = budgetCategories.reduce((sum, c) => sum + c.limit, 0);
  const totalSpent = budgetCategories.reduce((sum, c) => sum + c.spent, 0);
  const budgetProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return {
    totalBalance: monthlySurplus,
    monthlyIncome,
    monthlyExpenses,
    monthlySurplus,
    budgetProgress,
    savingsRate: Math.max(0, savingsRate),
  };
}

// Helper function to calculate total income from sources
function calculateTotalIncome(sources: IncomeSourceDetail[]): number {
  return sources.reduce((sum, source) => {
    let monthlyAmount = source.amount;
    switch (source.frequency) {
      case "weekly":
        monthlyAmount *= 4.33;
        break;
      case "biweekly":
        monthlyAmount *= 2.17;
        break;
      case "yearly":
        monthlyAmount /= 12;
        break;
    }
    return sum + monthlyAmount;
  }, 0);
}

// Helper function to calculate allocation status
function calculateAllocationStatus(
  totalIncome: number,
  totalAllocated: number
): AllocationStatus {
  const remainingToAllocate = totalIncome - totalAllocated;
  const allocationPercentage =
    totalIncome > 0 ? (totalAllocated / totalIncome) * 100 : 0;

  let status: AllocationStatus["status"] = "balanced";
  let message: string | undefined;

  if (allocationPercentage >= 95 && allocationPercentage <= 105) {
    status = "balanced";
    message = "Budget is well-balanced!";
  } else if (allocationPercentage < 95) {
    const unallocatedPercent = 100 - allocationPercentage;
    if (unallocatedPercent > 30) {
      status = "critical";
      message = `${unallocatedPercent.toFixed(0)}% income belum dialokasikan`;
    } else {
      status = "warning";
      message = `${unallocatedPercent.toFixed(0)}% income belum dialokasikan`;
    }
  } else {
    status = "critical";
    message = "Over-allocated! Reduce spending in some categories.";
  }

  return {
    totalIncome,
    totalAllocated,
    remainingToAllocate,
    allocationPercentage,
    status,
    message,
  };
}

// Transform functions - convert database records to app types
function transformTransactions(dbTransactions: any[]): Transaction[] {
  return dbTransactions.map((t) => ({
    id: t.id,
    merchant: t.merchant || t.category || "Unknown",
    amount: t.amount,
    category: (t.category as TransactionCategory) || "other",
    date: t.date,
    status: (t.status as "pending" | "completed" | "failed") || "completed",
    type: (t.type as "income" | "expense") || "expense",
    isAutoCategorized: !!t.paylabs_transaction_id,
    paylabsId: t.paylabs_transaction_id,
  }));
}

function transformIncomeSources(dbSources: any[]): IncomeSourceDetail[] {
  return dbSources.map((s) => ({
    id: s.id,
    name: s.name || "Income",
    amount: parseFloat(s.amount) || 0,
    frequency: (s.frequency as "weekly" | "biweekly" | "monthly" | "yearly") || "monthly",
    type: (s.type as "salary" | "freelance" | "investment" | "side-hustle" | "other") || "other",
  }));
}

function transformAllocations(dbAllocations: any[]): CategoryAllocation[] {
  return dbAllocations.map((a) => ({
    id: a.id,
    name: a.name || a.category || "Category",
    category: (a.category as TransactionCategory) || "other",
    allocatedAmount: parseFloat(a.allocated_amount) || 0,
    spentAmount: parseFloat(a.spent_amount) || 0,
    isEssential: a.is_essential ?? true,
    impactIndicator: (a.impact_indicator as "high" | "medium" | "low") || "medium",
    color: a.color || "#A3FF47",
  }));
}

function transformGoals(dbGoals: any[]): FinancialGoal[] {
  return dbGoals.map((g) => ({
    id: g.id,
    name: g.name || "Goal",
    targetAmount: parseFloat(g.target_amount) || 0,
    currentAmount: parseFloat(g.current_amount) || 0,
    targetDate: g.target_date,
    priority: (g.priority as "low" | "medium" | "high") || "medium",
    icon: g.icon,
  }));
}

function transformInsights(dbInsights: any[]): SmartInsight[] {
  return dbInsights.map((i) => ({
    id: i.id,
    title: i.title || "Budget Insight",
    content: i.content || i.insight || "",
    type: (i.type as "advice" | "alert" | "opportunity" | "achievement") || "advice",
    timestamp: i.created_at || i.timestamp || new Date().toISOString(),
    isRead: i.is_read || false,
  }));
}

function transformNotifications(dbNotifications: any[]): NotificationCard[] {
  return dbNotifications.map((n) => ({
    id: n.id,
    type: (n.type as "success" | "warning" | "error" | "info") || "info",
    title: n.title || n.merchant || "Notification",
    message: n.message || n.content || "",
    timestamp: n.created_at || n.timestamp || new Date().toISOString(),
    isRead: n.is_read || false,
  }));
}

// Calculate summary from real data
function calculateSummaryFromData(
  transactions: Transaction[],
  allocationStatus: AllocationStatus | null
): DashboardSummary {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === "income" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = monthlyTransactions
    .filter((t) => t.type === "expense" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlySurplus = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (monthlySurplus / monthlyIncome) * 100 : 0;

  const totalBudget = allocationStatus?.totalAllocated || 0;
  const totalSpent = allocationStatus ? allocationStatus.totalAllocated - allocationStatus.remainingToAllocate : 0;
  const budgetProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return {
    totalBalance: monthlySurplus,
    monthlyIncome,
    monthlyExpenses,
    monthlySurplus,
    budgetProgress,
    savingsRate: Math.max(0, savingsRate),
  };
}
