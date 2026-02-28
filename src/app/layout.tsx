import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans, Inter } from "next/font/google";
import { OnboardingProvider } from "@/lib/onboarding-store";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Duitly - Smart Budgeting App",
  description: "Your AI-powered smart budgeting companion. Build your path to financial freedom.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${plusJakartaSans.variable} ${inter.variable} antialiased`}
      >
        <OnboardingProvider>
          {children}
        </OnboardingProvider>
      </body>
    </html>
  );
}
