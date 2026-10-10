# VestrenHQ — Vestren AI Workspace

Turn a business/product question into a traceable brief and an editable next-step deliverable. The first workflow, not a large feature catalogue, is the product focus. Market/paid-pilot assumptions remain unvalidated.

## Current release truth

**Tested local release candidate; public/commercial production NO-GO. Not deployed.** Private single-owner sessions are not public SaaS authentication. The real local workflow works without provider calls using owner-supplied excerpts, honestly labelled **provided-not-retrieved**. It does not fetch pasted URLs, independently verify facts or pretend a template is AI inference.

Implemented and locally tested:
- Owner login/logout with hashed D1 sessions, HttpOnly/Secure host cookies outside localhost, expiry, CSRF/exact Origin and private record checks.
- Create/open/rename/delete projects; add/remove at most five permitted excerpts; questions, runs, sources and artifacts persist.
- Structured manual brief: provided evidence, independently verified facts (none), working interpretation, assumptions, unknowns and next steps.
- Editable Markdown artifacts with optimistic revision checks, safe text preview/copy and authorized MD/JSON/CSV/static escaped HTML export. Original run/evidence snapshots remain unchanged after editing; edits are not fact-checked.
- Explicit Workers AI/Groq/Tavily adapters, disabled until free-only account policy and live proof. No paid fallback, retries, top-up or sandbox substitution.
- Daily attempt caps, source/project/output/request/time/concurrency limits; per-run reserved/consumed/released ledger. Failed provider reservations release; anti-abuse attempt counts remain. These are not paid customer credits.
- Public scope-matching `/privacy`, `/terms`, `/pricing`, `/support`, `/status` pages. A monitored support channel is not claimed unless configured and verified.

**Evidence:** 51 automated unit/provider/API/D1/React tests passed; browser fixture checks passed; actual local Worker+D1 browser journey passed without HTTP/provider mocks. Dependency audit reported zero vulnerabilities. Cloudflare BYOK account authentication and read-only inventory succeeded, but no Vestren Worker/D1 target exists in the observed inventory. Wrangler dry-run validates packaging, not cloud target readiness. See NOW.md and the release/gap documents for exact evidence and open gates.

## Reproduce locally

Node 22+, npm, local Wrangler; lockfile is now tracked. No real vendor key is needed for ordinary tests.

```sh
npm ci
npm run typecheck
npm test
npm run build
npm run qa
npm audit --json
npm run db:migrate:local
```

Privately copy `.dev.vars.example` to ignored `.dev.vars`, set a random application-specific `OWNER_ACCESS_TOKEN` (32–256 characters) via a private editor/secret loader, chmod 600, and leave all provider policy flags false. Never use a vendor/Cloudflare/merchant key as the app token or put secrets in VITE variables. The session's real local acceptance used an agent-generated temporary app secret in this ignored mechanism, never printed or committed.

```sh
npm run build
pm2 start ecosystem.config.cjs
curl http://localhost:3000/api/health
npx playwright install --with-deps chromium
npm run test:browser    # actual route denial + explicitly mocked provider UI
npm run test:workflow   # actual local login/project/excerpt/brief/edit/export/reopen/delete
```

PM2 config uses `/home/user/webapp`; change cwd on another machine. Frontend-only `npm run dev` has no API. `wrangler dev --local` AI bindings are still remote if invoked, so never enable them casually. Tests replace optional inference/search; the manual workflow invokes neither. Live smoke script is opt-in and fails preflight unless owner permission/free quota are verified.

## Use the primary workflow

1. Open Settings and log in with the separate application token.
2. Choose **Start research project**, keep **Provided excerpts — no live retrieval / AI**, enter a project title and create it.
3. Add permitted excerpt/document text and an optional source URL. A URL alone is not evidence and is not fetched.
4. Enter the business question and submit. Inspect provenance/limitations; none of the supplied text is automatically verified.
5. Open an artifact, edit working interpretation/assumptions/next actions, save the revision, then copy/download.
6. Reopen the saved project after reload, rename it or delete it. Removing one current source does not remove immutable snapshots from old runs; project deletion/retention does.

Live Research is a separate explicit workflow requiring Tavily plus an approved inference provider; configured flags are not live verification. Other modes are limited text inference/analysis, not executed repository work or uploads. No money is accepted.

## Routes and data

| Routes | Actual contract |
|---|---|
| GET `/api/health` | Minimal public owner-only status |
| POST/GET/DELETE `/api/session` | `{token}` login / check / revoke, 8-hour sessions |
| GET `/api/providers` | Authenticated configuration/attempt counters/limitations, no secret values or account balance |
| POST/GET `/api/projects` | `{title}` + UUID Idempotency-Key creates research project; list most recent 50 |
| GET/PATCH/DELETE `/api/projects/:id` | Open / `{title}` rename / guarded atomic deletion |
| POST `/api/projects/:id/sources` | `{title,url?,evidence}` supplied excerpt, never page fetch |
| DELETE `/api/projects/:id/sources/:sourceId` | Remove current source; old run snapshots retained |
| POST `/api/tasks` | `{mode,prompt,inputType?,conversationId?,workflow?}`, UUID Idempotency-Key; research manual-brief requires existing project/excerpts |
| GET `/api/tasks/:id` | Durable run status/evidence/result/provenance |
| GET/PATCH `/api/artifacts/:id` | Content/metadata/revision; edit `{title,content,revision}` with conflict 409 |
| GET `/api/artifacts/:id?format=md|json|csv|html` | Authorized saved-revision attachment |
| `/api/conversations`, `/api/chat` | Compatibility routes for the same project aggregate/new task contract |
| `/privacy`, `/terms`, `/pricing`, `/support`, `/status` | Honest public trust/scope pages |

Every private request uses server-derived owner identity; mutations require trusted same-origin Origin. Errors include code/message/request ID; no upstream secret bodies/stack traces. Projects reuse the existing conversation aggregate to avoid parallel schema/history. Additive 0002 adds the tested foundation; 0003 adds normalized provided-source records, artifact edit revisions and a usage ledger. 0001 is unchanged. Small text artifacts remain in D1; R2 is unnecessary for this bounded use case. No runtime filesystem, arbitrary fetcher, upload/sandbox execution or payment ledger exists.

Limits: 50 projects, 30 runs/project, five supplied excerpts/project, 2000 chars/excerpt, 4000-char question, 64 KB UTF-8 artifact, 18 KB ordinary request/128 KB editor body, 4 runs/minute, 30 workspace mutations/minute, at most 20 provider attempts/day and 100 searches/month. Content/event retention is lazy 30 days; deletion does not refund anti-abuse counters. Backup/vendor deletion guarantees remain separately unverified.

## Operating and deployment decisions

- Canonical repo: https://github.com/Sparkmind-obp-off/Vestrenhq (verified rename from Mini-genspark).
- **Source control:** owner-directed direct commits/pushes to `main`; no new branches or pull requests for routine implementation. The existing PRs #4 and #5 are already merged.
- **Release:** no GitHub Actions/CI or automated deployment. Local QA + manual Wrangler release only.
- **Private preview target:** `vestrenhq-private-preview` Worker and D1; no custom DNS, paid provider activation, payments, or public launch.
- Wrangler Worker/D1 names are aligned to Vestren, but the D1 ID remains a placeholder. No deployment or remote mutation has been performed from this session because the authenticated Cloudflare BYOK runtime is not available here.
- The latest code changes address delayed private UI responses after logout and orphan-task creation at the 50-project cap. Regression tests were added but have **not** been rerun after those changes.
- Public multi-user auth, live retrieval/inference proof, backup/restore, observability, Duitku payments, Daytona sandbox, and customer-validation evidence remain open gates. See [current gap assessment and private-preview release plan](docs/27_CURRENT_GAP_ASSESSMENT_AND_DIRECT_MAIN_RELEASE.md).

## Canonical product documents

[Constitution](docs/00_VESTREN_PRODUCT_CONSTITUTION.md), [Architecture](docs/03_ARCHITECTURE.md), [Roadmap](docs/04_ROADMAP.md), [Migration](docs/11_VESTREN_MIGRATION_PLAN.md), [Full stack](docs/12_VESTREN_FULL_STACK_ARCHITECTURE.md), [Commercial blueprint](docs/13_COMMERCIAL_STARTUP_BLUEPRINT.md), [Product spec](docs/14_COMMERCIAL_PRODUCT_SPEC.md), [Pricing](docs/15_PRICING_AND_GO_TO_MARKET.md), [Release gates](docs/16_COMMERCIAL_RELEASE_GATES.md), [Trust/privacy](docs/17_TRUST_PRIVACY_AND_OPERATIONS.md), [Gap register](docs/18_COMMERCIAL_GAP_REGISTER.md), [Free-first/payment plan](docs/19_FREE_FIRST_BOOTSTRAP_AND_MONETIZATION.md), [Discovery](docs/20_ICP_AND_CUSTOMER_DISCOVERY.md), [Positioning](docs/21_POSITIONING_AND_LANDING_PAGE.md), [GTM](docs/22_GO_TO_MARKET_EXECUTION_PLAYBOOK.md), [Support](docs/23_CUSTOMER_SUPPORT_AND_SUCCESS_RUNBOOK.md), [Manual release](docs/24_CLOUDFLARE_WORKERS_MANUAL_RELEASE_RUNBOOK.md), [Metrics](docs/25_PRODUCT_METRICS_AND_EXPERIMENT_LOG.md), [Current gap assessment & private-preview release](docs/27_CURRENT_GAP_ASSESSMENT_AND_DIRECT_MAIN_RELEASE.md).

Next: approve/identify an isolated private BYOK Worker+D1 target, then complete live retrieval/inference and recovery proofs. Public paid launch stays NO-GO; Daytona and Duitku remain selected but disabled/unimplemented rather than falsely integrated.
