// Operator build only; no deployment, cloud writes, credentials or runtime Node APIs.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const dirty = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim().length > 0;
execFileSync('npx', ['wrangler', 'pages', 'functions', 'build', 'functions', '--outdir', 'dist/_worker.js', '--output-routes-path', 'dist/_routes.json', '--compatibility-date', '2026-10-10'], { stdio: 'inherit' });
let bundle = readFileSync('dist/_worker.js/index.js', 'utf8');
for (const [marker, value] of [['__VESTREN_RELEASE_SHA__', commit], ['__VESTREN_RELEASE_DIRTY__', String(dirty)]]) {
  assert.ok(bundle.includes(marker), 'Missing server release marker');
  bundle = bundle.replaceAll(marker, value);
}
writeFileSync('dist/_worker.js/index.js', bundle);
const routes = JSON.parse(readFileSync('dist/_routes.json', 'utf8'));
assert.ok(routes.include.includes('/*') && routes.exclude.length === 0, 'Every request must retain server headers, API routing and policy handling');
console.log('Pages Functions built from commit ' + commit + '; dirty=' + dirty + '. This is build provenance, not cloud deployment proof.');
