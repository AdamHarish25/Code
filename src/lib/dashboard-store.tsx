"use client";

/**
 * Duitly Dashboard Store
 * React Context-based state management for dashboard data
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  Transaction,
  BudgetCategory,
  FinancialGoal,
  DashboardSummary,
  SmartInsight,
  NotificationCard,
  DashboardView,
  TransactionCategory,
} from "@/types/dashboard";

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
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [state, setState] = useState<DashboardState>(initialState);

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

  // Data refresh
  const refreshData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    // Simulate API call - replace with actual data fetching
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setState((prev) => ({
      ...prev,
      isLoading: false,
      lastUpdated: new Date(),
    }));
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
