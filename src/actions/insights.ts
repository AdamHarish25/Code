/**
 * Insights Server Actions
 * Handles AI-powered financial insights using Alibaba Cloud Qwen API
 */

"use server";

import { OnboardingData } from "@/types/onboarding";

interface InsightResult {
  success: boolean;
  insight?: string;
  recommendations?: string[];
  error?: string;
}

/**
 * Get smart financial insight based on user data
 * Uses Qwen API with SSE support for real-time streaming
 */
export async function getSmartInsight(
  userData?: Partial<OnboardingData>
): Promise<InsightResult> {
  try {
    const prompt = buildInsightPrompt(userData);
    const insight = await callQwenAPI(prompt);

    return {
      success: true,
      insight,
    };
  } catch (error) {
    console.error("Failed to generate insight:", error);
    return {
      success: true,
      insight: generateFallbackInsight(),
    };
  }
}

/**
 * Analyze transaction and auto-categorize
 */
export async function categorizeTransaction(
  merchant: string,
  amount: number
): Promise<{ category: string; confidence: number }> {
  try {
    const apiKey = process.env.QWEN_API_KEY;
    const apiEndpoint =
      process.env.QWEN_API_ENDPOINT ||
      "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation";

    if (!apiKey) {
      return { category: "other", confidence: 0 };
    }

    const prompt = `Categorize this transaction into one of these categories: housing, food, transport, utilities, entertainment, healthcare, shopping, salary, freelance, investment, other.
    
Transaction:
- Merchant: ${merchant}
- Amount: $${amount}

Respond with ONLY the category name, nothing else.`;

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-DashScope-SSE": "disable",
      },
      body: JSON.stringify({
        model: "qwen-max",
        input: {
          messages: [
            {
              role: "system",
              content:
                "You are a financial categorization assistant. Respond with only the category name.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        },
        parameters: {
          temperature: 0.3,
          max_tokens: 20,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    let category = "other";

    if (result.output?.text) {
      category = result.output.text.trim().toLowerCase();
    } else if (result.output?.choices?.[0]?.message?.content) {
      category = result.output.choices[0].message.content.trim().toLowerCase();
    }

    // Validate category
    const validCategories = [
      "housing",
      "food",
      "transport",
      "utilities",
      "entertainment",
      "healthcare",
      "shopping",
      "salary",
      "freelance",
      "investment",
      "other",
    ];

    if (validCategories.includes(category)) {
      return { category, confidence: 0.9 };
    }

    // Fallback categorization based on keywords
    return { category: fallbackCategorize(merchant), confidence: 0.7 };
  } catch (error) {
    console.error("Failed to categorize transaction:", error);
    return { category: fallbackCategorize(merchant), confidence: 0.5 };
  }
}

/**
 * Analyze spending patterns and provide recommendations
 */
export async function analyzeSpendingPatterns(
  transactions: Array<{ category: string; amount: number; date: string }>
): Promise<InsightResult> {
  try {
    const prompt = buildSpendingAnalysisPrompt(transactions);
    const insight = await callQwenAPI(prompt);

    return {
      success: true,
      insight,
      recommendations: extractRecommendations(insight),
    };
  } catch (error) {
    console.error("Failed to analyze spending:", error);
    return {
      success: true,
      insight: "Your spending patterns look healthy. Continue tracking your expenses for more detailed insights.",
    };
  }
}

/**
 * Call Alibaba Cloud Qwen API
 */
async function callQwenAPI(prompt: string): Promise<string> {
  const apiKey = process.env.QWEN_API_KEY;
  const apiEndpoint =
    process.env.QWEN_API_ENDPOINT ||
    "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation";

  if (!apiKey) {
    console.warn("QWEN_API_KEY not configured");
    return "Unable to generate insight at this time.";
  }

  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-DashScope-SSE": "disable", // Can be enabled for streaming
      },
      body: JSON.stringify({
        model: "qwen-max", // Using qwen-max for better reasoning
        input: {
          messages: [
            {
              role: "system",
              content:
                "You are a friendly, expert financial advisor for Duitly. Provide clear, actionable, and encouraging advice. Keep responses concise (2-3 sentences) unless more detail is requested.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        },
        parameters: {
          temperature: 0.7,
          max_tokens: 300,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Qwen API error (${response.status}):`, errorText);
      throw new Error(`Qwen API error: ${response.status}`);
    }

    const result = await response.json();

    // Handle different response formats
    if (result.output?.text) {
      return result.output.text.trim();
    } else if (result.output?.choices?.[0]?.message?.content) {
      return result.output.choices[0].message.content.trim();
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
 * Build prompt for general insight
 */
function buildInsightPrompt(userData?: Partial<OnboardingData>): string {
  const now = new Date();
  const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" });
  const timeOfDay = now.getHours() < 12 ? "morning" : now.getHours() < 18 ? "afternoon" : "evening";

  let context = `Good ${timeOfDay}! It's ${dayOfWeek}. `;

  if (userData?.investmentPath) {
    context += `User follows a ${userData.investmentPath} investment strategy. `;
  }

  if (userData?.goals && userData.goals.length > 0) {
    context += `Their financial goals include: ${userData.goals.map(g => g.name).join(", ")}. `;
  }

  if (userData?.incomeSources && userData.incomeSources.length > 0) {
    const total = userData.incomeSources.reduce((sum, s) => sum + s.amount, 0);
    context += `Monthly income is approximately $${total}. `;
  }

  context += "Provide a brief, actionable financial tip or insight relevant to their situation.";

  return context;
}

/**
 * Build prompt for spending analysis
 */
function buildSpendingAnalysisPrompt(
  transactions: Array<{ category: string; amount: number; date: string }>
): string {
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const byCategory = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  return `Analyze this spending pattern and provide insights:

Total Spent: $${totalSpent.toFixed(2)}

By Category:
${Object.entries(byCategory)
  .map(([cat, amount]) => `- ${cat}: $${amount.toFixed(2)}`)
  .join("\n")}

Provide 2-3 brief observations and actionable recommendations.`;
}

/**
 * Extract recommendations from insight text
 */
function extractRecommendations(insight: string): string[] {
  // Simple extraction - split by newlines or bullet points
  const lines = insight.split(/\n|-|\*/).filter((line) => line.trim().length > 0);
  return lines.slice(0, 3).map((line) => line.trim());
}

/**
 * Fallback categorization based on keywords
 */
function fallbackCategorize(merchant: string): string {
  const lower = merchant.toLowerCase();

  const keywords: Record<string, string> = {
    mcdonald: "food",
    burger: "food",
    pizza: "food",
    restaurant: "food",
    cafe: "food",
    starbucks: "food",
    grocery: "food",
    supermarket: "food",
    uber: "transport",
    lyft: "transport",
    taxi: "transport",
    gas: "transport",
    fuel: "transport",
    netflix: "entertainment",
    spotify: "entertainment",
    cinema: "entertainment",
    game: "entertainment",
    amazon: "shopping",
    walmart: "shopping",
    target: "shopping",
    pharmacy: "healthcare",
    hospital: "healthcare",
    clinic: "healthcare",
    rent: "housing",
    mortgage: "housing",
    electric: "utilities",
    water: "utilities",
    internet: "utilities",
    phone: "utilities",
  };

  for (const [keyword, category] of Object.entries(keywords)) {
    if (lower.includes(keyword)) {
      return category;
    }
  }

  return "other";
}

/**
 * Generate fallback insight when API is unavailable
 */
function generateFallbackInsight(): string {
  const tips = [
    "Track your expenses daily to build better financial awareness.",
    "Consider setting aside 20% of your income for savings and investments.",
    "Review your subscriptions monthly to avoid unnecessary charges.",
    "Build an emergency fund covering 3-6 months of expenses.",
    "Small daily savings can compound into significant wealth over time.",
  ];

  return tips[Math.floor(Math.random() * tips.length)];
}
