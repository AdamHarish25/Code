"use client";

/**
 * ExpensesTrendChart Component
 * Multi-year line/bar chart showing Income vs Expenses
 */

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { TrendData } from "@/actions/analytics";

interface ExpensesTrendChartProps {
  data: TrendData[];
  isLoading?: boolean;
}

export function ExpensesTrendChart({ data, isLoading }: ExpensesTrendChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1)}M`;
    }
    return `Rp ${(value / 1000).toFixed(0)}K`;
  };

  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      incomeFormatted: item.income / 1000000,
      expensesFormatted: item.expenses / 1000000,
      netFormatted: item.net / 1000000,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl bg-surface border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/10">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Expenses Trend</h3>
            <p className="text-sm text-muted">Income vs Expenses over the years</p>
          </div>
        </div>
        <div className="h-64 bg-surface-hover rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-6 rounded-3xl bg-surface border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/10">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Expenses Trend</h3>
            <p className="text-sm text-muted">Income vs Expenses over the years</p>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center text-muted">
          No trend data available
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-surface border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Expenses Trend</h3>
            <p className="text-sm text-muted">Income vs Expenses (in Millions)</p>
          </div>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <span className="text-muted">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-danger" />
            <span className="text-muted">Expenses</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
            <XAxis
              dataKey="year"
              stroke="#6B6B6B"
              tick={{ fill: "#6B6B6B", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6B6B6B"
              tick={{ fill: "#6B6B6B", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1A1A",
                border: "1px solid #2A2A2A",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#EDEDED", marginBottom: "8px" }}
              formatter={(value, name) => [
                formatCurrency(Number(value) || 0),
                name === "incomeFormatted" ? "Income" : name === "expensesFormatted" ? "Expenses" : "Net",
              ]}
              labelFormatter={(label) => `Year ${label}`}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
            />
            <ReferenceLine y={0} stroke="#2A2A2A" />
            <Bar
              dataKey="incomeFormatted"
              name="Income"
              fill="#A3FF47"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="expensesFormatted"
              name="Expenses"
              fill="#FF5F5F"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
