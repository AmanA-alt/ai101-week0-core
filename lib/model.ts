export class ConfigError extends Error {}
export class ModelError extends Error {}

export class RateLimitError extends Error {
  constructor(public retryAfterSeconds: number) {
    super("rate limited");
    this.name = "RateLimitError";
  }
}

type Provider = "gemini" | "groq";

function readConfig() {
  const provider = (process.env.MODEL_PROVIDER ?? "gemini") as Provider;
  const modelId = process.env.MODEL_ID;
  const key =
    provider === "groq" ? process.env.GROQ_API_KEY : process.env.GEMINI_API_KEY;

  if (!modelId) throw new ConfigError("MODEL_ID is missing from the environment variables.");
  if (!key) throw new ConfigError(`The ${provider} API key is missing.`);

  return { provider, modelId, key };
}

function retryAfter(res: Response): number {
  const header = res.headers.get("retry-after");
  const parsed = header ? Number.parseInt(header, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 60;
}

async function callGemini(modelId: string, key: string, prompt: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, responseMimeType: "application/json" },
      }),
    }
  );

  if (res.status === 429) throw new RateLimitError(retryAfter(res));
  if (!res.ok) throw new ModelError(`Gemini returned ${res.status}`);

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map((p: { text?: string }) => p.text ?? "").join("");
  if (!text) throw new ModelError("Gemini returned an empty response.");
  return text;
}

async function callGroq(modelId: string, key: string, prompt: string) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      response_format: { type: "json_object" },
    }),
  });

  if (res.status === 429) throw new RateLimitError(retryAfter(res));
  if (!res.ok) throw new ModelError(`Groq returned ${res.status}`);

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new ModelError("Groq returned an empty response.");
  return text;
}

export async function callModel(prompt: string): Promise<string> {
  const { provider, modelId, key } = readConfig();
  return provider === "groq"
    ? callGroq(modelId, key, prompt)
    : callGemini(modelId, key, prompt);
}
