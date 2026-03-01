/**
 * Smart Budgeting Server Actions
 * AI-powered budget generation and allocation using Qwen API & Supabase
 */

"use server";

import { OnboardingData } from "@/types/onboarding";
import {
  AIBudgetResponse,
  BudgetSuggestion,
  CategoryAllocation,
  AllocationStatus,
} from "@/types/dashboard";
import { optimizeBudget as aiOptimizeBudget } from "@/lib/qwen-client";
import {
  getCategoryAllocations,
  createCategoryAllocation,
  getIncomeSources,
  getAllocationStatus as dbGetAllocationStatus,
} from "@/lib/database";

interface GenerateBudgetParams {
  totalIncome: number;
  goals?: Array<{ name: string; targetAmount: number; priority: string }>;
  existingCategories?: CategoryAllocation[];
}

interface BudgetAllocationResult {
  success: boolean;
  response?: AIBudgetResponse;
  error?: string;
}

/**
 * Generate AI-powered budget allocation based on income and goals
 */
export async function generateAIBudget(
  params: GenerateBudgetParams
): Promise<BudgetAllocationResult> {
  try {
    const prompt = buildBudgetGenerationPrompt(params);
    const aiResponse = await callQwenAPI(prompt);

    // Parse AI response into structured budget suggestions
    const suggestions = parseAISuggestions(aiResponse, params.totalIncome);
    const totalAllocated = suggestions.reduce(
      (sum, s) => sum + s.suggestedAmount,
      0
    );
    const remainingAmount = params.totalIncome - totalAllocated;

    let status: AIBudgetResponse["status"] = "balanced";
    if (remainingAmount < 0) {
      status = "over-allocated";
    } else if (remainingAmount > params.totalIncome * 0.1) {
      status = "under-allocated";
    }

    const insight = generateAllocationInsight(
      params.totalIncome,
      totalAllocated,
      remainingAmount,
      suggestions
    );

    return {
      success: true,
      response: {
        suggestions,
        totalAllocated,
        remainingAmount,
        insight,
        status,
      },
    };
  } catch (error) {
    console.error("Failed to generate AI budget:", error);
    return {
      success: true,
      response: generateFallbackBudget(params.totalIncome),
    };
  }
}

/**
 * Get allocation insight and status from database
 */
export async function getAllocationInsight(
  userId: string,
  totalIncome?: number,
  totalAllocated?: number,
  categories?: CategoryAllocation[]
): Promise<{ status: AllocationStatus | null; insight: string }> {
  // Try to get from database first
  if (userId) {
    const dbStatus = await dbGetAllocationStatus(userId) as unknown as AllocationStatus | null;
    if (dbStatus) {
      const insight = await generateDynamicInsight(
        dbStatus.totalIncome || 0,
        dbStatus.totalAllocated || 0,
        dbStatus.remainingToAllocate || 0,
        categories || []
      );
      return {
        status: dbStatus,
        insight,
      };
    }
  }

  // Fallback to calculation
  const totalInc = totalIncome || 0;
  const totalAlloc = totalAllocated || 0;
  const remainingToAllocate = totalInc - totalAlloc;
  const allocationPercentage = totalInc > 0 ? (totalAlloc / totalInc) * 100 : 0;

  let status: AllocationStatus["status"] = "balanced";
  let message: string | undefined;

  if (allocationPercentage >= 95 && allocationPercentage <= 105) {
    status = "balanced";
    message = "Budget is well-balanced!";
  } else if (allocationPercentage < 95) {
    const unallocatedPercent = 100 - allocationPercentage;
    if (unallocatedPercent > 30) {
      status = "critical";
      message = `${unallocatedPercent.toFixed(0)}% of income not allocated`;
    } else {
      status = "warning";
      message = `${unallocatedPercent.toFixed(0)}% of income not allocated`;
    }
  } else {
    status = "critical";
    message = "Over-allocated! Reduce spending in some categories.";
  }

  const insight = await generateDynamicInsight(
    totalInc,
    totalAlloc,
    remainingToAllocate,
    categories || []
  );

  return {
    status: {
      totalIncome: totalInc,
      totalAllocated: totalAlloc,
      remainingToAllocate,
      allocationPercentage,
      status,
      message,
    },
    insight,
  };
}

/**
 * Optimize existing budget allocation
 */
export async function optimizeBudget(
  currentAllocations: CategoryAllocation[],
  totalIncome: number
): Promise<BudgetAllocationResult> {
  try {
    const prompt = buildOptimizationPrompt(currentAllocations, totalIncome);
    const aiResponse = await callQwenAPI(prompt);

    const suggestions = parseAISuggestions(aiResponse, totalIncome);
    const totalAllocated = suggestions.reduce(
      (sum, s) => sum + s.suggestedAmount,
      0
    );
    const remainingAmount = totalIncome - totalAllocated;

    return {
      success: true,
      response: {
        suggestions,
        totalAllocated,
        remainingAmount,
        insight: "Budget optimized based on your spending patterns and goals.",
        status: remainingAmount === 0 ? "balanced" : "under-allocated",
      },
    };
  } catch (error) {
    console.error("Failed to optimize budget:", error);
    return {
      success: false,
      error: "Failed to optimize budget. Please try again.",
    };
  }
}

/**
 * Build prompt for budget generation
 */
function buildBudgetGenerationPrompt(params: GenerateBudgetParams): string {
  const { totalIncome, goals } = params;

  let prompt = `You are an expert financial advisor for Duitly, an AI-powered budgeting app.

USER FINANCIAL PROFILE:
- Total Monthly Income: $${totalIncome.toFixed(2)}
`;

  if (goals && goals.length > 0) {
    prompt += `- Financial Goals: ${goals.map((g) => `${g.name} ($${g.targetAmount})`).join(", ")}\n`;
  }

  prompt += `
TASK:
Generate a recommended budget allocation using the 50/30/20 rule as a baseline:
- 50% for Needs (Rent, Utilities, Food, Transport)
- 30% for Wants (Entertainment, Shopping)
- 20% for Savings & Debt Repayment

SUGGESTED CATEGORIES:
1. Rent & Utilities (Essential)
2. Food and Beverage (Essential)
3. Public Transport (Essential)
4. Healthcare (Essential)
5. Entertainment (Non-Essential)
6. Shopping (Non-Essential)
7. Emergency Fund (Savings)
8. Investment (Long-term Goals)

Respond in this EXACT JSON format (no additional text):
{
  "allocations": [
    {
      "category": "category name",
      "amount": suggested amount in USD,
      "percentage": percentage of income,
      "reasoning": "brief explanation"
    }
  ],
  "insight": "overall budget insight considering goals"
}

Ensure the total allocation is close to 100% of income. Prioritize essential categories first.`;

  return prompt;
}

/**
 * Build prompt for budget optimization
 */
function buildOptimizationPrompt(
  allocations: CategoryAllocation[],
  totalIncome: number
): string {
  const currentSpend = allocations
    .map(
      (a) =>
        `- ${a.name}: $${a.allocatedAmount} allocated, $${a.spentAmount} spent (${a.impactIndicator} impact)`
    )
    .join("\n");

  return `You are an expert financial optimizer for Duitly.

CURRENT BUDGET ALLOCATION:
Total Income: $${totalIncome}
${currentSpend}

TASK:
Analyze the current allocation and suggest optimizations:
1. Identify categories that are over or under-budget
2. Reallocate funds to better align with the 50/30/20 rule
3. Consider impact indicators (high impact categories need more funding)
4. Ensure essential categories are prioritized

Respond in this EXACT JSON format:
{
  "allocations": [
    {
      "category": "category name",
      "amount": optimized amount in USD,
      "percentage": percentage of income,
      "reasoning": "why this amount is optimal"
    }
  ],
  "insight": "key optimization insight"
}`;
}

/**
 * Generate dynamic insight based on allocation status
 */
async function generateDynamicInsight(
  totalIncome: number,
  totalAllocated: number,
  remaining: number,
  categories: CategoryAllocation[]
): Promise<string> {
  const highImpactCategories = categories.filter(
    (c) => c.impactIndicator === "high"
  );
  const overBudgetCategories = categories.filter(
    (c) => c.spentAmount > c.allocatedAmount
  );

  if (overBudgetCategories.length > 0) {
    return `Alert: You've exceeded budget in ${overBudgetCategories.length} category(ies). Consider reducing spending in: ${overBudgetCategories.map((c) => c.name).join(", ")}.`;
  }

  if (remaining > totalIncome * 0.3) {
    return `You have $${remaining.toFixed(2)} unallocated. Consider increasing your emergency fund or investment allocations to maximize long-term growth.`;
  }

  if (highImpactCategories.length > 0) {
    return `Your high-impact categories (${highImpactCategories.map((c) => c.name).join(", ")}) are well-funded. This aligns with your long-term savings targets.`;
  }

  return "Your budget allocation looks balanced. Continue monitoring your spending to stay on track.";
}

/**
 * Parse AI response into structured suggestions
 * Handles markdown code blocks and other formatting issues
 */
function parseAISuggestions(
  aiResponse: string,
  totalIncome: number
): BudgetSuggestion[] {
  try {
    if (!aiResponse || typeof aiResponse !== 'string') {
      console.warn("Empty or invalid AI response");
      return generateFallbackSuggestions(totalIncome);
    }

    // Remove markdown code blocks if present
    let cleanResponse = aiResponse.trim();
    
    // Remove ```json ... ``` wrappers
    cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Remove ``` ... ``` wrappers (without language tag)
    cleanResponse = cleanResponse.replace(/```\s*/g, '');
    
    // Try to extract JSON from response
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn("No JSON found in AI response, using fallback");
      return generateFallbackSuggestions(totalIncome);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const allocations = parsed.allocations || parsed.suggestions || [];

    return allocations.map((alloc: Record<string, unknown>) => ({
      category: String(alloc.category || alloc.name || "Other"),
      suggestedAmount: Number(alloc.amount || alloc.suggestedAmount || 0),
      percentage: Number(alloc.percentage || 0),
      reasoning: String(
        alloc.reasoning || alloc.reason || "Recommended allocation"
      ),
    }));
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    console.warn("AI response was:", aiResponse);
    return generateFallbackSuggestions(totalIncome);
  }
}

/**
 * Generate fallback budget suggestions (50/30/20 rule)
 */
function generateFallbackSuggestions(totalIncome: number): BudgetSuggestion[] {
  const needs = totalIncome * 0.5;
  const wants = totalIncome * 0.3;
  const savings = totalIncome * 0.2;

  return [
    {
      category: "Rent & Utilities",
      suggestedAmount: needs * 0.6,
      percentage: 30,
      reasoning: "Essential housing costs should be ~30% of income",
    },
    {
      category: "Food and Beverage",
      suggestedAmount: needs * 0.3,
      percentage: 15,
      reasoning: "Groceries and dining out allocation",
    },
    {
      category: "Public Transport",
      suggestedAmount: needs * 0.1,
      percentage: 5,
      reasoning: "Transportation costs for commuting",
    },
    {
      category: "Entertainment",
      suggestedAmount: wants * 0.5,
      percentage: 15,
      reasoning: "Leisure and recreational activities",
    },
    {
      category: "Shopping",
      suggestedAmount: wants * 0.5,
      percentage: 15,
      reasoning: "Personal shopping and non-essentials",
    },
    {
      category: "Emergency Fund",
      suggestedAmount: savings * 0.5,
      percentage: 10,
      reasoning: "Build 3-6 months of expenses",
    },
    {
      category: "Investment",
      suggestedAmount: savings * 0.5,
      percentage: 10,
      reasoning: "Long-term wealth building",
    },
  ];
}

/**
 * Generate fallback budget response
 */
function generateFallbackBudget(totalIncome: number): AIBudgetResponse {
  const suggestions = generateFallbackSuggestions(totalIncome);
  const totalAllocated = suggestions.reduce(
    (sum, s) => sum + s.suggestedAmount,
    0
  );

  return {
    suggestions,
    totalAllocated,
    remainingAmount: totalIncome - totalAllocated,
    insight:
      "Budget generated using the 50/30/20 rule. Adjust based on your personal needs and goals.",
    status: "balanced",
  };
}

/**
 * Generate allocation insight message
 */
function generateAllocationInsight(
  totalIncome: number,
  totalAllocated: number,
  remaining: number,
  suggestions: BudgetSuggestion[]
): string {
  const essentialCategories = suggestions.filter((s) =>
    ["Rent & Utilities", "Food and Beverage", "Public Transport"].includes(
      s.category
    )
  );
  const essentialTotal = essentialCategories.reduce(
    (sum, s) => sum + s.suggestedAmount,
    0
  );
  const essentialPercentage = (essentialTotal / totalIncome) * 100;

  if (remaining > totalIncome * 0.2) {
    return `You have $${remaining.toFixed(2)} remaining to allocate. Consider increasing savings or investment allocations to maximize your financial growth.`;
  }

  if (essentialPercentage > 60) {
    return `Essential categories take ${essentialPercentage.toFixed(0)}% of income. Look for opportunities to reduce fixed costs to free up more for savings.`;
  }

  return "Great job! Your budget is well-balanced across essential, discretionary, and savings categories.";
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
    console.warn("QWEN_API_KEY not configured, using fallback");
    return JSON.stringify({
      allocations: [],
      insight: "AI budget generation unavailable. Using fallback allocations based on the 50/30/20 rule.",
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
        model: "qwen-max",
        input: {
          messages: [
            {
              role: "system",
              content:
                "You are a precise financial advisor. Always respond with valid JSON only, no markdown or additional text.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        },
        parameters: {
          temperature: 0.7,
          max_tokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(`Qwen API error (${response.status}):`, errorText);
      
      // Return fallback instead of throwing
      return JSON.stringify({
        allocations: [],
        insight: `API error (${response.status}). Using fallback allocations.`,
      });
    }

    const result = await response.json();

    if (result.output?.text) {
      return result.output.text.trim();
    } else if (result.output?.choices?.[0]?.message?.content) {
      return result.output.choices[0].message.content.trim();
    } else {
      console.warn("Unexpected Qwen API response format:", result);
      return JSON.stringify({
        allocations: [],
        insight: "Unable to generate budget at this time. Using fallback.",
      });
    }
  } catch (error) {
    console.error("Qwen API call failed:", error);
    // Return fallback on any error
    return JSON.stringify({
      allocations: [],
      insight: "AI service unavailable. Using fallback allocations.",
    });
  }
}
