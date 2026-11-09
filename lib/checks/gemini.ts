import { ApiError, GoogleGenAI, ThinkingLevel } from "@google/genai";

export type GeminiResult =
  | { ok: true; text: string }
  | {
      ok: false;
      error: "model_not_configured" | "model_request_failed" | "model_timeout";
    };

const DEFAULT_MODEL = "gemini-3.8-flash";
const MODEL_TIMEOUT_MS = 90_000;
const MAX_OUTPUT_TOKENS = 16_384;
const MAX_ATTEMPTS = 3;

type GeminiConfig = {
  apiKey: string;
  model: string;
};

function getGeminiConfig(): GeminiConfig | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const configuredModel = process.env.PLUMBCODE_MODEL?.trim();
  const model = (configuredModel || DEFAULT_MODEL)
    .replace(/^["']|["']$/g, "")
    .split(/\s+#/)[0]
    .trim();

  if (!model) return null;

  return { apiKey, model };
}

function isTimeout(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  );
}

export async function generateJson({
  prompt,
  jsonSchema,
  systemInstruction,
}: {
  prompt: string;
  jsonSchema: unknown;
  systemInstruction: string;
}): Promise<GeminiResult> {
  const config = getGeminiConfig();
  if (!config) return { ok: false, error: "model_not_configured" };

  try {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });

    const response = await ai.models.generateContent({
      model: config.model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseJsonSchema: jsonSchema,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        // Reviewing a diff is reasoning-light, and thought tokens count
        // against maxOutputTokens.
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        abortSignal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
        httpOptions: {
          retryOptions: { attempts: MAX_ATTEMPTS },
        },
      },
    });

    return { ok: true, text: response.text ?? "" };
  } catch (error) {
    if (isTimeout(error)) {
      console.error("Plumbcode model: request timed out");
      return { ok: false, error: "model_timeout" };
    }

    if (error instanceof ApiError) {
      console.error("Plumbcode model: Gemini returned an error", {
        status: error.status,
      });
      return { ok: false, error: "model_request_failed" };
    }

    console.error(
      "Plumbcode model: request failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return { ok: false, error: "model_request_failed" };
  }
}
