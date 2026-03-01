/**
 * Onboarding Server Actions
 * Handles server-side processing and Qwen AI API integration
 */

"use server";

import { OnboardingData } from "@/types/onboarding";

interface OnboardingResult {
  success: boolean;
  insight?: string;
  recommendations?: string[];
  error?: string;
}

/**
 * Sends onboarding data to Alibaba Cloud Qwen API
 * and generates personalized financial insights
 */
export async function finishOnboarding(
  data: OnboardingData
): Promise<OnboardingResult> {
  try {
    // Prepare the prompt for Qwen AI
    const prompt = buildQwenPrompt(data);

    // Call Qwen API
    const insight = await callQwenAPI(prompt);

    return {
      success: true,
      insight,
    };
  } catch (error) {
    console.error("Failed to generate insights:", error);

    // Return a fallback insight if API fails
    return {
      success: true,
      insight: generateFallbackInsight(data),
    };
  }
}

/**
 * Builds a comprehensive prompt for Qwen AI based on user data
 */
function buildQwenPrompt(data: OnboardingData): string {
  const incomeTotal = data.incomeSources.reduce((sum, source) => {
    const multiplier =
      source.frequency === "weekly"
        ? 4.33
        : source.frequency === "biweekly"
        ? 2.17
        : source.frequency === "yearly"
        ? 0.0833
        : 1;
    return sum + source.amount * multiplier;
  }, 0);

  const expensesTotal = data.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthlySurplus = incomeTotal - expensesTotal;

  return `You are a friendly, expert financial advisor for Duitly, a smart budgeting app.
Based on the following user profile, provide a concise (2-3 sentences) personalized financial insight:

USER PROFILE:
- Investment Style: ${data.investmentPath === "conservative" ? "Conservative (low-risk, steady growth)" : "Active Compounder (growth-focused, higher risk tolerance)"}
- Monthly Income: $${incomeTotal.toFixed(2)}
- Monthly Expenses: $${expensesTotal.toFixed(2)}
- Monthly Surplus: $${monthlySurplus.toFixed(2)}
- Financial Dreams: ${data.dreamDescription || "Not specified"}
- Financial Goals: ${data.goals.length > 0 ? data.goals.map(g => `${g.name} ($${g.targetAmount})`).join(", ") : "Not specified"}

Provide actionable, encouraging advice tailored to their investment style and financial situation.
Keep it under 100 words. Be warm and motivating.`;
}

/**
 * Calls Alibaba Cloud Qwen API for generating insights
 * Note: Configure your API key in environment variables
 */
async function callQwenAPI(prompt: string): Promise<string> {
  const apiKey = process.env.QWEN_API_KEY;
  const apiEndpoint =
    process.env.QWEN_API_ENDPOINT ||
    "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation";

  if (!apiKey) {
    console.warn("QWEN_API_KEY not configured, using fallback insight");
    return generateFallbackInsight({
      investmentPath: null,
      dreamDescription: "",
      goals: [],
      incomeSources: [],
      expenses: [],
    });
  }

  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-DashScope-SSE": "disable",
      },
      body: JSON.stringify({
        model: "qwen-turbo",
        input: {
          messages: [
            {
              role: "system",
              content:
                "You are a helpful, friendly financial advisor. Provide clear, actionable advice.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        },
        parameters: {
          temperature: 0.7,
          max_tokens: 200,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Qwen API error (${response.status}):`, errorText);
      throw new Error(`Qwen API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // Handle different response formats
    if (result.output?.text) {
      return result.output.text;
    } else if (result.output?.choices?.[0]?.message?.content) {
      return result.output.choices[0].message.content;
    } else {
      console.warn("Unexpected Qwen API response format:", result);
      return "Unable to generate insight at this time.";
    }
  } catch (error) {
    console.error("Qwen API call failed:", error);
    throw error;
  }
}

/**
 * Generates a fallback insight when API is unavailable
 */
function generateFallbackInsight(data: OnboardingData): string {
  const path = data.investmentPath || "conservative";
  const hasGoals = data.goals.length > 0;
  const hasDream = !!data.dreamDescription;

  const pathAdvice =
    path === "conservative"
      ? "Your conservative approach prioritizes stability and steady growth. Consider building an emergency fund first, then explore low-risk index funds and bonds."
      : "Your active compounder strategy embraces growth potential. Maximize your compound interest by investing early and consistently in diversified assets.";

  const goalsAdvice = hasGoals
    ? ` You have ${data.goals.length} financial goal(s) set - great start!`
    : hasDream
    ? " Your dream is noted - let's break it down into actionable goals."
    : " Consider setting specific financial goals to track your progress.";

  return `Welcome to Duitly! ${pathAdvice}${goalsAdvice} Our AI will provide personalized insights as you explore the platform.`;
}

/**
 * Validates onboarding data before submission
 */
export async function validateOnboardingData(data: OnboardingData): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  if (!data.investmentPath) {
    errors.push("Investment path not selected");
  }

  if (!data.dreamDescription) {
    errors.push("Dream description is required");
  }

  if (data.goals.length === 0) {
    errors.push("At least one goal is required");
  }

  if (data.incomeSources.length === 0) {
    errors.push("At least one income source is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
