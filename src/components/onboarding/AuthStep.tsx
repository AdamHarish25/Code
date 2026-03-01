"use client";

/**
 * Step 5: Auth Component
 * User creates account or signs in to save their onboarding data
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle, UserPlus, LogIn } from "lucide-react";
import { useOnboarding } from "@/lib/onboarding-store";
import { signUpWithEmail, signInWithEmail } from "@/lib/auth";

interface AuthStepProps {
  onComplete: () => void;
}

type AuthMode = "signin" | "signup";

export function AuthStep({ onComplete }: AuthStepProps) {
  const router = useRouter();
  const { data, isSaving, saveError, completeOnboarding } = useOnboarding();

  const [mode, setMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (mode === "signup") {
        // For signup, create account and save onboarding data
        const result = await signUpWithEmail(email, password);

        if (result.success && result.user) {
          // Save onboarding data immediately after signup
          const saved = await completeOnboarding();
          if (saved) {
            // Redirect to verification page with email
            router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
          } else {
            setError("Failed to save onboarding data");
          }
          return;
        } else {
          setError(result.error || "Failed to create account");
        }
      } else {
        // For signin, complete onboarding immediately
        const result = await signInWithEmail(email, password);

        if (result.success && result.user) {
          // Auth successful - onboarding will save data automatically
          onComplete();
        } else {
          setError(result.error || "Sign in failed");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          {mode === "signup" ? (
            <UserPlus className="w-8 h-8 text-primary" />
          ) : (
            <LogIn className="w-8 h-8 text-primary" />
          )}
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {mode === "signup" ? "Create Your Account" : "Welcome Back"}
        </h2>
        <p className="text-muted">
          {mode === "signup"
            ? "Save your financial profile to access it anytime"
            : "Sign in to access your saved financial profile"}
        </p>
      </div>

      {/* Summary Card */}
      <div className="p-4 rounded-2xl bg-surface border border-border mb-6">
        <h3 className="text-sm font-semibold mb-3">Your Profile Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted">Investment Path</span>
            <span className="capitalize">{data.investmentPath || "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Goals</span>
            <span>{data.goals.length} goals</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Income Sources</span>
            <span>{data.incomeSources.length} sources</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {(error || saveError) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-danger-dim border border-danger/20 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-danger mt-0.5 flex-shrink-0" />
          <p className="text-sm text-danger">{error || saveError}</p>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-background border-2 border-border focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-background border-2 border-border focus:border-primary focus:outline-none transition-colors"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted mt-2">
            Must be at least 6 characters
          </p>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading || isSaving}
          whileHover={{ scale: (isLoading || isSaving) ? 1 : 1.02 }}
          whileTap={{ scale: (isLoading || isSaving) ? 1 : 0.98 }}
          className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${
            (isLoading || isSaving)
              ? "bg-surface-hover text-muted cursor-not-allowed"
              : "bg-primary text-black"
          }`}
        >
          {(isLoading || isSaving) ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Lock className="w-5 h-5" />
              </motion.div>
              {isLoading ? "Authenticating..." : "Saving to Database..."}
            </span>
          ) : (
            mode === "signup" ? "Create Account & Save" : "Sign In"
          )}
        </motion.button>
      </form>

      {/* Toggle Mode */}
      <div className="text-center">
        <p className="text-sm text-muted">
          {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setError("");
            }}
            className="text-primary hover:text-primary-hover font-medium transition-colors"
          >
            {mode === "signup" ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>

      {/* Success Indicator */}
      {isSaving && !isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 rounded-xl bg-success-dim border border-success/20 flex items-center gap-3"
        >
          <CheckCircle className="w-5 h-5 text-success" />
          <div>
            <p className="text-sm font-medium text-success">Saving your data...</p>
            <p className="text-xs text-muted">Your financial profile is being saved securely</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
