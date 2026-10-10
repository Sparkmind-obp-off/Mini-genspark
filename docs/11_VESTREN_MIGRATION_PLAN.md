# VestrenHQ Migration and Implementation Plan

## Canonical decisions
- Product: Vestren; canonical repository: VestrenHQ.
- Workspace: one React/Vite product with Chat, Research, Create, Analyze, Build.
- Runtime/deploy: Cloudflare Workers + Wrangler.
- Data: D1 metadata; R2 file bodies/artifacts where needed.
- Execution: Daytona selected for V1; no E2B fallback.
- Source control: GitHub branches, commits, and pushes.
- CI: no GitHub Actions/GitHub CI; use local checks and a manual Cloudflare release checklist.
- Commercial priority: validate one repeatable workflow and paid pilot before broad feature expansion.

## Current repository baseline
The repository contains React/TypeScript/Vite, a Cloudflare Worker, Workers AI binding, D1 usage/task-event storage, an owner-token gate, and five UI modes. UI mode names do not imply the integrations are live. The Worker explicitly says live web research and file upload are not enabled. The Wrangler D1 ID is a placeholder and resource naming is legacy; remote deployment must wait until real bindings are verified.

The current tree does not contain a Daytona adapter under src/. The provider is selected, but the adapter must be located/ported into this canonical repo or implemented and verified before Build can claim real sandbox execution.

## Phase 0 — Commercial foundation (current branch)
- Establish VestrenHQ as canonical repository.
- Update README, product constitution, architecture, and commercial blueprint.
- Remove GitHub Actions workflow and document manual Cloudflare release.
- Rename package metadata to vestrenhq without changing production Cloudflare resource names.
- Acceptance: product direction and operating instructions agree; no CI workflow remains in this repository.

## Phase 1 — Verify current truth
- Run local typecheck, tests, and build.
- Inspect UI, Worker routes, D1 schema, and provider states.
- Verify actual Cloudflare deployment, bindings, D1 ID, secrets, and domain before any remote deploy.
- Record every capability as implemented/mock/disabled/live-verified.
- No paid provider calls without explicit approval.

## Phase 2 — Secure foundation
- Keep owner-only private dogfooding until a proper identity/session model is configured.
- Add verified authentication, server-side project/tenant authorization, session revocation, and rate limits before public multi-user access.
- Add durable projects, conversations, task runs, artifact metadata, export/delete, and additive D1 migrations.
- Store binary artifacts in R2 when required and authorize every retrieval.

## Phase 3 — First trustworthy workflow
- Select evidence-backed research and work-product creation as the first market hypothesis.
- Implement or verify real search/retrieval; maintain a source ledger and citation checks.
- Generate editable, downloadable Markdown/HTML/CSV outputs.
- Record useful-output rate, corrections, time-to-value, and actual use.
- If research is already live in another branch, port that implementation and verify rather than duplicate it.

## Phase 4 — Daytona execution
- Locate the actual existing Daytona adapter if available; otherwise implement it behind ExecutionProvider.
- Contract-test sandbox creation, file transfer, command execution, output bounds, exit code, timeout, cleanup, and error normalization.
- Use one small, owner-authorized live smoke test and record results.
- Keep mock execution for tests only. Do not use E2B fallback. Do not enable Build as live until verified.

## Phase 5 — GitHub integration
- Use a separate least-privilege GitHub credential boundary.
- Start with read-only repo access, then branch-scoped diff and commit.
- Require explicit approval for push, PR creation, deployment, or other external writes.
- Test repository/branch allowlists and credential redaction.

## Phase 6 — Commercial validation
- Complete 10 target-user problem interviews.
- Recruit 3–5 design partners for one repeated workflow.
- Get at least 3 users to repeat the workflow and measure actual use, correction time, quality, and cost.
- Test one narrow paid pilot before broad subscription or team features.
- Continue, narrow, or pivot based on evidence rather than feature count.

## Manual release gates (no GitHub CI)
1. Local typecheck, tests, and build run and results recorded.
2. Diff reviewed; no secrets or unrelated changes.
3. Cloudflare target, bindings, D1 ID, secrets, quotas, and rollback verified.
4. Auth and data-isolation checks pass for the release scope.
5. Relevant provider smoke tests pass; mocks are not counted as live.
6. Deploy explicitly with Wrangler.
7. Test deployed URL and inspect Cloudflare logs.
8. Record commit, deployment, test evidence, known gaps, and rollback.

## Not yet claimed as complete
- Production Cloudflare bindings or D1 placeholder replacement.
- Multi-user production auth and tenant isolation.
- Real web research in the current Worker.
- Daytona adapter integrated/live-verified in this repository.
- Complete GitHub product connector.
- Product-market fit or willingness to pay.
- Production launch.
