"use client";

/**
 * Verified Success Page
 * Shown after user clicks email confirmation link
 * Auto-redirects to dashboard
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function VerifiedPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        <div className="p-8 rounded-3xl bg-surface border border-border">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
            className="w-24 h-24 rounded-full bg-success-dim flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-success" />
          </motion.div>

          {/* Header */}
          <h1 className="text-3xl font-bold mb-3">Email Verified!</h1>
          <p className="text-muted text-lg mb-8">
            Your account has been successfully verified. Welcome aboard!
          </p>

          {/* Features List */}
          <div className="mb-8 space-y-3 text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border"
            >
              <div className="w-8 h-8 rounded-full bg-success-dim flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
              <span className="text-sm text-foreground">
                Full account access enabled
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border"
            >
              <div className="w-8 h-8 rounded-full bg-success-dim flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
              <span className="text-sm text-foreground">
                Ready to track your finances
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border"
            >
              <div className="w-8 h-8 rounded-full bg-success-dim flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
              <span className="text-sm text-foreground">
                AI-powered insights available
              </span>
            </motion.div>
          </div>

          {/* Redirect Indicator */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted">
              <span>Redirecting to dashboard in</span>
              <span className="font-bold text-primary text-lg">{countdown}s</span>
            </div>

            <motion.button
              onClick={() => router.push("/dashboard")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-2xl font-semibold text-lg bg-primary text-black flex items-center justify-center gap-2"
            >
              <span>Go to Dashboard Now</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-sm text-muted"
        >
          <p>Thank you for verifying your email address.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
