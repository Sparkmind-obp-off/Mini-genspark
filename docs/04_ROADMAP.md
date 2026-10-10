# VestrenHQ Roadmap — From Current Prototype to Market

**Status:** ordered execution plan, not a claim that any unchecked item is complete. One active release objective at a time. local QA + manual Cloudflare Wrangler; no GitHub Actions or CI.

## Observed progress — 2026-10-10

This candidate implements and locally tests the private foundation and the manual-evidence version of the first workflow: owner session → project → permitted supplied excerpts → structured brief → revision-checked editor → saved export → reopen/rename/delete. 51 behavior tests and real local Worker/D1/browser workflow passed; optional provider UI tests are labelled MOCKED. Live retrieval/public auth/payment/cloud recovery/market gates below remain open.

Actual fixes/files, risk and next owner dependency are in docs/18; release matrix in docs/16; exact commands and screenshot provenance in NOW.md; BYOK inventory/dry-run/rollback in docs/24. No Actions workflows were created, no remote resource/migration/DNS/payment was changed, and no release label was promoted to commercial readiness. Daytona remains a separate selected-but-disabled integration, not an execution claim for Build. Small text artifacts use D1; R2 is deferred until a measured binary/storage need exists.

Next critical dependency: identify/approve isolated private BYOK Worker+D1 targets. Then verify account/model/search quota and actual live retrieval, rehearse recovery, and implement public identity/tenant/payment gates only for the approved commercial scope. Do not continue feature breadth or market acquisition on top of unresolved stop-ship gaps.

## Phase 0 — repository and operating truth
- VestrenHQ is the canonical product repository.
- Keep one source of truth for product, architecture, scope, pricing, and release status.
- Keep GitHub Actions workflows absent.
- Implement and review code in the project workspace and local terminal; use GitHub for source history/push and Cloudflare Workers/Wrangler for runtime/deployment.
- Do not modify real Cloudflare resources until account, Worker name, D1 ID, bindings, and ownership are verified.
- Gate: operating documents agree and placeholder resources are clearly marked.

## Phase 1 — verify baseline and quality
- Inspect routes, UI states, D1 migrations, provider adapters, and existing tests.
- Run typecheck, tests, build, and diff checks locally.
- Record capability status as implemented, mock, configured, live-verified, or unavailable.
- Fix naming drift only after confirming Cloudflare resource ownership.
- Gate: exact QA results recorded at a commit; no false live/production claims.

## Phase 2 — secure private founder workspace
- Keep owner-only access private until public authentication is implemented.
- Add/verify session lifecycle, server-side project authorization, and fail-closed behavior.
- Add durable projects/runs, export, account/project deletion, and appropriate migrations.
- Define retention, provider disclosure, logs, support, and kill switches.
- Gate: persistence and negative cross-user tests pass; no sensitive customer data before controls pass.

## Phase 3 — first complete sellable workflow
Primary workflow: business/product question → real source retrieval → evidence-backed brief → editable/exportable action deliverable → saved project.
- Implement a real SearchProvider or explicitly disclose unavailable research.
- Record source URLs, titles, retrieval time, attribution, and uncertainty.
- Validate links/citations; mark unsupported claims.
- Deliver one export format reliably before expanding formats.
- Add visible usage caps, quota reservation/release, failure states, and a cost ledger.
- Gate: fresh test user completes the workflow end to end; export reopens correctly; failures never fabricate success.

## Phase 4 — trust, billing, and operations
- Publish privacy, terms, support, and known-limitations pages matching actual behavior.
- Implement user export/deletion and verify data lifecycle.
- Add redacted logs, incident procedure, recovery, kill switches, and rollback.
- Implement Duitku server-side only after verifying merchant configuration, callback/signature verification, idempotency, and entitlement rules.
- Start with a fixed-scope paid pilot or one-time usage pack; do not promise automatic recurring payment without a verified renewal lifecycle.
- Gate: applicable security, payment, refund/cancellation, support, and reconciliation checks pass before taking money.

## Phase 5 — Daytona Build workflow (separate from research V1)
- Locate/port or implement the Daytona adapter behind ExecutionProvider.
- Bound runtime, resource, output, network, file scope, concurrency, and cleanup.
- Require explicit approval for repository writes, publishing, and deployment.
- Gate: adapter contract tests and real bounded smoke test pass. No E2B fallback and no mock-as-live.

## Phase 6 — founder dogfood
- Complete at least 10 real, non-sensitive tasks on a fixed evaluation set.
- Record source quality, corrections, time-to-useful-output, failure recovery, costs, and artifact use.
- Fix repeated failures before inviting external users.
- Gate: core workflow has reproducible quality evidence and bounded costs.

## Phase 7 — customer discovery and design partners
- Conduct 10–15 problem interviews using docs/20.
- Select one ICP based on evidence.
- Recruit 3–5 design partners and observe real tasks.
- Target at least three users repeating the same workflow within seven days; measure actual use and corrections.
- Gate: specific job, buyer, repeat pattern, and manageable support/cost burden are evidenced.

## Phase 8 — paid pilot and go-to-market
- Follow docs/22 for staged outreach, demo, pilot, and launch decisions.
- Publish landing page/sample only after claims pass docs/21 substantiation checks.
- Price using measured cost, support burden, payment fees/tax, and willingness-to-pay evidence.
- Run a narrow paid pilot with clear usage, expiry, support, refund, and cancellation terms.
- Gate: genuine paid pilot/payment, verified entitlements/reconciliation, and no unresolved critical issue.

## Phase 9 — controlled public beta
- Public auth, tenant isolation, deletion/export, quota/abuse controls, privacy/terms, support, monitoring, rollback, and payment gates pass.
- Use a small cohort, clear limitations, and a kill switch.
- Measure activation, useful artifacts, seven-day repeat, corrections, cost, and support.
- Gate: manual release record, smoke-test evidence, and release-owner sign-off.

## Phase 10 — scale only on evidence
- Add modes, providers, collaboration, paid infrastructure, and acquisition spend only when real users are blocked by a measured limitation.
- Upgrade infrastructure only after measuring a bottleneck and documenting expected revenue/cost and rollback.
- Gate: repeatable retention, sustainable unit economics, and operational support.

## Manual release checklist — no GitHub Actions
- [ ] npm run typecheck completed; result recorded.
- [ ] npm test completed; result recorded.
- [ ] npm run build completed; result recorded.
- [ ] git diff --check and secret review completed.
- [ ] Correct branch/commit reviewed locally.
- [ ] Wrangler dry-run completed.
- [ ] Cloudflare account, Worker, environment, D1 ID, R2 bindings, secrets, and quotas verified.
- [ ] Production deployment explicitly approved.
- [ ] Deployed smoke tests and logs checked.
- [ ] Rollback path known; NOW.md updated with actual evidence.

## Source documents
- Product truth/scope: docs/00_VESTREN_PRODUCT_CONSTITUTION.md, docs/14_COMMERCIAL_PRODUCT_SPEC.md.
- Architecture/migration: docs/03_ARCHITECTURE.md, docs/11_VESTREN_MIGRATION_PLAN.md, docs/12_VESTREN_FULL_STACK_ARCHITECTURE.md.
- Startup/monetization: docs/13_COMMERCIAL_STARTUP_BLUEPRINT.md, docs/15_PRICING_AND_GO_TO_MARKET.md, docs/19_FREE_FIRST_BOOTSTRAP_AND_MONETIZATION.md.
- Release/trust/gaps: docs/16_COMMERCIAL_RELEASE_GATES.md, docs/17_TRUST_PRIVACY_AND_OPERATIONS.md, docs/18_COMMERCIAL_GAP_REGISTER.md.
- Market/distribution/operations: docs/20_ICP_AND_CUSTOMER_DISCOVERY.md through docs/25_PRODUCT_METRICS_AND_EXPERIMENT_LOG.md.
- Implementation agent instructions: docs/26_MASTER_IMPLEMENTATION_SYSTEM_PROMPT.md.
