/**
 * AI-powered insights for greenhouse analytics.
 * Uses OpenAI API when VITE_OPENAI_API_KEY is set; otherwise returns null.
 */

import type { AnalyticsResult } from "./analyticsEngine";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY?.trim();
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export interface AIInsight {
  summary: string;
  recommendations: string[];
  riskLevel: "low" | "medium" | "high";
  predictedImpact?: string;
}

export async function fetchAIInsights(
  analytics: AnalyticsResult,
  sensorData: { temp: number; humidity: number; soilMoisture: number }
): Promise<AIInsight | null> {
  if (!OPENAI_API_KEY) return null;

  const prompt = `You are an expert agricultural data analyst for smart greenhouses. Analyze these sensor readings and computed analytics. Respond with a JSON object containing: "summary" (1-2 sentences), "recommendations" (array of 2-4 actionable strings), "riskLevel" ("low"|"medium"|"high"), and optionally "predictedImpact" (1 sentence if risk is medium or high).

Current readings:
- Temperature: ${sensorData.temp}°C
- Humidity: ${sensorData.humidity}%
- Soil moisture: ${sensorData.soilMoisture}%

Computed analytics:
- Plant health score: ${analytics.plantHealthScore}/100
- Irrigation need: ${analytics.irrigationNeedScore}/100
- Climate risk: ${analytics.climateRiskScore}/100
- VPD (Vapor Pressure Deficit): ${analytics.vpd} kPa (${analytics.vpdStatus})
- Trend: ${analytics.trend}
- Status: Temp ${analytics.metrics.tempStatus}, Humidity ${analytics.metrics.humidityStatus}, Soil ${analytics.metrics.soilStatus}

Respond ONLY with valid JSON, no markdown or extra text.`;

  try {
    const res = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 400,
      }),
    });

    if (!res.ok) {
      console.warn("OpenAI API error:", res.status, await res.text());
      return null;
    }

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content.trim().replace(/^```json?\s*|\s*```$/g, "")) as AIInsight;
    return parsed;
  } catch (err) {
    console.warn("AI insights fetch failed:", err);
    return null;
  }
}

export function isAIConfigured(): boolean {
  return Boolean(OPENAI_API_KEY);
}
