"use client";

/**
 * Onboarding Complete Page
 * Handles final onboarding completion after email verification
 * Saves onboarding data and redirects to dashboard
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useOnboarding } from "@/lib/onboarding-store";
import { saveOnboardingData } from "@/actions/onboarding-db";
import { supabase } from "@/lib/supabase";

export default function OnboardingCompletePage() {
  const router = useRouter();
  const { data, userId } = useOnboarding();
  
  const [status, setStatus] = useState<"loading" | "saving" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const completeOnboarding = async () => {
      try {
        // Get current user from session
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setStatus("error");
          setErrorMessage("Please sign in to complete onboarding");
          setTimeout(() => {
            router.push("/onboarding");
          }, 2000);
          return;
        }

        setStatus("saving");

        // Save onboarding data to database
        const result = await saveOnboardingData(user.id, {
          ...data,
          completedAt: new Date().toISOString(),
        });

        if (result.success) {
          setStatus("success");
          
          // Update user metadata to mark onboarding as complete
          // This ensures next login goes directly to dashboard
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              onboarding_completed: true,
              onboarding_completed_at: new Date().toISOString(),
            },
          });
          
          if (updateError) {
            console.error("[Onboarding] Failed to update metadata:", updateError.message);
          } else {
            console.log("[Onboarding] ✅ User metadata updated");
          }
          
          console.log("[Onboarding] ✅ Onboarding complete, redirecting to dashboard...");
          
          // Force a session refresh to ensure metadata is updated
          await supabase.auth.refreshSession();
          
          // Redirect to dashboard after short delay
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        } else {
          setStatus("error");
          setErrorMessage(result.error || "Failed to save onboarding data");
        }
      } catch (error) {
        console.error("Onboarding completion error:", error);
        setStatus("error");
        setErrorMessage("An unexpected error occurred");
      }
    };

    completeOnboarding();
  }, [router, data]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="p-8 rounded-3xl bg-surface border border-border">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <Loader2 className="w-10 h-10 text-primary" />
              </motion.div>
              <h2 className="text-xl font-bold mb-2">Completing Setup...</h2>
              <p className="text-muted text-center text-sm">
                Please wait while we finalize your account
              </p>
            </div>
          )}

          {status === "saving" && (
            <div className="flex flex-col items-center justify-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <Loader2 className="w-10 h-10 text-primary" />
              </motion.div>
              <h2 className="text-xl font-bold mb-2">Saving Your Data...</h2>
              <p className="text-muted text-center text-sm">
                Your financial profile is being saved securely
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center justify-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-success-dim flex items-center justify-center mb-6"
              >
                <CheckCircle className="w-10 h-10 text-success" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">All Set!</h2>
              <p className="text-muted text-center mb-4">
                Your account is ready. Redirecting to dashboard...
              </p>
              <div className="w-full h-1 bg-surface-hover rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2 }}
                  className="h-full bg-success"
                />
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-full bg-danger-dim flex items-center justify-center mb-6"
              >
                <AlertCircle className="w-8 h-8 text-danger" />
              </motion.div>
              <h2 className="text-xl font-bold mb-2">Something Went Wrong</h2>
              <p className="text-muted text-center text-sm mb-4">{errorMessage}</p>
              <motion.button
                onClick={() => router.push("/onboarding")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 rounded-2xl bg-primary text-black font-semibold"
              >
                Try Again
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
