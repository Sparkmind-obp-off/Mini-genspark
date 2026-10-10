import { AppError, readJson } from './domain';
import type { D1Database, D1Statement, Env } from './worker';
export type OwnerSession = { owner_id: string; audit_id: string; created_at: number; expires_at: number; credential_hash: string };
export type AccessContext = { requestId: string; session?: OwnerSession; expired?: boolean; committed?: boolean; requireStoredSession?: boolean };
export type EvidenceStatus = 'VERIFIED' | 'CONFIGURED' | 'PENDING' | 'UNAVAILABLE' | 'ERROR';
export type SecuritySnapshot = {
  observedAt: string; window: string; windowStart: string;
  authentication: { status: EvidenceStatus; expiresAt: string; sessionLabel: string; lastSuccess: string | null; lastFailure: string | null };
  credential: { fingerprint: string; status: string; createdAt: string | null; installation: string };
  counters: Record<string, number>;
  events: { created_at: string; category: string; action: string; outcome: string; session_label: string | null; request_id: string; reason: string | null }[];
  configuration: Record<string, { status: EvidenceStatus; detail: string }>;
  lastHealthCheck: string; limitations: string;
};
export type GeneratedCredential = { token: string; fingerprint: string; createdAt: string; environment: string; filename: string; fileContent: string; status: 'pending'; installation: string };
export async function fingerprint(value: string): Promise<string> {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), byte => byte.toString(16).padStart(2, '0')).join('');
}
export function requireOwnerSecret(env: Env): void {
  if (!env.OWNER_ACCESS_TOKEN || env.OWNER_ACCESS_TOKEN.length < 32 || env.OWNER_ACCESS_TOKEN.length > 256)
    throw new AppError('OWNER_TOKEN_NOT_CONFIGURED', 503, 'Configure OWNER_ACCESS_TOKEN through Cloudflare Worker Secrets (wrangler secret put OWNER_ACCESS_TOKEN --config wrangler.preview.jsonc). Never paste it in chat.');
}
function action(request: Request): string {
  const path = new URL(request.url).pathname;
  if (path === '/api/session') return 'session.' + ({ POST: 'login', GET: 'check', DELETE: 'logout' }[request.method] ?? 'other');
  if (path === '/api/security') return 'security.read';
  if (path === '/api/sessions') return 'session.revoke-all';
  if (path.startsWith('/api/credentials')) return 'credential.manage';
  if (/^\/api\/(projects|conversations)(\/|$)/.test(path)) return 'project.' + request.method.toLowerCase();
  if (/^\/api\/(tasks|chat)(\/|$)/.test(path)) return 'task.' + request.method.toLowerCase();
  if (/^\/api\/artifacts(\/|$)/.test(path)) return 'artifact.' + request.method.toLowerCase();
  return 'private.other';
}
export function auditStatements(db: D1Database, request: Request, context: AccessContext, status: number, reason: string | null = null, explicit?: string): D1Statement[] {
  const now = new Date().toISOString(); const hour = now.slice(0, 13); const successful = status < 400;
  const category = explicit ?? (action(request) === 'session.login' ? successful ? 'AUTH_SUCCESS' : 'AUTH_FAILURE'
    : context.expired ? 'SESSION_EXPIRED' : status === 401 ? 'UNAUTHORIZED_REQUEST' : status === 403 ? 'FORBIDDEN_REQUEST'
    : reason === 'OWNER_TOKEN_NOT_CONFIGURED' ? 'SECRET_CONFIGURATION_ERROR'
    : successful && request.method === 'DELETE' && action(request).startsWith('session.') ? 'SESSION_REVOKED' : 'OWNER_ACTION');
  const categories = [category];
  if (category === 'AUTH_SUCCESS') categories.push('SESSION_CREATED');
  if (status === 401 && category !== 'UNAUTHORIZED_REQUEST') categories.push('UNAUTHORIZED_REQUEST');
  if (status === 403 && category !== 'FORBIDDEN_REQUEST') categories.push('FORBIDDEN_REQUEST');
  const safeReason = reason && /^[A-Z_]{1,64}$/.test(reason) ? reason : null;
  const guard = context.requireStoredSession ? ' AND EXISTS(SELECT 1 FROM sessions WHERE audit_id=? AND credential_hash=?)' : '';
  const params = context.requireStoredSession ? [context.session!.audit_id, context.session!.credential_hash] : [];
  return [
    ...categories.map(kind => db.prepare('INSERT INTO access_counts(hour,category,event_count,last_at) SELECT ?,?,1,? WHERE 1' + guard + ' ON CONFLICT(hour,category) DO UPDATE SET event_count=event_count+1,last_at=excluded.last_at').bind(hour, kind, now, ...params)),
    db.prepare('INSERT INTO access_events(id,hour,created_at,category,action,outcome,session_label,request_id,reason) SELECT ?,?,?,?,?,?,?,?,? WHERE (SELECT count(*) FROM access_events WHERE hour=?)<200' + guard).bind(crypto.randomUUID(), hour, now, category, action(request), successful ? 'success' : 'failure', context.session?.audit_id?.slice(0, 8) ?? null, context.requestId, safeReason, hour, ...params)
  ];
}
export async function accessSnapshot(db: D1Database, env: Env, session: OwnerSession, window: string | null): Promise<SecuritySnapshot> {
  const windows: Record<string, number> = { '1h': 1, '24h': 24, '7d': 168, '30d': 720 };
  const choice = window ?? '24h'; if (!windows[choice]) throw new AppError('INVALID_SECURITY_WINDOW');
  const now = new Date(); const start = new Date(now.getTime() - windows[choice] * 3600000).toISOString().slice(0, 13);
  const rows = (await db.prepare('SELECT category,sum(event_count) AS n FROM access_counts WHERE hour>=? GROUP BY category').bind(start).all<{ category: string; n: number }>()).results;
  const count = (category: string) => rows.find(row => row.category === category)?.n ?? 0;
  const loginTimes = (await db.prepare("SELECT category,max(last_at) AS at FROM access_counts WHERE category IN ('AUTH_SUCCESS','AUTH_FAILURE') GROUP BY category").all<{ category: string; at: string }>()).results;
  const active = await db.prepare('SELECT count(*) AS n FROM sessions WHERE owner_id=? AND expires_at>? AND credential_hash=?').bind(session.owner_id, now.getTime(), session.credential_hash).first<{ n: number }>();
  const credential = await db.prepare('SELECT fingerprint,created_at,status FROM owner_credentials WHERE fingerprint=?').bind(session.credential_hash).first<{ fingerprint: string; created_at: string | null; status: string }>();
  const events = (await db.prepare('SELECT created_at,category,action,outcome,session_label,request_id,reason FROM access_events WHERE hour>=? ORDER BY created_at DESC,rowid DESC LIMIT 50').bind(start).all<SecuritySnapshot['events'][number]>()).results;
  await db.prepare('SELECT revision,updated_at FROM artifacts LIMIT 1').first();
  await db.prepare('SELECT status FROM usage_ledger LIMIT 1').first();
  await db.prepare('SELECT provided_at FROM project_sources LIMIT 1').first();
  return {
    observedAt: now.toISOString(), window: choice, windowStart: start + ':00:00.000Z',
    authentication: { status: 'VERIFIED', expiresAt: new Date(session.expires_at).toISOString(), sessionLabel: session.audit_id.slice(0, 8), lastSuccess: loginTimes.find(row => row.category === 'AUTH_SUCCESS')?.at ?? null, lastFailure: loginTimes.find(row => row.category === 'AUTH_FAILURE')?.at ?? null },
    credential: { fingerprint: session.credential_hash.slice(0, 12), status: credential?.status ?? 'UNAVAILABLE', createdAt: credential?.created_at ?? null, installation: 'Worker secret verified by current login/session. Externally created token timestamp is UNAVAILABLE.' },
    counters: { attempts: count('AUTH_SUCCESS') + count('AUTH_FAILURE'), successful: count('AUTH_SUCCESS'), failed: count('AUTH_FAILURE'), unauthorized: count('UNAUTHORIZED_REQUEST'), forbidden: count('FORBIDDEN_REQUEST'), sessionCreated: count('SESSION_CREATED'), sessionRevoked: count('SESSION_REVOKED'), ownerActions: count('OWNER_ACTION'), activeSessions: active?.n ?? 0 }, events,
    configuration: {
      ownerSecret: { status: 'CONFIGURED', detail: 'OWNER_ACCESS_TOKEN present and length-valid; login verifies its use. Value never returned.' },
      d1: { status: 'VERIFIED', detail: 'D1 queries succeeded in this runtime; cloud resource identity requires operator verification.' },
      migrations: { status: 'VERIFIED', detail: 'Required schema through 0004 queried successfully; not a remote ledger or restore proof.' },
      worker: { status: 'VERIFIED', detail: 'Authenticated Worker request executed; not a claim of cloud deployment.' },
      deployment: env.WORKER_VERSION?.id ? { status: 'VERIFIED', detail: 'Cloudflare runtime version ' + env.WORKER_VERSION.id + ', release tag ' + (env.WORKER_VERSION.tag || 'UNAVAILABLE') + '. Target ownership, secret preflight and remote smoke evidence are recorded by the release operator; this is not a backup/restore proof.' } : { status: 'UNAVAILABLE', detail: (env.DEPLOYMENT_STAGE === 'private-preview' ? 'Preview configuration present. ' : 'Development runtime. ') + 'Remote deployment/version and REQUIRED_SECRETS_CONFIGURED are operator release gates, not inferred from local secret presence.' },
      alerts: { status: 'UNAVAILABLE', detail: 'No monitored alert integration verified.' }
    }, lastHealthCheck: now.toISOString(),
    limitations: 'Counters measure only requests reaching this Worker, UTC hourly buckets (boundary hour included), retained 30 days; not lifetime or Cloudflare edge traffic. Events retained 7 days, sampled to 200/hour, latest 50 displayed. AUTH_SUCCESS also counts SESSION_CREATED. Expiry is observed on attempted use, not for idle sessions. Last login timestamps cover retained counters. Credential fingerprints only; no tokens, cookies, content or raw IP recorded. Audit failures return 503; inspect state before retrying a mutation.'
  };
}
export async function credentialMutation(request: Request, db: D1Database, env: Env, context: AccessContext): Promise<Response | null> {
  const path = new URL(request.url).pathname;
  if (!path.startsWith('/api/credentials/')) return null;
  if (request.method !== 'POST') throw new AppError('METHOD_NOT_ALLOWED', 405);
  const body = await readJson(request) as { confirm?: unknown; fingerprint?: unknown };
  if (!body || body.confirm !== true) throw new AppError('EXPLICIT_CONFIRMATION_REQUIRED');
  const limiter = await db.prepare('INSERT INTO request_limits(bucket,request_count) VALUES (?,1) ON CONFLICT(bucket) DO UPDATE SET request_count=request_count+1 WHERE request_count<10 RETURNING request_count').bind('credential:' + Math.floor(Date.now() / 60000)).first();
  if (!limiter) throw new AppError('RATE_LIMITED', 429);
  let statements: D1Statement[] = []; let data: unknown; let category: string;
  if (path === '/api/credentials/generate') {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('');
    const digest = await fingerprint(token); const createdAt = new Date().toISOString();
    const environment = env.DEPLOYMENT_STAGE === 'private-preview' ? 'private-preview' : 'development';
    const installation = 'PENDING manual installation: save this token securely; run wrangler secret put OWNER_ACCESS_TOKEN --config wrangler.preview.jsonc in your own terminal. Login with the new token to verify installation. Until then the current token remains active.';
    data = { token, fingerprint: digest, createdAt, environment, filename: 'vestrenhq-owner-credential.txt', fileContent: `VestrenHQ\nPurpose: application owner authentication (not a Cloudflare API token)\nCreated: ${createdAt}\nEnvironment: ${environment}\nSECRET: store securely; never upload, commit or send in chat. Cannot be retrieved from the server.\nToken: ${token}\n${installation}\n`, status: 'pending', installation } satisfies GeneratedCredential;
    statements = [db.prepare("INSERT INTO owner_credentials(fingerprint,created_at,status) VALUES (?,?,'pending')").bind(digest, createdAt)]; category = 'CREDENTIAL_GENERATED';
  } else if (path === '/api/credentials/cancel') {
    if (typeof body.fingerprint !== 'string' || !/^[a-f0-9]{64}$/.test(body.fingerprint)) throw new AppError('INVALID_CREDENTIAL_ID');
    const row = await db.prepare("SELECT fingerprint FROM owner_credentials WHERE fingerprint=? AND status='pending'").bind(body.fingerprint).first();
    if (!row) throw new AppError('NOT_FOUND', 404);
    statements = [db.prepare("UPDATE owner_credentials SET status='cancelled' WHERE fingerprint=? AND status='pending'").bind(body.fingerprint)]; category = 'CREDENTIAL_REVOKED'; data = { cancelled: true, installation: 'Never install this cancelled candidate. Existing active credential unchanged.' };
  } else if (path === '/api/credentials/revoke') {
    statements = [db.prepare("UPDATE owner_credentials SET status='revoked' WHERE fingerprint=?").bind(context.session!.credential_hash), db.prepare('DELETE FROM sessions WHERE owner_id=?').bind(context.session!.owner_id)];
    category = 'CREDENTIAL_REVOKED'; data = { revoked: true, recovery: 'Login disabled for this credential. Install a NEW owner token via your Cloudflare account, then login. No token retrieval is available.' };
  } else if (path === '/api/credentials/authorize-export') {
    category = 'CREDENTIAL_EXPORT_AUTHORIZED'; data = { authorized: true };
  } else throw new AppError('NOT_FOUND', 404);
  await db.batch([...statements, ...(path === '/api/credentials/generate' ? auditStatements(db, request, context, 200, null, 'CREDENTIAL_ROTATION_STARTED') : []), ...auditStatements(db, request, context, 200, null, category)]); context.committed = true;
  return new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'pragma': 'no-cache' } });
}
