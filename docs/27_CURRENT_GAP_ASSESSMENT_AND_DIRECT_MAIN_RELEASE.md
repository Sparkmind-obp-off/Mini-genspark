# VestrenHQ — Current Gap Assessment & Direct-Main Private Preview Release

**Assessment date:** 2026-10-10  
**Latest verified main SHA at wrap-up:** `b5af1e0570ad963144fe9b3f407925d29b95430b`  
**Canonical branch:** `main`  
**Release target:** isolated `vestrenhq-private-preview` Worker + D1, private owner-only preview, no custom domain/DNS  
**Release state:** `NO-GO / DEPLOYMENT BLOCKED` in this execution environment. This is an access/resource blocker, not a claim that local implementation is broken.

## Operating instruction from the owner

- Commit and push directly to `main`; do not create a new branch or pull request for routine implementation.
- No GitHub Actions, CI workflow, or automatic deployment.
- Use GitHub for source history; run local QA; deploy manually with Wrangler to Cloudflare using the owner-authorized BYOK account.
- Create and use dedicated Vestren private-preview resources only. Do not reuse another project's Worker or D1.
- The owner authorized the private preview deployment scope only: **no DNS/custom domain, no paid search/LLM provider activation, no Duitku/live payments, no public launch**.
- After resource creation and successful preflight, complete the private-preview deployment and smoke test. Do not claim it is deployed until the live URL and health/session checks are verified.

## Verified repository facts

- `main` contains the private evidence-project and editable-brief implementation merged from commit `3e2e1887e251270489a7b3f4981ee31e4c3acd81`.
- Product scope is single-owner private workspace, not public multi-user SaaS.
- Manual fallback stores owner-provided excerpts and produces an explicitly labelled evidence brief. It does **not** fetch the provided URLs, independently verify facts, or call an AI model.
- Live Workers AI/Groq/Tavily are disabled unless separately configured and confirmed; configuration alone is not live verification.
- Duitku payments and Daytona sandbox are not implemented as live product capabilities.
- There are no GitHub Actions workflows in the intended operating model.
- Wrangler now names the target `vestrenhq-private-preview`, and the local migration command uses the same D1 name. **The D1 ID is still a placeholder** and must be replaced with the actual ID returned by Cloudflare before remote migration/deployment.

## Changes pushed directly to main in this session

1. `src/App.tsx`: introduced an auth/session epoch to ignore delayed private reads and writes after logout, clear local private state immediately on logout, and prevent stale task/project/artifact responses from repopulating the logged-out UI.
2. `src/worker.ts`: task reservation now requires the conversation/project to exist in the same guarded insert. If the 50-project cap prevents creation, the API returns `PROJECT_LIMIT_REACHED` rather than creating an orphan task.
3. `src/App.test.tsx`: added a regression test for a delayed project response arriving after logout.
4. `src/worker.test.ts`: added a regression test for project-cap/orphan-task behavior.
5. `wrangler.jsonc` and `package.json`: aligned Worker, D1 and local migration naming to `vestrenhq-private-preview`.

**Important QA caveat:** these new changes and regression tests have **not** been run in this session. Earlier baseline evidence recorded 51 tests and a successful local workflow before these latest changes; do not treat that as proof the current head passes. The execution container cannot resolve GitHub for a checkout, has no repository working tree/dependencies, and exposes no Cloudflare/Wrangler credentials or Cloudflare deployment connector. No tests, remote migration, resource creation, or deployment are claimed in this session.

## Gap register

| Priority | Gap | Current truth | Required completion evidence |
|---|---|---|---|
| P0 | Cloudflare target identity | No authenticated Cloudflare operation available in this session; Wrangler D1 ID is placeholder | `wrangler whoami`; create dedicated D1; record real ID; confirm target account/name; inspect deployment plan |
| P0 | Private preview release | Not deployed | Full local QA; remote migrations; secret set; manual deploy; workers.dev URL; unauthenticated denial, owner login, project save/reopen/delete and logout smoke test |
| P0 | Current-head regression tests | Tests added but not rerun after changes | `npm run typecheck`, `npm test -- --reporter=dot`, `npm run qa`, `npm run build`, `npm run test:browser`, `npm run test:workflow`, `git diff --check` all actually run and recorded |
| P1 | Public multi-user authentication/tenant isolation | Single-owner token/session only | Product and threat model; real identity provider; tenant-owned data migration; cross-tenant security tests. Keep public signup disabled until complete |
| P1 | Live research/inference | Manual excerpt workflow only; providers disabled/not live-verified | Provider terms/quotas/no-overage verified; secrets set server-side; controlled live smoke test; source provenance/timeout/limit tests |
| P1 | Backup and restore | Production recovery not demonstrated | D1 backup/export and restore rehearsal with recorded duration, integrity checks and rollback procedure |
| P1 | Operations/observability | Health endpoint exists; observability is disabled in Wrangler | Redacted structured logs, request IDs, alerting/incident playbook, health and failure smoke checks |
| P1 | Payment and entitlements | Duitku disabled/not implemented | Verified signatures/callbacks, idempotency, amount/order match, durable entitlements, refund/reversal/reconciliation tests; owner approval before any live transaction |
| P1 | Build sandbox | Daytona not implemented/live-verified | Server-side adapter, network/resource/time/file bounds, cancellation/cleanup tests; explicit approval for repo writes/publish/deploy |
| P2 | Uploads and code execution | Not enabled; code generation is text only | Only implement if validated demand and threat/cost controls are in place; no misleading UI claims |
| P2 | Commercial validation | Interviews, repeat use, design partners and paid pilot are not evidenced by repository tests | Record real interviews, repeat-use signals, design-partner outcomes, willingness to pay and paid pilot results |
| P2 | Legal/support accuracy | Policy surfaces exist; business jurisdiction/support contact and legal review are not independently verified | Verify operator/contact/retention/refund language against real operations; do not claim certification or SLA without evidence |

## Private-preview release procedure

Run in a trusted local checkout with Node/npm and Wrangler installed. Never paste credentials into source files or GitHub.

1. Verify the checkout is on current `main`, clean, and matches GitHub. Inspect the diff before deployment.
2. Run:
   - `npm ci` (if lockfile is present; otherwise `npm install` and commit the generated lockfile)
   - `npm run typecheck`
   - `npm test -- --reporter=dot`
   - `npm run qa`
   - `npm run build`
   - `npm run test:browser`
   - `npm run test:workflow`
   - `git diff --check`
3. Authenticate to the owner's intended Cloudflare BYOK account and verify it:
   - `npx wrangler whoami`
4. Create the dedicated D1 if it does not exist:
   - `npx wrangler d1 create vestrenhq-private-preview`
   - Copy the returned **real database ID** into `wrangler.jsonc` in a direct commit to `main`; do not guess the ID.
5. Apply reviewed migrations to that dedicated database:
   - `npx wrangler d1 migrations apply vestrenhq-private-preview --remote`
6. Build and set the app-specific owner secret interactively:
   - `npm run build`
   - `npx wrangler secret put OWNER_ACCESS_TOKEN`
   Use a newly generated, high-entropy application token, not a provider API key. Do not print it in logs or commit it. Leave paid provider confirmation flags false.
7. Review `wrangler.jsonc`, account, Worker/D1 binding, secrets presence, migration results and preview intent; then deploy:
   - `npx wrangler deploy`
8. Record the returned `workers.dev` URL. Smoke test health, unauthenticated private API denial, owner login, project create/reopen/delete, logout/revocation and reload persistence. Verify no provider calls, payments, DNS changes, or other product resources were touched.
9. If any check fails, mark deployment NO-GO, do not enable providers or payments, and use Wrangler's version rollback procedure only after confirming the affected Worker and version.

If the current environment cannot access the authenticated Cloudflare BYOK account, stop after code/QA preparation and report that exact blocker. Never claim the private preview is deployed.

## Production boundary

This document authorizes only the isolated private preview. Public/paid production remains **NO-GO** until all mandatory release gates pass, including multi-user identity/tenant isolation if public users are allowed, verified live providers, backup recovery, privacy/support verification, payment correctness if checkout is enabled, and actual customer-value evidence.
