# Vestren Migration and Implementation Plan

**Target:** consolidate the Mini Genspark workspace direction with selected architecture from the existing Vestren Workbench.

## Source-of-truth decisions

- Product brand: **Vestren**.
- Workspace UX baseline: Mini Genspark repository.
- Security, tenant/project authorization, artifact access, and execution-boundary patterns: existing Vestren Workbench repository.
- Existing Vestren Workbench remains reference/source material during migration; do not operate two competing product experiences long-term.
- Canonical repository rename (such as vestren or vestren-hq) is a separate owner-controlled step after the migration path is reviewed.

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
- ExecutionProvider interface with E2B and deterministic mock adapters.
- Tool and execution boundaries with tests.
- This codebase is the stronger security/control-plane reference, but production configuration and live provider behavior still need verification.

## Target integration map

| Concern | Decision |
|---|---|
| Product name and UI | Vestren workspace |
| Core modes | Chat, Research, Create, Analyze, Build |
| Multi-step orchestration | Agent run service with visible plan, progress, tool policy and verification |
| Identity | Adopt existing Vestren Auth0/OIDC boundary; no permanent owner-token-only multi-user model |
| Authorization | Adopt tenant/project membership and role checks from existing Vestren |
| Conversations and task metadata | D1, project-scoped when multi-user enabled |
| Artifacts | R2 with D1 metadata and authorization checks; local download fallback in development |
| Model provider | Provider-neutral LLM adapter; Workers AI default only when configured and live-verified |
| Research | Search/retrieval adapter and evidence ledger; no fabricated citations |
| Code execution | ExecutionProvider; E2B adapter retained behind interface, mock adapter for tests |
| Tools | Typed schemas, allowlists, timeouts, quotas, approvals and audit |
| Repository name | Rename only after implementation branch is reviewed |
| Deployment | No deployment or production resource rename in this phase |

## Implementation phases

### Phase 0 — Rebrand and contract (this branch)

- Change browser title, visible brand, UI copy, and model system identity to Vestren.
- Add this constitution and migration plan.
- Keep production resource names and provider configuration unchanged.
- Acceptance: no visible Mini Genspark brand remains in the main user path; tests/docs accurately describe capabilities.

### Phase 1 — Baseline verification

- Install dependencies and run typecheck, unit/QA tests, build, and audit.
- Add or update browser tests for workspace modes, empty/error/loading states, mobile layout, keyboard access, and artifact flows.
- Record exact command output and blockers; do not report mock tests as live provider verification.

### Phase 2 — Merge security/control-plane contracts

- Compare current worker API and existing Vestren Pages Functions/Hono routes.
- Introduce identity and authorization interfaces before merging endpoints.
- Integrate Auth0/OIDC server-side verification and D1 membership resolution.
- Preserve local-only deterministic test identity behind explicit development/test gates.
- Test unauthenticated access, tenant isolation, project roles, artifact authorization, and fail-closed behavior.

### Phase 3 — Persistence and artifacts

- Model projects, conversations, messages, task runs, artifacts, and audit events.
- Use idempotency keys and server-side ownership/scope checks.
- Keep artifact bodies in R2 when configured; authorize through D1 before retrieval.
- Add migrations additively; do not rename or delete existing production databases.

### Phase 4 — Real research and creation

- Add provider-neutral search and page retrieval adapters.
- Record source URL, title, publication/retrieval date where available, and claim/evidence relationships.
- Support editable/downloadable artifacts with size/type limits and safe previews.
- Label demo, mock, configured, and live-verified modes accurately.

### Phase 5 — Agent runs and tools

- Create a typed task plan and visible execution timeline.
- Validate model-proposed plans against server-owned tool schemas and user/project permissions.
- Apply request, time, retry, concurrency, and daily caps.
- Require approval for external writes, deployment, sending, publishing, or spend.
- Verify artifacts and task outputs; log redacted audit events.

### Phase 6 — Isolated build execution

- Retain the E2B implementation behind ExecutionProvider.
- Contract-test E2B and mock implementations.
- Verify sandbox timeout, filesystem boundaries, network policy, secret isolation, and cleanup.
- No production code execution or automatic deployment until explicit smoke tests pass.

### Phase 7 — Productization

- Validate real user demand before paid model/API commitments.
- Add BYOK only with secure secret storage, no key logging, usage metering, and provider-specific privacy disclosure.
- Design pricing after cost per completed workflow and retention are measured.

## Release gates

Do not call the product production-ready until all relevant gates pass:

1. typecheck, tests, build and dependency/security audit;
2. real Auth0 login and tenant/project authorization smoke tests;
3. live model and search provider smoke tests, with costs/quota observed;
4. E2B sandbox contract and safety tests;
5. artifact authorization and cross-project isolation tests;
6. mobile/browser usability and accessibility checks;
7. deployment/rollback plan and explicit owner approval.

## Explicitly not done by this branch

- Full source-code merge between the two repositories.
- Auth0 configuration, owner provisioning, or production secrets.
- Live model/search/sandbox verification.
- Cloudflare resource renaming or production deployment.
- Repository rename.
