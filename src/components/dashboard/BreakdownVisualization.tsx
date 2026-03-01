"use client";

/**
 * BreakdownVisualization Component
 * Doughnut chart showing category distribution
 */

import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { CategoryBreakdown } from "@/actions/analytics";

interface BreakdownVisualizationProps {
  data: CategoryBreakdown[];
  isLoading?: boolean;
}

const COLORS = [
  "#A3FF47", // Primary Lime
  "#3B82F6", // Blue
  "#F97316", // Orange
  "#EAB308", // Yellow
  "#EF4444", // Red
  "#A855F7", // Purple
  "#EC4899", // Pink
  "#22C55E", // Green
  "#10B981", // Emerald
  "#06B6D4", // Cyan
];

export function BreakdownVisualization({ data, isLoading }: BreakdownVisualizationProps) {
  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      name: item.category,
      value: item.amount,
      percentage: item.percentage,
      count: item.count,
      fill: COLORS[index % COLORS.length],
    }));
  }, [data]);

  const totalAmount = useMemo(() => {
    return data.reduce((sum, item) => sum + item.amount, 0);
  }, [data]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 rounded-xl bg-surface border border-border shadow-xl">
          <p className="text-sm font-semibold mb-1">{data.name}</p>
          <p className="text-xs text-primary mb-1">{formatCurrency(data.value)}</p>
          <p className="text-xs text-muted">{data.percentage}% of total</p>
          <p className="text-xs text-muted">{data.count} transactions</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl bg-surface border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-secondary/10">
            <PieChartIcon className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Category Breakdown</h3>
            <p className="text-sm text-muted">Expense distribution by category</p>
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
          <div className="p-2 rounded-xl bg-secondary/10">
            <PieChartIcon className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Category Breakdown</h3>
            <p className="text-sm text-muted">Expense distribution by category</p>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center text-muted">
          No category data available
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-surface border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-secondary/10">
            <PieChartIcon className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Category Breakdown</h3>
            <p className="text-sm text-muted">
              Total: {formatCurrency(totalAmount)}
            </p>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} (${percent ? (percent * 100).toFixed(0) : 0}%)`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top Categories List */}
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="text-sm font-medium mb-3">Top Categories</h4>
        <div className="space-y-2">
          {data.slice(0, 5).map((item, index) => (
            <div
              key={item.category}
              className="flex items-center justify-between p-2 rounded-xl bg-background border border-border"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm">{item.category}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">
                  {formatCurrency(item.amount)}
                </span>
                <span className="text-xs text-muted ml-2">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
