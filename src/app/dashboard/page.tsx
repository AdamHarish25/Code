"use client";

/**
 * Dashboard Page
 * Main dashboard view for authenticated users
 */

import { DashboardLayout } from "@/components/dashboard";
import { DashboardProvider } from "@/lib/dashboard-store";
import { NotificationContainer } from "@/components/dashboard";
import { useState, useEffect } from "react";

export default function DashboardPage() {
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

    // Poll every 5 seconds
    const interval = setInterval(pollNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

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
