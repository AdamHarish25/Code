"use client";

/**
 * OnboardingFlow Component
 * Main container for the multi-step onboarding experience
 * Manages step transitions with Framer Motion animations
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, Loader2 } from "lucide-react";
import Image from "next/image";
import { useOnboarding } from "@/lib/onboarding-store";
import { OnboardingStep } from "@/types/onboarding";
import { WelcomeStep } from "./WelcomeStep";
import { PathSelectionStep } from "./PathSelectionStep";
import { GoalSettingStep } from "./GoalSettingStep";
import { FinancialSetupStep } from "./FinancialSetupStep";
import { finishOnboarding } from "@/actions/onboarding";

interface StepIndicatorProps {
  currentStep: OnboardingStep;
  totalSteps: number;
  currentStepIndex: number;
}

function StepIndicator({ currentStep, totalSteps, currentStepIndex }: StepIndicatorProps) {
  const steps: OnboardingStep[] = ["welcome", "path", "goals", "financial"];
  const stepLabels = ["Welcome", "Path", "Goals", "Financial"];

  if (currentStep === "complete") return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted">Step</span>
        <span className="text-sm font-semibold text-primary">
          {currentStepIndex} of {totalSteps}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-2 h-2 rounded-full transition-all ${
                index < currentStepIndex
                  ? "bg-primary"
                  : index === currentStepIndex
                    ? "bg-primary scale-125"
                    : "bg-border"
              }`}
            />
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-1 transition-all ${
                  index < currentStepIndex ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function OnboardingContent() {
  const { currentStep, currentStepIndex, totalSteps, data, completeOnboarding, nextStep, previousStep } =
    useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  const handleNext = useCallback(() => {
    nextStep();
  }, [nextStep]);

  const handleBack = useCallback(() => {
    previousStep();
  }, [previousStep]);

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const result = await finishOnboarding(data);
      if (result.success && result.insight) {
        setInsight(result.insight);
      }
      completeOnboarding();
    } catch (error) {
      console.error("Failed to finish onboarding:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "welcome":
        return <WelcomeStep onNext={handleNext} />;
      case "path":
        return <PathSelectionStep onNext={handleNext} onBack={handleBack} />;
      case "goals":
        return <GoalSettingStep onNext={handleNext} onBack={handleBack} />;
      case "financial":
        return <FinancialSetupStep onNext={handleFinish} onBack={handleBack} />;
      case "complete":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-6"
            >
              <Check className="w-10 h-10 text-black" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-3">You&apos;re All Set!</h2>
            <p className="text-muted max-w-md mb-8">
              Welcome to Duitly. Your personalized financial journey begins now.
            </p>
            {insight && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 rounded-2xl bg-surface border border-secondary/30 max-w-md text-left"
              >
                <h3 className="text-sm font-semibold text-secondary mb-2">
                  🤖 Your First AI Insight
                </h3>
                <p className="text-sm text-muted">{insight}</p>
              </motion.div>
            )}
            {isSubmitting && (
              <div className="flex items-center gap-2 text-muted mt-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Generating your personalized insights...</span>
              </div>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          {currentStep !== "welcome" && currentStep !== "complete" && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleBack}
              className="p-2 rounded-xl hover:bg-surface transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-muted" />
            </motion.button>
          )}
          <div className="flex items-center gap-2">
            <Image
              src="/logohorizontal.png"
              alt="Duitly"
              width={120}
              height={32}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <StepIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        currentStepIndex={currentStepIndex}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            className="flex-1 flex flex-col"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export function OnboardingFlow() {
  return <OnboardingContent />;
}
