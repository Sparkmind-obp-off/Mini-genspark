// Real local Worker/D1/browser workflow. No HTTP/provider mocks; supplied evidence is a labelled test input.
import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
const base = 'http://localhost:3000';
const vars = await readFile('.dev.vars', 'utf8').catch(() => '');
const token = /^OWNER_ACCESS_TOKEN=(.+)$/m.exec(vars)?.[1]?.trim();
if (!token || token.length < 32) { console.log('BLOCKED: configure an ignored local OWNER_ACCESS_TOKEN; no provider secret is needed.'); process.exit(2); }
await mkdir('.qa', { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
let context; let projectId;
try {
  context = await browser.newContext({ viewport: { width: 1365, height: 900 }, permissions: ['clipboard-read','clipboard-write'] });
  const page = await context.newPage(); const errors = []; const vendorRequests = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('request', r => { if (!r.url().startsWith(base)) vendorRequests.push(r.url()); });
  await page.goto(base); await page.getByRole('button', { name: 'Open settings' }).click();
  await page.getByLabel('Application owner token (not a provider API key)').fill(token); await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible(); await page.getByRole('button', { name: 'Close settings' }).click();
  await page.getByRole('button', { name: 'Start research project' }).click();
  const projectTitle = 'Local acceptance question ' + Date.now(); await page.getByLabel('Project title', { exact: true }).fill(projectTitle);
  const created = page.waitForResponse(r => new URL(r.url()).pathname === '/api/projects' && r.request().method() === 'POST'); await page.getByRole('button', { name: 'Create research project' }).click();
  const createResponse = await created; assert.equal(createResponse.status(),201); projectId = (await createResponse.json()).id;
  await page.getByLabel('Source title', { exact: true }).fill('Owner-provided test excerpt'); await page.getByLabel('Source URL (optional; not fetched)').fill('https://example.org/evidence');
  await page.getByLabel('Permitted source excerpt / document text').fill('LOCAL ACCEPTANCE INPUT: option A has a stated price of 10 and option B of 20. These invented fixture figures are not real vendor evidence.');
  await page.getByRole('button', { name: 'Add supplied evidence' }).click(); await expect(page.getByText('Owner-provided evidence (1/5)')).toBeVisible();
  await page.getByRole('textbox', { name: 'Task prompt' }).fill('Organize the supplied information into a comparison brief; distinguish assumptions and unknowns.');
  await page.getByRole('button', { name: 'Run task' }).click(); await expect(page.getByText('SUCCEEDED · local-evidence-template · evidence-brief-v1')).toBeVisible();
  const artifactButton = page.getByRole('region', { name: 'Artifacts' }).getByRole('button').first(); await artifactButton.click();
  const editor = page.getByRole('textbox', { name: 'Markdown brief editor' }); const original = await editor.inputValue(); assert.ok(original.includes('None. These excerpts were supplied')); assert.ok(original.includes('Not AI-generated'));
  const edit = original + '\n\n## Owner-reviewed next action\nRequest actual vendor evidence before choosing an option.';
  await editor.fill(edit); await page.getByLabel('Artifact title', { exact: true }).fill('Reviewed local comparison brief');
  await page.getByRole('button', { name: 'Save artifact edits' }).click(); await expect(page.getByText(/Artifact saved, revision 2/)).toBeVisible();
  await page.getByRole('button', { name: 'Copy artifact' }).click(); assert.equal(await page.evaluate(() => navigator.clipboard.readText()), edit);
  const pendingDownload = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download MD' }).click(); const download = await pendingDownload; assert.equal(await readFile(await download.path(),'utf8'), edit);
  const renamedTitle = projectTitle + ' reviewed'; await page.getByLabel('Project title', { exact: true }).fill(renamedTitle); await page.getByRole('button', { name: 'Rename project' }).click(); await expect(page.getByRole('region',{name:'Saved projects'}).getByRole('button',{name:renamedTitle})).toBeVisible();
  await page.reload(); await page.getByRole('region',{name:'Saved projects'}).getByRole('button',{name:renamedTitle}).click(); await expect(page.getByText('SUCCEEDED · local-evidence-template · evidence-brief-v1')).toBeVisible();
  await page.getByRole('region',{name:'Artifacts'}).getByRole('button',{name:'Reviewed local comparison brief'}).click(); assert.equal(await editor.inputValue(),edit);
  await page.screenshot({ path:'.qa/vestren-real-local-workflow.png', fullPage:true }); await page.setViewportSize({width:390,height:844}); assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
  await page.screenshot({ path:'.qa/vestren-real-local-mobile.png', fullPage:true });
  page.once('dialog', dialog=>dialog.accept()); await page.getByRole('button',{name:'Delete project',exact:true}).click(); await expect(page.getByRole('region',{name:'Saved projects'}).getByRole('button',{name:renamedTitle})).toHaveCount(0);
  assert.equal((await context.request.get(base+'/api/projects/'+projectId)).status(),404); projectId = null;
  await page.getByRole('button',{name:'Open settings'}).click(); await page.getByRole('button',{name:'Log out'}).click(); assert.equal((await context.request.get(base+'/api/providers')).status(),401);
  assert.deepEqual(errors,[]); assert.deepEqual(vendorRequests,[]);
  console.log('PASS: real local login → project → supplied source ledger → manual brief → edit/CAS save → copy/MD export → rename → reload/reopen → deletion/logout; desktop/mobile; no provider/network retrieval.');
} catch (error) { console.error('WORKFLOW_FAILED: ' + String(error?.message ?? error).replaceAll(token,'[redacted]').slice(0,2500)); process.exitCode=1; }
finally {
  if (projectId && context) { await context.request.delete(base+'/api/projects/'+projectId,{headers:{origin:base}}).catch(()=>{}); }
  if (context) { await context.request.delete(base+'/api/session',{headers:{origin:base}}).catch(()=>{}); await context.close(); }
  await browser.close();
}
