"use client";

/**
 * Verify Email Page
 * Notifies user to check their email for confirmation
 * Auto-redirects to dashboard upon verification
 */

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowLeft, Inbox, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useOnboarding } from "@/lib/onboarding-store";
import { saveOnboardingData } from "@/actions/onboarding-db";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const { data: onboardingData, userId, setUserId } = useOnboarding();

  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Load onboarding data from sessionStorage if not in context
  const getOnboardingData = () => {
    // Try context first
    if (onboardingData.investmentPath) {
      return onboardingData;
    }
    // Fallback to sessionStorage
    try {
      const stored = sessionStorage.getItem('onboardingData');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("[VerifyEmail] Failed to parse sessionStorage:", e);
    }
    return null;
  };

  // Poll for verification status
  useEffect(() => {
    const checkVerification = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (user) {
          // Email verification disabled - proceed immediately for all users
          setIsVerified(true);
          
          // Get user ID from context or user object
          const currentUserId = userId || user.id;
          
          // Get onboarding data
          const onboardingToSave = getOnboardingData();
          
          // Check if onboarding already saved
          const alreadySaved = user.user_metadata?.onboarding_completed;
          
          // Save onboarding data (if not already saved)
          if (onboardingToSave?.investmentPath && currentUserId && !alreadySaved) {
            setIsSaving(true);
            try {
              const result = await saveOnboardingData(currentUserId, {
                ...onboardingToSave,
                completedAt: new Date().toISOString(),
              });
              
              if (result.success) {
                // Update user metadata
                await supabase.auth.updateUser({
                  data: { onboarding_completed: true },
                });
                
                // Clear sessionStorage
                sessionStorage.removeItem('onboardingData');
                
                // Redirect to dashboard
                setTimeout(() => {
                  router.push("/dashboard");
                }, 1500);
              } else {
                setError("Failed to save onboarding data");
              }
            } catch (saveError) {
              console.error("[VerifyEmail] Save error:", saveError);
              setError("Failed to save data, redirecting anyway...");
              setTimeout(() => router.push("/dashboard"), 2000);
            } finally {
              setIsSaving(false);
            }
          } else if (alreadySaved) {
            // Already saved, just redirect to dashboard
            setTimeout(() => {
              router.push("/dashboard");
            }, 1000);
          } else if (!onboardingToSave?.investmentPath) {
            // No onboarding data, redirect to dashboard or onboarding
            setTimeout(() => {
              router.push("/dashboard");
            }, 1000);
          }
        }
      } catch (err) {
        console.error("[VerifyEmail] Check error:", err);
      }
    };

    // Check immediately
    checkVerification();

    // No polling needed - just save once
    const interval = setInterval(checkVerification, 1000);

    return () => clearInterval(interval);
  }, [router, userId]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (!canResend || !email) return;

    setIsVerifying(true);
    setError("");

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      // Reset countdown
      setCountdown(30);
      setCanResend(false);
    } catch (err) {
      setError("Failed to resend verification email. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <button
          onClick={handleBackToHome}
          className="flex items-center gap-2 text-muted hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </button>

        {/* Card */}
        <div className="p-8 rounded-3xl bg-surface border border-border">
          <AnimatePresence mode="wait">
            {!isVerified ? (
              <motion.div
                key="verification-pending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
                >
                  <Inbox className="w-10 h-10 text-primary" />
                </motion.div>

                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold mb-2">
                    Verify Your Email
                  </h1>
                  <p className="text-muted text-sm">
                    We&apos;ve sent a confirmation link to{" "}
                    <span className="text-primary font-medium">{email}</span>
                  </p>
                </div>

                {/* Instructions */}
                <div className="mb-8 p-4 rounded-xl bg-background border border-border">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted">
                      <p className="font-medium text-foreground mb-1">
                        Account Created Successfully!
                      </p>
                      <p>
                        Please wait while we save your onboarding data and redirect you to the dashboard.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-xl bg-danger-dim border border-danger/20 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-danger mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-danger">{error}</p>
                  </motion.div>
                )}

                {/* Resend Button */}
                <div className="space-y-4">
                  <motion.button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={!canResend || isVerifying}
                    whileHover={{ scale: canResend && !isVerifying ? 1.02 : 1 }}
                    whileTap={{ scale: canResend && !isVerifying ? 0.98 : 1 }}
                    className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                      canResend && !isVerifying
                        ? "bg-primary text-black"
                        : "bg-surface-hover text-muted cursor-not-allowed"
                    }`}
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        <span>Resend Verification Email</span>
                      </>
                    )}
                  </motion.button>

                  {/* Countdown Timer */}
                  {!canResend && (
                    <p className="text-center text-sm text-muted">
                      Resend available in{" "}
                      <span className="font-medium text-foreground">
                        {countdown}s
                      </span>
                    </p>
                  )}
                </div>

                {/* Loading Indicator */}
                <div className="mt-8 flex items-center justify-center gap-2 text-muted text-sm">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.div>
                  <span>Waiting for verification...</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="verification-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                {isSaving ? (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
                    >
                      <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </motion.div>
                    <h1 className="text-2xl font-bold mb-2">Saving Your Data...</h1>
                    <p className="text-muted mb-4">
                      Please wait while we save your onboarding information.
                    </p>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="w-20 h-20 rounded-full bg-success-dim flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle className="w-10 h-10 text-success" />
                    </motion.div>
                    <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
                    <p className="text-muted mb-4">
                      Your account has been successfully verified.
                    </p>
                    <p className="text-sm text-muted">
                      Redirecting to dashboard...
                    </p>
                  </>
                )}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5 }}
                  className="h-1 bg-surface-hover rounded-full mt-6 overflow-hidden"
                >
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 1.5 }}
                    className="w-full h-full bg-success"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <button
              onClick={handleResendEmail}
              disabled={!canResend || isVerifying}
              className="text-primary hover:text-primary-hover font-medium transition-colors disabled:opacity-50"
            >
              resend it
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
