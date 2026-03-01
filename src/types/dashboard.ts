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

// Smart Budgeting Types
export interface IncomeSourceDetail {
  id: string;
  name: string;
  amount: number;
  frequency: "weekly" | "biweekly" | "monthly" | "yearly";
  type: "salary" | "freelance" | "investment" | "side-hustle" | "other";
}

export interface CategoryAllocation {
  id: string;
  name: string;
  category: TransactionCategory;
  allocatedAmount: number;
  spentAmount: number;
  isEssential: boolean;
  impactIndicator: "high" | "medium" | "low";
  color: string;
}

export interface BudgetSuggestion {
  category: string;
  suggestedAmount: number;
  percentage: number;
  reasoning: string;
}

export interface AIBudgetResponse {
  suggestions: BudgetSuggestion[];
  totalAllocated: number;
  remainingAmount: number;
  insight: string;
  status: "balanced" | "over-allocated" | "under-allocated";
}

export interface AllocationStatus {
  totalIncome: number;
  totalAllocated: number;
  remainingToAllocate: number;
  allocationPercentage: number;
  status: "balanced" | "warning" | "critical";
  message?: string;
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
  allocationStatus?: AllocationStatus;
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
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export type DashboardView = "home" | "budgeting" | "analytics" | "transactions" | "budget" | "goals" | "insights";

// Transaction Entry Types
export type TransactionType = "income" | "expense";
export type TransactionInputMethod = "manual" | "photo" | "upload";

export interface TransactionFormData {
  type: TransactionType;
  category: string;
  account: string;
  amount: string;
  date: string;
  merchant?: string;
  note?: string;
  attachment?: File | null;
  imageUrl?: string | null;
}

export interface OCRResult {
  merchant: string;
  date: string;
  amount: number;
  confidence: number;
  rawText?: string;
}

export interface TransactionCategoryOption {
  value: string;
  label: string;
  icon: string;
  type: "income" | "expense" | "both";
}

export interface IncomeAccountOption {
  value: string;
  label: string;
  icon: string;
}
