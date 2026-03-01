"use client";

/**
 * Dashboard Page
 * Main dashboard view for authenticated users
 */

import { DashboardLayout } from "@/components/dashboard";
import { DashboardProvider } from "@/lib/dashboard-store";
import { NotificationContainer } from "@/components/dashboard";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, onAuthStateChange } from "@/lib/auth-config";

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    merchant: string;
    amount: number;
  }>>([]);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log("[Dashboard Page] Checking authentication...");
      
      try {
        const { data: { session }, error: sessionError } = await getSession();
        
        if (sessionError) {
          console.error("[Dashboard Page] Session check error:", sessionError.message);
        }
        
        console.log("[Dashboard Page] Session result:", {
          hasSession: !!session,
          email: session?.user?.email,
          userId: session?.user?.id,
          onboardingCompleted: session?.user?.user_metadata?.onboarding_completed,
        });
        
        if (session) {
          setIsAuthenticated(true);
          setIsAuthReady(true);
        } else {
          console.warn("[Dashboard Page] No session found, redirecting to signin");
          router.push("/auth/signin");
        }
      } catch (err) {
        console.error("[Dashboard Page] Auth check error:", err);
        setIsAuthReady(true);
      }
    };
    
    checkAuth();

    // Listen for auth changes
    return onAuthStateChange((user) => {
      console.log("[Dashboard Page] Auth event:", user ? "SIGNED_IN" : "SIGNED_OUT", {
        hasUser: !!user,
        email: user?.email,
      });
      
      if (user) {
        setIsAuthenticated(true);
        setIsAuthReady(true);
      } else {
        setIsAuthenticated(false);
        router.push("/auth/signin");
      }
    });
  }, [router]);

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Show loading while checking auth
  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardProvider>
      <DashboardLayout />
      <NotificationContainer
        notifications={notifications}
        onDismiss={handleDismissNotification}
      />
    </DashboardProvider>
  );
}
