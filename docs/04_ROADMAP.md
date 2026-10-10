# VestrenHQ Roadmap and Acceptance Criteria

**Rule:** ship one complete, verified user outcome at a time. This is a roadmap, not a statement that items are implemented.

## Phase 0 — Foundation
- VestrenHQ identity and commercial product direction.
- React/Vite workspace + Cloudflare Worker.
- D1 usage/task metadata; honest provider/capability status.
- Remove GitHub Actions; use local QA and manual Wrangler release.
- Acceptance: repository docs agree with operating decisions and no GitHub workflow remains.

## Phase 1 — Secure private workspace
- Local typecheck, tests, and build verified.
- Confirm Cloudflare bindings and real D1 ID before remote deploy.
- Owner-only access remains private until authentication and authorization are production-ready.
- Add durable projects/conversations and user export/deletion.
- Acceptance: refresh persistence, correct ownership checks, fail-closed auth, no secret exposure.

## Phase 2 — First useful research workflow
- Real search/retrieval adapter and source ledger.
- Editable Markdown/HTML report and downloadable artifact.
- Citation completeness, link validation, retrieval timestamps, uncertainty.
- Acceptance: every material research claim maps to a real source or is explicitly labelled unsupported; quota exhaustion stops the workflow.

## Phase 3 — Analyze/Create artifacts
- CSV import validation, deterministic calculations, tables/charts.
- Markdown/HTML and CSV export first.
- XLSX/PPTX/DOCX/PDF only after format-specific tests.
- Acceptance: artifacts reopen correctly and calculation/data lineage is inspectable.

## Phase 4 — Daytona Build workflow
- Daytona server-side adapter behind ExecutionProvider.
- Bounded sandbox, scoped files, command output/exit code, timeout, cleanup.
- Repository diff and human approval before external writes.
- Acceptance: adapter contract and real sandbox smoke test pass; mock is not counted as live.

## Phase 5 — Agent runs and connectors
- Typed plan, visible task timeline, server-side tool validation.
- Usage quotas, timeouts, bounded retries, audit.
- GitHub connector starts read-only; branch writes require approval.
- Acceptance: no tool bypasses project authorization; external writes are approval-gated.

## Phase 6 — Startup validation
- 10 problem interviews and 3–5 design partners.
- At least 3 users repeat the same workflow.
- Measure useful output, corrections, time-to-value, retention, cost per task.
- Run one narrow paid pilot before a broad subscription.
- Acceptance: evidence of repeat use and willingness to pay, not merely positive feedback.

## Phase 7 — Public beta
Only after auth, tenant isolation, data deletion/export, privacy/terms, support, usage caps, incident/rollback process, and security checks are verified.

## Manual release checklist — no GitHub Actions
- [ ] npm run typecheck completed; result recorded.
- [ ] npm test completed; result recorded.
- [ ] npm run build completed; result recorded.
- [ ] Diff inspected; no secrets or unrelated files.
- [ ] Cloudflare Worker, D1 IDs, bindings, and secrets verified.
- [ ] Relevant live provider smoke tests completed within explicit limits.
- [ ] Wrangler deployment approved and completed.
- [ ] Deployed URL checked; Cloudflare logs reviewed.
- [ ] Commit, deployment, test evidence, gaps, and rollback recorded.
