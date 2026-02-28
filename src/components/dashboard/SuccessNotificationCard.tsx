"use client";

/**
 * SuccessNotificationCard Component
 * Displays success notification for Paylabs transactions
 * Fixed dimensions: 354x120px as per spec
 */

import { motion } from "framer-motion";
import { CheckCircle2, X, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useMemo, useEffect } from "react";

interface SuccessNotificationCardProps {
  merchant: string;
  amount: number;
  onDismiss: () => void;
}

export function SuccessNotificationCard({
  merchant,
  amount,
  onDismiss,
}: SuccessNotificationCardProps) {
  // Pre-compute random positions for particle effects (using stable seed)
  const particlePositions = useMemo(() => {
    const seed = 12345; // Fixed seed for stability
    return Array.from({ length: 6 }).map((_, i) => {
      const random = ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280;
      return {
        x: random * 354,
        y: -50 - ((random * 100) % 50),
        endX: ((random * 200) % 354),
      };
    });
  }, []);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: "spring", damping: 20 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-success-dim to-success/5 border border-success/30"
      style={{ width: "354px", minHeight: "120px" }}
    >
      {/* Animated Background Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-10 -right-10 w-32 h-32 bg-success/20 rounded-full blur-2xl"
      />

      {/* Content */}
      <div className="relative p-5 flex items-start gap-4">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2, damping: 15 }}
          className="flex-shrink-0"
        >
          <div className="w-14 h-14 rounded-xl bg-success/20 flex items-center justify-center border border-success/30">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.3 }}
            >
              <CheckCircle2 className="w-7 h-7 text-success" />
            </motion.div>
          </div>
        </motion.div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pt-1">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 mb-1"
          >
            <span className="text-xs font-semibold text-success uppercase tracking-wide">
              Payment Successful
            </span>
          </motion.div>

          <motion.h4
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="font-semibold text-foreground truncate mb-1"
          >
            {merchant}
          </motion.h4>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4 text-success" />
            <span className="text-lg font-bold text-success">
              {formatCurrency(amount)}
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-xs text-muted mt-1"
          >
            Transaction completed successfully
          </motion.p>
        </div>

        {/* Close Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onDismiss}
          className="flex-shrink-0 p-1.5 rounded-lg hover:bg-success/10 transition-colors"
        >
          <X className="w-4 h-4 text-muted hover:text-success" />
        </motion.button>
      </div>

      {/* Progress Bar */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 5, ease: "linear" }}
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-success to-success-light"
      />

      {/* Particle Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particlePositions.map((pos, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              scale: 0,
              x: pos.x,
              y: 120,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0.5],
              y: pos.y,
              x: pos.endX,
            }}
            transition={{
              duration: 1.5,
              delay: 0.3 + i * 0.1,
              repeat: Infinity,
              repeatDelay: 2,
            }}
            className="absolute w-2 h-2 rounded-full bg-success/40"
          />
        ))}
      </div>
    </motion.div>
  );
}

/**
 * NotificationContainer Component
 * Manages multiple success notifications
 */

interface NotificationContainerProps {
  notifications: Array<{
    id: string;
    merchant: string;
    amount: number;
  }>;
  onDismiss: (id: string) => void;
}

export function NotificationContainer({
  notifications,
  onDismiss,
}: NotificationContainerProps) {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <SuccessNotificationCard
            merchant={notification.merchant}
            amount={notification.amount}
            onDismiss={() => onDismiss(notification.id)}
          />
        </div>
      ))}
    </div>
  );
}
