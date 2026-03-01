"use client";

/**
 * IncomeManagementModule Component
 * Allows users to add, edit, and remove income sources
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, DollarSign, Edit2, Trash2, Save } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-store";
import { IncomeSourceDetail } from "@/types/dashboard";
import {
  createIncomeSource as createIncomeSourceService,
  updateIncomeSource as updateIncomeSourceService,
  deleteIncomeSource as deleteIncomeSourceService,
} from "@/lib/supabase-services";

interface IncomeFormData {
  name: string;
  amount: string;
  frequency: IncomeSourceDetail["frequency"];
  type: IncomeSourceDetail["type"];
}

const initialFormData: IncomeFormData = {
  name: "",
  amount: "",
  frequency: "monthly",
  type: "salary",
};

const incomeTypes: { value: IncomeSourceDetail["type"]; label: string }[] = [
  { value: "salary", label: "Salary" },
  { value: "freelance", label: "Freelance" },
  { value: "investment", label: "Investment" },
  { value: "side-hustle", label: "Side Hustle" },
  { value: "other", label: "Other" },
];

const frequencies: { value: IncomeSourceDetail["frequency"]; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export function IncomeManagementModule() {
  const { incomeSources, addIncomeSource, updateIncomeSource, removeIncomeSource, refreshData } = useDashboard();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<IncomeFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.name || !formData.amount) return;

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingId) {
        await updateIncomeSourceService(editingId, {
          name: formData.name,
          amount,
          frequency: formData.frequency,
          type: formData.type,
        });
        setEditingId(null);
      } else {
        await createIncomeSourceService({
          name: formData.name,
          amount,
          frequency: formData.frequency,
          type: formData.type,
        });
      }

      // Refresh data from Supabase
      await refreshData();
      setFormData(initialFormData);
      setIsAdding(false);
    } catch (error) {
      console.error("Failed to save income source:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (source: IncomeSourceDetail) => {
    setFormData({
      name: source.name,
      amount: source.amount.toString(),
      frequency: source.frequency,
      type: source.type,
    });
    setEditingId(source.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const calculateMonthlyIncome = (source: IncomeSourceDetail) => {
    let monthly = source.amount;
    switch (source.frequency) {
      case "weekly":
        monthly *= 4.33;
        break;
      case "biweekly":
        monthly *= 2.17;
        break;
      case "yearly":
        monthly /= 12;
        break;
    }
    return monthly;
  };

  const totalMonthlyIncome = incomeSources.reduce(
    (sum, source) => sum + calculateMonthlyIncome(source),
    0
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteIncomeSourceService(id);
      await refreshData();
    } catch (error) {
      console.error("Failed to delete income source:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl bg-surface border border-border"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Manage Income</h3>
          <p className="text-sm text-muted mt-1">
            Add your income sources to get started
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdding(!isAdding)}
          className="p-3 rounded-xl bg-primary text-black hover:bg-primary-hover transition-colors"
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </motion.button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="mb-6 p-4 rounded-2xl bg-background border border-border overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Income Name */}
              <div className="col-span-2">
                <label className="block text-xs text-muted mb-2">
                  Income Source Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Digital Marketing, Stock Dividends"
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none transition-colors text-sm"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs text-muted mb-2">
                  Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none transition-colors text-sm"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-xs text-muted mb-2">
                  Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      frequency: e.target.value as IncomeSourceDetail["frequency"],
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none transition-colors text-sm"
                >
                  {frequencies.map((freq) => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div className="col-span-2">
                <label className="block text-xs text-muted mb-2">Type</label>
                <div className="flex flex-wrap gap-2">
                  {incomeTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, type: type.value })
                      }
                      className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                        formData.type === type.value
                          ? "bg-primary text-black"
                          : "bg-surface-hover text-muted hover:text-foreground"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 rounded-xl bg-primary text-black font-medium text-sm flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingId ? "Update" : "Add"} Income Source
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                className="px-6 py-3 rounded-xl bg-surface-hover text-muted font-medium text-sm"
              >
                Cancel
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Income Sources List */}
      {incomeSources.length === 0 ? (
        <div className="text-center py-8">
          <DollarSign className="w-12 h-12 text-muted mx-auto mb-3 opacity-50" />
          <p className="text-muted text-sm">
            No income sources added yet
          </p>
          <p className="text-muted text-xs mt-1">
            Click + to add your first income source
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {incomeSources.map((source) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="p-4 rounded-2xl bg-background border border-border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success-dim flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{source.name}</p>
                    <p className="text-xs text-muted">
                      ${source.amount.toLocaleString()} / {source.frequency}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      ${calculateMonthlyIncome(source).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-muted">/ month</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(source)}
                      className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-muted" />
                    </button>
                    <button
                      onClick={() => handleDelete(source.id)}
                      className="p-2 rounded-lg hover:bg-danger/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-danger" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Total */}
          <div className="pt-4 mt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Total Monthly Income</span>
              <span className="text-xl font-bold text-success">
                ${totalMonthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
