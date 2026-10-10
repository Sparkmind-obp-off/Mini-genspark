# VestrenHQ — Vestren AI Workspace

Turn a business/product question into a traceable brief and an editable next-step deliverable. The first workflow, not a large feature catalogue, is the product focus. Market/paid-pilot assumptions remain unvalidated.

## Current release truth

**Cloudflare BYOK owner-only preview DEPLOYED and remotely verified; public/commercial production NO-GO.** Preview: https://vestrenhq-private-preview.sparkmind-support.workers.dev. Public shell/health/policies are intentionally reachable; all private data and owner actions require application authentication. Private single-owner sessions are not public SaaS authentication. The real local workflow works without provider calls using owner-supplied excerpts, honestly labelled **provided-not-retrieved**. It does not fetch pasted URLs, independently verify facts or pretend a template is AI inference.

Implemented and locally tested:
- Owner login/logout with hashed D1 sessions, HttpOnly/Secure host cookies outside localhost, expiry, CSRF/exact Origin and private record checks. Rotation of the application secret now invalidates old sessions; revoke-all and active-credential revocation are available.
- Protected **Access & Security / Authentication & Credentials** panel: real D1 counters/events, one-time 256-bit replacement token generation, explicit copy/TXT download, pending cancellation, guided manual Worker secret installation and verified replacement login. No Cloudflare API token enters the browser; no plaintext application token is stored in D1 or retrievable by dashboard APIs.
- Create/open/rename/delete projects; add/remove at most five permitted excerpts; questions, runs, sources and artifacts persist.
- Structured manual brief: provided evidence, independently verified facts (none), working interpretation, assumptions, unknowns and next steps.
- Editable Markdown artifacts with optimistic revision checks, safe text preview/copy and authorized MD/JSON/CSV/static escaped HTML export. Original run/evidence snapshots remain unchanged after editing; edits are not fact-checked.
- Explicit Workers AI/Groq/Tavily adapters, disabled until free-only account policy and live proof. No paid fallback, retries, top-up or sandbox substitution.
- Daily attempt caps, source/project/output/request/time/concurrency limits; per-run reserved/consumed/released ledger. Failed provider reservations release; anti-abuse attempt counts remain. These are not paid customer credits.
- Public scope-matching `/privacy`, `/terms`, `/pricing`, `/support`, `/status` pages. A monitored support channel is not claimed unless configured and verified.

**Evidence:** 67 unit/provider/API/D1/React tests plus local browser checks passed at release `a2e46a23ef5c58e95c1ad438575c89fabfd004e3`. Dedicated remote D1 was created, migrations 0001–0004 applied and safely rechecked, mandatory owner secret installed, and actual remote acceptance passed: denial/login/cookies/session expiry/logout, real project/brief/edit/export/delete, credential rotation/revocation/recovery, rate limiting, counters/audit and browser dashboard. Known secrets were absent from ordinary responses/assets/audit; sampled application logs had no console/exception entries. NOW.md records actual version/checkpoints and remaining limits, not old local-only evidence.

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
| GET `/api/security?window=1h\|24h\|7d\|30d` | Owner-only counters, events, session/credential fingerprint and runtime schema status |
| POST `/api/credentials/generate` | `{confirm:true}` generates one-time token; pending until manual secret installation |
| POST `/api/credentials/authorize-export` | `{confirm:true}` checks owner session/CSRF before browser copy/download; never retrieves old token |
| POST `/api/credentials/cancel` | `{confirm:true,fingerprint}` cancels a pending token; never install it |
| POST `/api/credentials/revoke` | `{confirm:true}` disables active credential and deletes all sessions; recovery through own Cloudflare account |
| DELETE `/api/sessions` | Revoke all owner sessions; active credential remains usable |
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

Every private request uses server-derived owner identity; mutations require trusted same-origin Origin. Errors include code/message/request ID; no upstream secret bodies/stack traces. Projects reuse the existing conversation aggregate to avoid parallel schema/history. Additive 0002 adds the tested foundation; 0003 adds normalized provided-source records, artifact edit revisions and a usage ledger. 0004 adds session credential binding, fingerprint-only credential lifecycle metadata and bounded access audit/counters. Existing legacy sessions require re-login; 0001–0003 are unchanged. Small text artifacts remain in D1; R2 is unnecessary for this bounded use case. No runtime filesystem, arbitrary fetcher, upload/sandbox execution or payment ledger exists.

Limits: 50 projects, 30 runs/project, five supplied excerpts/project, 2000 chars/excerpt, 4000-char question, 64 KB UTF-8 artifact, 18 KB ordinary request/128 KB editor body, 4 runs/minute, 30 workspace mutations/minute, at most 20 provider attempts/day and 100 searches/month. Content/event retention is lazy 30 days; deletion does not refund anti-abuse counters. Backup/vendor deletion guarantees remain separately unverified.

## Operating and deployment decisions

- Canonical repo: https://github.com/Sparkmind-obp-off/Vestrenhq (verified rename from Mini-genspark).
- **Source control:** owner-directed direct commits/pushes to `main`; no new branches or pull requests for routine implementation. The existing PRs #4 and #5 are already merged.
- **Release:** no GitHub Actions/CI or automated deployment. Local QA + manual Wrangler release only.
- **Private preview target:** `vestrenhq-private-preview` Worker and D1; no custom DNS, paid provider activation, payments, or public launch.
- `wrangler.jsonc` is **local-only** (emulator ID). `wrangler.preview.jsonc` targets the existing proposed `vestrenhq-private-preview` name and verified account; `d1_databases[0].database_id` is the real dedicated ID `86787a64-0479-4ee6-96ca-5e9387a9b781`, obtained from authorized creation and verified against Cloudflare. `npm run release:check` exits 2 until real target/secret/schema prerequisites are satisfied; it never deploys automatically.
- GitHub/Cloudflare BYOK authentication are available. Authorized remote mutations: one dedicated D1, four additive migrations, one dedicated Worker, owner-secret installation/rotation/recovery and preview deployment. Unrelated resources were not modified; DNS and paid integrations stay unchanged. Version metadata exposes only public release identifiers, not credentials; extra version-preview URLs are disabled in the final config.
- No Genspark Hosted Access Rules, membership gate, hosted identity or platform Dispatcher dependency is used for this BYOK application. Existing app owner identity/record authorization remain server-side Worker concerns. Public login shell and policy pages contain no private data.
- Public multi-user auth, live retrieval/inference proof, backup/restore, observability, Duitku payments, Daytona sandbox, and customer-validation evidence remain open gates. See [current gap assessment and private-preview release plan](docs/27_CURRENT_GAP_ASSESSMENT_AND_DIRECT_MAIN_RELEASE.md).

## Canonical product documents

[Constitution](docs/00_VESTREN_PRODUCT_CONSTITUTION.md), [Architecture](docs/03_ARCHITECTURE.md), [Roadmap](docs/04_ROADMAP.md), [Migration](docs/11_VESTREN_MIGRATION_PLAN.md), [Full stack](docs/12_VESTREN_FULL_STACK_ARCHITECTURE.md), [Commercial blueprint](docs/13_COMMERCIAL_STARTUP_BLUEPRINT.md), [Product spec](docs/14_COMMERCIAL_PRODUCT_SPEC.md), [Pricing](docs/15_PRICING_AND_GO_TO_MARKET.md), [Release gates](docs/16_COMMERCIAL_RELEASE_GATES.md), [Trust/privacy](docs/17_TRUST_PRIVACY_AND_OPERATIONS.md), [Gap register](docs/18_COMMERCIAL_GAP_REGISTER.md), [Free-first/payment plan](docs/19_FREE_FIRST_BOOTSTRAP_AND_MONETIZATION.md), [Discovery](docs/20_ICP_AND_CUSTOMER_DISCOVERY.md), [Positioning](docs/21_POSITIONING_AND_LANDING_PAGE.md), [GTM](docs/22_GO_TO_MARKET_EXECUTION_PLAYBOOK.md), [Support](docs/23_CUSTOMER_SUPPORT_AND_SUCCESS_RUNBOOK.md), [Manual release](docs/24_CLOUDFLARE_WORKERS_MANUAL_RELEASE_RUNBOOK.md), [Metrics](docs/25_PRODUCT_METRICS_AND_EXPERIMENT_LOG.md), [Current gap assessment & private-preview release](docs/27_CURRENT_GAP_ASSESSMENT_AND_DIRECT_MAIN_RELEASE.md).

## Owner credential lifecycle

Open Settings, login with the separate application credential, then open **Access & Security**. Generate a replacement, explicitly copy/download the one-time secret, save it securely, install via your own Cloudflare Worker Secrets, and choose **Verify replacement login**. Generation alone does not alter access. Installation has no grace period: the existing single-secret architecture immediately invalidates old sessions when the secret changes. Successful replacement login marks the old fingerprint rotated. Cancelled/revoked/rotated fingerprints cannot login again. Save the replacement BEFORE installing it; failed verification cannot install or revoke a secret automatically.

Closing the panel/logout/reload clears the plaintext; it cannot be recovered from the server. Bootstrap or lost-token recovery requires your own terminal/Cloudflare account, not chat. Full safe bootstrap commands, rotation/recovery and rollback steps: [manual BYOK runbook](docs/24_CLOUDFLARE_WORKERS_MANUAL_RELEASE_RUNBOOK.md).

Counters cover requests reaching this Worker, in UTC hourly windows, retained 30 days (not lifetime traffic). Detailed events retain 7 days, sampled to 200/hour, latest 50 displayed; session creation is represented by AUTH_SUCCESS. Unknown creation time/absent retained timestamps and unverified cloud deployment are UNAVAILABLE, not fabricated zero. Audit failures return safe 503; some ordinary mutations may already have completed, so inspect state before retrying. Credential fingerprints/status are retained to enforce revocation; no plaintext secrets retained.

Owner access: open the preview, Settings → sign in with the privately delivered NEW application credential → Access & Security. Credential values/delivery URLs are never committed; the delivery requires the owner's authenticated file account and was verified to return 403 without authentication. Save it in a password manager. This delivery is not an automatically self-deleting/single-use link; delete the protected delivery file after secure storage. The application itself remains standalone Cloudflare BYOK, independent of platform-hosted identity/rules.

Next: private founder use and operational recovery/alerting proofs. `scripts/remote-preview-smoke.mjs` is a bounded explicit operator check, never part of normal tests or automatic deployment. Critical credential mutation tests require `ALLOW_PREVIEW_CREDENTIAL_TESTS=true` and a new empty dedicated preview; do not casually rerun them on an owner's active workspace. Public paid launch stays NO-GO; Daytona and Duitku remain selected but disabled/unimplemented rather than falsely integrated.
