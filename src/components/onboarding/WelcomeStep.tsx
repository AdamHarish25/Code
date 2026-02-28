"use client";

/**
 * Step 1: Welcome Component
 * Introduction screen for Duitly onboarding with enhanced interactivity
 */

import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { Wallet, Sparkles, ArrowRight, Star, Zap, Shield } from "lucide-react";
import { useOnboarding } from "@/lib/onboarding-store";
import { useState, useEffect } from "react";

interface WelcomeStepProps {
  onNext: () => void;
}

// Haptic feedback helper
function triggerHaptic(pattern: number | number[] = 10) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const { setWelcomed } = useOnboarding();
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const opacity = useTransform(dragX, [-200, 0, 200], [0.5, 1, 0.5]);
  const rotate = useTransform(dragX, [-200, 200], [-15, 15]);
  const scale = useTransform(dragY, [0, -100], [1, 0.9]);
  const controls = useAnimation();
  const [showParticles, setShowParticles] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Fixed particle positions to avoid hydration mismatch
  const particles = [
    { id: 0, x: -40, y: -30, delay: 0, duration: 2.5 },
    { id: 1, x: 30, y: -20, delay: 0.3, duration: 3 },
    { id: 2, x: -20, y: 40, delay: 0.6, duration: 2.8 },
    { id: 3, x: 45, y: 10, delay: 0.9, duration: 3.2 },
    { id: 4, x: -35, y: 25, delay: 1.2, duration: 2.6 },
    { id: 5, x: 15, y: -45, delay: 1.5, duration: 3.5 },
    { id: 6, x: -50, y: -10, delay: 0.2, duration: 2.9 },
    { id: 7, x: 25, y: 35, delay: 0.7, duration: 3.1 },
    { id: 8, x: -10, y: -35, delay: 1.0, duration: 2.7 },
    { id: 9, x: 50, y: 20, delay: 1.3, duration: 3.3 },
    { id: 10, x: -30, y: 50, delay: 0.5, duration: 2.4 },
    { id: 11, x: 40, y: -40, delay: 0.8, duration: 3.4 },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleStart = () => {
    triggerHaptic([50, 50, 50]);
    setShowParticles(true);
    controls.start({
      scale: [1, 1.05, 1],
      transition: { duration: 0.3 },
    });
    setTimeout(() => {
      setWelcomed(true);
      onNext();
    }, 200);
  };

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.y < -100) {
      // Swipe up to continue
      triggerHaptic(30);
      onNext();
    } else if (Math.abs(info.offset.x) > 100) {
      // Swipe left/right for fun feedback
      triggerHaptic(20);
      controls.start({
        x: 0,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 relative overflow-hidden"
    >
      {/* Floating Particles Background */}
      {isMounted && (
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ 
                x: particle.x, 
                y: particle.y, 
                opacity: 0,
                scale: 0 
              }}
              animate={{ 
                y: [particle.y, particle.y - 30, particle.y],
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full bg-gradient-to-r from-primary/40 to-secondary/40"
            />
          ))}
        </div>
      )}

      {/* Main Interactive Card */}
      <motion.div
        style={{ x: dragX, y: dragY, opacity, rotate, scale }}
        drag
        dragConstraints={{ left: 0, right: 0, top: -50, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="relative mb-8 cursor-grab active:cursor-grabbing touch-none"
      >
        <div className="w-28 h-28 rounded-[40px] bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center border-2 border-primary/40 backdrop-blur-sm shadow-2xl shadow-primary/20">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          >
            <Wallet className="w-14 h-14 text-primary" />
          </motion.div>
        </div>
        
        {/* Orbiting Sparkles */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-4"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1">
            <Sparkles className="w-5 h-5 text-secondary" />
          </div>
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-2"
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1">
            <Star className="w-4 h-4 text-primary" />
          </div>
        </motion.div>

        {/* Drag Indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-muted text-xs"
        >
          <span>Swipe up or tap to start</span>
        </motion.div>
      </motion.div>

      {/* Title with Gradient Animation */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-4xl md:text-5xl font-bold mb-4 relative"
      >
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "200% 200%" }}
        >
          Welcome to Duitly
        </motion.span>
        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Welcome to Duitly
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-lg md:text-xl text-muted max-w-md mb-8"
      >
        Your AI-powered smart budgeting companion. Let&apos;s build your path to financial freedom.
      </motion.p>

      {/* Interactive Features Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="grid grid-cols-3 gap-3 mb-12 w-full max-w-md"
      >
        {[
          { icon: Wallet, label: "Budget Smart", color: "text-success" },
          { icon: Sparkles, label: "AI Insights", color: "text-secondary" },
          { icon: Zap, label: "Fast Setup", color: "text-primary" },
        ].map((feature, index) => (
          <motion.div
            key={feature.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
            whileHover={{ 
              scale: 1.1, 
              rotate: [-5, 5, -5, 0],
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center p-4 rounded-2xl bg-surface border border-border hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => triggerHaptic(15)}
          >
            <motion.div
              animate={{ 
                y: [0, -3, 0],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                delay: index * 0.3,
                ease: "easeInOut" 
              }}
            >
              <feature.icon className={`w-6 h-6 ${feature.color} mb-2`} />
            </motion.div>
            <span className="text-xs text-muted">{feature.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Button with Enhanced Effects */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95, y: 0 }}
        onClick={handleStart}
        className="group relative px-8 py-4 bg-primary text-black font-semibold rounded-2xl flex items-center gap-3 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all overflow-hidden"
        onMouseEnter={() => triggerHaptic(10)}
      >
        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
        
        {/* Particle Burst on Click */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, scale: 1 }}
                animate={{
                  opacity: 0,
                  scale: 0,
                  x: (Math.random() - 0.5) * 100,
                  y: (Math.random() - 0.5) * 100,
                }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-primary"
              />
            ))}
          </div>
        )}

        <span className="relative z-10">Start Your Journey</span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform relative z-10" />
      </motion.button>

      {/* Security Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-surface/50 border border-border/50"
      >
        <Shield className="w-4 h-4 text-success" />
        <span className="text-xs text-muted">Bank-level security • Your data is encrypted</span>
      </motion.div>
    </motion.div>
  );
}
