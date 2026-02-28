/**
 * AI Insights Stream API
 * Server-Sent Events (SSE) endpoint for streaming Qwen AI responses
 */

import { NextRequest } from "next/server";

const encoder = new TextEncoder();

/**
 * GET /api/insights/stream
 * Streams AI-generated insights using SSE
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userData = searchParams.get("data");

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const apiKey = process.env.QWEN_API_KEY;
        const apiEndpoint =
          process.env.QWEN_API_ENDPOINT ||
          "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation";

        if (!apiKey) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message: "API key not configured" })}\n\n`
            )
          );
          controller.close();
          return;
        }

        // Build prompt
        const prompt = buildStreamPrompt(userData);

        // Call Qwen API with SSE enabled
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "X-DashScope-SSE": "enable", // Enable SSE for streaming
          },
          body: JSON.stringify({
            model: "qwen-max",
            input: {
              messages: [
                {
                  role: "system",
                  content:
                    "You are a friendly, expert financial advisor for Duitly. Provide clear, actionable, and encouraging advice in a streaming format.",
                },
                {
                  role: "user",
                  content: prompt,
                },
              ],
            },
            parameters: {
              temperature: 0.7,
              max_tokens: 500,
              enable_search: true,
            },
          }),
        });

        if (!response.ok) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message: `API error: ${response.status}` })}\n\n`
            )
          );
          controller.close();
          return;
        }

        // Stream the response
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "start" })}\n\n`)
        );

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += new TextDecoder().decode(value);

          // Process SSE messages from Qwen
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data:")) {
              const data = line.slice(5).trim();
              if (data === "[DONE]") {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
                );
                controller.close();
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content =
                  parsed.output?.choices?.[0]?.message?.content || "";

                if (content) {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ type: "chunk", content })}\n\n`
                    )
                  );
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
        );
        controller.close();
      } catch (error) {
        console.error("SSE stream error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: "Stream error" })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}

/**
 * Build prompt for streaming insight
 */
function buildStreamPrompt(userData: string | null): string {
  const now = new Date();
  const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" });
  const timeOfDay =
    now.getHours() < 12 ? "morning" : now.getHours() < 18 ? "afternoon" : "evening";

  let context = `Good ${timeOfDay}! It's ${dayOfWeek}. `;

  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      if (parsed.investmentPath) {
        context += `User follows a ${parsed.investmentPath} investment strategy. `;
      }
      if (parsed.goals && parsed.goals.length > 0) {
        context += `Their financial goals include: ${parsed.goals
          .map((g: { name: string }) => g.name)
          .join(", ")}. `;
      }
      if (parsed.incomeSources && parsed.incomeSources.length > 0) {
        const total = parsed.incomeSources.reduce(
          (sum: number, s: { amount: number }) => sum + s.amount,
          0
        );
        context += `Monthly income is approximately $${total}. `;
      }
    } catch {
      // Invalid JSON, use generic prompt
    }
  }

  context +=
    "Provide a brief, actionable financial tip or insight relevant to their situation. Stream your response naturally.";

  return context;
}
