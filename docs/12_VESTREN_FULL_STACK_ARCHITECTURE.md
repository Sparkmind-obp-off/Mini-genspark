# Vestren Full-Stack Architecture — V1

## Product shape

Vestren is one AI workspace with five modes: **Chat, Research, Create, Analyze, Build**. The UI is unified; projects, conversations, task runs, permissions, artifacts and audit records share one control plane.

## Architecture map

```text
React + TypeScript + Vite
        │ HTTPS / typed API
        ▼
Cloudflare Pages Functions + Hono (target API layer)
        │
        ├── Identity: Auth0 OIDC/JWKS
        ├── Control plane: tenant/project RBAC, approvals, quotas, audit
        ├── Agent orchestrator: plan → validate → tools → verify
        ├── AI provider adapter (Workers AI candidate; live verification required)
        ├── Research adapter (search + page retrieval; provider configurable)
        ├── GitHub adapter (least privilege, branch-scoped writes, approvals)
        └── ExecutionProvider ── Daytona API (V1 selected sandbox)
        │
        ├── Cloudflare D1: relational metadata and operational state
        └── Cloudflare R2: authorized file bodies and artifacts
```

## Component responsibilities

- **Frontend:** workspace navigation, conversations, task timeline, provider status, project context, approval prompts and artifact preview/download. It never authorizes itself or stores provider secrets.
- **API/backend:** schema validation, authentication, authorization, rate/usage limits, idempotency, orchestration, audit, safe error normalization.
- **Control plane:** tenant and project scope, role checks, tool allowlists, human approval for external side effects, run state and policy decisions.
- **Agent runtime:** proposes typed plans. Server validates each action before a tool is called. Retrieved pages, repository content and model output are untrusted data.
- **D1:** users, tenants, memberships, projects, conversations, messages, runs, tool calls, artifact metadata, usage and audit events. Use additive migrations and scoped queries.
- **R2:** uploaded/generated file contents and build artifacts. Check authorization in D1 before serving every object.
- **Daytona:** isolated code/build sandbox accessed server-side. Adapter contract covers create, write/read files, command execution, process management, bounded output, timeout, normalized errors and destroy/cleanup.
- **AI providers:** common interface so model choice does not leak into product/domain logic. Provider must be marked mock/configured/live-verified; no implicit paid fallback.
- **Research providers:** separate search/retrieval adapters and an evidence ledger with source URL/title and observed dates. Do not fabricate citations when no provider is active.
- **GitHub:** separate credential and adapter boundary. Start with read-only, then branch-scoped commits. Push/PR/deploy require explicit approval. Keep GitHub tokens away from browser code, model prompts and sandbox environment unless narrowly scoped and specifically required.

## Daytona decision and current verification state

**Decision:** Daytona is the selected V1 sandbox provider. Do not substitute E2B or automatically fall back to a paid provider.

**Verification:** the checked-in Mini Genspark workspace currently reports code execution as disabled. The existing Vestren Workbench README currently documents E2B/mock-E2B, not a verified Daytona adapter. Therefore this architecture records the approved target; it does not claim that the Daytona adapter is already present in the consolidated workspace. Locate/port the user's existing Daytona implementation or implement the adapter in the next execution phase, then run contract tests and a real authorized smoke test before enabling it.

## Security invariants

1. Secrets live only in server-side secret storage.
2. Every API route enforces authentication and server-authoritative tenant/project authorization.
3. Model output cannot grant permissions or bypass tool schemas.
4. Daytona sandboxes receive only task-scoped files and credentials, ideally no secrets at all.
5. Bound CPU/time/output/files; always attempt cleanup after success, failure and timeout.
6. Never treat a random artifact key as authorization; authorize each D1/R2 access.
7. GitHub write actions are scoped, diff-visible, approval-gated and audited.
8. No hidden provider fallback. The user sees unavailable/configured/mock/live-verified status accurately.
9. Logs redact tokens, credentials, private file contents and sensitive prompts.
10. Deployment, external writes, publishing and spending require explicit policy and user approval.

## Implementation order

1. Establish CI and verify the current baseline.
2. Reconcile the Worker API and Pages Functions/Hono routes; retain one canonical API.
3. Merge Auth0 identity and D1 tenant/project authorization.
4. Consolidate D1 migrations and R2 artifact authorization.
5. Add agent-run lifecycle, typed tools, approval and audit.
6. Port/implement Daytona adapter and contract tests; run a real smoke test.
7. Add provider-neutral research and GitHub integrations with least privilege.
8. Enable production only after CI, security, provider and rollback gates pass.

## Cost and provider policy

- Free-tier-first, but never assume a service is free merely because an API exists.
- No automatic paid fallback.
- Track provider status, quotas, timeouts and usage; enforce app-level caps.
- Keep optional external providers behind adapters and feature flags.
- A mock is for deterministic tests and local development only, never a production success substitute.

## Out of scope for this architecture document

This document does not itself merge application source, provision Auth0, create production secrets, deploy Cloudflare resources, verify live Daytona access, or implement the GitHub connector. Those are implementation tasks with explicit tests and release gates.
