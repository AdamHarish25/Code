"use client";

/**
 * Settings Page
 * User profile and account settings
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Bell,
  Palette,
  Globe,
  CreditCard,
  Shield,
  LogOut,
  Save,
  Camera,
  Trash2,
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Theme = "dark" | "light";
type Currency = "IDR" | "USD" | "EUR" | "SGD";
type Language = "en" | "id";

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // User data
  const [user, setUser] = useState<{
    id: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
  } | null>(null);

  // Settings
  const [theme, setTheme] = useState<Theme>("dark");
  const [currency, setCurrency] = useState<Currency>("IDR");
  const [language, setLanguage] = useState<Language>("en");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (currentUser) {
          setUser({
            id: currentUser.id,
            email: currentUser.email || "",
            fullName: currentUser.user_metadata?.full_name,
            avatarUrl: currentUser.user_metadata?.avatar_url,
          });

          // Load user preferences from metadata
          if (currentUser.user_metadata) {
            setTheme(currentUser.user_metadata.theme || "dark");
            setCurrency(currentUser.user_metadata.currency || "IDR");
            setLanguage(currentUser.user_metadata.language || "en");
            setEmailNotifications(currentUser.user_metadata.emailNotifications ?? true);
            setPushNotifications(currentUser.user_metadata.pushNotifications ?? true);
          }
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };

    loadUser();
  }, []);

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: user?.fullName,
          theme,
          currency,
          language,
          emailNotifications,
          pushNotifications,
        },
      });

      if (error) throw error;

      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    if (!confirm("Are you sure you want to sign out?")) return;

    try {
      await supabase.auth.signOut();
      router.push("/auth/signin");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    if (!confirm("This will permanently delete your account and all data.")) return;

    try {
      // In production, you would call a server action to delete the account
      alert("Account deletion requested. Please contact support for assistance.");
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 py-6 max-w-4xl mx-auto">

      <button className="pb-10" onClick={() => {
        router.push("../")
      }}>
        <ChevronLeft className="w-8 h-8 text-muted" />
      </button>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 rounded-3xl bg-surface border border-border"
      >
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Profile</h2>
        </div>

        <div className="flex items-center gap-6 mb-6">
          {/* Avatar */}
          <div className="relative">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName || "User"}
                className="w-24 h-24 rounded-full object-cover border-2 border-primary/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/20">
                <User className="w-12 h-12 text-primary" />
              </div>
            )}
            <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-black hover:bg-primary-hover transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="mb-4">
              <label className="block text-sm text-muted mb-2">Full Name</label>
              <input
                type="text"
                value={user.fullName || ""}
                onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-2">Email</label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-background/50 border border-border text-muted">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Preferences Section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 p-6 rounded-3xl bg-surface border border-border"
      >
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Preferences</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Theme */}
          <div>
            <label className="block text-sm text-muted mb-2">Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none transition-colors"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm text-muted mb-2">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none transition-colors"
            >
              <option value="IDR">IDR - Indonesian Rupiah</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="SGD">SGD - Singapore Dollar</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm text-muted mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none transition-colors"
            >
              <option value="en">English</option>
              <option value="id">Bahasa Indonesia</option>
            </select>
          </div>
        </div>
      </motion.section>

      {/* Notifications Section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 p-6 rounded-3xl bg-surface border border-border"
      >
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Notifications</h2>
        </div>

        <div className="space-y-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
            <div>
              <p className="font-medium mb-1">Email Notifications</p>
              <p className="text-sm text-muted">Receive updates via email</p>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`w-12 h-6 rounded-full transition-colors ${emailNotifications ? "bg-primary" : "bg-surface-hover"
                }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${emailNotifications ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
            <div>
              <p className="font-medium mb-1">Push Notifications</p>
              <p className="text-sm text-muted">Receive browser notifications</p>
            </div>
            <button
              onClick={() => setPushNotifications(!pushNotifications)}
              className={`w-12 h-6 rounded-full transition-colors ${pushNotifications ? "bg-primary" : "bg-surface-hover"
                }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${pushNotifications ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>
        </div>
      </motion.section>

      {/* Account Section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8 p-6 rounded-3xl bg-surface border border-border"
      >
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Account</h2>
        </div>

        <div className="space-y-4">
          {/* Change Password */}
          <button className="w-full p-4 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-muted" />
              <div className="text-left">
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-muted">Update your password</p>
              </div>
            </div>
          </button>

          {/* Delete Account */}
          <button
            onClick={handleDeleteAccount}
            className="w-full p-4 rounded-xl bg-danger/10 border border-danger/20 hover:bg-danger/20 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-danger" />
              <div className="text-left">
                <p className="font-medium text-danger">Delete Account</p>
                <p className="text-sm text-muted">Permanently delete your account</p>
              </div>
            </div>
          </button>
        </div>
      </motion.section>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 py-4 rounded-2xl bg-primary text-black font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {isSaving ? "Saving..." : "Save Changes"}
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={handleSignOut}
          className="flex-1 py-4 rounded-2xl bg-surface border border-border hover:border-danger/50 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5 text-danger" />
          <span className="text-danger">Sign Out</span>
        </motion.button>
      </div>
    </div>
  );
}
