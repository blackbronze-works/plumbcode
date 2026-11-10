import { ApiError, GoogleGenAI, ThinkingLevel } from "@google/genai";

export type GeminiResult =
  | { ok: true; text: string }
  | {
      ok: false;
      error: "model_not_configured" | "model_request_failed" | "model_timeout";
    };

// Measured fastest first. Re-test with scripts/gemini-ping.mjs when models change.
const DEFAULT_MODEL = "gemini-3.5-flash-lite";
const FALLBACK_MODELS = ["gemini-3.6-flash", "gemini-3.5-flash"];
const MODEL_TIMEOUT_MS = 40_000;
const MAX_OUTPUT_TOKENS = 16_384;
const MAX_ATTEMPTS = 1;

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
  if (typeof error !== "object" || error === null) return false;

  const name = (error as { name?: unknown }).name;
  return name === "TimeoutError" || name === "AbortError";
}

// Overloaded (429/5xx) or retired (404) models should fall through to the
// next one instead of failing the whole review.
function shouldTryNextModel(error: ApiError): boolean {
  return error.status === 404 || error.status === 429 || error.status >= 500;
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

  const ai = new GoogleGenAI({ apiKey: config.apiKey });
  const models = [
    config.model,
    ...FALLBACK_MODELS.filter((model) => model !== config.model),
  ];

  let lastError: "model_request_failed" | "model_timeout" =
    "model_request_failed";

  for (const model of models) {
    const started = Date.now();
    const elapsed = () => `${Date.now() - started}ms`;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseJsonSchema: jsonSchema,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          abortSignal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
          httpOptions: {
            retryOptions: { attempts: MAX_ATTEMPTS },
          },
        },
      });

      console.info(
        `Plumbcode model: ${model} answered in ${elapsed()} (prompt ${prompt.length} chars)`,
      );
      return { ok: true, text: response.text ?? "" };
    } catch (error) {
      if (isTimeout(error)) {
        console.warn(
          `Plumbcode model: ${model} timed out after ${elapsed()} (prompt ${prompt.length} chars)`,
        );
        lastError = "model_timeout";
        continue;
      }

      if (error instanceof ApiError) {
        console.error("Plumbcode model: Gemini returned an error", {
          model,
          status: error.status,
          after: elapsed(),
        });

        lastError = "model_request_failed";
        if (shouldTryNextModel(error)) continue;

        return { ok: false, error: "model_request_failed" };
      }

      console.error(
        `Plumbcode model: ${model} request failed after ${elapsed()}`,
        error instanceof Error ? error.message : "unknown error",
      );
      lastError = "model_request_failed";
    }
  }

  console.error("Plumbcode model: all configured models failed");
  return { ok: false, error: lastError };
}
