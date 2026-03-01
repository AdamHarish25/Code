"use client";

/**
 * Dashboard Page
 * Main dashboard view for authenticated users
 */

import { DashboardLayout } from "@/components/dashboard";
import { DashboardProvider } from "@/lib/dashboard-store";
import { NotificationContainer } from "@/components/dashboard";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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
    console.log("[Dashboard Page] Checking authentication...");
    
    // Get session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[Dashboard Page] Session:", !!session, session?.user?.email);
      setIsAuthenticated(!!session);
      setIsAuthReady(true);
      
      if (!session) {
        console.warn("[Dashboard Page] No session, redirecting to signin");
        router.push("/auth/signin");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("[Dashboard Page] Auth event:", event, !!session);
        setIsAuthenticated(!!session);
        setIsAuthReady(true);
        
        if (!session && event === "SIGNED_OUT") {
          router.push("/auth/signin");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Poll for Paylabs notifications
  useEffect(() => {
    const pollNotifications = async () => {
      try {
        const response = await fetch("/api/webhooks/paylabs/notifications");
        const data = await response.json();
        if (data.success && data.notifications.length > 0) {
          setNotifications((prev) => [...prev, ...data.notifications]);
        }
      } catch (error) {
        console.error("Failed to poll notifications:", error);
      }
    };

    const interval = setInterval(pollNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Show nothing while checking auth
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

  // Redirect if not authenticated
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
