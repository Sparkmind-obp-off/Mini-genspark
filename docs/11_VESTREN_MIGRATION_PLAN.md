# Vestren Migration and Implementation Plan

**Target:** consolidate the Mini Genspark workspace direction with selected architecture from the existing Vestren Workbench.

## Source-of-truth decisions

- Product brand: **Vestren**.
- Workspace UX baseline: Mini Genspark repository.
- Security, tenant/project authorization, artifact access, and execution-boundary patterns: existing Vestren Workbench repository.
- **Daytona is the selected V1 code-execution/sandbox provider.** Do not switch to E2B for V1 without a deliberate decision and migration plan.
- Existing Vestren Workbench remains reference/source material during migration; do not operate two competing product experiences long-term.
- Canonical repository rename is separate from this migration and should happen only after implementation and CI are reviewed.

## Audit summary

### Mini Genspark workspace baseline

- React 19 + TypeScript + Vite.
- Cloudflare Worker API and D1 usage/audit schema.
- Chat/Research/Create/Analyze/Build UI.
- Basic owner-token gate and free-plan confirmation guard.
- Initial provider path uses Workers AI; research and arbitrary code execution are not live capabilities merely because a mode exists.
- This codebase is the simpler workspace UX baseline.

### Existing Vestren Workbench

- React 19 + TypeScript + Cloudflare Pages Functions/Hono.
- Auth0 OIDC/JWKS identity verification.
- D1-backed tenant/project membership and server-authoritative authorization.
- R2 artifacts with authorization before retrieval.
- Workers AI structured planning.
- ExecutionProvider abstraction, documented in the checked-in README as E2B plus a deterministic mock adapter.
- Tool and execution boundaries with tests.
- Production Auth0 setup, owner provisioning, and live provider behavior still require verification.

### Daytona status — important verification note

Daytona is the selected provider for the consolidated Vestren V1. However, the GitHub source files inspected for this planning change do not yet demonstrate a Daytona adapter in either repository: the existing Workbench README describes E2B/mock-E2B, while the Mini Genspark workspace currently reports code execution disabled. Treat Daytona as the **approved target**, not as verified in this consolidated branch, until its adapter files and contract tests are located or committed and a real smoke test succeeds. Do not silently route to E2B or a mock in production.

## Target integration map

| Concern | V1 decision |
|---|---|
| Product name and UI | Vestren workspace |
| Core modes | Chat, Research, Create, Analyze, Build |
| Multi-step orchestration | Agent run service with visible plan, progress, tool policy and verification |
| Identity | Adopt existing Vestren Auth0/OIDC boundary; no permanent owner-token-only multi-user model |
| Authorization | Adopt tenant/project membership and role checks from existing Vestren |
| Conversations and task metadata | D1, project-scoped |
| Artifacts | R2 with D1 metadata and authorization checks; local download fallback in development |
| Model provider | Provider-neutral LLM adapter; Workers AI can be initial default only when configured and live-verified |
| Research | Search/retrieval adapter and evidence ledger; no fabricated citations |
| Code execution | ExecutionProvider interface with **Daytona adapter as the selected V1 implementation** and deterministic mock for tests only |
| Tools | Typed schemas, allowlists, timeouts, quotas, approvals and audit |
| GitHub | Explicit connector adapter; minimum required permissions; branch-scoped writes, commit/push and pull request; never expose tokens to browser/model prompts |
| Deployment | No production resource rename or deployment until release gates pass |

## Full-stack architecture

1. **Frontend:** React 19 + TypeScript + Vite. A unified workspace shell for Chat, Research, Create, Analyze and Build; project selector; conversation history; visible agent timeline; artifact panel; provider/configuration state. Frontend is a presentation client, not an authority for permissions.
2. **API/backend:** Cloudflare Pages Functions + Hono is the target API composition from the existing Workbench. Reconcile the current Worker routes before moving them; do not keep duplicate implementations. Validate schemas at every route and use server-side authorization.
3. **Control plane:** identity, tenant/project membership, role-based permissions, run lifecycle, tool policy, approvals, usage caps, idempotency and redacted audit. This plane decides what the agent may do.
4. **Agent/orchestration:** typed plan → server validation → authorized tool calls → execution → verification → artifacts. Model output is untrusted input and never grants itself permissions.
5. **Database:** Cloudflare D1 for users, tenants, memberships, projects, conversations, messages, task runs, tool calls, artifact metadata, usage and audit events. Add migrations; do not rename/drop existing production databases as part of the initial consolidation.
6. **Object storage:** Cloudflare R2 for file bodies and generated artifacts. D1 metadata carries ownership/scope; authorize before every read/download. Never rely on an unguessable object key as access control.
7. **Execution:** Daytona API through a server-side adapter implementing create sandbox, write/read files, execute commands, start processes, collect outputs, and destroy sandbox. Enforce timeout, resource limits, safe path handling, output limits, cleanup and approval for network/external side effects. The Daytona API key is a server secret only. Mock execution is test/development only.
8. **AI provider:** provider-neutral interface for planning and inference. Workers AI is the current candidate default where suitable; model/provider configuration and availability must be explicit. No paid fallback unless the owner has explicitly enabled it.
9. **Research provider:** a separate search and page-retrieval interface. Store source URL/title and observed dates, connect claims to evidence, and show when live search is unavailable. Search provider choice remains configurable rather than hardcoded into the UI.
10. **GitHub integration:** server-side GitHub App or narrowly scoped token, separate from Daytona credentials. Start with repository read and branch-scoped writes; validate repo/branch allowlists, show diffs, require user approval before push/PR or other external writes, and record an audit event. Never allow arbitrary repositories or organization-wide access by default.
11. **Quality/operations:** CI for typecheck, tests, build and dependency audit; structured logs with redaction; health/status endpoint that distinguishes configured from live-verified providers; documented rollback and deployment gates.

## Implementation phases

### Phase 0 — Rebrand and contract (current branch)

- Change browser title, visible brand, UI copy, and model system identity to Vestren.
- Add product constitution and migration plan.
- Keep production resource names and provider configuration unchanged.
- Acceptance: no visible Mini Genspark brand remains in the main user path; tests/docs accurately describe capabilities.

### Phase 1 — Baseline verification and CI

- Run typecheck, unit/QA tests, build and dependency audit in GitHub Actions.
- Add browser tests for workspace modes, empty/error/loading states, mobile layout, keyboard access, and artifact flows.
- Record exact command output and blockers; do not report mock tests as live provider verification.

### Phase 2 — Reconcile API and security/control plane

- Compare current Worker API with existing Vestren Pages Functions/Hono routes.
- Introduce identity and authorization interfaces before merging endpoints.
- Integrate Auth0/OIDC server-side verification and D1 membership resolution.
- Preserve deterministic test identity only behind explicit development/test gates.
- Test unauthenticated access, tenant isolation, project roles, artifact authorization, and fail-closed behavior.

### Phase 3 — Persistence and artifacts

- Model projects, conversations, messages, task runs, tool calls, artifacts, and audit events.
- Use idempotency keys and server-side ownership/scope checks.
- Keep artifact bodies in R2 when configured; authorize through D1 before retrieval.
- Add migrations additively; do not rename or delete existing production databases.

### Phase 4 — Real research and creation

- Add provider-neutral search and page-retrieval adapters.
- Record source URL, title, publication/retrieval date where available, and claim/evidence relationships.
- Support editable/downloadable artifacts with size/type limits and safe previews.
- Label demo, mock, configured, and live-verified modes accurately.

### Phase 5 — Agent runs and tools

- Create a typed task plan and visible execution timeline.
- Validate model-proposed plans against server-owned tool schemas and user/project permissions.
- Apply request, time, retry, concurrency, and daily caps.
- Require approval for external writes, deployment, sending, publishing, or spend.
- Verify artifacts and task outputs; log redacted audit events.

### Phase 6 — Daytona execution

- Implement or port the Daytona adapter behind the shared ExecutionProvider contract.
- Add contract tests for sandbox creation, command execution, file transfer, process lifecycle, timeout, output limits, error normalization and cleanup.
- Keep deterministic mock adapter for unit/integration tests only.
- Verify API-key isolation, safe workspace paths, sandbox cleanup, network policy and resource limits.
- Do not claim Daytona is live until a real, owner-authorized smoke test has passed. Do not use E2B as an automatic fallback.

### Phase 7 — GitHub integration

- Add a dedicated GitHub integration boundary with least-privilege credentials.
- Begin with repository metadata/read; then allow branch-scoped file changes and commits.
- Require approval for push, pull request creation, deployment, or other external writes.
- Add tests for repository/branch allowlists, credential redaction, permission denial and audit coverage.

### Phase 8 — Productization

- Validate real user demand before paid model/API commitments.
- Add BYOK only with secure secret storage, no key logging, usage metering, and provider-specific privacy disclosure.
- Design pricing after cost per completed workflow and retention are measured.

## Release gates

Do not call the product production-ready until all relevant gates pass:

1. typecheck, tests, build and dependency/security audit;
2. real Auth0 login and tenant/project authorization smoke tests;
3. live model and search provider smoke tests, with costs/quota observed;
4. Daytona adapter contract and real sandbox smoke tests;
5. artifact authorization and cross-project isolation tests;
6. GitHub integration permission and approval tests;
7. mobile/browser usability and accessibility checks;
8. deployment/rollback plan and explicit owner approval.

## Explicitly not done by this branch

- Full source-code merge between the two repositories.
- Verified Daytona adapter in the consolidated workspace.
- Auth0 configuration, owner provisioning, or production secrets.
- Live model/search/Daytona verification.
- GitHub write integration in the Vestren product itself.
- Cloudflare resource renaming or production deployment.
- Repository rename.
