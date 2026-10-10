# VestrenHQ — Genspark Execution Prompt: Create a BRAND-NEW Cloudflare Pages Project

Date: 2026-10-10
Repository: https://github.com/Sparkmind-obp-off/Vestrenhq
Canonical branch: main
Required result: a NEW, separate Cloudflare Pages project with a successful deployment and working default `*.pages.dev` URL.
Custom domain: `vestren.biz.id` will be connected manually by the owner later. Do NOT attempt to configure it now.

## Explicit owner instruction

Create a NEW Cloudflare Pages project. Do not bind the work to, reuse as the target, overwrite, rename, or migrate into the old Worker deployment or legacy Pages project `vestren-workbench`. Do not make the custom domain a blocker. The owner will connect `vestren.biz.id` manually after the new Pages deployment is ready.

The existing Worker deployment, dedicated D1 database, migration ledger (four remote migrations reportedly applied), and secrets are reference resources that must be preserved. The new Pages project must be a separate project; reuse the existing dedicated VestrenHQ D1 database only if it is verified to belong to VestrenHQ and its schema is correct. Never bind the new application to the legacy `vestren-workbench` D1 database.

## What the owner expects

Do the technical work yourself. Do not send the owner manual terminal commands or ask them to create the Pages project. Audit, implement, test, create the new Pages project, deploy, test the default Pages URL, and report evidence. The owner will handle only the custom-domain attachment manually afterward.

## Starting state (reported; verify where possible)

- Existing Worker reference URL: https://vestrenhq-private-preview.sparkmind-support.workers.dev (reported HTTP 200).
- Dedicated VestrenHQ D1 exists; four migrations are reportedly recorded remotely.
- Current gap: no verified Pages Functions packaging/adapter for the existing application.
- Legacy Pages project `vestren-workbench` has a different D1 and must not be modified.
- `vestren.biz.id` currently resolves ENOTFOUND; DNS API inspection was denied with HTTP 403 / Cloudflare code 10000.
- Pages runtime secret and actual Pages acceptance are NOT VERIFIED.
- Git workflow: direct to `main`; no force push, no PR, no feature branch, no GitHub Actions.

## Phase 1 — Audit current repository and account

1. Inspect the latest `main` SHA, source tree, `package.json`, Vite build output, Worker entrypoint, all API routes, migration files, security functions, and existing docs.
2. Inspect available Cloudflare account/project access. List existing Pages projects and confirm the exact name of the legacy project before creating anything.
3. Verify the existing D1 database identifier, name, migration history, and required tables without printing secrets. Preserve the database and all data.
4. Do not interpret a 403 as proof that no resource exists. Record the precise access limitation and use any other authorized Cloudflare deployment mechanism available.
5. Select a unique new project name, preferably `vestrenhq-private` or another name proven unused. Do not collide with an existing project.

## Phase 2 — Implement Pages compatibility without rebuilding the product

The current application uses a Worker entrypoint and Worker Assets. A static-only Pages upload is unacceptable if it breaks APIs.

1. Implement a thin Cloudflare Pages Functions adapter for the existing backend, reusing the existing tested router and security logic where technically valid.
2. Avoid duplicating or rewriting authentication, credential lifecycle, sessions, D1 business logic, audit logging, rate limiting, task/project/artifact routes, or export logic unnecessarily.
3. If code must be refactored for a shared handler, preserve behavior and add regression tests. Keep the old Worker entrypoint operational.
4. Place Pages Functions routes in the supported structure (for example, `functions/api/[[path]].ts` or explicit route files as appropriate to the actual router) and verify Cloudflare Pages Functions routing semantics. Do not assume a catch-all adapter behaves correctly without tests.
5. Ensure the Vite frontend build output is the correct Pages static asset directory (likely `dist`, verify).
6. Ensure every required route works in the Pages runtime and that SPA fallback does not mask API errors.
7. Configure the new Pages runtime's D1 binding to the correct existing VestrenHQ database. Never use the legacy workbench database.
8. Verify the Pages runtime has the required owner secret. Worker secrets do not automatically prove the Pages project has the same secret. Transfer/configure secrets only through authorized secure mechanisms; never print token values or embed them in frontend variables.
9. Keep the owner-only access model. No public registration, payment activation, paid-provider enablement, public launch, or weakening security to pass tests.
10. Update scripts and docs for the new Pages target without deleting Worker configuration.

## Phase 3 — Run quality gates before deployment

Run relevant existing scripts and add tests where needed:
- dependency install
- typecheck
- unit/API tests
- security/authentication/session/credential tests
- D1/migration compatibility tests
- browser workflow tests
- Vite build
- Pages Functions routing tests
- diff check and secret scan
- Pages deployment dry run/preflight if supported

Never weaken or delete tests just to get a green result. Use synthetic data only. Preserve existing data.

## Phase 4 — Create a NEW Pages project and deploy

1. Create a completely NEW Cloudflare Pages project using the authorized Cloudflare account and a verified unused project name. Do not reuse `vestren-workbench`.
2. Configure the correct build command, output directory, and Pages Functions compatibility settings.
3. Use direct authenticated CLI/API deployment if that avoids setting up GitHub Actions or an unwanted automatic deployment pipeline. Do not add GitHub Actions.
4. Deploy the tested application to the new project's default `*.pages.dev` URL.
5. Configure required runtime bindings and secrets for the new Pages project.
6. Do not configure `vestren.biz.id`, edit DNS, change nameservers, or attempt domain attachment. The owner will do that manually.
7. Do not delete, rename, overwrite, or redirect the existing Worker, legacy Pages project, or D1 database.
8. If account access fails, try another authorized deployment method available in the current environment. If no authorized method works, finish code/tests/docs and report the exact blocked capability. Do not fabricate a successful deployment.

## Phase 5 — Remote acceptance on the NEW pages.dev URL

Verify the actual new Pages URL, not the old Worker URL and not the legacy project.

Required checks:
- HTTP/TLS works and the deployment corresponds to the intended `main` commit.
- Frontend loads, SPA route refresh works, and static assets load.
- API requests reach Pages Functions.
- D1 binding points to the correct VestrenHQ database and read/write operations work.
- Health/status endpoints return expected, truthful results.
- Unauthenticated private API requests are rejected.
- Owner login works with the configured Pages secret.
- Invalid/revoked credentials are rejected.
- Session cookie security, logout, expiry, revoke-one/revoke-all, and credential rotation work.
- Login rate limit and security audit/counters operate.
- Dashboard, conversations/projects, source handling, manual brief/task execution, artifacts, save/reopen/delete, and export work as implemented.
- No secret appears in client bundles, response payloads, logs, or repository files.
- No public registration or accidental public access is introduced.

Mark each test PASS / FAIL / BLOCKED / NOT TESTED. A build passing is not remote acceptance.

## Phase 6 — Documentation and final report

Update canonical docs on `main` to reflect verified facts:
- new Pages project name
- default `pages.dev` URL
- deployment ID and deployed commit SHA
- build settings and Pages Functions route architecture
- actual D1 binding and migration status (no secret values)
- Pages runtime secret configured: yes/no/not verified
- test results and remaining gaps
- legacy Worker and `vestren-workbench` explicitly preserved
- custom domain `vestren.biz.id` intentionally NOT attached; owner will do it manually

Final report must include evidence from actual Cloudflare output or remote tests. Clearly distinguish PASS, FAIL, BLOCKED, and NOT TESTED. Never claim a deployment or test that did not happen.

## Definition of done

The task is complete when:
1. A NEW and separate Cloudflare Pages project exists.
2. The app is deployed and accessible at its new default `pages.dev` URL.
3. Pages Functions and the correct D1 binding work.
4. Owner authentication and critical workflows pass remote tests.
5. The deployed commit matches the intended `main` code.
6. The legacy Pages project, old Worker, and existing data remain intact.
7. Documentation records actual results.
8. `vestren.biz.id` remains untouched for the owner to configure manually.

Start immediately. Do the work; do not return a manual checklist.