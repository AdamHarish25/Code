/**
 * Centralized Utility Functions
 * Single source of truth for formatting and helpers
 */

// Default currency for the app
const DEFAULT_CURRENCY = "IDR";
const DEFAULT_LOCALE = "en-US";  // Changed to English locale

/**
 * Format a number as currency
 * @param value - The numeric value to format
 * @param currency - Currency code (default: IDR)
 * @param locale - Locale code (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a number with thousands separator
 * @param value - The numeric value to format
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE).format(value);
}

/**
 * Format a percentage
 * @param value - The numeric value (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return value.toFixed(decimals) + "%";
}

/**
 * Parse currency string back to number
 * @param value - The currency string to parse
 * @returns Numeric value
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols and thousands separators
  const cleaned = value.replace(/[^0-9.-]/g, "");
  return parseFloat(cleaned) || 0;
}

/**
 * Format a date
 * @param date - Date string or Date object
 * @param format - Format type: 'short' | 'long' | 'relative'
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, format: "short" | "long" = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  if (format === "short") {
    return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  }
  
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * Format relative time (e.g., "2 hours ago", "yesterday")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat(DEFAULT_LOCALE, { numeric: "auto" });
  
  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, "second");
  }
  
  const diffInMinute = Math.floor(diffInSeconds / 60);
  if (diffInMinute < 60) {
    return rtf.format(-diffInMinute, "minute");
  }
  
  const diffInHour = Math.floor(diffInMinute / 60);
  if (diffInHour < 24) {
    return rtf.format(-diffInHour, "hour");
  }
  
  const diffInDay = Math.floor(diffInHour / 24);
  if (diffInDay < 30) {
    return rtf.format(-diffInDay, "day");
  }
  
  const diffInMonth = Math.floor(diffInDay / 30);
  if (diffInMonth < 12) {
    return rtf.format(-diffInMonth, "month");
  }
  
  const diffInYear = Math.floor(diffInMonth / 12);
  return rtf.format(-diffInYear, "year");
}

/**
 * Get icon emoji for transaction category
 * @param category - Category name
 * @returns Emoji string
 */
export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    housing: "🏠",
    food: "🍔",
    transport: "🚗",
    utilities: "💡",
    entertainment: "🎬",
    healthcare: "🏥",
    shopping: "🛍️",
    salary: "💰",
    freelance: "💼",
    investment: "📈",
    other: "📦",
  };
  
  return icons[category.toLowerCase()] || icons.other;
}
