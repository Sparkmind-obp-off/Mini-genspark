import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const required = ['README.md','NOW.md','docs/00_VESTREN_PRODUCT_CONSTITUTION.md','docs/03_ARCHITECTURE.md','docs/04_ROADMAP.md','docs/14_COMMERCIAL_PRODUCT_SPEC.md','docs/16_COMMERCIAL_RELEASE_GATES.md','docs/18_COMMERCIAL_GAP_REGISTER.md','docs/24_CLOUDFLARE_WORKERS_MANUAL_RELEASE_RUNBOOK.md','src/App.tsx','src/worker.ts','src/domain.ts','src/providers.ts','src/workspace.ts','src/policies.ts','src/worker.test.ts','package-lock.json','migrations/0001_initial.sql','migrations/0002_workspace.sql','migrations/0003_projects_and_edits.sql','migrations/0004_owner_security.sql','src/security.ts','src/AccessSecurity.tsx','wrangler.preview.jsonc','scripts/release-preflight.mjs'];
for (const file of required) assert.ok(existsSync(file), 'Missing required file: '+file);
assert.ok(!existsSync('.github/workflows') || readdirSync('.github/workflows').length === 0,'No GitHub Actions/workflows allowed');
const pkg = JSON.parse(readFileSync('package.json','utf8')); assert.equal(pkg.name,'vestrenhq'); assert.ok(pkg.scripts.test.includes('vitest') && pkg.scripts.typecheck && pkg.scripts.build);
const config = readFileSync('wrangler.jsonc','utf8');
for (const policy of ['FREE_PLAN_CONFIRMED','GROQ_FREE_PLAN_CONFIRMED','TAVILY_FREE_PLAN_CONFIRMED']) assert.ok(config.includes('"'+policy+'": "false"'),'Default disabled policy required: '+policy);
assert.ok(config.includes('run_worker_first') && config.includes('"binding": "DB"'),'API routing and D1 binding required');
const app = readFileSync('src/App.tsx','utf8') + readFileSync('src/AccessSecurity.tsx','utf8'); const worker = readFileSync('src/worker.ts','utf8');
assert.ok(!/sessionStorage\.setItem|localStorage\.setItem|dangerouslySetInnerHTML/.test(app),'No credential browser storage or unsafe HTML rendering');
for (const guard of ['OWNER_TOKEN_NOT_CONFIGURED','IDEMPOTENCY_CONFLICT','ORIGIN_REJECTED','DAILY_APP_LIMIT_REACHED','HttpOnly','__Host-vestren-session']) assert.ok(worker.includes(guard),'Guard required: '+guard);
assert.ok(readFileSync('src/workspace.ts','utf8').includes('ARTIFACT_REVISION_CONFLICT'),'Optimistic edit conflicts required');
const patterns = [/apify_api_[a-zA-Z0-9]{20,}/,/fc-[a-f0-9]{32}/,/tvly-(?:dev|prod)-[a-zA-Z0-9_-]{20,}/,/dtn_[a-f0-9]{40,}/,/gh[pousr]_[a-zA-Z0-9]{30,}/,/sk-(?:proj-)?[a-zA-Z0-9_-]{40,}/];
const secretValues = existsSync('.dev.vars') ? readFileSync('.dev.vars','utf8').split('\n').filter(line=>/^(?:OWNER_ACCESS_TOKEN|.*_API_KEY|.*_TOKEN|.*_SECRET)=/.test(line)).map(line=>line.slice(line.indexOf('=')+1).trim()).filter(value=>value.length>=20) : [];
for(const file of ['.qa/remote-owner-token.raw','.qa/recovery-owner-token.raw']) if(existsSync(file)) { const value=readFileSync(file,'utf8').trim(); if(value.length>=32) secretValues.push(value); }
if(process.env.CLOUDFLARE_API_TOKEN?.length>=20) secretValues.push(process.env.CLOUDFLARE_API_TOKEN);
let files=0;
function check(text, label) { assert.ok(!patterns.some(p=>p.test(text)) && !secretValues.some(value=>text.includes(value)),'Possible secret detected; value suppressed: '+label); }
function scan(dir) { for (const entry of readdirSync(dir,{withFileTypes:true})) { const path=dir+'/'+entry.name; if(entry.isDirectory())scan(path); else if(/\.(?:js|mjs|ts|tsx|html|css|md|json|jsonc|sql|yml)$/.test(path)){check(readFileSync(path,'utf8'),path);files++;} } }
for(const dir of ['src','scripts','docs','migrations','dist','.qa/worker'])if(existsSync(dir))scan(dir);
for(const file of ['README.md','NOW.md','package.json','wrangler.jsonc','wrangler.preview.jsonc','.dev.vars.example']) check(readFileSync(file,'utf8'),file);
assert.equal(execFileSync('git',['check-ignore','vestrenhq-owner-credential.txt','.dev.vars.owner-bootstrap.txt'],{encoding:'utf8'}).trim().split('\n').length,2,'Credential downloads/bootstrap must be ignored');
const preview = JSON.parse(readFileSync('wrangler.preview.jsonc','utf8'));
assert.ok(!preview.ai && !preview.routes && !preview.triggers, 'No paid binding/routes/cron activation in preview');
check(execFileSync('git',['log','--all','-p','--format='],{encoding:'utf8',maxBuffer:30_000_000}),'git history');
console.log('Vestren static QA PASS: canonical files/no workflow invariant, disabled policies, auth/cost/edit guards, '+files+' files + git history scanned (known patterns and configured local secret values).');
console.log('Pattern scan is not a universal credential guarantee. Provider live proofs, cloud release and commercial gates remain separate.');
