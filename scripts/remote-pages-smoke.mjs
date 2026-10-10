// Explicit operator acceptance; synthetic content only. No deployment/DNS/secret writes.
// Shared D1: never rotates/revokes the active credential or unrelated owner sessions.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { request, chromium } from '@playwright/test';
if (process.env.RUN_REMOTE_SMOKE !== 'true') { console.error('BLOCKED: RUN_REMOTE_SMOKE=true required'); process.exit(2); }
const c = { ...JSON.parse(readFileSync('wrangler.jsonc','utf8')), account_id: JSON.parse(readFileSync('wrangler.preview.jsonc','utf8')).account_id };
const base = process.env.REMOTE_PAGES_URL;
const sha = process.env.EXPECTED_RELEASE_SHA;
const deploymentId = process.env.EXPECTED_DEPLOYMENT_ID;
assert.ok(base && /^https:\/\/(?:[a-z0-9-]+\.)?vestrenhq-private\.pages\.dev$/.test(base), 'Exact new Pages target required');
assert.ok(/^[a-f0-9]{40}$/.test(sha ?? '') && deploymentId, 'Cloud deployment identity required');
const token = readFileSync('.qa/remote-owner-token.raw','utf8').trim();
const secrets = [token, process.env.CLOUDFLARE_API_TOKEN].filter(Boolean);
const report = { url: base, deploymentId, commit: sha, checkedAt: new Date().toISOString(), checks: [], destructiveCredentialTests: 'NOT_REPEATED_REMOTE_SHARED_D1; tested locally and previously on isolated Worker preview', platformLogSampling: 'NOT_TESTED' };
let context, browser, projectId;
function safe(value) { const text = typeof value === 'string' ? value : JSON.stringify(value); assert.ok(!secrets.some(secret => text.includes(secret)), 'Known secret in ordinary data'); return text; }
function pass(label) { report.checks.push(label); console.log('PASS: ' + label); }
async function cloud(path, body) {
  const r = await fetch('https://api.cloudflare.com/client/v4/accounts/' + c.account_id + path, { method: body ? 'POST' : 'GET', headers: { authorization: 'Bearer ' + process.env.CLOUDFLARE_API_TOKEN, 'content-type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20000) });
  const data = await r.json(); assert.ok(r.ok && data.success, 'Cloud API HTTP ' + r.status); return data.result;
}
const query = async (sql, params = []) => (await cloud('/d1/database/' + c.d1_databases[0].database_id + '/query', { sql, params }))[0].results;
const call = (path, method = 'GET', body, extra = {}) => context.fetch(base + path, { method, headers: { origin: base, ...extra }, ...(body === undefined ? {} : { data: body }), timeout: 30000, maxRedirects: 0 });
async function login(value, expected = 200) {
  let r = await call('/api/session','POST',{ token: value });
  if (r.status() === 429) {
    const wait = (Math.floor(Date.now()/600000)+1)*600000-Date.now()+1500;
    console.log('Respecting existing login throttle for ' + Math.ceil(wait/1000) + ' seconds; no counter reset/IP spoof.');
    await new Promise(resolve => setTimeout(resolve, wait)); r = await call('/api/session','POST',{ token: value });
  }
  assert.equal(r.status(), expected, 'Owner login result');
  const cookie = r.headers()['set-cookie'] ?? ''; const valueMatch = /__Host-vestren-session=([^;]+)/.exec(cookie)?.[1]; if (valueMatch) secrets.push(valueMatch);
  return r;
}
try {
  const project = await cloud('/pages/projects/' + c.name);
  const deployment = await cloud('/pages/projects/' + c.name + '/deployments/' + deploymentId);
  assert.equal(deployment.deployment_trigger.metadata.commit_hash, sha);
  const runtime = project.deployment_configs[deployment.environment];
  assert.equal(runtime.d1_databases.DB.id, c.d1_databases[0].database_id);
  assert.equal(runtime.env_vars.OWNER_ACCESS_TOKEN.type, 'secret_text');
  assert.equal(project.source, null); assert.equal(project.production_branch, 'main');
  pass('Cloudflare Pages deployment SHA, intended D1 ID and secret type verified');
  context = await request.newContext({ timeout: 30000 });
  const health = await call('/api/health'); assert.equal(health.status(),200); const h = await health.json(); safe(h);
  assert.deepEqual(h.deployment, { platform: 'cloudflare-pages', commit: sha, dirty: false }); assert.equal(h.publicLaunch,false); assert.equal(h.version,null);
  for (const path of ['/', '/workspace/refresh-fixture']) { const r = await call(path); assert.equal(r.status(),200); assert.ok(safe(await r.text()).includes('<div id="root">')); assert.ok(r.headers()['content-security-policy'].includes("frame-ancestors 'none'")); }
  for (const path of ['/privacy','/terms','/support','/pricing','/status']) { const r = await call(path); assert.equal(r.status(),200); assert.ok((await r.text()).includes('<main>')); }
  const html = await (await call('/')).text();
  for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)) { const r = await call(match[1]); assert.equal(r.status(),200); assert.equal(safe(await r.text()),readFileSync('dist'+match[1],'utf8')); }
  pass('HTTPS, truthful Functions health, policy routes, SPA refresh, assets and security headers');
  for (const path of ['/api/projects','/api/providers','/api/security','/api/tasks/'+crypto.randomUUID(),'/api/artifacts/'+crypto.randomUUID()]) assert.equal((await call(path)).status(),401);
  for (const path of ['/api/credentials/generate','/api/credentials/authorize-export','/api/credentials/revoke']) assert.equal((await call(path,'POST',{confirm:true})).status(),401);
  assert.equal((await call('/api/session','POST',{token:'invalid'},{origin:'https://attacker.example'})).status(),403);
  if (process.env.PROBE_INVALID_LOGIN === 'true') await login('invalid-pages-fixture',401);
  const valid = await login(token); const cookie = valid.headers()['set-cookie'];
  for (const marker of ['__Host-vestren-session=', 'HttpOnly','Secure','SameSite=Strict','Max-Age=28800']) assert.ok(cookie.includes(marker));
  const snapshot = await (await call('/api/security')).json(); safe(snapshot);
  assert.equal(snapshot.authentication.status,'VERIFIED'); assert.equal(snapshot.configuration.d1.status,'VERIFIED'); assert.equal(snapshot.configuration.migrations.status,'VERIFIED'); assert.equal(snapshot.configuration.deployment.status,'CONFIGURED');
  assert.ok(snapshot.counters.activeSessions>=1 && snapshot.counters.successful>=1);
  pass('anonymous denial, exact-Origin rejection, configured owner login, secure cookie and real dashboard');
  assert.equal((await call('/api/unknown')).status(),404);
  assert.equal((await call('/api/projects/'+crypto.randomUUID())).status(),404);
  assert.equal((await call('/api/projects','POST',{title:'Must not create'},{origin:'https://attacker.example','idempotency-key':crypto.randomUUID()})).status(),403);
  const candidateResponse = await call('/api/credentials/generate','POST',{confirm:true}); assert.equal(candidateResponse.status(),200);
  const candidate = await candidateResponse.json(); assert.match(candidate.token,/^[a-f0-9]{64}$/); secrets.push(candidate.token); assert.equal(candidate.status,'pending'); assert.ok(candidate.installation.includes('wrangler pages secret put'));
  assert.equal((await call('/api/credentials/authorize-export','POST',{confirm:true})).status(),200);
  assert.equal((await call('/api/credentials/cancel','POST',{confirm:true,fingerprint:candidate.fingerprint})).status(),200);
  assert.equal((await query('SELECT status FROM owner_credentials WHERE fingerprint=?',[candidate.fingerprint]))[0].status,'cancelled');
  assert.equal((await call('/api/session')).status(),200);
  pass('API errors not masked by SPA; safe credential generation/export-authorization/cancellation, active credential unchanged');
  const id = crypto.randomUUID(); projectId = id;
  assert.equal((await call('/api/projects','POST',{title:'Synthetic Pages acceptance'},{'idempotency-key':id})).status(),201);
  assert.equal((await query('SELECT id FROM conversations WHERE id=?',[id]))[0].id,id);
  const source = await call('/api/projects/'+id+'/sources','POST',{title:'Synthetic evidence',evidence:'PAGES ACCEPTANCE FIXTURE ONLY. These are invented figures, not independently verified evidence.'}); assert.equal(source.status(),201);
  const input = {mode:'research',prompt:'Organize the supplied synthetic evidence.',conversationId:id,workflow:'manual-brief'}, key = crypto.randomUUID();
  const run = await call('/api/tasks','POST',input,{'idempotency-key':key}); assert.equal(run.status(),201); const task = await run.json(); safe(task); assert.equal(task.integration,'manual-no-live-retrieval'); assert.equal(task.sources[0].retrievedAt,null);
  assert.equal((await call('/api/tasks','POST',input,{'idempotency-key':key})).status(),200);
  const reopened = await (await call('/api/projects/'+id)).json(); assert.equal(reopened.tasks.length,1); assert.equal(reopened.artifacts.length,1);
  const a = reopened.artifacts[0], edit = {title:'Reviewed synthetic Pages brief',content:'Synthetic owner review only. No AI or live retrieval.',revision:1};
  assert.equal((await call('/api/artifacts/'+a.id,'PATCH',edit)).status(),200); assert.equal((await call('/api/artifacts/'+a.id,'PATCH',edit)).status(),409);
  for (const format of ['md','json','csv','html']) { const r = await call('/api/artifacts/'+a.id+'?format='+format); assert.equal(r.status(),200); assert.ok(safe(await r.text()).includes(edit.content)); assert.ok(r.headers()['content-disposition'].includes('attachment')); }
  assert.equal((await call('/api/projects/'+id,'PATCH',{title:'Reopened Pages fixture'})).status(),200);
  assert.equal((await (await call('/api/projects/'+id)).json()).title,'Reopened Pages fixture');
  browser = await chromium.launch({headless:true,args:['--no-sandbox']}); const bc = await browser.newContext({storageState:await context.storageState()}); const page = await bc.newPage(); const errors=[]; page.on('pageerror',()=>errors.push('runtime error'));
  await page.goto(base,{waitUntil:'networkidle'}); await page.getByRole('region',{name:'Saved projects'}).getByRole('button',{name:'Reopened Pages fixture'}).click();
  await page.getByRole('region',{name:'Artifacts'}).getByRole('button',{name:edit.title}).click(); assert.equal(await page.getByRole('textbox',{name:'Markdown brief editor'}).inputValue(),edit.content);
  await page.reload(); await page.getByRole('button',{name:'Access & Security',exact:true}).click(); await page.getByRole('region',{name:'Access & Security',exact:true}).getByText('Access counters — VERIFIED').waitFor();
  await page.screenshot({path:'.qa/pages-remote-desktop.png',fullPage:true}); await page.setViewportSize({width:390,height:844}); assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)); await page.screenshot({path:'.qa/pages-remote-mobile.png',fullPage:true}); assert.deepEqual(errors,[]); await bc.close(); await browser.close(); browser=undefined;
  assert.equal((await call('/api/projects/'+id,'DELETE')).status(),200); projectId=undefined; assert.equal((await call('/api/projects/'+id)).status(),404); assert.equal((await query('SELECT id FROM conversations WHERE id=?',[id])).length,0);
  pass('Actual Pages D1 write independently queried; manual brief/provenance/replay/CAS/all exports/reopen/browser/dashboard/mobile/delete');
  const view = await (await call('/api/security')).json(), label = view.authentication.sessionLabel;
  const expired = await query('UPDATE sessions SET expires_at=? WHERE audit_id LIKE ? AND credential_hash=? RETURNING audit_id',[Date.now()-1000,label+'%',createHash('sha256').update(token).digest('hex')]); assert.equal(expired.length,1);
  assert.equal((await call('/api/security')).status(),401); await login(token);
  const finalView = await (await call('/api/security')).json(); safe(finalView);
  safe(await query('SELECT * FROM access_events ORDER BY created_at DESC LIMIT 200')); safe(await query('SELECT * FROM owner_credentials'));
  assert.equal((await call('/api/session','DELETE')).status(),200); assert.equal((await call('/api/security')).status(),401);
  if (process.env.PROBE_RATE_LIMIT === 'true') { let limited=false; for(let i=0;i<6;i++){const r=await call('/api/session','POST',{token:'invalid-rate-fixture'}); if(r.status()===429){limited=true;break;}assert.equal(r.status(),401);} assert.ok(limited); pass('actual login rate limit 429 without reset/spoof'); }
  pass('targeted synthetic session expiry and logout; audit/counters and known-secret absence in assets/ordinary data/verifier rows');
  writeFileSync('.qa/pages-'+deployment.environment+'-acceptance.json',JSON.stringify(report,null,2),{mode:0o600});
  console.log('PASS: Pages remote acceptance complete. No active credential rotation, revoke-all, Worker edit, legacy edit or DNS operation.');
} catch(error) { let message=String(error?.message??'Remote acceptance failed'); for(const value of secrets) message=message.replaceAll(value,'[redacted]'); console.error('FAIL: '+message.slice(0,2000)); process.exitCode=1; }
finally { if(projectId && context) await call('/api/projects/'+projectId,'DELETE').catch(()=>{}); if(context){await call('/api/session','DELETE').catch(()=>{});await context.dispose();} if(browser) await browser.close(); }
