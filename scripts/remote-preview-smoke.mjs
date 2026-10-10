// Explicit, bounded BYOK remote acceptance. Never runs with npm test or deploys code.
// Credential lifecycle tests are separately opt-in and only safe on a NEW empty dedicated preview.
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { request, chromium } from '@playwright/test';
if (process.env.RUN_REMOTE_SMOKE !== 'true') { console.log('BLOCKED: explicit RUN_REMOTE_SMOKE=true required.'); process.exit(2); }
const config = JSON.parse(readFileSync('wrangler.preview.jsonc','utf8'));
const base = process.env.REMOTE_PREVIEW_URL; const expectedTag = process.env.EXPECTED_RELEASE_SHA;
if (!base || !/^https:\/\/vestrenhq-private-preview\.[a-z0-9-]+\.workers\.dev$/.test(base) || config.name !== 'vestrenhq-private-preview') { console.log('BLOCKED: exact dedicated workers.dev preview URL/config required.'); process.exit(2); }
let token = readFileSync('.qa/remote-owner-token.raw','utf8').trim();
const protectedValues = [token, process.env.CLOUDFLARE_API_TOKEN].filter(Boolean); let projectId; let context; let browser;
const report = { url: base, checkedAt: new Date().toISOString(), checks: [], version: null, credentialLifecycle: 'NOT_TESTED' };
function ensure(condition, label) { if (!condition) throw new Error(label); }
function passed(label) { report.checks.push(label); writeFileSync('.qa/remote-smoke-progress.json',JSON.stringify(report,null,2),{mode:0o600}); console.log('PASS: ' + label); }
async function call(path, method='GET', body, extra={}) {
  return context.fetch(base+path,{method,headers:{origin:base,...extra},...(body===undefined?{}:{data:body}),timeout:20000,maxRedirects:0});
}
async function cloud(path, body) {
  const r = await fetch('https://api.cloudflare.com/client/v4/accounts/'+config.account_id+path,{method:body?'POST':'GET',headers:{authorization:'Bearer '+process.env.CLOUDFLARE_API_TOKEN,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000),redirect:'error'});
  const data = await r.json(); ensure(r.ok && data.success,'Cloudflare verification/query failed HTTP '+r.status); return data.result;
}
async function query(sql, params=[]) { return (await cloud('/d1/database/'+config.d1_databases[0].database_id+'/query',{sql,params}))[0]; }
async function login(value, expected=200) {
  let r=await call('/api/session','POST',{token:value});
  if(r.status()===429 && expected===200) {
    const wait=(Math.floor(Date.now()/600000)+1)*600000-Date.now()+1500;
    console.log('INFO: respecting login throttle; bounded wait '+Math.ceil(wait/1000)+' seconds, no limit reset or IP spoof.');
    await new Promise(resolve=>setTimeout(resolve,wait)); r=await call('/api/session','POST',{token:value});
  }
  ensure(r.status()===expected,'Login status mismatch (expected '+expected+', got '+r.status()+')');return r;
}
async function install(generated) {
  // Save recoverable private candidate BEFORE changing runtime secret; never print it.
  protectedValues.push(generated.token);
  writeFileSync('.qa/remote-owner-token.raw',generated.token,{mode:0o600});
  const result=spawnSync('npx',['wrangler','secret','put','OWNER_ACCESS_TOKEN','--config','wrangler.preview.jsonc'],{input:generated.token,encoding:'utf8',timeout:120000});
  if(result.status!==0){let details=(result.stderr||result.stdout||'').slice(0,2000);for(const value of protectedValues)details=details.replaceAll(value,'[redacted]');throw new Error('Secret install failed: '+details);}
  token=generated.token;
}
async function noSecret(value,label) { const text=typeof value==='string'?value:JSON.stringify(value); ensure(!protectedValues.some(secret=>text.includes(secret)),label); }
try {
  ensure(/^[a-f0-9]{64}$/.test(token),'Expected high-entropy preview token in private input file');
  const metadata=await cloud('/d1/database/'+config.d1_databases[0].database_id); ensure(metadata.name===config.name,'Wrong D1 target');
  context=await request.newContext({timeout:20000});
  const health=await call('/api/health'); ensure(health.status()===200,'Remote health failed'); const h=await health.json();
  ensure(h.app==='vestrenhq' && h.publicLaunch===false && h.status==='owner-only','Unexpected preview health');
  ensure(h.version?.id && (!expectedTag || h.version.tag===expectedTag),'Deployed version/tag does not match release SHA'); report.version=h.version;
  passed('remote health, owner-only boundary and Cloudflare runtime version/tag');
  for(const path of ['/api/projects','/api/providers','/api/security','/api/tasks/'+crypto.randomUUID(),'/api/artifacts/'+crypto.randomUUID()]){const r=await call(path);ensure(r.status()===401,'Anonymous private read allowed: '+path.split('/')[2]);await noSecret(await r.text(),'Secret in anonymous response');}
  for(const path of ['/api/credentials/generate','/api/credentials/authorize-export','/api/credentials/revoke'])ensure((await call(path,'POST',{confirm:true})).status()===401,'Anonymous credential action allowed');
  passed('anonymous private reads and credential actions denied');
  await login('invalid-preview-test-credential',401); const valid=await login(token);
  const cookie=valid.headers()['set-cookie']||''; protectedValues.push(cookie);
  ensure(cookie.includes('__Host-vestren-session=') && cookie.includes('HttpOnly') && cookie.includes('Secure') && cookie.includes('SameSite=Strict') && cookie.includes('Max-Age=28800'),'Unsafe session cookie attributes');
  const baseline=await (await call('/api/security')).json(); ensure(baseline.authentication.status==='VERIFIED' && baseline.counters.failed>=1 && baseline.counters.successful>=1 && baseline.counters.activeSessions>=1,'Unverified session/counters');
  ensure(baseline.configuration.d1.status==='VERIFIED' && baseline.configuration.migrations.status==='VERIFIED' && baseline.configuration.deployment.status==='VERIFIED','Runtime/binding/schema not verified'); await noSecret(baseline,'Secret in dashboard');
  passed('invalid login denial, valid login, secure cookie, real D1/schema/session/audit counters');
  ensure((await call('/api/credentials/generate','POST',{confirm:true},{origin:'https://attacker.example'})).status()===403,'Cross-origin mutation allowed');
  const absent=crypto.randomUUID();ensure((await call('/api/projects/'+absent)).status()===404,'Missing/foreign project exposed');
  passed('cross-origin rejection and nonexistent private-resource denial');
  const id=crypto.randomUUID();const create=await call('/api/projects','POST',{title:'Synthetic remote smoke project'},{'idempotency-key':id});ensure(create.status()===201,'Project creation failed'); projectId=id;
  const source=await call('/api/projects/'+id+'/sources','POST',{title:'Synthetic supplied evidence',evidence:'REMOTE TEST FIXTURE ONLY: no business/customer data; no live retrieval.'});ensure(source.status()===201,'Source save failed');
  const key=crypto.randomUUID();const input={mode:'research',prompt:'Organize the supplied synthetic evidence.',conversationId:id,workflow:'manual-brief'};
  const run=await call('/api/tasks','POST',input,{'idempotency-key':key});ensure(run.status()===201,'Manual brief failed'); const task=await run.json();ensure(task.integration==='manual-no-live-retrieval' && task.sources[0].retrievedAt===null,'Dishonest source provenance');
  ensure((await call('/api/tasks','POST',input,{'idempotency-key':key})).status()===200,'Task replay failed');
  const reopened=await (await call('/api/projects/'+id)).json();ensure(reopened.tasks.length===1 && reopened.artifacts.length===1,'Persisted/replayed project mismatch');
  const a=reopened.artifacts[0];const edited={title:'Reviewed synthetic brief',content:'Owner-reviewed synthetic test only.',revision:1};ensure((await call('/api/artifacts/'+a.id,'PATCH',edited)).status()===200,'Edit save failed');ensure((await call('/api/artifacts/'+a.id,'PATCH',edited)).status()===409,'Stale edit was accepted');
  const exported=await call('/api/artifacts/'+a.id+'?format=md');ensure(exported.status()===200 && await exported.text()===edited.content,'Saved export mismatch');
  ensure((await call('/api/projects/'+id,'DELETE')).status()===200,'Synthetic project cleanup failed'); projectId=undefined;ensure((await call('/api/projects/'+id)).status()===404,'Deleted project remains accessible');
  passed('real remote D1 project/source/manual brief/idempotency/edit-CAS/export/reopen/delete');
  const beforeExpiry=await (await call('/api/security')).json(); const label=beforeExpiry.authentication.sessionLabel;
  const expired=await query('UPDATE sessions SET expires_at=? WHERE audit_id LIKE ? AND credential_hash=? RETURNING audit_id',[Date.now()-1000,label+'%',createHash('sha256').update(token).digest('hex')]);ensure(expired.results?.length===1,'Did not target exactly the synthetic smoke session');
  ensure((await call('/api/security')).status()===401,'Expired session authorized');passed('remote session expiry rejects protected operations');
  await login(token);ensure((await call('/api/session','DELETE')).status()===200,'Logout failed');ensure((await call('/api/security')).status()===401,'Logged-out session authorized');passed('remote logout revocation');
  await login(token);
  if(process.env.ALLOW_PREVIEW_CREDENTIAL_TESTS==='true') {
    const existing=await (await call('/api/projects')).json();ensure(Array.isArray(existing)&&existing.length===0,'Credential lifecycle tests require NEW empty dedicated preview');
    const oldToken=token;const oldCookie=(await context.storageState()).cookies;
    const candidateResponse=await call('/api/credentials/generate','POST',{confirm:true});ensure(candidateResponse.status()===200,'Candidate generation failed');const candidate=await candidateResponse.json();ensure(/^[a-f0-9]{64}$/.test(candidate.token) && candidate.status==='pending','Candidate is not secure/pending');
    await install(candidate);await login(token);
    const oldContext=await request.newContext({storageState:{cookies:oldCookie,origins:[]}});ensure((await oldContext.get(base+'/api/security')).status()===401,'Old rotated session remains authorized');await oldContext.dispose();
    const newView=await (await call('/api/security')).json();ensure(newView.credential.status==='active' && newView.credential.createdAt===candidate.createdAt,'Rotation metadata not settled');
    const oldMetadata=await query('SELECT status FROM owner_credentials WHERE fingerprint=?',[createHash('sha256').update(oldToken).digest('hex')]);ensure(oldMetadata.results[0]?.status==='rotated','Old credential not rotated');
    passed('actual remote generation, Worker-secret rotation, new login and old-session invalidation');
    // Prepare a recoverable replacement before deliberate active credential revocation.
    const recoveryResponse=await call('/api/credentials/generate','POST',{confirm:true});ensure(recoveryResponse.status()===200,'Recovery candidate generation failed');const recovery=await recoveryResponse.json();protectedValues.push(recovery.token);
    writeFileSync('.qa/recovery-owner-token.raw',recovery.token,{mode:0o600});
    ensure((await call('/api/credentials/revoke','POST',{confirm:true})).status()===200,'Active credential revoke failed');ensure((await call('/api/security')).status()===401,'Revoked credential session authorized');
    const revoked=await query('SELECT status FROM owner_credentials WHERE fingerprint=?',[createHash('sha256').update(token).digest('hex')]);ensure(revoked.results[0]?.status==='revoked','Active credential not marked revoked');
    await install(recovery);await login(token);
    writeFileSync('.qa/vestrenhq-owner-credential.txt',`VestrenHQ\nPurpose: owner application login (NOT a Cloudflare API token)\nEnvironment: private-preview\nCreated: ${recovery.createdAt}\nSECRET: save in a password manager; never commit, share or paste into chat.\nToken: ${token}\nThis is the verified active replacement; previous smoke credentials were rotated/revoked.\n`,{mode:0o600});
    passed('actual active-credential revocation and recovery with verified NEW replacement');report.credentialLifecycle='PASS';
  } else passed('credential mutation/rotation tests skipped (NOT_TESTED; separate explicit authorization required)');
  const current=await (await call('/api/security')).json();await noSecret(current,'Secret in ordinary security responses');
  const stored=await query('SELECT * FROM access_events ORDER BY created_at DESC LIMIT 200');await noSecret(stored,'Secret in remote audit records');const verifiers=await query('SELECT * FROM owner_credentials');await noSecret(verifiers,'Plaintext token in credential metadata');
  const html=await (await call('/')).text();await noSecret(html,'Secret in remote shell');
  for(const match of html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)){const path=match[1];const r=await call(path);ensure(r.status()===200,'Asset load failed');const body=await r.text();await noSecret(body,'Secret in remote frontend asset');const local=readFileSync('dist'+path,'utf8');ensure(body===local,'Remote asset does not match built release');}
  passed('no known plaintext credentials in remote shell/assets/dashboard/audit/credential records; assets match release build');
  const cookies=(await context.storageState()).cookies;browser=await chromium.launch({headless:true,args:['--no-sandbox']});const browserContext=await browser.newContext({storageState:{cookies,origins:[]}});const page=await browserContext.newPage();const errors=[];page.on('pageerror',()=>errors.push('page runtime error'));
  await page.goto(base,{waitUntil:'networkidle'});await page.getByRole('button',{name:'Access & Security',exact:true}).click();await page.getByRole('region',{name:'Access & Security',exact:true}).getByText('Access counters — VERIFIED').waitFor();ensure(errors.length===0,'Remote browser runtime error');await browserContext.close();await browser.close();browser=undefined;passed('actual remote browser owner dashboard renders with runtime data');
  if(process.env.ALLOW_PREVIEW_CREDENTIAL_TESTS==='true') {
    ensure((await call('/api/sessions','DELETE')).status()===200,'Revoke-all failed');ensure((await call('/api/security')).status()===401,'Revoked-all cookie remains authorized');passed('revoke-all rejects former session');
  } else { ensure((await call('/api/session','DELETE')).status()===200,'Final logout failed');passed('current smoke session revoked without revoking other owner sessions'); }
  // Exactly bounded rejection test; does not alter global limits or spoof CF connecting IP.
  for(let i=0;i<6;i++){const r=await call('/api/session','POST',{token:'invalid-rate-fixture'});if(r.status()===429){passed('actual remote login rate limit returns 429');break;}ensure(r.status()===401,'Unexpected rate probe result');if(i===5)throw new Error('Rate limit not reached within bounded probes');}
  const audited=await query("SELECT category,event_count FROM access_counts WHERE category IN ('AUTH_SUCCESS','AUTH_FAILURE','UNAUTHORIZED_REQUEST','FORBIDDEN_REQUEST','SESSION_CREATED','SESSION_REVOKED','CREDENTIAL_ROTATION_COMPLETED','CREDENTIAL_REVOKED')");ensure(audited.results.some(row=>row.category==='AUTH_FAILURE' && row.event_count>=1),'Audit counters not updated');passed('remote audit counters reflect authentication, rejection, session and credential events');
  report.checkedAt=new Date().toISOString();writeFileSync('.qa/remote-smoke-result.json',JSON.stringify(report,null,2),{mode:0o600});console.log('PASS: remote acceptance complete; no secret/session values printed. Owner token retained only in protected delivery input until upload.');
} catch(error) { let message=String(error?.message??'Remote smoke failed');for(const value of protectedValues)message=message.replaceAll(value,'[redacted]');console.error('FAIL: '+message.slice(0,2500));process.exitCode=1; }
finally { if(projectId&&context)await call('/api/projects/'+projectId,'DELETE').catch(()=>{});if(context){await call('/api/session','DELETE').catch(()=>{});await context.dispose();}if(browser)await browser.close(); }
