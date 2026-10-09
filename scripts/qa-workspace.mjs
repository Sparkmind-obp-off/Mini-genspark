import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const required = [
  "README.md",
  "docs/01_RESEARCH_AND_FEATURE_PARITY.md",
  "docs/02_PROVIDER_FREE_TIER_REGISTRY.md",
  "docs/03_ARCHITECTURE.md",
  "docs/04_ROADMAP.md",
  "docs/05_SCRIPTS_AND_OPERATIONS.md",
  "docs/06_GENCODE_IMPLEMENTATION_PROMPT.md",
  "docs/07_RESEARCH_ACCEPTANCE_CASE_MK.md",
  "docs/08_DOGFOOD_AND_MONETIZATION.md",
  "docs/09_SELF_USE_AND_MONETIZATION.md",
  "docs/10_LOCAL_SETUP.md",
  "src/App.tsx",
  "src/worker.ts",
  "src/styles.css",
  "wrangler.jsonc",
  "migrations/0001_initial.sql",
  "scripts/gencode-provider-inventory.sh"
];

for (const path of required) {
  assert.ok(existsSync(path), "Required file missing: " + path);
}

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const worker = readFileSync("src/worker.ts", "utf8");
const app = readFileSync("src/App.tsx", "utf8");
const config = readFileSync("wrangler.jsonc", "utf8");
const readme = readFileSync("README.md", "utf8");

assert.ok(pkg.scripts.build, "Build command must exist.");
assert.ok(pkg.scripts.typecheck, "Typecheck command must exist.");
assert.ok(config.includes('"binding": "AI"'), "Workers AI binding must be configured.");
assert.ok(config.includes('"binding": "DB"'), "D1 binding must be configured.");
assert.ok(worker.includes('FREE_PLAN_CONFIRMED !== "true"'), "Model call must be disabled by default until free plan is confirmed.");
assert.ok(worker.includes("DAILY_APP_LIMIT_REACHED"), "Daily request quota guard must exist.");
assert.ok(worker.includes("OWNER_TOKEN_NOT_CONFIGURED"), "Missing owner token must fail closed.");
assert.ok(worker.includes("No paid fallback was attempted."), "Provider failure must not silently switch to paid usage.");
assert.ok(app.includes("not an actual AI inference"), "Demo output must be clearly labelled.");
assert.ok(app.includes("sessionStorage"), "Owner token must not be placed in committed frontend config.");
assert.ok(readme.includes("09_SELF_USE_AND_MONETIZATION.md"), "README must link to monetization plan.");
assert.ok(readme.includes("docs/10_LOCAL_SETUP.md"), "README must link to setup docs.");

console.log("Mini Genspark repository QA: PASS");
console.log("Checks: required files, provider binding, free-plan gate, daily quota gate, owner-token gate, honest demo mode, and docs links.");
console.log("This is static repository QA only; it does not prove the app compiles or a live provider call succeeds.");
