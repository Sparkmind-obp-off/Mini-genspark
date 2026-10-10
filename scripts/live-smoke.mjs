// Explicitly opt-in: one task, no direct provider keys and no automatic retries.
import assert from 'node:assert/strict';
const required = ['RUN_LIVE_SMOKE', 'COST_QUOTA_VERIFIED', 'LIVE_BASE_URL', 'OWNER_ACCESS_TOKEN'];
const missing = required.filter(name => !process.env[name]);
if (missing.length || process.env.RUN_LIVE_SMOKE !== 'true' || process.env.COST_QUOTA_VERIFIED !== 'true') {
  console.log('BLOCKED: owner approval and account free-quota verification required. Set variable names only: ' + required.join(', '));
  process.exit(2);
}
const base = new URL(process.env.LIVE_BASE_URL);
assert.ok(base.protocol === 'https:' || (base.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(base.hostname)), 'Use HTTPS or localhost');
const origin = base.origin;
let cookie = '';
async function call(path, options = {}) {
  const response = await fetch(origin + path, { redirect: 'error', signal: AbortSignal.timeout(55000), ...options, headers: { origin, 'content-type': 'application/json', ...(cookie ? { cookie } : {}), ...options.headers } });
  const body = await response.json();
  if (!response.ok) throw new Error('SMOKE_FAILED_HTTP_' + response.status + '_' + (body.error ?? 'UNKNOWN'));
  return { response, body };
}
try {
  const login = await call('/api/session', { method: 'POST', body: JSON.stringify({ token: process.env.OWNER_ACCESS_TOKEN }) });
  cookie = login.response.headers.get('set-cookie')?.split(';')[0] ?? '';
  assert.ok(cookie, 'Session cookie missing');
  const { body: config } = await call('/api/providers');
  assert.ok(config.inference.enabled && config.inference.configured, 'Inference policy/binding disabled');
  const mode = process.env.SMOKE_MODE ?? 'chat'; assert.ok(['chat', 'research'].includes(mode), 'Unsupported smoke mode');
  const { body: task } = await call('/api/tasks', { method: 'POST', headers: { 'idempotency-key': crypto.randomUUID() }, body: JSON.stringify({ mode, prompt: mode === 'research' ? 'Find official documentation describing Cloudflare D1 as a serverless SQL database. Cite the retrieved evidence and state limitations.' : 'Reply with a short greeting and state that this is a bounded connectivity test.', inputType: 'text' }) });
  assert.equal(task.status, 'succeeded'); assert.ok(task.response?.length > 0);
  if (mode === 'research') { assert.ok(task.sources.length > 0); const refs = [...task.response.matchAll(/\[(\d+)\]/g)].map(m => Number(m[1])); assert.ok(refs.length && refs.every(id => task.sources.some(source => source.id === id))); }
  const { body: reopened } = await call('/api/conversations/' + task.conversationId);
  assert.ok(reopened.tasks.some(t => t.id === task.id && t.response === task.response)); assert.ok(reopened.artifacts.length);
  console.log(JSON.stringify({ status: 'LIVE VERIFIED', provider: task.provider, model: task.model, mode, citations: task.sources.length, persisted: true, requests: 1 }));
} catch (error) { console.error(error instanceof Error && /^SMOKE_FAILED_HTTP_/.test(error.message) ? error.message : 'SMOKE_FAILED: preflight, assertion or connectivity. No retry/fallback.'); process.exitCode = 1; }
finally { if (cookie) { try { await call('/api/session', { method: 'DELETE' }); } catch { console.error('SESSION_REVOKE_FAILED: revoke test session through the owner runtime'); process.exitCode = 1; } } }
