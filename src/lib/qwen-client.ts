/**
 * Alibaba Cloud Qwen AI Client
 * Uses OpenAI-compatible API endpoint
 *
 * Models: qwen-turbo, qwen-plus, qwen-max
 */

import { OCRResult } from "@/types/dashboard";

interface QwenConfig {
  apiKey: string;
  baseUrl: string;
  chatModel: string;
  visionModel: string;
}

const config: QwenConfig = {
  apiKey: process.env.QWEN_API_KEY || process.env.ALIBABA_CLOUD_API_KEY || "",
  baseUrl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
  chatModel: "qwen-flash",  
  visionModel: "qwen-vl-max",
};

console.log("[Qwen] Config:", { 
  apiKeySet: !!config.apiKey, 
  baseUrl: config.baseUrl,
  model: config.chatModel,
  savings: "Up to 60% vs qwen-turbo"
});

/**
 * Chat Completion Request
 */
interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

/**
 * Chat Completion Response
 */
interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Vision Completion Request (for OCR)
 */
interface VisionCompletionRequest {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    >;
  }>;
  temperature?: number;
  max_tokens?: number;
}

/**
 * Smart Categorization using Qwen-Max
 * Analyzes merchant name and amount to suggest category
 */
export async function smartCategorize(
  merchant: string,
  amount: number,
  type: "income" | "expense" = "expense"
): Promise<{ category: string; confidence: number; reasoning: string }> {
  try {
    if (!config.apiKey) {
      return fallbackCategorize(merchant, type);
    }

    const expenseCategories = [
      "housing",
      "food",
      "transport",
      "utilities",
      "entertainment",
      "healthcare",
      "shopping",
      "other",
    ];

    const incomeCategories = [
      "salary",
      "freelance",
      "investment",
      "side-hustle",
      "other",
    ];

    const categories = type === "income" ? incomeCategories : expenseCategories;

    const messages = [
      {
        role: "system" as const,
        content:
          "You are a financial categorization expert. Analyze transactions and categorize them accurately. Respond with valid JSON only.",
      },
      {
        role: "user" as const,
        content: `Categorize this ${type} transaction.

Merchant: ${merchant}
Amount: $${amount}

Available categories: ${categories.join(", ")}

Respond with JSON:
{
  "category": "category name",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`,
      },
    ];

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.chatModel,
        messages,
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      console.error("[Qwen] Categorization API error:", response.status);
      return fallbackCategorize(merchant, type);
    }

    const result: ChatCompletionResponse = await response.json();
    const content = result.choices[0]?.message?.content || "";

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const category = parsed.category?.toLowerCase() || "other";
      const confidence = parsed.confidence || 0.7;
      const reasoning = parsed.reasoning || "AI categorization";

      // Validate category
      if (categories.includes(category)) {
        return { category, confidence, reasoning };
      }
    }

    return fallbackCategorize(merchant, type);
  } catch (error) {
    console.error("[Qwen] Categorization error:", error);
    return fallbackCategorize(merchant, type);
  }
}

/**
 * Receipt OCR using Qwen-VL-Max
 * Extracts merchant, date, and amount from receipt images
 */
export async function extractReceiptOCR(
  imageData: string,
  isBase64: boolean = false
): Promise<OCRResult> {
  try {
    if (!config.apiKey) {
      return {
        merchant: "Unknown Merchant",
        date: new Date().toISOString().split("T")[0],
        amount: 0,
        confidence: 0,
      };
    }

    const imageUrl = isBase64 ? imageData : `data:image/jpeg;base64,${imageData}`;

    const messages = [
      {
        role: "system" as const,
        content:
          "You are a receipt OCR specialist. Extract transaction data accurately from receipt images.",
      },
      {
        role: "user" as const,
        content: [
          {
            type: "image_url",
            image_url: { url: imageUrl },
          },
          {
            type: "text",
            text: `Analyze this receipt and extract:
1. Merchant/Store name
2. Transaction date (YYYY-MM-DD format)
3. Total amount (numeric value only)

Respond with JSON:
{
  "merchant": "store name",
  "date": "YYYY-MM-DD",
  "amount": numeric_value,
  "confidence": 0.0-1.0
}

If any field cannot be determined, use null.`,
          },
        ],
      },
    ];

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.visionModel,
        messages,
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error("[Qwen Vision] OCR API error:", response.status);
      return {
        merchant: "Unknown Merchant",
        date: new Date().toISOString().split("T")[0],
        amount: 0,
        confidence: 0,
      };
    }

    const result: ChatCompletionResponse = await response.json();
    const content = result.choices[0]?.message?.content || "";

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        merchant: parsed.merchant || "Unknown Merchant",
        date: parsed.date || new Date().toISOString().split("T")[0],
        amount: typeof parsed.amount === "number" ? parsed.amount : parseFloat(parsed.amount) || 0,
        confidence: parsed.confidence || 0.8,
      };
    }

    return {
      merchant: "Unknown Merchant",
      date: new Date().toISOString().split("T")[0],
      amount: 0,
      confidence: 0,
    };
  } catch (error) {
    console.error("[Qwen Vision] OCR error:", error);
    return {
      merchant: "Unknown Merchant",
      date: new Date().toISOString().split("T")[0],
      amount: 0,
      confidence: 0,
    };
  }
}

/**
 * Budget Optimization using Qwen-Max
 * Generates optimal budget allocation based on income and goals
 */
export async function optimizeBudget(
  totalIncome: number,
  goals: Array<{ name: string; targetAmount: number; priority: string }>,
  existingCategories?: Array<{ name: string; allocated: number; spent: number }>
): Promise<{
  allocations: Array<{ category: string; amount: number; percentage: number }>;
  insight: string;
}> {
  try {
    if (!config.apiKey) {
      return generateFallbackBudget(totalIncome);
    }

    const goalsText = goals
      .map((g) => `- ${g.name}: $${g.targetAmount} (${g.priority} priority)`)
      .join("\n");

    const existingText = existingCategories
      ? existingCategories
          .map(
            (c) =>
              `- ${c.name}: $${c.allocated} allocated, $${c.spent} spent`
          )
          .join("\n")
      : "No existing categories";

    const messages = [
      {
        role: "system" as const,
        content:
          "You are a financial planning expert. Create optimal budget allocations using the 50/30/20 rule as a baseline.",
      },
      {
        role: "user" as const,
        content: `Create a budget allocation plan.

Total Monthly Income: $${totalIncome}

Financial Goals:
${goalsText}

Current Allocations:
${existingText}

Use the 50/30/20 rule:
- 50% Needs (Rent, Utilities, Food, Transport)
- 30% Wants (Entertainment, Shopping)
- 20% Savings & Investments

Respond with JSON:
{
  "allocations": [
    {"category": "name", "amount": number, "percentage": number}
  ],
  "insight": "overall budget insight"
}`,
      },
    ];

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.chatModel,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error("[Qwen] Budget optimization API error:", response.status);
      return generateFallbackBudget(totalIncome);
    }

    const result: ChatCompletionResponse = await response.json();
    const content = result.choices[0]?.message?.content || "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        allocations: parsed.allocations || [],
        insight: parsed.insight || "Budget optimization complete",
      };
    }

    return generateFallbackBudget(totalIncome);
  } catch (error) {
    console.error("[Qwen] Budget optimization error:", error);
    return generateFallbackBudget(totalIncome);
  }
}

/**
 * Generate Financial Insight
 */
export async function generateInsight(
  userData: {
    income?: number;
    expenses?: number;
    goals?: string[];
    investmentPath?: string;
  }
): Promise<string> {
  try {
    if (!config.apiKey) {
      console.warn("[Qwen] API key not configured, using fallback");
      return generateFallbackInsight();
    }

    console.log("[Qwen] Generating insight with model:", config.chatModel);

    const messages = [
      {
        role: "system" as const,
        content: "You are a friendly financial advisor for Duitly. Provide brief, actionable advice (2-3 sentences).",
      },
      {
        role: "user" as const,
        content: `User profile:
- Monthly Income: $${userData.income || "Not specified"}
- Monthly Expenses: $${userData.expenses || "Not specified"}
- Goals: ${userData.goals?.join(", ") || "Not specified"}
- Investment Style: ${userData.investmentPath || "Not specified"}

Provide a brief, actionable financial tip.`,
      },
    ];

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.chatModel,
        messages,
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    console.log("[Qwen] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Qwen] API error:", response.status, errorText);
      return generateFallbackInsight();
    }

    const result: ChatCompletionResponse = await response.json();
    console.log("[Qwen] Response:", result);
    
    const insight = result.choices[0]?.message?.content;
    
    if (!insight) {
      console.warn("[Qwen] No insight in response");
      return generateFallbackInsight();
    }
    
    return insight;
  } catch (error) {
    console.error("[Qwen] Insight generation error:", error);
    return generateFallbackInsight();
  }
}

/**
 * Fallback categorization (keyword-based)
 */
function fallbackCategorize(
  merchant: string,
  type: "income" | "expense"
): { category: string; confidence: number; reasoning: string } {
  const lower = merchant.toLowerCase();

  if (type === "income") {
    const keywords: Record<string, string> = {
      salary: "salary",
      freelance: "freelance",
      upwork: "freelance",
      dividend: "investment",
      uber: "side-hustle",
    };

    for (const [key, category] of Object.entries(keywords)) {
      if (lower.includes(key)) {
        return { category, confidence: 0.5, reasoning: "Keyword match" };
      }
    }
    return { category: "other", confidence: 0.3, reasoning: "Default category" };
  }

  const keywords: Record<string, string> = {
    mcdonald: "food",
    starbucks: "food",
    uber: "transport",
    netflix: "entertainment",
    amazon: "shopping",
    rent: "housing",
    electric: "utilities",
  };

  for (const [key, category] of Object.entries(keywords)) {
    if (lower.includes(key)) {
      return { category, confidence: 0.5, reasoning: "Keyword match" };
    }
  }

  return { category: "other", confidence: 0.3, reasoning: "Default category" };
}

/**
 * Fallback budget (50/30/20 rule)
 */
function generateFallbackBudget(totalIncome: number): {
  allocations: Array<{ category: string; amount: number; percentage: number }>;
  insight: string;
} {
  const needs = totalIncome * 0.5;
  const wants = totalIncome * 0.3;
  const savings = totalIncome * 0.2;

  return {
    allocations: [
      { category: "Rent & Utilities", amount: needs * 0.6, percentage: 30 },
      { category: "Food and Beverage", amount: needs * 0.3, percentage: 15 },
      { category: "Public Transport", amount: needs * 0.1, percentage: 5 },
      { category: "Entertainment", amount: wants * 0.5, percentage: 15 },
      { category: "Shopping", amount: wants * 0.5, percentage: 15 },
      { category: "Emergency Fund", amount: savings * 0.5, percentage: 10 },
      { category: "Investment", amount: savings * 0.5, percentage: 10 },
    ],
    insight:
      "Budget generated using the 50/30/20 rule. Adjust based on your personal needs and goals.",
  };
}

/**
 * Fallback insight
 */
function generateFallbackInsight(): string {
  const tips = [
    "Track your expenses daily to build better financial awareness.",
    "Consider setting aside 20% of your income for savings and investments.",
    "Review your subscriptions monthly to avoid unnecessary charges.",
    "Build an emergency fund covering 3-6 months of expenses.",
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}
