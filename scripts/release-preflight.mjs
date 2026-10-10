// Read-only Pages gate. No deployments, secret writes, DNS or migrations.
import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';
const config = { ...JSON.parse(readFileSync('wrangler.jsonc', 'utf8')), account_id: JSON.parse(readFileSync('wrangler.preview.jsonc','utf8')).account_id };
const db = config.d1_databases.find(item => item.binding === 'DB');
function block(message) { console.error('BLOCKED: ' + message); process.exit(2); }
assert.equal(config.name, 'vestrenhq-private');
assert.equal(config.pages_build_output_dir, './dist');
assert.equal(db.database_id, '86787a64-0479-4ee6-96ca-5e9387a9b781');
assert.ok(!config.main && !config.assets && !config.ai && !config.triggers && !config.routes);
for (const flag of ['FREE_PLAN_CONFIRMED','GROQ_FREE_PLAN_CONFIRMED','TAVILY_FREE_PLAN_CONFIRMED']) assert.equal(config.vars[flag], 'false');
assert.ok(readFileSync('dist/_worker.js/index.js','utf8').includes('cloudflare-pages'));
assert.deepEqual(JSON.parse(readFileSync('dist/_routes.json','utf8')).include, ['/*']);
if (!process.argv.includes('--online')) { console.log('PASS: Pages config/server bundle preflight; cloud bindings/secrets NOT VERIFIED offline.'); process.exit(0); }
if (!process.env.CLOUDFLARE_API_TOKEN) block('Cloudflare API credential not loaded.');
async function api(path, body) {
  const r = await fetch('https://api.cloudflare.com/client/v4/accounts/' + config.account_id + path, { method: body ? 'POST' : 'GET', headers: { authorization: 'Bearer ' + process.env.CLOUDFLARE_API_TOKEN, 'content-type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20000) });
  const data = await r.json(); if (!r.ok || !data.success) block('Read-only Cloudflare check ' + path + ' HTTP ' + r.status);
  return data.result;
}
const query = async sql => (await api('/d1/database/' + db.database_id + '/query', { sql }))[0].results;
try {
  assert.equal((await api('/d1/database/' + db.database_id)).name, db.database_name);
  const ledger = await query('SELECT name FROM d1_migrations ORDER BY id');
  assert.deepEqual(ledger.map(row => row.name), readdirSync('migrations').filter(file => file.endsWith('.sql')).sort());
  await query('SELECT audit_id,created_at,credential_hash FROM sessions LIMIT 0');
  await query('SELECT revision,updated_at FROM artifacts LIMIT 0');
  const project = await api('/pages/projects/' + config.name);
  assert.equal(project.production_branch, 'main');
  assert.equal(project.source ?? null, null, 'No automatic Git deployment integration');
  for (const environment of ['preview','production']) {
    const runtime = project.deployment_configs[environment];
    assert.equal(runtime.d1_databases.DB.id, db.database_id);
    assert.equal(runtime.env_vars.OWNER_ACCESS_TOKEN.type, 'secret_text');
  }
  console.log('PASS: Pages preview/production D1 binding IDs, owner secret type, dedicated D1 identity and migration ledger verified via Cloudflare API. Presence is not login proof; remote acceptance remains required.');
} catch { block('Pages target/binding/secret/schema mismatch; sensitive details suppressed.'); }
