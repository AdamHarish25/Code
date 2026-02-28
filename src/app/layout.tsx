import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <OnboardingProvider>
          {children}
        </OnboardingProvider>
      </body>
    </html>
  );
}
