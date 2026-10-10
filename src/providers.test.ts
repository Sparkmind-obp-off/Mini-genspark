import { afterEach, describe, expect, it, vi } from "vitest";
import { cfModel, infer, inferenceConfig, search } from "./providers";
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
const messages = [{ role: "user" as const, content: "Hello" }];
describe("provider-neutral inference (MOCKED)", () => {
  it("fails closed for absent policy, binding and unsupported models", async () => {
    await expect(infer({}, messages)).rejects.toMatchObject({ code: "FREE_PLAN_NOT_CONFIRMED" });
    await expect(infer({ FREE_PLAN_CONFIRMED: "true" }, messages)).rejects.toMatchObject({ code: "PROVIDER_NOT_CONFIGURED" });
    expect(inferenceConfig({ AI_MODEL: "paid-model", FREE_PLAN_CONFIRMED: "true" }).enabled).toBe(false);
    expect(inferenceConfig({ LLM_PROVIDER: "unrecognized" }).configured).toBe(false);
  });
  it("normalizes Workers AI success and empty/error outputs", async () => {
    const run = vi.fn().mockResolvedValue({ response: " bounded answer " });
    expect(await infer({ AI: { run }, FREE_PLAN_CONFIRMED: "true" }, messages)).toBe("bounded answer");
    expect(run.mock.calls[0][0]).toBe(cfModel);
    run.mockResolvedValueOnce({ response: "" }); await expect(infer({ AI: { run }, FREE_PLAN_CONFIRMED: "true" }, messages)).rejects.toMatchObject({ code: "EMPTY_MODEL_RESPONSE" });
    run.mockRejectedValueOnce(new Error("sensitive upstream error")); await expect(infer({ AI: { run }, FREE_PLAN_CONFIRMED: "true" }, messages)).rejects.toMatchObject({ code: "PROVIDER_REQUEST_FAILED" });
  });
  it("times out binding calls without retry or fallback", async () => {
    vi.useFakeTimers(); const run = vi.fn(() => new Promise<never>(() => {}));
    const result = expect(infer({ AI: { run }, FREE_PLAN_CONFIRMED: "true" }, messages)).rejects.toMatchObject({ code: "PROVIDER_TIMEOUT" });
    await vi.advanceTimersByTimeAsync(22001); await result; expect(run).toHaveBeenCalledTimes(1);
  });
  it("uses explicitly selected Groq, normalizes quota failure and never falls back", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ choices: [{ message: { content: "Groq fixture" } }] }))).mockResolvedValueOnce(new Response("upstream", { status: 429 })); vi.stubGlobal("fetch", fetcher);
    const env = { LLM_PROVIDER: "groq", GROQ_API_KEY: "mock-key-not-live", GROQ_FREE_PLAN_CONFIRMED: "true" };
    expect(await infer(env, messages)).toBe("Groq fixture"); await expect(infer(env, messages)).rejects.toMatchObject({ code: "PROVIDER_QUOTA_EXHAUSTED" }); expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
describe("Tavily search (MOCKED)", () => {
  it("requires key plus explicit free-only gate", async () => { await expect(search({ TAVILY_API_KEY: "mock-only" }, "query")).rejects.toMatchObject({ code: "SEARCH_NOT_CONFIGURED" }); });
  it("bounds basic search and normalizes evidence", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ results: [{ title: "Fixture", url: "https://example.org", content: "fixture excerpt" }] }))); vi.stubGlobal("fetch", fetcher);
    expect(await search({ TAVILY_API_KEY: "mock-only", TAVILY_FREE_PLAN_CONFIRMED: "true" }, "x".repeat(1000))).toHaveLength(1);
    const payload = JSON.parse(fetcher.mock.calls[0][1].body); expect(payload.search_depth).toBe("basic"); expect(payload.max_results).toBe(5); expect(payload.query.length).toBe(400); expect(payload.auto_parameters).toBe(false);
  });
  it("rejects quota/no evidence/invalid provider JSON without retry", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response("sensitive", { status: 432 })).mockResolvedValueOnce(new Response('{"results":[]}')).mockResolvedValueOnce(new Response("invalid json")); vi.stubGlobal("fetch", fetcher);
    const env = { TAVILY_API_KEY: "mock-only", TAVILY_FREE_PLAN_CONFIRMED: "true" };
    await expect(search(env, "q")).rejects.toMatchObject({ code: "PROVIDER_QUOTA_EXHAUSTED" }); await expect(search(env, "q")).rejects.toMatchObject({ code: "NO_RETRIEVED_EVIDENCE" }); await expect(search(env, "q")).rejects.toMatchObject({ code: "INVALID_PROVIDER_RESPONSE" }); expect(fetcher).toHaveBeenCalledTimes(3);
  });
});
