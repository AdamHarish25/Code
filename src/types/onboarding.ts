/**
 * Duitly Onboarding Types
 * Type definitions for the onboarding flow state and data structures
 */

export type InvestmentPath = "conservative" | "active-compounder";

export type OnboardingStep = "path" | "dream" | "goals" | "financial" | "auth" | "complete";

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate?: string;
  priority: "low" | "medium" | "high";
}

export interface IncomeSource {
  type: "salary" | "freelancing" | "other";
  amount: number;
  frequency: "weekly" | "biweekly" | "monthly" | "yearly";
}

export interface ExpenseCategory {
  category: "housing" | "food" | "transport" | "utilities" | "entertainment" | "healthcare" | "other";
  amount: number;
  isEssential: boolean;
}

export interface OnboardingData {
  // Step 1: Investment Path Selection
  investmentPath: InvestmentPath | null;

  // Step 2: Dream Description
  dreamDescription: string;

  // Step 3: Goal Setting
  goals: FinancialGoal[];

  // Step 4: Financial Setup
  incomeSources: IncomeSource[];
  expenses: ExpenseCategory[];

  // Metadata
  completedAt?: string;
}

export interface SmartInsight {
  insight: string;
  recommendations: string[];
  riskProfile: string;
  suggestedAllocation: {
    emergency: number;
    investments: number;
    savings: number;
  };
}
