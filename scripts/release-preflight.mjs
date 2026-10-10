// Read-only BYOK gate. Never deploys, installs secrets, creates DBs or runs migrations.
import { readFileSync } from 'node:fs';
const config = JSON.parse(readFileSync('wrangler.preview.jsonc', 'utf8'));
function block(message) { console.log('PENDING_OWNER_ACTION: ' + message); console.log('REQUIRED_SECRETS_CONFIGURED = false; deployment BLOCKED.'); process.exit(2); }
const db = config.d1_databases?.find(item => item.binding === 'DB');
if (config.name !== 'vestrenhq-private-preview' || db?.database_name !== config.name || db.migrations_dir !== 'migrations') block('Verify dedicated Worker/D1 names and migration directory.');
if (!/^[a-f0-9]{32}$/i.test(config.account_id ?? '')) block('Set wrangler.preview.jsonc account_id from wrangler whoami; do not guess.');
if (!/^[a-f0-9-]{36}$/i.test(db.database_id ?? '') || /^00000000-/.test(db.database_id)) block('Set d1_databases[0].database_id to the verified dedicated D1 ID; run wrangler d1 create vestrenhq-private-preview only with owner authorization.');
for (const flag of ['FREE_PLAN_CONFIRMED','GROQ_FREE_PLAN_CONFIRMED','TAVILY_FREE_PLAN_CONFIRMED']) if (config.vars?.[flag] !== 'false') block('Provider policies must stay disabled for this release.');
if (config.ai || config.routes || config.triggers) block('No AI binding, DNS/routes or scheduled tasks approved for this release.');
if (!process.argv.includes('--online')) block('Offline config check passed; run npm run release:check -- --online for read-only target/secret/schema checks.');
if (!process.env.CLOUDFLARE_API_TOKEN) block('Load Cloudflare deployment credentials privately in your own environment. Never send them to chat.');
async function api(path, options = {}) {
  const response = await fetch('https://api.cloudflare.com/client/v4/accounts/' + config.account_id + path, { ...options, redirect: 'error', signal: AbortSignal.timeout(15000), headers: { authorization: 'Bearer ' + process.env.CLOUDFLARE_API_TOKEN, 'content-type': 'application/json' } });
  const body = await response.json(); if (!response.ok || !body.success) block('Read-only Cloudflare verification failed, HTTP ' + response.status + '; check account/token scope.');
  return body.result;
}
try {
  const metadata = await api('/d1/database/' + db.database_id);
  if (metadata.name !== db.database_name) block('D1 ID belongs to a different database. Do not proceed.');
  const secrets = await api('/workers/scripts/' + config.name + '/secrets');
  if (!secrets.some(secret => secret.name === 'OWNER_ACCESS_TOKEN')) block('Run npx wrangler secret put OWNER_ACCESS_TOKEN --config wrangler.preview.jsonc, in your own terminal.');
  const schema = await api('/d1/database/' + db.database_id + '/query', { method: 'POST', body: JSON.stringify({ sql: "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('sessions','owner_credentials','access_counts','access_events','artifacts','tasks','project_sources','usage_ledger','daily_usage','task_events','request_limits','conversations')" }) });
  if (schema[0]?.results?.length !== 12) block('Required schema missing. Verify target, back up existing data and apply reviewed migrations manually.');
  const columns = await api('/d1/database/' + db.database_id + '/query', { method: 'POST', body: JSON.stringify({ sql: 'SELECT audit_id,created_at,credential_hash FROM sessions LIMIT 0' }) });
  if (columns[0]?.success === false) block('Session migration 0004 is missing.');
  console.log('PASS: dedicated BYOK D1 identity, required schema, Worker secret name verified read-only. REQUIRED_SECRETS_CONFIGURED = true (presence gate only; login smoke still required). No deployment occurred. Run local QA at the exact release commit before manual deploy.');
} catch { block('Cloudflare verification unavailable; details/credentials suppressed.'); }
