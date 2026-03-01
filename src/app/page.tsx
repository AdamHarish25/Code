/**
 * Duitly - Smart Budgeting App
 * Main entry point - redirects based on auth and onboarding status
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      try {
        // Wait a bit for auth to initialize
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // User is authenticated - check onboarding status
          // Check both user_metadata and profiles table
          const onboardingCompleted = user.user_metadata?.onboarding_completed;
          
          if (onboardingCompleted) {
            router.push("/dashboard");
          } else {
            // Double-check by querying profiles table
            const { data: profile } = await (supabase as any)
              .from("profiles")
              .select("investment_path")
              .eq("id", user.id)
              .single();
            
            if ((profile as any)?.investment_path) {
              // User has completed onboarding (profile exists with investment_path)
              router.push("/dashboard");
            } else {
              // User needs to complete onboarding
              router.push("/onboarding");
            }
          }
        } else {
          // User not authenticated - redirect to welcome page
          router.push("/auth/welcome");
        }
      } catch (error) {
        console.error("[Home] Auth check error:", error);
        // Not authenticated - redirect to welcome
        router.push("/auth/welcome");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndOnboarding();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  return null;
}
