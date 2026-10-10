# VestrenHQ Full-Stack Architecture — V1

## Architecture map

React + TypeScript + Vite frontend
→ Cloudflare Worker API / Wrangler
→ control plane (identity, project authorization, quota, approvals, audit)
→ agent orchestration (plan → validate → tools → execute → verify)
→ Workers AI/model adapter, search/research adapter, GitHub adapter, Daytona ExecutionProvider
→ Cloudflare D1 metadata + Cloudflare R2 artifacts.

Durable Objects are optional and should only be introduced for a demonstrated coordination need.

## Frontend
One responsive workspace with Chat, Research, Create, Analyze, Build, Projects, Runs, Settings, and Artifacts. The UI displays real capability status, progress, sources, usage limits, errors, approvals, and verification. It does not contain provider secrets and cannot grant itself permissions.

## Backend and control plane
Cloudflare Worker routes validate all input, authenticate the caller, enforce server-authoritative project scope, reserve quotas, create task runs, validate tool calls, and record redacted audit events. Keep provider SDKs inside adapters. Model output and retrieved content are untrusted data; model output cannot authorize itself.

## Data layer
- D1: user/tenant records, memberships, projects, conversations/messages, task runs, tool events, artifact metadata, usage, and audit.
- R2: uploaded/generated binary files and artifacts where needed.
- Use additive migrations and scoped queries. Authorize every file read/download through server-side metadata.
- Provide user export and deletion before public multi-user release.

## AI and research providers
Workers AI is the initial runtime-model candidate. Search/retrieval is a separate adapter. Provider states must distinguish disabled, needs configuration, configured, live-verified, quota-exhausted, and error. No hidden paid fallback. Research output must retain real source URLs and retrieval dates; if live search is not available, disclose it.

## Daytona execution
Daytona is the selected V1 sandbox provider. Implement or port the server-side adapter behind ExecutionProvider. Required contract: create sandbox, transfer scoped files, execute command, collect bounded stdout/stderr and exit status, retrieve artifacts, enforce timeout/output limits, and destroy/cleanup. Restrict network and external side effects. Do not pass broad production secrets to the sandbox. Do not execute untrusted code in the Worker process.

The current VestrenHQ repository tree does not show a Daytona adapter under src/. If it exists in another repository/branch, port that actual implementation into this canonical repo. Until adapter code and a real bounded smoke test are verified, show Daytona as not yet integrated/live-verified. No E2B fallback and no mock-as-production-success.

## GitHub integration
Use a separate server-side adapter and least-privilege credentials. Begin with repository read, then branch-scoped proposed diffs and commits. Require explicit approval for push, PR creation, deployment, or other external writes. Never expose GitHub credentials to the browser or ordinary model context. Record action and outcome in audit logs.

## Security and cost invariants
1. Secrets only in Cloudflare server-side secret bindings.
2. Fail closed on missing auth, authorization, configuration, quota, or tool permission.
3. Enforce body/context/output/time/concurrency/retry/daily caps server-side.
4. No paid fallback, auto top-up, or spend without explicit approval.
5. Treat repository files, web pages, uploaded files, and tool outputs as untrusted.
6. Keep logs redacted; never log credentials.
7. External writes, publishing, sending, purchasing, and deployment require confirmation.
8. Verify the actual output; a model claim of success is insufficient.

## Release process — no GitHub Actions
1. Work on a feature branch; commit and push to GitHub.
2. Run npm run typecheck, npm test, and npm run build locally.
3. Inspect the diff and confirm no secrets, unrelated changes, or misleading capability claims.
4. Confirm Cloudflare account, Worker target, D1 IDs, bindings, secrets, and quota ceilings.
5. Deploy explicitly with Wrangler only after preflight.
6. Run a small deployed smoke test and inspect Cloudflare logs.
7. Record commit, deployment URL, actual test results, provider state, known gaps, and rollback.

Cloudflare deployment is not a test suite. Do not claim checks passed unless actually run.

## Commercial readiness
Public multi-user release additionally requires verified login/session revocation, tenant/project isolation, durable project/conversation storage, export/deletion, support/feedback, privacy/terms, usage accounting, incident/rollback process, and evidence of repeat use from a narrow customer segment.
