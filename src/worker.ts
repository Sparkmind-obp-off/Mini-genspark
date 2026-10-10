import { AppError, analyzeInput, cap, exportArtifact, readJson, systemPrompt, uuidPattern, validateCitations, validateTask, manualBrief, type Message, type Source } from "./domain";
import { providedSources, workspaceMutation } from "./workspace";
import { policyPage } from "./policies";
import { assertInference, assertSearch, infer, inferenceConfig, search, type ProviderEnv } from "./providers";
export interface D1Statement {
  bind(...values: (string | number | null)[]): D1Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
}
export interface D1Database { prepare(sql: string): D1Statement; batch(statements: D1Statement[]): Promise<unknown[]>; }
export interface Env extends ProviderEnv {
  DB?: D1Database; ASSETS?: { fetch(request: Request): Promise<Response> };
  OWNER_ACCESS_TOKEN?: string; DAILY_REQUEST_LIMIT?: string; SEARCH_MONTHLY_LIMIT?: string; APP_ORIGIN?: string; SUPPORT_EMAIL?: string;
}
type Task = { id: string; conversation_id: string; mode: string; prompt: string; result: string; status: string; provider: string; model: string; error_code: string; sources_json: string; analysis_json: string | null; created_at: string; updated_at: string; input_hash: string };
const ownerId = "workspace-owner";
function sessionCookie(request: Request): string { const u = new URL(request.url); return u.protocol === "http:" && ["localhost", "127.0.0.1"].includes(u.hostname) ? "vestren-session" : "__Host-vestren-session"; }
function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response { return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } }); }
async function hash(value: string): Promise<string> { return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))), b => b.toString(16).padStart(2, "0")).join(""); }
function same(a: string, b: string): boolean { if (!a || a.length !== b.length) return false; let n = 0; for (let i = 0; i < a.length; i++) n |= a.charCodeAt(i) ^ b.charCodeAt(i); return n === 0; }
function database(env: Env): D1Database { if (!env.DB) throw new AppError("DATABASE_NOT_CONFIGURED", 503); return env.DB; }
async function rate(db: D1Database, bucket: string, limit: number): Promise<void> {
  const result = await db.prepare("INSERT INTO request_limits(bucket, request_count) VALUES (?,1) ON CONFLICT(bucket) DO UPDATE SET request_count=request_count+1 WHERE request_count < ? RETURNING request_count").bind(bucket, limit).first();
  if (!result) throw new AppError("RATE_LIMITED", 429, "Rate limit reached; wait for the next time window.");
}
function guardOrigin(request: Request, env: Env): void {
  const expected = env.APP_ORIGIN || new URL(request.url).origin;
  if (request.headers.get("origin") !== expected || request.headers.get("sec-fetch-site") === "cross-site") throw new AppError("ORIGIN_REJECTED", 403);
}
function cookie(request: Request): string { return request.headers.get("cookie")?.split(";").map(s => s.trim()).find(s => s.startsWith(sessionCookie(request) + "="))?.slice(sessionCookie(request).length + 1) ?? ""; }
function setCookie(request: Request, token: string, maxAge: number): string {
  const local = ["localhost", "127.0.0.1"].includes(new URL(request.url).hostname);
  return `${sessionCookie(request)}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${local && new URL(request.url).protocol === "http:" ? "" : "; Secure"}`;
}
async function authenticate(request: Request, env: Env): Promise<void> {
  const token = cookie(request); if (!/^[a-f0-9]{64}$/.test(token)) throw new AppError("UNAUTHORIZED", 401);
  const session = await database(env).prepare("SELECT owner_id FROM sessions WHERE token_hash=? AND expires_at>?").bind(await hash(token), Date.now()).first<{ owner_id: string }>();
  if (!session || session.owner_id !== ownerId) throw new AppError("UNAUTHORIZED", 401);
}
function taskView(row: Task): Record<string, unknown> {
  return { id: row.id, conversationId: row.conversation_id, mode: row.mode, prompt: row.prompt, response: row.result, status: row.status, provider: row.provider, model: row.model, error: row.error_code || null, sources: JSON.parse(row.sources_json), analysis: row.analysis_json ? JSON.parse(row.analysis_json) : null, createdAt: row.created_at, updatedAt: row.updated_at, integration: row.provider === "local-evidence-template" ? "manual-no-live-retrieval" : "live-provider", notice: row.provider === "local-evidence-template" ? "Owner-provided excerpts only; no page was retrieved or independently verified, no AI call was made. Edit and review the structured brief." : row.mode === "research" ? "Model synthesis based on search excerpts, not full-page extraction. Citation checks validate source IDs, not factual entailment. Review evidence independently." : "AI output; review before use. Build does not execute code." };
}
async function cleanup(db: D1Database): Promise<void> {
  // Lazy retention and interrupted-request recovery, no unsupported cron dependency.
  const stale = new Date(Date.now() - 120000).toISOString(); const cutoff = new Date(Date.now() - 30 * 86400000).toISOString();
  await db.batch([
    db.prepare("UPDATE tasks SET status='failed', error_code='INTERRUPTED', updated_at=? WHERE status='running' AND updated_at<?").bind(new Date().toISOString(), stale),
    db.prepare("UPDATE usage_ledger SET status='released',updated_at=? WHERE status='reserved' AND task_id IN(SELECT id FROM tasks WHERE status='failed')").bind(new Date().toISOString()),
    db.prepare("DELETE FROM artifacts WHERE task_id IN (SELECT id FROM tasks WHERE created_at<?)").bind(cutoff),
    db.prepare("DELETE FROM project_sources WHERE provided_at<?").bind(cutoff),
    db.prepare("DELETE FROM tasks WHERE created_at<?").bind(cutoff),
    db.prepare("DELETE FROM task_events WHERE created_at<?").bind(cutoff),
    db.prepare("DELETE FROM conversations WHERE created_at<? AND NOT EXISTS (SELECT 1 FROM tasks WHERE conversation_id=conversations.id)").bind(cutoff),
    db.prepare("DELETE FROM sessions WHERE expires_at<?").bind(Date.now()),
    db.prepare("DELETE FROM request_limits WHERE bucket NOT LIKE ? AND bucket NOT LIKE ? AND bucket NOT LIKE ? AND bucket NOT LIKE ?").bind("login:" + Math.floor(Date.now() / 600000) + ":%", "submit:" + Math.floor(Date.now() / 60000) + ":%", "search:" + new Date().toISOString().slice(0, 7), "workspace:" + Math.floor(Date.now() / 60000) + ":%")
  ]);
}
async function executeTask(request: Request, env: Env): Promise<Response> {
  const db = database(env); const input = validateTask(await readJson(request)); const analysis = analyzeInput(input);
  const key = request.headers.get("idempotency-key") ?? ""; if (!uuidPattern.test(key)) throw new AppError("IDEMPOTENCY_KEY_REQUIRED");
  const inputHash = await hash(JSON.stringify(input));
  const prior = await db.prepare("SELECT * FROM tasks WHERE owner_id=? AND idempotency_key=?").bind(ownerId, key).first<Task>();
  if (prior) { if (prior.input_hash !== inputHash) throw new AppError("IDEMPOTENCY_CONFLICT", 409); return json(taskView(prior), prior.status === "running" ? 202 : 200); }
  const manual = input.workflow === "manual-brief";
  const config = manual ? { provider: "local-evidence-template", model: "evidence-brief-v1" } : assertInference(env);
  if (!manual && input.mode === "research") assertSearch(env);
  await rate(db, "submit:" + Math.floor(Date.now() / 60000) + ":" + ownerId, 4);
  const conversationId = input.conversationId ?? crypto.randomUUID(); const taskId = crypto.randomUUID(); const now = new Date().toISOString();
  if (input.conversationId) {
    const conversation = await db.prepare("SELECT mode FROM conversations WHERE id=? AND owner_id=?").bind(conversationId, ownerId).first<{ mode: string }>();
    if (!conversation) throw new AppError("NOT_FOUND", 404);
    if (conversation.mode !== input.mode) throw new AppError("CONVERSATION_MODE_MISMATCH", 409);
    const count = await db.prepare("SELECT count(*) AS n FROM tasks WHERE conversation_id=? AND owner_id=?").bind(conversationId, ownerId).first<{ n: number }>();
    if ((count?.n ?? 0) >= 30) throw new AppError("CONVERSATION_LIMIT_REACHED", 409, "Maximum 30 turns per conversation. Start a new task; existing work stays saved.");
  }
  try {
    await db.batch([
      db.prepare("INSERT OR IGNORE INTO conversations(id,owner_id,mode,title,created_at) SELECT ?,?,?,?,? WHERE (SELECT count(*) FROM conversations WHERE owner_id=?)<50 OR EXISTS(SELECT 1 FROM conversations WHERE id=? AND owner_id=?)").bind(conversationId, ownerId, input.mode, input.prompt.slice(0, 90), now, ownerId, conversationId, ownerId),
      db.prepare("INSERT INTO tasks(id,owner_id,conversation_id,idempotency_key,input_hash,mode,prompt,status,provider,model,created_at,updated_at,analysis_json) SELECT ?,?,?,?,?,?,?,'running',?,?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM tasks WHERE status='running')").bind(taskId, ownerId, conversationId, key, inputHash, input.mode, input.prompt, config.provider, config.model, now, now, analysis)
    ]);
  } catch {
    const duplicate = await db.prepare("SELECT * FROM tasks WHERE owner_id=? AND idempotency_key=?").bind(ownerId, key).first<Task>();
    if (duplicate && duplicate.input_hash === inputHash) return json(taskView(duplicate), duplicate.status === "running" ? 202 : 200);
    throw new AppError("TASK_RESERVATION_FAILED", 503);
  }
  const inserted = await db.prepare("SELECT id FROM tasks WHERE id=?").bind(taskId).first();
  if (!inserted) {
    if (!input.conversationId) await db.prepare("DELETE FROM conversations WHERE id=? AND NOT EXISTS(SELECT 1 FROM tasks WHERE conversation_id=?)").bind(conversationId, conversationId).run();
    throw new AppError("WORKSPACE_BUSY", 409, "One task may execute at a time. Retry after it completes.");
  }
  let sources: Source[] = [];
  try {
    await db.prepare("INSERT INTO usage_ledger(task_id,owner_id,operation,reserved_units,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?)").bind(taskId, ownerId, manual ? "manual-brief" : "provider", manual ? 0 : 1, "reserved", now, now).run();
    const day = now.slice(0, 10); const limit = cap(env.DAILY_REQUEST_LIMIT, 20, 20);
    const quota = manual ? null : await db.prepare("INSERT INTO daily_usage(usage_date,request_count,updated_at) VALUES (?,1,?) ON CONFLICT(usage_date) DO UPDATE SET request_count=request_count+1,updated_at=excluded.updated_at WHERE request_count<? RETURNING request_count").bind(day, now, limit).first();
    if (!manual && !quota) throw new AppError("DAILY_APP_LIMIT_REACHED", 429, "Daily app cap reached; no paid fallback was attempted.");
    if (manual) {
      sources = await providedSources(db, conversationId, ownerId);
      if (!sources.length) throw new AppError("SOURCE_REQUIRED");
      await db.prepare("UPDATE tasks SET sources_json=? WHERE id=? AND owner_id=?").bind(JSON.stringify(sources), taskId, ownerId).run();
    } else if (input.mode === "research") {
      await rate(db, "search:" + now.slice(0, 7), cap(env.SEARCH_MONTHLY_LIMIT, 100, 100));
      sources = await search(env, input.prompt);
      await db.prepare("UPDATE tasks SET sources_json=? WHERE id=? AND owner_id=?").bind(JSON.stringify(sources), taskId, ownerId).run();
    }
    const context = await db.prepare("SELECT prompt,result FROM tasks WHERE conversation_id=? AND owner_id=? AND status='succeeded' ORDER BY created_at DESC LIMIT 3").bind(conversationId, ownerId).all<{ prompt: string; result: string }>();
    // Server-owned history only; client cannot inject assistant roles/owner IDs.
    const history: Message[] = (input.mode === "research" ? [] : context.results.reverse()).flatMap(t => [{ role: "user" as const, content: t.prompt.slice(0, 2000) }, { role: "assistant" as const, content: t.result.slice(0, 2000) }]);
    const result = manual ? manualBrief(input.prompt, sources) : await infer(env, [{ role: "system", content: systemPrompt(input.mode, sources, analysis) }, ...history, { role: "user", content: input.prompt }]);
    if (!manual && input.mode === "research") validateCitations(result, sources);
    const artifactText = result + (!manual && sources.length ? "\n\n## Retrieved search excerpts\n" + sources.map(s => `[${s.id}] ${s.title}\n${s.url}\nRetrieved: ${s.retrievedAt}\nEvidence: ${s.evidence}`).join("\n\n") : "");
    if (new TextEncoder().encode(artifactText).length > 64000) throw new AppError("ARTIFACT_TOO_LARGE", 413);
    await db.batch([
      db.prepare("UPDATE usage_ledger SET status='consumed',updated_at=? WHERE task_id=? AND owner_id=? AND status='reserved'").bind(new Date().toISOString(), taskId, ownerId),
      db.prepare("INSERT INTO artifacts(id,task_id,owner_id,title,content,created_at) VALUES (?,?,?,?,?,?)").bind(crypto.randomUUID(), taskId, ownerId, input.prompt.slice(0, 90), artifactText, now),
      db.prepare("UPDATE tasks SET status='succeeded',result=?,updated_at=? WHERE id=? AND owner_id=? AND status='running'").bind(result, new Date().toISOString(), taskId, ownerId),
      db.prepare("INSERT INTO task_events(id,created_at,mode,status,provider,model,duration_ms,error_code) VALUES (?,?,?,?,?,?,?,?)").bind(taskId, new Date().toISOString(), input.mode, "succeeded", config.provider, config.model, Date.now() - Date.parse(now), "")
    ]);
  } catch (error) {
    const code = error instanceof AppError ? error.code : "TASK_FAILED";
    await db.batch([
      db.prepare("UPDATE usage_ledger SET status='released',updated_at=? WHERE task_id=? AND owner_id=? AND status='reserved'").bind(new Date().toISOString(), taskId, ownerId),
      db.prepare("UPDATE tasks SET status='failed',error_code=?,updated_at=? WHERE id=? AND owner_id=?").bind(code, new Date().toISOString(), taskId, ownerId),
      db.prepare("INSERT OR IGNORE INTO task_events(id,created_at,mode,status,provider,model,duration_ms,error_code) VALUES (?,?,?,?,?,?,?,?)").bind(taskId, new Date().toISOString(), input.mode, "failed", config.provider, config.model, Date.now() - Date.parse(now), code)
    ]);
    throw new AppError(code, error instanceof AppError ? error.status : 502, "Task failed: " + code + ". Provider reservation released; anti-abuse attempt count (if reserved) remains. No automatic retry or paid fallback. Reopen history to inspect status.");
  }
  const completed = await db.prepare("SELECT * FROM tasks WHERE id=? AND owner_id=?").bind(taskId, ownerId).first<Task>();
  return json(taskView(completed!), 201);
}
async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url); const path = url.pathname.replace(/^\/api\/projects(?=\/|$)/, "/api/conversations");
  const policy = request.method === "GET" ? policyPage(url.pathname, env.SUPPORT_EMAIL) : null;
  if (policy) return policy;
  if (!path.startsWith("/api/")) return env.ASSETS ? env.ASSETS.fetch(request) : new Response("Build assets with npm run build.", { status: 503 });
  if (path === "/api/health" && request.method === "GET") return json({ app: "vestrenhq", status: "owner-only", publicLaunch: false });
  if (!["GET", "POST", "PATCH", "DELETE"].includes(request.method)) throw new AppError("METHOD_NOT_ALLOWED", 405);
  if (request.method !== "GET") guardOrigin(request, env);
  const db = database(env);
  if (path === "/api/session" && request.method === "POST") {
    await db.batch([db.prepare("DELETE FROM request_limits WHERE bucket LIKE 'login:%' AND bucket NOT LIKE ?").bind("login:" + Math.floor(Date.now() / 600000) + ":%"), db.prepare("DELETE FROM sessions WHERE expires_at<?").bind(Date.now())]);
    await rate(db, "login:" + Math.floor(Date.now() / 600000) + ":global", 20);
    await rate(db, "login:" + Math.floor(Date.now() / 600000) + ":" + await hash(request.headers.get("cf-connecting-ip") ?? "local"), 5);
    if (!env.OWNER_ACCESS_TOKEN || (env.OWNER_ACCESS_TOKEN.length < 32 || env.OWNER_ACCESS_TOKEN.length > 256)) throw new AppError("OWNER_TOKEN_NOT_CONFIGURED", 503, "Set an application-specific owner token of at least 32 characters as a server secret.");
    const body = await readJson(request) as { token?: unknown };
    if (!body || typeof body.token !== "string" || body.token.length > 256 || !same(await hash(body.token), await hash(env.OWNER_ACCESS_TOKEN))) throw new AppError("UNAUTHORIZED", 401);
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, "0")).join("");
    await db.prepare("INSERT INTO sessions(token_hash,owner_id,expires_at) VALUES (?,?,?)").bind(await hash(token), ownerId, Date.now() + 8 * 3600000).run();
    return json({ authenticated: true, expiresIn: 28800 }, 200, { "set-cookie": setCookie(request, token, 28800) });
  }
  await authenticate(request, env);
  if (path === "/api/session" && request.method === "GET") return json({ authenticated: true, scope: "single-owner" });
  if (path === "/api/session" && request.method === "DELETE") {
    await db.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await hash(cookie(request))).run();
    return json({ authenticated: false }, 200, { "set-cookie": setCookie(request, "", 0) });
  }
  await cleanup(db);
  const mutation = await workspaceMutation(request, db, ownerId);
  if (mutation) return mutation;
  if (path === "/api/providers" && request.method === "GET") {
    const config = inferenceConfig(env); const date = new Date().toISOString().slice(0, 10);
    const usage = await db.prepare("SELECT request_count FROM daily_usage WHERE usage_date=?").bind(date).first<{ request_count: number }>();
    const searchUsage = await db.prepare("SELECT request_count FROM request_limits WHERE bucket=?").bind("search:" + date.slice(0, 7)).first<{ request_count: number }>();
    return json({ inference: config, search: { provider: "tavily", configured: Boolean(env.TAVILY_API_KEY), enabled: env.TAVILY_FREE_PLAN_CONFIRMED === "true", evidence: "search-excerpts-only" }, usage: { date, used: usage?.request_count ?? 0, limit: cap(env.DAILY_REQUEST_LIMIT, 20, 20), searchMonthUsed: searchUsage?.request_count ?? 0, searchMonthLimit: cap(env.SEARCH_MONTHLY_LIMIT, 100, 100) }, liveVerified: false, scope: "single-owner-private", manualBrief: true, payments: "disabled-not-implemented", costPolicy: "No fallback; owner must verify free-only account quota. Configuration is not a live health test.", disabled: ["firecrawl", "apify", "rapidapi", "daytona", "openrouter", "file-upload", "code-execution"] });
  }
  if ((path === "/api/tasks" || path === "/api/chat") && request.method === "POST") return executeTask(request, env);
  if (path === "/api/conversations" && request.method === "GET") return json((await db.prepare("SELECT id,mode,title,created_at FROM conversations WHERE owner_id=? ORDER BY created_at DESC LIMIT 50").bind(ownerId).all()).results);
  const conversationPath = /^\/api\/conversations\/([a-f0-9-]+)$/.exec(path);
  if (conversationPath && uuidPattern.test(conversationPath[1])) {
    const id = conversationPath[1];
    const found = await db.prepare("SELECT id,title,mode,created_at FROM conversations WHERE id=? AND owner_id=?").bind(id, ownerId).first();
    if (!found) throw new AppError("NOT_FOUND", 404);
    if (request.method === "GET") {
      const rows = (await db.prepare("SELECT * FROM tasks WHERE conversation_id=? AND owner_id=? ORDER BY created_at LIMIT 100").bind(id, ownerId).all<Task>()).results;
      return json({ ...found, id, sources: await providedSources(db, id, ownerId), tasks: rows.map(taskView), artifacts: (await db.prepare("SELECT a.id,a.title,a.created_at,a.updated_at,a.revision,'markdown' AS type FROM artifacts a JOIN tasks t ON t.id=a.task_id WHERE t.conversation_id=? AND a.owner_id=?").bind(id, ownerId).all()).results });
    }
    if (request.method === "DELETE") {
      if (await db.prepare("SELECT id FROM tasks WHERE conversation_id=? AND status='running'").bind(id).first()) throw new AppError("WORKSPACE_BUSY", 409);
      const removed = await db.prepare("DELETE FROM conversations WHERE id=? AND owner_id=? AND NOT EXISTS(SELECT 1 FROM tasks WHERE conversation_id=? AND status='running') RETURNING id").bind(id, ownerId, id).first();
      if (!removed) throw new AppError("WORKSPACE_BUSY", 409);
      return json({ deleted: true, quotaReset: false });
    }
  }
  const taskPath = /^\/api\/tasks\/([a-f0-9-]+)$/.exec(path);
  if (taskPath && request.method === "GET" && uuidPattern.test(taskPath[1])) {
    const row = await db.prepare("SELECT * FROM tasks WHERE id=? AND owner_id=?").bind(taskPath[1], ownerId).first<Task>();
    if (!row) throw new AppError("NOT_FOUND", 404); return json(taskView(row));
  }
  const artifactPath = /^\/api\/artifacts\/([a-f0-9-]+)$/.exec(path);
  if (artifactPath && request.method === "GET" && uuidPattern.test(artifactPath[1])) {
    const artifact = await db.prepare("SELECT id,title,content,created_at,updated_at,revision,'markdown' AS type FROM artifacts WHERE id=? AND owner_id=?").bind(artifactPath[1], ownerId).first<{ id: string; title: string; content: string; created_at: string }>();
    if (!artifact) throw new AppError("NOT_FOUND", 404);
    const format = url.searchParams.get("format"); if (!format) return json(artifact);
    const exported = exportArtifact(artifact.title, artifact.content, format);
    return new Response(exported.content, { headers: { "content-type": exported.mime + "; charset=utf-8", "content-disposition": `attachment; filename="vestren-${artifact.id}.${exported.extension}"`, "cache-control": "no-store", "content-security-policy": "sandbox; default-src 'none'" } });
  }
  throw new AppError("NOT_FOUND", 404);
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const requestId = crypto.randomUUID(); let response: Response;
    try { response = await route(request, env); }
    catch (error) { const safe = error instanceof AppError ? error : new AppError("INTERNAL_ERROR", 500, "Request failed safely. Check runtime bindings and migrations; details are not exposed."); response = json({ error: safe.code, message: safe.message, requestId }, safe.status, safe.status === 429 ? { "retry-after": "60" } : {}); }
    const secured = new Response(response.body, response);
    secured.headers.set("x-request-id", requestId); secured.headers.set("x-content-type-options", "nosniff"); secured.headers.set("referrer-policy", "no-referrer"); secured.headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
    if (!secured.headers.has("content-security-policy")) secured.headers.set("content-security-policy", "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; frame-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
    if (new URL(request.url).protocol === "https:") secured.headers.set("strict-transport-security", "max-age=31536000");
    return secured;
  }
};
