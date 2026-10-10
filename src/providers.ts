import { AppError, normalizeSources, readTextLimited, type Message, type Source } from "./domain";
export interface ProviderEnv {
  AI?: { run(model: string, input: { messages: Message[]; max_tokens: number; temperature: number }): Promise<{ response?: string }> };
  LLM_PROVIDER?: string; AI_MODEL?: string; GROQ_MODEL?: string; GROQ_API_KEY?: string;
  FREE_PLAN_CONFIRMED?: string; GROQ_FREE_PLAN_CONFIRMED?: string;
  TAVILY_API_KEY?: string; TAVILY_FREE_PLAN_CONFIRMED?: string;
}
export const cfModel = "@cf/meta/llama-3.1-8b-instruct-fp8-fast";
export const groqModels = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"];
export function inferenceConfig(env: ProviderEnv): { provider: string; model: string; configured: boolean; enabled: boolean } {
  const provider = env.LLM_PROVIDER ?? "cloudflare";
  if (provider === "cloudflare") return { provider, model: env.AI_MODEL ?? cfModel, configured: Boolean(env.AI), enabled: env.FREE_PLAN_CONFIRMED === "true" && (env.AI_MODEL ?? cfModel) === cfModel };
  if (provider === "groq") return { provider, model: env.GROQ_MODEL ?? groqModels[0], configured: Boolean(env.GROQ_API_KEY), enabled: env.GROQ_FREE_PLAN_CONFIRMED === "true" && groqModels.includes(env.GROQ_MODEL ?? groqModels[0]) };
  return { provider: "unsupported", model: "", configured: false, enabled: false };
}
export function assertInference(env: ProviderEnv): ReturnType<typeof inferenceConfig> {
  const config = inferenceConfig(env);
  if (!config.enabled) throw new AppError("FREE_PLAN_NOT_CONFIRMED", 503, "Provider disabled. Verify selected account/model free quota and disable paid overage before enabling its runtime policy. No paid fallback was attempted.");
  if (!config.configured) throw new AppError("PROVIDER_NOT_CONFIGURED", 503);
  return config;
}
async function deadline<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try { return await Promise.race([operation, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new AppError("PROVIDER_TIMEOUT", 504)), timeoutMs); })]); }
  finally { clearTimeout(timer); }
}
async function remoteJson(url: string, key: string, payload: unknown): Promise<unknown> {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 18000);
  try {
    const response = await fetch(url, { method: "POST", redirect: "error", signal: controller.signal, headers: { "content-type": "application/json", authorization: "Bearer " + key }, body: JSON.stringify(payload) });
    if (!response.ok) { await response.body?.cancel(); throw new AppError(response.status === 429 || response.status === 432 ? "PROVIDER_QUOTA_EXHAUSTED" : "PROVIDER_REQUEST_FAILED", response.status === 429 || response.status === 432 ? 429 : 502); }
    const text = await readTextLimited(response, 100000);
    try { return JSON.parse(text); } catch { throw new AppError("INVALID_PROVIDER_RESPONSE", 502); }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(controller.signal.aborted ? "PROVIDER_TIMEOUT" : "PROVIDER_REQUEST_FAILED", controller.signal.aborted ? 504 : 502);
  } finally { clearTimeout(timer); }
}
export async function infer(env: ProviderEnv, messages: Message[]): Promise<string> {
  const { provider, model } = assertInference(env);
  let text: unknown;
  try {
    if (provider === "cloudflare") text = (await deadline(env.AI!.run(model, { messages, max_tokens: 900, temperature: 0.25 }), 22000)).response;
    else {
      const result = await remoteJson("https://api.groq.com/openai/v1/chat/completions", env.GROQ_API_KEY!, { model, messages, max_tokens: 900, temperature: 0.25 }) as { choices?: { message?: { content?: unknown } }[] };
      text = result?.choices?.[0]?.message?.content;
    }
  } catch (error) { if (error instanceof AppError) throw error; throw new AppError("PROVIDER_REQUEST_FAILED", 502, "Model failed; no paid fallback was attempted."); }
  if (typeof text !== "string" || !text.trim()) throw new AppError("EMPTY_MODEL_RESPONSE", 502);
  if (text.length > 16000) throw new AppError("OUTPUT_TOO_LARGE", 502);
  return text.trim();
}
export function assertSearch(env: ProviderEnv): void {
  if (!env.TAVILY_API_KEY || env.TAVILY_FREE_PLAN_CONFIRMED !== "true") throw new AppError("SEARCH_NOT_CONFIGURED", 503, "Research requires TAVILY_API_KEY and confirmed no-overage free quota. Search excerpts only; no direct page extraction is enabled.");
}
export async function search(env: ProviderEnv, query: string): Promise<Source[]> {
  assertSearch(env);
  const result = await remoteJson("https://api.tavily.com/search", env.TAVILY_API_KEY!, { query: query.slice(0, 400), search_depth: "basic", max_results: 5, include_answer: false, include_raw_content: false, auto_parameters: false }) as { results?: unknown };
  return normalizeSources(result?.results);
}
