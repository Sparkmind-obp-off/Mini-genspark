import { AppError, readJson, uuidPattern, validateProvidedSource, type Source } from "./domain";
import type { D1Database } from "./worker";
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
export async function providedSources(db: D1Database, projectId: string, owner: string): Promise<Source[]> {
  const rows = (await db.prepare("SELECT id,ordinal,title,url,evidence,provided_at FROM project_sources WHERE project_id=? AND owner_id=? ORDER BY ordinal").bind(projectId, owner).all<{ id: string; ordinal: number; title: string; url: string; evidence: string; provided_at: string }>()).results;
  return rows.map((s, index) => ({ id: index + 1, recordId: s.id, title: s.title, url: s.url, evidence: s.evidence, retrievedAt: null, providedAt: s.provided_at, provider: "user-provided", status: "provided-not-retrieved" }));
}
function title(value: unknown): string {
  if (typeof value !== "string" || !value.trim() || value.length > 120 || /[\r\n]/.test(value)) throw new AppError("INVALID_TITLE");
  return value.trim();
}
async function project(db: D1Database, id: string, owner: string): Promise<void> {
  if (!await db.prepare("SELECT id FROM conversations WHERE id=? AND owner_id=?").bind(id, owner).first()) throw new AppError("NOT_FOUND", 404);
}
export async function workspaceMutation(request: Request, db: D1Database, owner: string): Promise<Response | null> {
  const path = new URL(request.url).pathname;
  const projectPath = /^\/api\/projects\/([a-f0-9-]+)(?:\/sources(?:\/([a-f0-9-]+))?)?$/.exec(path);
  const artifactPath = /^\/api\/artifacts\/([a-f0-9-]+)$/.exec(path);
  const matches = path === "/api/projects" && request.method === "POST" || projectPath && ["POST", "PATCH"].includes(request.method) || projectPath?.[2] && request.method === "DELETE" || artifactPath && request.method === "PATCH";
  if (!matches) return null;
  // Hard mutation cap shared across project/source/editor operations, independent of provider quota.
  const limit = await db.prepare("INSERT INTO request_limits(bucket,request_count) VALUES (?,1) ON CONFLICT(bucket) DO UPDATE SET request_count=request_count+1 WHERE request_count<30 RETURNING request_count").bind("workspace:" + Math.floor(Date.now() / 60000) + ":" + owner).first();
  if (!limit) throw new AppError("RATE_LIMITED", 429);
  if (path === "/api/projects") {
    const p = await readJson(request) as { title?: unknown }; const name = title(p?.title);
    const id = request.headers.get("idempotency-key") ?? ""; if (!uuidPattern.test(id)) throw new AppError("IDEMPOTENCY_KEY_REQUIRED");
    const prior = await db.prepare("SELECT title FROM conversations WHERE id=? AND owner_id=?").bind(id, owner).first<{ title: string }>();
    if (prior) { if (prior.title !== name) throw new AppError("IDEMPOTENCY_CONFLICT", 409); return json({ id, title: name, mode: "research" }); }
    const row = await db.prepare("INSERT INTO conversations(id,owner_id,mode,title,created_at) SELECT ?,?,'research',?,? WHERE (SELECT count(*) FROM conversations WHERE owner_id=?)<50 ON CONFLICT(id) DO NOTHING RETURNING id").bind(id, owner, name, new Date().toISOString(), owner).first();
    if (!row) throw new AppError("PROJECT_LIMIT_OR_CONFLICT", 409, "Maximum 50 saved projects or conflicting request ID. Delete unused projects or choose a new ID.");
    return json({ id, title: name, mode: "research" }, 201);
  }
  if (artifactPath) {
    const id = artifactPath[1]; if (!uuidPattern.test(id)) throw new AppError("INVALID_ARTIFACT_ID");
    const artifact = await db.prepare("SELECT id,revision,task_id FROM artifacts WHERE id=? AND owner_id=?").bind(id, owner).first<{ revision: number; task_id: string }>();
    if (!artifact) throw new AppError("NOT_FOUND", 404);
    const p = await readJson(request, 128000) as { content?: unknown; title?: unknown; revision?: unknown };
    const name = title(p?.title);
    if (typeof p.content !== "string" || !p.content.trim() || new TextEncoder().encode(p.content).length > 64000 || !Number.isInteger(p.revision) || Number(p.revision) < 1) throw new AppError("INVALID_ARTIFACT_EDIT", 400, "Content must be nonempty and at most 64 KB UTF-8; supply the current revision.");
    const updated = await db.prepare("UPDATE artifacts SET title=?,content=?,revision=revision+1,updated_at=? WHERE id=? AND owner_id=? AND revision=? RETURNING id,title,content,created_at,updated_at,revision,'markdown' AS type").bind(name, p.content, new Date().toISOString(), id, owner, Number(p.revision)).first();
    if (!updated) throw new AppError("ARTIFACT_REVISION_CONFLICT", 409, "Another edit was saved. Reopen the artifact; your unsaved text has not overwritten it.");
    return json(updated);
  }
  if (!projectPath || !uuidPattern.test(projectPath[1])) throw new AppError("INVALID_PROJECT_ID");
  const id = projectPath[1]; await project(db, id, owner);
  if (request.method === "PATCH" && !path.includes("/sources")) {
    const p = await readJson(request) as { title?: unknown }; const name = title(p?.title);
    await db.prepare("UPDATE conversations SET title=? WHERE id=? AND owner_id=?").bind(name, id, owner).run(); return json({ id, title: name });
  }
  if (!path.includes("/sources")) throw new AppError("METHOD_NOT_ALLOWED", 405);
  if (await db.prepare("SELECT id FROM tasks WHERE conversation_id=? AND owner_id=? AND status='running'").bind(id, owner).first()) throw new AppError("WORKSPACE_BUSY", 409);
  if (request.method === "DELETE") {
    if (!uuidPattern.test(projectPath[2] ?? "")) throw new AppError("INVALID_SOURCE_ID");
    const result = await db.prepare("DELETE FROM project_sources WHERE id=? AND project_id=? AND owner_id=? AND NOT EXISTS(SELECT 1 FROM tasks WHERE conversation_id=? AND status='running') RETURNING id").bind(projectPath[2], id, owner, id).first();
    if (!result) throw new AppError("NOT_FOUND_OR_BUSY", 404); return json({ deleted: true, existingRunSnapshotsRetained: true });
  }
  if (request.method !== "POST" || projectPath[2]) throw new AppError("METHOD_NOT_ALLOWED", 405);
  const source = validateProvidedSource(await readJson(request)); const sourceId = crypto.randomUUID();
  const row = await db.prepare("INSERT INTO project_sources(id,project_id,owner_id,ordinal,title,url,evidence,provided_at) SELECT ?,?,?,COALESCE((SELECT max(ordinal) FROM project_sources WHERE project_id=?),0)+1,?,?,?,? WHERE (SELECT count(*) FROM project_sources WHERE project_id=?)<5 AND NOT EXISTS(SELECT 1 FROM tasks WHERE conversation_id=? AND status='running') RETURNING id").bind(sourceId, id, owner, id, source.title, source.url, source.evidence, new Date().toISOString(), id, id).first();
  if (!row) throw new AppError("SOURCE_LIMIT_OR_BUSY", 409, "Maximum five supplied excerpts per project; edits are blocked while a task runs.");
  return json({ id: sourceId, status: "provided-not-retrieved", retrievedAt: null }, 201);
}
