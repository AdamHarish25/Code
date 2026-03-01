"use client";

/**
 * CategoryAllocationList Component
 * Vertical list for budget items including Rent & Utilities, Food and Beverage, etc.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Utensils,
  Train,
  Heart,
  Gamepad2,
  ShoppingBag,
  PiggyBank,
  TrendingUp,
  MoreHorizontal,
  Edit2,
  Trash2,
} from "lucide-react";
import { useDashboard } from "@/lib/dashboard-store";
import { CategoryAllocation } from "@/types/dashboard";

const categoryIcons: Record<string, React.ReactNode> = {
  housing: <Home className="w-4 h-4" />,
  food: <Utensils className="w-4 h-4" />,
  transport: <Train className="w-4 h-4" />,
  healthcare: <Heart className="w-4 h-4" />,
  entertainment: <Gamepad2 className="w-4 h-4" />,
  shopping: <ShoppingBag className="w-4 h-4" />,
  savings: <PiggyBank className="w-4 h-4" />,
  investment: <TrendingUp className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  housing: "bg-blue-500",
  food: "bg-orange-500",
  transport: "bg-yellow-500",
  healthcare: "bg-red-500",
  entertainment: "bg-purple-500",
  shopping: "bg-pink-500",
  savings: "bg-green-500",
  investment: "bg-emerald-500",
};

const impactColors: Record<"high" | "medium" | "low", string> = {
  high: "bg-danger text-danger",
  medium: "bg-warning/10 text-warning",
  low: "bg-success-dim text-success",
};

interface EditModalProps {
  allocation: CategoryAllocation;
  onSave: (updates: Partial<CategoryAllocation>) => void;
  onClose: () => void;
}

function EditAllocationModal({ allocation, onSave, onClose }: EditModalProps) {
  const [allocatedAmount, setAllocatedAmount] = useState(
    allocation.allocatedAmount.toString()
  );
  const [impactIndicator, setImpactIndicator] = useState<
    "high" | "medium" | "low"
  >(allocation.impactIndicator);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      allocatedAmount: parseFloat(allocatedAmount) || 0,
      impactIndicator,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md p-6 rounded-3xl bg-surface border border-border"
      >
        <h3 className="text-lg font-semibold mb-4">Edit Allocation</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-muted mb-2">
              Allocated Amount
            </label>
            <input
              type="number"
              value={allocatedAmount}
              onChange={(e) => setAllocatedAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none transition-colors"
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-2">
              Impact Indicator
            </label>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((impact) => (
                <button
                  key={impact}
                  type="button"
                  onClick={() => setImpactIndicator(impact)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                    impactIndicator === impact
                      ? impactColors[impact]
                      : "bg-surface-hover text-muted"
                  }`}
                >
                  {impact}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-primary text-black font-medium text-sm"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-surface-hover text-muted font-medium text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export function CategoryAllocationList() {
  const {
    categoryAllocations,
    updateCategoryAllocation,
    removeCategoryAllocation,
  } = useDashboard();
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = (id: string, updates: Partial<CategoryAllocation>) => {
    updateCategoryAllocation(id, updates);
    setEditingId(null);
  };

  const getProgressPercentage = (allocated: number, spent: number) => {
    if (allocated === 0) return 0;
    return Math.min((spent / allocated) * 100, 100);
  };

  const getProgressColor = (allocated: number, spent: number) => {
    const percentage = (spent / allocated) * 100;
    if (percentage > 100) return "bg-danger";
    if (percentage > 80) return "bg-warning";
    return "bg-success";
  };

  if (categoryAllocations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl bg-surface border border-border"
      >
        <h3 className="text-lg font-semibold mb-2">Category Allocation List</h3>
        <p className="text-sm text-muted">
          No categories allocated yet. Use AI to generate allocations or add
          manually.
        </p>
      </motion.div>
    );
  }

  const totalAllocated = categoryAllocations.reduce(
    (sum, c) => sum + c.allocatedAmount,
    0
  );
  const totalSpent = categoryAllocations.reduce(
    (sum, c) => sum + c.spentAmount,
    0
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl bg-surface border border-border"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Category Allocation List</h3>
            <p className="text-sm text-muted">
              ${totalAllocated.toLocaleString()} allocated • $
              {totalSpent.toLocaleString()} spent
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {categoryAllocations.map((allocation, index) => (
              <motion.div
                key={allocation.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-2xl bg-background border border-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl ${categoryColors[allocation.category] || "bg-muted"} flex items-center justify-center text-white`}
                    >
                      {categoryIcons[allocation.category] || (
                        <MoreHorizontal className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{allocation.name}</p>
                      <p className="text-xs text-muted">
                        {allocation.isEssential ? (
                          <span className="text-primary">Essential</span>
                        ) : (
                          "Non-Essential"
                        )}{" "}
                        • {allocation.impactIndicator} impact
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingId(allocation.id)}
                      className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-muted" />
                    </button>
                    <button
                      onClick={() => removeCategoryAllocation(allocation.id)}
                      className="p-2 rounded-lg hover:bg-danger/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-danger" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted">
                      ${allocation.spentAmount.toLocaleString()} of $
                      {allocation.allocatedAmount.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted">
                      {getProgressPercentage(
                        allocation.allocatedAmount,
                        allocation.spentAmount
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${getProgressPercentage(
                          allocation.allocatedAmount,
                          allocation.spentAmount
                        )}%`,
                      }}
                      transition={{ duration: 0.5 }}
                      className={`h-full ${getProgressColor(allocation.allocatedAmount, allocation.spentAmount)} rounded-full`}
                    />
                  </div>
                </div>

                {/* Impact Indicator Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded-lg ${impactColors[allocation.impactIndicator]}`}
                  >
                    {allocation.impactIndicator.toUpperCase()} IMPACT
                  </span>
                  {allocation.spentAmount > allocation.allocatedAmount && (
                    <span className="text-xs text-danger font-medium">
                      Over budget by $
                      {(allocation.spentAmount - allocation.allocatedAmount).toLocaleString()}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingId && (
          <EditAllocationModal
            allocation={categoryAllocations.find((c) => c.id === editingId)!}
            onSave={(updates) => handleSave(editingId, updates)}
            onClose={() => setEditingId(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
