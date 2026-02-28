"use client";

/**
 * InsightsView Component
 * AI insights and recommendations view
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Zap,
  Brain,
  RefreshCw,
} from "lucide-react";
import { useDashboard } from "@/lib/dashboard-store";
import { getSmartInsight } from "@/actions/insights";
import { formatRelativeTime } from "@/lib/utils";

const insightIcons = {
  advice: Lightbulb,
  alert: AlertCircle,
  opportunity: TrendingUp,
  achievement: CheckCircle,
};

const insightColors = {
  advice: "text-secondary",
  alert: "text-danger",
  opportunity: "text-success",
  achievement: "text-primary",
};

export function InsightsView() {
  const { insights, addInsight, markInsightRead } = useDashboard();
  const [isLoading, setIsLoading] = useState(false);

  const handleRefreshInsight = async () => {
    setIsLoading(true);
    try {
      const result = await getSmartInsight();
      if (result.success && result.insight) {
        addInsight({
          title: "New Financial Insight",
          content: result.insight,
          type: "advice",
        });
      }
    } catch (error) {
      console.error("Failed to refresh insight:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sample insights for demo
  const sampleInsights = [
    {
      id: "1",
      title: "Spending Pattern Alert",
      content:
        "Your dining expenses increased by 23% this month. Consider meal prepping to save up to $150 monthly.",
      type: "alert" as const,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isRead: false,
    },
    {
      id: "2",
      title: "Savings Opportunity",
      content:
        "You have $500 extra this month. Consider increasing your emergency fund contribution by 15%.",
      type: "opportunity" as const,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      isRead: false,
    },
    {
      id: "3",
      title: "Budget Achievement",
      content:
        "Great job! You've stayed under your entertainment budget for 3 consecutive months. Keep it up!",
      type: "achievement" as const,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      isRead: true,
    },
    {
      id: "4",
      title: "Investment Tip",
      content:
        "Based on your conservative profile, consider allocating 10% more to index funds for steady growth.",
      type: "advice" as const,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      isRead: true,
    },
  ];

  const displayInsights = insights.length > 0 ? insights : sampleInsights;

  return (
    <div className="px-4 md:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">AI Insights</h1>
          <p className="text-muted">Personalized financial intelligence from Qwen</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefreshInsight}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary text-black font-medium hover:bg-secondary-hover transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">
            {isLoading ? "Generating..." : "New Insight"}
          </span>
        </motion.button>
      </div>

      {/* Featured Insight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent border border-secondary/30"
      >
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
            <Brain className="w-8 h-8 text-secondary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-xs font-semibold text-secondary uppercase tracking-wide">
                Powered by Qwen AI
              </span>
            </div>
            <h2 className="text-xl font-bold mb-3">Your Personal Financial Advisor</h2>
            <p className="text-muted leading-relaxed">
              Our AI analyzes your spending patterns, income, and goals to provide
              personalized recommendations. Check back regularly for new insights
              tailored to your financial journey.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Insights List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Recent Insights</h3>
          <span className="text-xs text-muted">
            {displayInsights.filter((i) => !i.isRead).length} unread
          </span>
        </div>

        {displayInsights.map((insight, index) => {
          const Icon = insightIcons[insight.type];
          const colorClass = insightColors[insight.type];

          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01, backgroundColor: "var(--surface-hover)" }}
              onClick={() => markInsightRead(insight.id)}
              className={`p-5 rounded-2xl bg-surface border border-border cursor-pointer transition-all ${
                !insight.isRead ? "border-secondary/50" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    insight.type === "alert"
                      ? "bg-danger-dim"
                      : insight.type === "opportunity"
                      ? "bg-success-dim"
                      : insight.type === "achievement"
                      ? "bg-primary/20"
                      : "bg-secondary/20"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${colorClass}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-foreground">
                      {insight.title}
                    </h4>
                    {!insight.isRead && (
                      <span className="w-2 h-2 rounded-full bg-secondary" />
                    )}
                  </div>
                  <p className="text-sm text-muted leading-relaxed mb-3">
                    {insight.content}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="capitalize">{insight.type}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(insight.timestamp)}</span>
                  </div>
                </div>

                {/* Action */}
                <div className="flex-shrink-0">
                  {insight.type === "opportunity" && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-xl bg-success text-black text-sm font-medium"
                    >
                      Act Now
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {displayInsights.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-muted"
        >
          <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-semibold mb-2">No insights yet</h3>
          <p className="text-sm mb-4">
            Generate your first AI-powered financial insight
          </p>
          <motion.button
            onClick={handleRefreshInsight}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-2xl bg-secondary text-black font-medium"
          >
            Generate Insight
          </motion.button>
        </motion.div>
      )}

      {/* AI Features */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: Zap,
            title: "Real-time Analysis",
            desc: "Instant insights on transactions",
          },
          {
            icon: Brain,
            title: "Smart Categorization",
            desc: "AI-powered transaction tagging",
          },
          {
            icon: TrendingUp,
            title: "Predictive Insights",
            desc: "Forecast spending patterns",
          },
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ y: -4 }}
            className="p-5 rounded-2xl bg-surface border border-border"
          >
            <feature.icon className="w-8 h-8 text-secondary mb-3" />
            <h4 className="font-semibold mb-1">{feature.title}</h4>
            <p className="text-sm text-muted">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
