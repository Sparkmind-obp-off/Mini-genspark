# NOW — VestrenHQ

## Objective and actual baseline

First workflow: business/product question → traceable evidence brief → editable/exportable deliverable → saved project. Canonical repository was verified as **Sparkmind-obp-off/Vestrenhq** (GitHub renamed the earlier Mini-genspark URL). Active candidate branch: `feat/vestren-research-deliverable`, based on remote main `8a3d0aecb981a67157a2ca16b39cdda1913a773d`.

The earlier local Mini Genspark implementation commits remain preserved on local main. Tested foundation files were selectively ported into this latest branch, excluding GitHub Actions and retaining the Vestren constitution/commercial documents. No PR was merged, branch protection changed or user work reset.

Baseline: no lockfile on remote; `npm install` succeeded, typecheck/build passed, audit reported 0 vulnerabilities. `npm run qa` and baseline `npm test` **failed** because static QA still required obsolete README monetization/local-setup links. This was replaced by stronger current guard/no-workflow/secret checks and behavioral tests, not hidden by claiming a baseline pass.

## What now actually works

- Private owner HttpOnly session lifecycle and server-side ownership/Origin/request/usage controls.
- Durable create/open/rename/delete project, normalized owner-provided source records and immutable run evidence snapshots.
- Honest manual evidence brief (no page fetch, no independent verification, no AI call), editable artifact, revision conflict detection, safe export/copy.
- Optional Workers AI/Groq/Tavily adapters with disabled-by-default gates and deterministic tests. No inference/retrieval provider is claimed LIVE VERIFIED.
- Separate anti-abuse attempt caps and run usage reservation/settlement/release ledger. No paid credit/payment entitlement exists.
- Accurate `/privacy`, `/terms`, `/pricing`, `/support`, `/status` surfaces. Support channel requires configured/verified SUPPORT_EMAIL; no SLA or legal certification claimed.
- No GitHub Actions/workflow files and no automatic deployment. Daytona remains selected/disabled; no substitute. Duitku merchant-live statement is recorded, not mistaken for operational code.

## Exact observed QA — 2026-10-10

| Command | Actual result |
|---|---|
| `npm install` | PASS; lockfile generated/reconciled; no reported vulnerabilities |
| `npm run typecheck` | PASS |
| `npm test -- --reporter=dot` | PASS: 51 tests, 4 files, no skips; real local D1 and mocked optional providers |
| `npm run build` | PASS: 30 modules, SPA JS 246.58 KB / 76.56 KB gzip |
| `npm run qa` | PASS: no workflows, canonical guards, source/build/history credential checks including local secret exact values |
| `npm audit --json` | PASS: 0 reported vulnerabilities |
| `npm run db:migrate:local` | PASS: additive 0003 applied; 0001/0002 preserved and upgrade tested |
| `curl -fsS http://localhost:3000/api/health` | PASS: vestrenhq, owner-only, publicLaunch false |
| `npm run test:browser` | PASS: real route denial/setup/keyboard; successful optional-provider UI explicitly MOCKED |
| `npm run test:workflow` | PASS: actual local browser → Worker → D1 login/project/source/manual brief/edit/save/copy/export/rename/reload/delete/logout, no HTTP mocks or vendor calls |
| `npx wrangler deploy --dry-run --outdir .qa/worker` | PASS: Worker 51.43 KiB / 15.61 KiB gzip; no upload/mutation/deployment |
| `git diff --check` | PASS |

Lint is NOT CONFIGURED. Cloud deployment, real vendor inference/search, public signup/tenant identity, payments/refunds/reconciliation, Daytona cleanup and production backup restore are BLOCKED/NOT TESTED, not covered by mocks. Actual screenshots `.qa/vestren-real-local-workflow.png` and `.qa/vestren-real-local-mobile.png` were generated with labelled supplied test evidence; mobile screenshot was read. They contain no application token.

## Cloudflare BYOK and release decision

BYOK setup and `wrangler whoami` succeeded. Read-only account inventory: **9 D1 databases and 1 Worker; zero matching Vestren/mini-genspark targets**. None belongs to this candidate by verified identity. Existing unrelated resources were not reused or altered. Wrangler retains its local placeholder/legacy name; dry-run is packaging proof only. No remote migrations, resource creation, secret changes, DNS, live transaction or production deployment occurred; no deployment URL exists.

**Public/paid production: NO-GO.** Local private founder evaluation is supported with disclosed manual limitations, not public multi-user SaaS. Generic BYOK deployment/push request is recorded; deployment is blocked by resource identity and release gates, not by assuming a different hosting path. The Pages-oriented platform BYOK skill was used for authentication/preflight only; native Worker+Assets remains the canonical architecture.

## Single highest-value next action

Owner should **approve/identify dedicated isolated Vestren private-preview Worker + D1 resources in the authenticated BYOK account**, with no DNS/payment/provider activation. Do not guess IDs or attach another product's DB. Then set real per-environment bindings/secrets and prove live retrieval/inference/backup recovery before revisiting release GO. Public auth, approved merchant configuration/offer/callback/refund policy, verified Daytona budget/cleanup/network restrictions and customer value evidence remain separate gates.

## Versioned delivery

Implementation commit/push results and final SHA are recorded after actual git operations in the session's final report and subsequent evidence note. No remote push/PR/deployment is claimed in advance. Read docs/16 release gates, docs/18 gap register and docs/24 manual release record alongside this status.


---

## Current session update — direct main / private preview — 2026-10-10

- **Operating direction:** routine code changes directly to `main`, no new PRs/branches, no GitHub Actions. Existing PR #4 and #5 are already merged.
- **Latest work:** `src/App.tsx` now invalidates stale in-flight private UI requests at logout; `src/worker.ts` requires a persisted project before task reservation; regression tests added to `src/App.test.tsx` and `src/worker.test.ts`.
- **Resource naming:** Worker and D1 target renamed in Wrangler to `vestrenhq-private-preview`; local D1 migration script aligned. **The D1 ID remains placeholder and must be replaced with the real ID from Cloudflare.**
- **QA:** new source changes/tests were not executed in this session. Earlier 51-test/local-workflow results predate these changes and must not be treated as current-head verification.
- **Deployment:** blocked in this execution environment; no Cloudflare/Wrangler connector or authenticated Cloudflare credentials are available, and the shell cannot resolve GitHub to create a local checkout. No remote resource creation, migration, secret update or deployment was performed; no live URL is claimed.
- **Remaining high-priority gaps:** dedicated Cloudflare resource creation and private preview deployment; rerun current-head QA; live provider/quota verification; backup/restore rehearsal; observability; public multi-user auth/tenant isolation; Duitku lifecycle; Daytona adapter; and customer-value validation.
- **Assessment and exact release commands:** [docs/27_CURRENT_GAP_ASSESSMENT_AND_DIRECT_MAIN_RELEASE.md](docs/27_CURRENT_GAP_ASSESSMENT_AND_DIRECT_MAIN_RELEASE.md).
