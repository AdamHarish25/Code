"use client";

/**
 * MobileOnboardingWrapper
 * Restricts onboarding flow to mobile devices only
 * Shows desktop placeholder for larger screens
 */

import { motion } from "framer-motion";
import { Smartphone, Monitor, ArrowRight, Wifi, Lock, Zap } from "lucide-react";
import Image from "next/image";
import { useMobile } from "@/hooks/use-mobile";
import { OnboardingFlow } from "./onboarding";

export function MobileOnboardingWrapper() {
  const { isMobile, isClient } = useMobile();

  // Show nothing during SSR to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20" />
        </div>
      </div>
    );
  }

  // Show onboarding on mobile
  if (isMobile) {
    return <OnboardingFlow />;
  }

  // Show desktop placeholder
  return <DesktopPlaceholder />;
}

function DesktopPlaceholder() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-background flex flex-col items-center justify-center px-6"
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-1/2 -left-1/4 w-full h-full bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-gradient-to-tl from-secondary/10 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl text-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 flex justify-center"
        >
          <Image
            src="/logohorizontal.png"
            alt="Duitly"
            width={200}
            height={54}
            className="object-contain"
            priority
          />
        </motion.div>

        {/* Icon Animation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative mb-8"
        >
          <div className="w-32 h-32 mx-auto rounded-[40px] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30">
            <Smartphone className="w-16 h-16 text-primary" />
          </div>
          
          {/* Orbiting particles */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50" />
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-2 h-2 rounded-full bg-secondary shadow-lg shadow-secondary/50" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
        >
          Mobile Experience
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-lg md:text-xl text-muted mb-8 max-w-md mx-auto"
        >
          Duitly onboarding is optimized for mobile devices. Please continue your journey on your phone or tablet.
        </motion.p>

        {/* Feature Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 w-full max-w-xl mx-auto"
        >
          {[
            {
              icon: Smartphone,
              title: "Mobile First",
              desc: "Designed for touch",
              color: "from-primary/20 to-primary/30",
            },
            {
              icon: Lock,
              title: "Secure",
              desc: "Bank-level encryption",
              color: "from-secondary/20 to-secondary/30",
            },
            {
              icon: Zap,
              title: "Fast",
              desc: "Quick setup process",
              color: "from-success/20 to-success/30",
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 rounded-3xl bg-surface border border-border hover:border-primary/50 transition-all cursor-default"
            >
              <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3`}>
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
              <p className="text-xs text-muted">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* QR Code Placeholder / CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="p-6 rounded-3xl bg-surface/50 border border-border max-w-sm mx-auto backdrop-blur-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30">
              <Smartphone className="w-10 h-10 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground mb-1">
                Scan to Continue
              </p>
              <p className="text-sm text-muted">
                Open on your mobile device
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bottom Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="text-xs text-muted mt-8 flex items-center gap-2 justify-center"
        >
          <Monitor className="w-3 h-3" />
          Resize your browser or use a mobile device to access the onboarding flow
        </motion.p>
      </div>

      {/* Animated Divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      />
    </motion.div>
  );
}
