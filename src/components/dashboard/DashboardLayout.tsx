"use client";

/**
 * DashboardLayout Component
 * Main container for the dashboard with navigation
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  CreditCard,
  PieChart,
  Target,
  Sparkles,
  Bell,
  Menu,
  X,
  Wallet,
  BarChart3,
} from "lucide-react";
import Image from "next/image";
import { useDashboard } from "@/lib/dashboard-store";
import { DashboardView } from "@/types/dashboard";
import { HomeView } from "./views/HomeView";
import { TransactionsView } from "./views/TransactionsView";
import { BudgetView } from "./views/BudgetView";
import { GoalsView } from "./views/GoalsView";
import { InsightsView } from "./views/InsightsView";
import { SmartBudgetingView } from "./views/SmartBudgetingView";
import { AnalyticsView } from "./views/AnalyticsView";

const navItems: { id: DashboardView; label: string; icon: React.ReactNode }[] = [
  { id: "home", label: "Home", icon: <Home className="w-5 h-5" /> },
  { id: "budgeting", label: "Budgeting", icon: <Wallet className="w-5 h-5" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
  { id: "transactions", label: "Transactions", icon: <CreditCard className="w-5 h-5" /> },
  { id: "budget", label: "Budget", icon: <PieChart className="w-5 h-5" /> },
  { id: "goals", label: "Goals", icon: <Target className="w-5 h-5" /> },
  { id: "insights", label: "Insights", icon: <Sparkles className="w-5 h-5" /> },
];

export function DashboardLayout() {
  const { currentView, setCurrentView, notifications } = useDashboard();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const renderView = () => {
    switch (currentView) {
      case "home":
        return <HomeView />;
      case "budgeting":
        return <SmartBudgetingView />;
      case "analytics":
        return <AnalyticsView />;
      case "transactions":
        return <TransactionsView />;
      case "budget":
        return <BudgetView />;
      case "goals":
        return <GoalsView />;
      case "insights":
        return <InsightsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 md:px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/logohorizontal.png"
              alt="Duitly"
              width={120}
              height={32}
              className="object-contain"
              priority
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-xl hover:bg-surface transition-colors"
            >
              <Bell className="w-5 h-5 text-muted" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 w-4 h-4 rounded-full bg-danger text-white text-xs flex items-center justify-center font-medium"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </motion.span>
              )}
            </motion.button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-xl hover:bg-surface transition-colors"
            >
              {showMobileMenu ? (
                <X className="w-5 h-5 text-muted" />
              ) : (
                <Menu className="w-5 h-5 text-muted" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation (Mobile) */}
      {isMounted && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-lg border-t border-border z-50">
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  whileTap={{ scale: 0.9 }}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                    isActive
                      ? "text-primary"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <div
                    className={`p-1 rounded-lg ${
                      isActive ? "bg-primary/10" : ""
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Side Navigation (Desktop) */}
      <nav className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 flex-col gap-2 p-3 z-40">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              whileHover={{ x: 4, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-r-2xl transition-all ${
                isActive
                  ? "bg-primary text-black shadow-lg shadow-primary/20"
                  : "bg-surface text-muted hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              {item.icon}
              <span className="font-medium text-sm whitespace-nowrap">
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="md:hidden fixed right-0 top-0 bottom-0 w-64 bg-surface z-50 p-6"
            >
              <div className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        setShowMobileMenu(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? "bg-primary text-black"
                          : "text-muted hover:text-foreground hover:bg-surface-hover"
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
