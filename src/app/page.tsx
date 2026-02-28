/**
 * Duitly - Smart Budgeting App
 * Main entry point with onboarding flow and dashboard
 */

"use client";

import { useState, useEffect } from "react";
import { OnboardingFlow } from "@/components/onboarding";
import { DashboardLayout } from "@/components/dashboard";
import { DashboardProvider } from "@/lib/dashboard-store";
import { useOnboarding } from "@/lib/onboarding-store";
import { NotificationContainer } from "@/components/dashboard";

function AppContent() {
  const { isComplete } = useOnboarding();
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    merchant: string;
    amount: number;
  }>>([]);

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

    // Poll every 5 seconds when dashboard is shown
    if (isComplete) {
      const interval = setInterval(pollNotifications, 5000);
      return () => clearInterval(interval);
    }
  }, [isComplete]);

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (!isComplete) {
    return <OnboardingFlow />;
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

export default function Home() {
  return <AppContent />;
}
