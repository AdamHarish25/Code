"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect if the user is on a mobile device
 * Uses both screen size and user agent detection
 */
export function useMobile() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase()
      );
      const isMobileWidth = window.innerWidth < 768;
      
      // Consider mobile if either user agent or width indicates mobile
      setIsMobile(isMobileUA || isMobileWidth);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return { isMobile, isClient };
}

/**
 * Hook to detect touch capability
 */
export function useTouch() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  return isTouch;
}
