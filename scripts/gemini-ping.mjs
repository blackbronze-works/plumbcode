import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const models = process.argv.slice(2);
const filler = "const x = 1;\n".repeat(2000); // roughly 26k characters

for (const model of models) {
  const start = Date.now();
  try {
    const res = await ai.models.generateContent({
      model,
      contents: `Summarize this code in one sentence as JSON {"summary": string}.\n${filler}`,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        abortSignal: AbortSignal.timeout(60_000),
      },
    });
    console.log(model, "ok", `${Date.now() - start}ms`, res.text?.slice(0, 60));
  } catch (e) {
    console.log(model, "FAILED", `${Date.now() - start}ms`, e.status ?? e.name, String(e.message).slice(0, 80));
  }
}
