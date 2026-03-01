"use client";

/**
 * UserProfile Component
 * Displays user account info in navbar
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState<{
    email: string;
    name?: string;
    avatarUrl?: string;
  } | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (currentUser) {
          // Get profile data
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", currentUser.id)
            .single();

          if (error) {
            console.error("[UserProfile] Error fetching profile:", error);
          }

          setUser({
            email: currentUser.email || "",
            name: (profile as any)?.full_name || currentUser.email?.split('@')[0],
            avatarUrl: (profile as any)?.avatar_url,
          });
        }
      } catch (error) {
        console.error("[UserProfile] Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/welcome");
  };

  if (isLoading || !user) {
    return (
      <div className="w-8 h-8 rounded-full bg-surface animate-pulse" />
    );
  }

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 p-2 rounded-xl hover:bg-surface transition-colors"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name || "User"}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
        )}
        <ChevronDown className="w-4 h-4 text-muted hidden md:block" />
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface border border-border shadow-lg z-50 overflow-hidden"
          >
            {/* User Info */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || "User"}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {user.name || "User"}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <button
                onClick={() => {
                  setShowMenu(false);
                  router.push("/settings");
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-background transition-colors text-sm"
              >
                <Settings className="w-4 h-4 text-muted" />
                <span>Settings</span>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-danger/10 transition-colors text-sm text-danger"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
