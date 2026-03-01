"use client";

/**
 * Duitly Onboarding Store
 * React Context-based state management for onboarding flow
 * Integrated with Supabase authentication and database
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  OnboardingData,
  OnboardingStep,
  InvestmentPath,
  FinancialGoal,
  IncomeSource,
  ExpenseCategory,
} from "@/types/onboarding";
import { saveOnboardingData } from "@/actions/onboarding-db";

const initialOnboardingData: OnboardingData = {
  investmentPath: null,
  dreamDescription: "",
  goals: [],
  incomeSources: [],
  expenses: [],
};

interface OnboardingContextType {
  userId: string | null;
  currentStep: OnboardingStep;
  data: OnboardingData;
  totalSteps: number;
  currentStepIndex: number;
  isSaving: boolean;
  saveError: string | null;

  // Auth
  setUserId: (id: string | null) => void;

  // Navigation
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: OnboardingStep) => void;

  // Data mutations
  setInvestmentPath: (path: InvestmentPath) => void;
  addGoal: (goal: Omit<FinancialGoal, "id">) => void;
  updateGoal: (id: string, updates: Partial<FinancialGoal>) => void;
  removeGoal: (id: string) => void;
  setDreamDescription: (description: string) => void;
  addIncomeSource: (source: IncomeSource) => void;
  updateIncomeSource: (index: number, updates: Partial<IncomeSource>) => void;
  removeIncomeSource: (index: number) => void;
  addExpense: (expense: ExpenseCategory) => void;
  updateExpense: (index: number, updates: Partial<ExpenseCategory>) => void;
  removeExpense: (index: number) => void;
  completeOnboarding: () => Promise<boolean>;

  // Validation
  canProceed: boolean;
  isComplete: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const stepOrder: OnboardingStep[] = ["path", "dream", "goals", "financial", "auth", "complete"];

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("path");
  const [data, setData] = useState<OnboardingData>(initialOnboardingData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const currentStepIndex = stepOrder.indexOf(currentStep);
  const totalSteps = stepOrder.length - 1; // Exclude "complete"

  const nextStep = useCallback(() => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  }, [currentStep]);

  const previousStep = useCallback(() => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: OnboardingStep) => {
    setCurrentStep(step);
  }, []);

  // Data mutations
  const setInvestmentPath = useCallback((path: InvestmentPath) => {
    setData((prev) => ({ ...prev, investmentPath: path }));
  }, []);

  const addGoal = useCallback((goal: Omit<FinancialGoal, "id">) => {
    const newGoal: FinancialGoal = {
      ...goal,
      id: Math.random().toString(36).substring(2, 9),
    };
    setData((prev) => ({ ...prev, goals: [...prev.goals, newGoal] }));
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<FinancialGoal>) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal)),
    }));
  }, []);

  const removeGoal = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.filter((goal) => goal.id !== id),
    }));
  }, []);

  const setDreamDescription = useCallback((description: string) => {
    setData((prev) => ({ ...prev, dreamDescription: description }));
  }, []);

  const addIncomeSource = useCallback((source: IncomeSource) => {
    setData((prev) => ({ ...prev, incomeSources: [...prev.incomeSources, source] }));
  }, []);

  const updateIncomeSource = useCallback((index: number, updates: Partial<IncomeSource>) => {
    setData((prev) => ({
      ...prev,
      incomeSources: prev.incomeSources.map((source, i) =>
        i === index ? { ...source, ...updates } : source
      ),
    }));
  }, []);

  const removeIncomeSource = useCallback((index: number) => {
    setData((prev) => ({
      ...prev,
      incomeSources: prev.incomeSources.filter((_, i) => i !== index),
    }));
  }, []);

  const addExpense = useCallback((expense: ExpenseCategory) => {
    setData((prev) => ({ ...prev, expenses: [...prev.expenses, expense] }));
  }, []);

  const updateExpense = useCallback((index: number, updates: Partial<ExpenseCategory>) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((expense, i) =>
        i === index ? { ...expense, ...updates } : expense
      ),
    }));
  }, []);

  const removeExpense = useCallback((index: number) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((_, i) => i !== index),
    }));
  }, []);

  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!userId) {
      setSaveError("User not authenticated");
      return false;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const result = await saveOnboardingData(userId, {
        ...data,
        completedAt: new Date().toISOString(),
      });

      if (result.success) {
        setData((prev) => ({
          ...prev,
          completedAt: new Date().toISOString(),
        }));
        setCurrentStep("complete");
        return true;
      } else {
        setSaveError(result.error || "Failed to save onboarding data");
        return false;
      }
    } catch (error) {
      console.error("[Onboarding] Complete error:", error);
      setSaveError("An unexpected error occurred");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [userId, data]);

  // Validation logic
  const canProceed = React.useMemo(() => {
    switch (currentStep) {
      case "path":
        return data.investmentPath !== null;
      case "dream":
        return !!data.dreamDescription;
      case "goals":
        return data.goals.length > 0;
      case "financial":
        return data.incomeSources.length > 0;
      case "auth":
        return true; // Can proceed to create account or skip
      default:
        return true;
    }
  }, [currentStep, data]);

  const isComplete = currentStep === "complete";

  return (
    <OnboardingContext.Provider
      value={{
        userId,
        setUserId,
        currentStep,
        data,
        totalSteps,
        currentStepIndex,
        isSaving,
        saveError,
        nextStep,
        previousStep,
        goToStep,
        setInvestmentPath,
        addGoal,
        updateGoal,
        removeGoal,
        setDreamDescription,
        addIncomeSource,
        updateIncomeSource,
        removeIncomeSource,
        addExpense,
        updateExpense,
        removeExpense,
        completeOnboarding,
        canProceed,
        isComplete,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
