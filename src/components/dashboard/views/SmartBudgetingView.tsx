"use client";

/**
 * SmartBudgetingView Component
 * Main dashboard view for the Smart Budgeting & Allocation module
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, PieChart, Sparkles, TrendingUp } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-store";
import { BudgetingSummaryCard } from "../BudgetingSummaryCard";
import { IncomeManagementModule } from "../IncomeManagementModule";
import { CategoryAllocationList } from "../CategoryAllocationList";
import { AccountDistributionView } from "../AccountDistributionView";
import { AIBudgetGenerator } from "../AIBudgetGenerator";
import { AIAllocationInsight } from "../AIAllocationInsight";

type BudgetingTab = "overview" | "income" | "categories" | "ai-generate";

export function SmartBudgetingView() {
  const { allocationStatus, categoryAllocations } = useDashboard();
  const [activeTab, setActiveTab] = useState<BudgetingTab>("overview");

  const tabs: { id: BudgetingTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <PieChart className="w-4 h-4" /> },
    { id: "income", label: "Income", icon: <Wallet className="w-4 h-4" /> },
    { id: "categories", label: "Categories", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "ai-generate", label: "AI Generate", icon: <Sparkles className="w-4 h-4" /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* AI Allocation Insight - Always visible at top */}
            {allocationStatus && (
              <AIAllocationInsight />
            )}

            {/* Budgeting Summary */}
            <BudgetingSummaryCard
              allocationStatus={allocationStatus}
              onManageIncome={() => setActiveTab("income")}
            />

            {/* AI Budget Generator - Quick access */}
            <AIBudgetGenerator />

            {/* Category Allocation Preview */}
            {categoryAllocations.length > 0 && (
              <CategoryAllocationList />
            )}

            {/* Account Distribution */}
            {categoryAllocations.length > 0 && (
              <AccountDistributionView />
            )}
          </div>
        );

      case "income":
        return (
          <div className="space-y-6">
            <IncomeManagementModule />
          </div>
        );

      case "categories":
        return (
          <div className="space-y-6">
            <CategoryAllocationList />
            <AccountDistributionView />
          </div>
        );

      case "ai-generate":
        return (
          <div className="space-y-6">
            <AIBudgetGenerator />
            {allocationStatus && (
              <AIAllocationInsight />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="px-4 md:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Smart Budgeting
        </h1>
        <p className="text-muted">
          AI-powered budget allocation and income management
        </p>
      </div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex gap-2 p-1.5 rounded-2xl bg-surface border border-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-black"
                  : "text-muted hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
}
