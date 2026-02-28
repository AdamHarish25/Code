"use client";

/**
 * Loading Skeleton Components
 * Reusable skeleton loaders for dashboard
 */

import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  delay?: number;
}

export function Skeleton({
  className = "",
  width,
  height,
  borderRadius = "8px",
  delay = 0,
}: SkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className={`bg-surface ${className}`}
      style={{
        width,
        height,
        borderRadius,
      }}
    >
      <motion.div
        animate={{
          backgroundPosition: ["-200% 0", "200% 0"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
          delay,
        }}
        className="w-full h-full bg-gradient-to-r from-surface via-surface-hover to-surface"
        style={{ backgroundSize: "200% 100%" }}
      />
    </motion.div>
  );
}

/**
 * Card Skeleton
 */
export function CardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-5 rounded-3xl bg-surface border border-border"
    >
      <div className="flex items-center gap-3 mb-3">
        <Skeleton width={40} height={40} borderRadius={12} />
        <Skeleton width={100} height={14} borderRadius={4} />
      </div>
      <Skeleton width={120} height={32} borderRadius={8} delay={delay + 0.1} />
      <Skeleton
        width={80}
        height={12}
        borderRadius={4}
        className="mt-2"
        delay={delay + 0.2}
      />
    </motion.div>
  );
}

/**
 * Summary Cards Skeleton
 */
export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <CardSkeleton delay={0} />
      <CardSkeleton delay={0.1} />
      <CardSkeleton delay={0.2} />
      <CardSkeleton delay={0.3} />
    </div>
  );
}

/**
 * Transaction Item Skeleton
 */
export function TransactionItemSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="p-4 rounded-2xl bg-surface border border-border flex items-center gap-3"
    >
      <Skeleton width={48} height={48} borderRadius={12} />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" height={16} borderRadius={4} />
        <Skeleton width="40%" height={12} borderRadius={4} />
      </div>
      <div className="text-right space-y-2">
        <Skeleton width={80} height={16} borderRadius={4} />
        <Skeleton width={50} height={12} borderRadius={4} />
      </div>
    </motion.div>
  );
}

/**
 * Transaction Feed Skeleton
 */
export function TransactionFeedSkeleton() {
  return (
    <div className="rounded-3xl bg-surface border border-border p-5 space-y-3">
      <Skeleton width={150} height={20} borderRadius={8} />
      <TransactionItemSkeleton delay={0.1} />
      <TransactionItemSkeleton delay={0.2} />
      <TransactionItemSkeleton delay={0.3} />
      <TransactionItemSkeleton delay={0.4} />
    </div>
  );
}

/**
 * Budget Progress Skeleton
 */
export function BudgetProgressSkeleton() {
  return (
    <div className="rounded-3xl bg-surface border border-border p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton width={40} height={40} borderRadius={12} />
        <div className="flex-1 space-y-2">
          <Skeleton width={120} height={16} borderRadius={4} />
          <Skeleton width={80} height={12} borderRadius={4} />
        </div>
      </div>
      <Skeleton width="100%" height={12} borderRadius={6} />
      <div className="space-y-3">
        {[0, 0.1, 0.2].map((delay) => (
          <div key={delay} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton width={100} height={14} borderRadius={4} />
              <Skeleton width={60} height={14} borderRadius={4} />
            </div>
            <Skeleton width="100%" height={8} borderRadius={4} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Insight Card Skeleton
 */
export function InsightCardSkeleton() {
  return (
    <div className="rounded-3xl bg-surface border border-border p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton width={40} height={40} borderRadius={12} />
        <div className="space-y-2">
          <Skeleton width={120} height={16} borderRadius={4} />
          <Skeleton width={80} height={12} borderRadius={4} />
        </div>
      </div>
      <Skeleton width="90%" height={14} borderRadius={4} />
      <Skeleton width="80%" height={14} borderRadius={4} />
      <Skeleton width="60%" height={14} borderRadius={4} />
    </div>
  );
}

/**
 * Goal Card Skeleton
 */
export function GoalCardSkeleton() {
  return (
    <div className="p-5 rounded-3xl bg-surface border border-border space-y-4">
      <div className="flex justify-between">
        <Skeleton width={56} height={56} borderRadius={16} />
        <Skeleton width={60} height={24} borderRadius={12} />
      </div>
      <Skeleton width="70%" height={20} borderRadius={4} />
      <Skeleton width="100%" height={8} borderRadius={4} />
      <div className="flex justify-between">
        <Skeleton width={80} height={24} borderRadius={4} />
        <Skeleton width={80} height={24} borderRadius={4} />
      </div>
    </div>
  );
}

/**
 * Dashboard Loading State
 */
export function DashboardLoading() {
  return (
    <div className="px-4 md:px-6 py-6 space-y-6">
      <div className="space-y-2">
        <Skeleton width={200} height={32} borderRadius={8} />
        <Skeleton width={300} height={16} borderRadius={4} />
      </div>
      <SummaryCardsSkeleton />
      <InsightCardSkeleton />
      <BudgetProgressSkeleton />
      <TransactionFeedSkeleton />
    </div>
  );
}
