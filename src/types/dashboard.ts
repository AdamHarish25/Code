/**
 * Duitly Dashboard Types
 * Type definitions for dashboard, transactions, and financial data
 */

export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  category: TransactionCategory;
  date: string;
  status: "pending" | "completed" | "failed";
  type: "income" | "expense";
  isAutoCategorized: boolean;
  paylabsId?: string;
}

export type TransactionCategory =
  | "housing"
  | "food"
  | "transport"
  | "utilities"
  | "entertainment"
  | "healthcare"
  | "shopping"
  | "salary"
  | "freelance"
  | "investment"
  | "other";

export interface BudgetCategory {
  category: TransactionCategory;
  limit: number;
  spent: number;
  isEssential: boolean;
  color: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  priority: "low" | "medium" | "high";
  icon?: string;
}

export interface IncomeSource {
  type: "salary" | "freelancing" | "investment" | "other";
  amount: number;
  frequency: "weekly" | "biweekly" | "monthly" | "yearly";
}

export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySurplus: number;
  budgetProgress: number;
  savingsRate: number;
}

export interface SmartInsight {
  id: string;
  title: string;
  content: string;
  type: "advice" | "alert" | "opportunity" | "achievement";
  timestamp: string;
  isRead: boolean;
}

export interface PaylabsWebhookPayload {
  event: "transaction.success" | "transaction.failed" | "transaction.pending";
  transaction: {
    id: string;
    amount: number;
    currency: string;
    merchant: string;
    status: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
  };
}

export interface NotificationCard {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export type DashboardView = "home" | "transactions" | "budget" | "goals" | "insights";
