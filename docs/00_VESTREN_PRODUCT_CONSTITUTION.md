# Vestren Product Constitution

**Status:** Product direction for the Mini Genspark → Vestren rebrand. This is a design contract, not a claim that all listed capabilities exist.

## 1. Product thesis

Vestren is a unified AI workspace for getting real work done. It should move from prompt → plan → evidence/context → bounded execution → artifact → verification, while keeping the user in control of permissions, cost, and consequential actions.

It is inspired by the broad category of all-in-one AI workspaces and agentic work products, including Genspark. It is not a clone. Vestren must have its own product language, design system, architecture, workflow choices, and implementation.

## 2. The product loop

1. **Understand:** classify the request and ask only for essential missing information.
2. **Plan:** show a short task plan for multi-step or consequential work.
3. **Gather:** retrieve permitted web, file, project, or connected-account context; show source provenance.
4. **Act:** use only tools authorized for the current user/project and task.
5. **Produce:** return a response and/or editable artifact.
6. **Verify:** run available checks and clearly distinguish verified facts from assumptions.
7. **Remember:** save only appropriate project context with user visibility, editability, and deletion controls.

## 3. Workspace modes

- **Chat:** general reasoning, iterative conversation, explain and decide.
- **Research:** search/retrieval, source ledger, dated claims, citation checks, uncertainty.
- **Create:** documents and structured deliverables first; additional media generation only when a real provider is configured.
- **Analyze:** CSV and structured data validation, deterministic calculations, tables/charts, export.
- **Build:** repository-aware changes, diff review, test/build output, explicit approval before consequential actions.
- **Agent run:** orchestration layer that can combine modes and tools. It is not a separate chatbot; its plan and progress should be visible.

Modes are workflows over shared core services, not five separate products.

## 4. Architecture boundaries

- **Experience:** UI, accessibility, responsive behavior, artifacts and run timeline.
- **Identity:** OIDC/Auth0 boundary inherited from the existing Vestren Workbench, configured and verified before multi-user production.
- **Authorization:** D1-backed tenant/project membership and role checks on every protected resource.
- **Control plane:** request validation, quota reservation, planning, tool authorization, approvals, audit.
- **Intelligence:** LLM and embedding adapters, routing, context assembly, structured output validation.
- **Research:** search provider, page retrieval, source ledger, citation/evidence mapping.
- **Execution:** isolated ExecutionProvider adapters; no untrusted code in the request worker.
- **Tools:** typed contracts, schema validation, permission scopes, timeouts, bounded retries.
- **Persistence:** D1 metadata; R2 artifacts; Durable Objects only for demonstrated coordination needs.
- **Observability:** redacted audit events, usage counters, latency/error metadata; never persist provider secrets or unnecessary raw sensitive content.

## 5. Provider interfaces

Keep stable internal interfaces for LLMProvider, SearchProvider, EmbeddingProvider, ToolProvider, ExecutionProvider, and StorageProvider. Vendor SDKs stay inside adapter modules. Provider status must be explicit: mock, configured, or live-verified.

The initial execution adapter in the existing Vestren repository is E2B. Keep E2B behind ExecutionProvider; do not force a provider migration without comparative contract tests, cost review, and approval.

## 6. Trust, safety, and cost

- Fail closed on missing identity, authorization, provider configuration, quota, or tool permission.
- No paid fallback or spending without explicit user/owner approval.
- No arbitrary external side effects without a clear confirmation step.
- Treat retrieved web pages, files, repository content, and tool output as untrusted data.
- Enforce request, context, output, time, concurrency, and daily usage limits server-side.
- Keep credentials server-side, redact logs, rotate exposed credentials, and document provider data-retention/privacy constraints.
- Artifacts and history must be scoped by user/project and authorized before access.
- Research must not fabricate sources; distinguish source existence from whether a claim is proven.

## 7. MVP priority

**P0 — Rebrand and stabilize:** Vestren UI identity, accessible responsive workspace, truthful capability status, build/test baseline.

**P1 — Trustworthy core:** persistent conversations/projects, Auth0 identity, D1 project authorization, quotas, audit events, safe artifact storage.

**P2 — Real research:** provider adapter, source ledger, citation validation, live smoke tests.

**P3 — Deliverables and analysis:** Markdown/HTML/CSV artifacts; deterministic data calculations and exports; file upload with size/type validation.

**P4 — Agent runs:** visible plan, typed tools, bounded execution, approval checkpoints, artifact verification.

**P5 — Build sandbox:** repository-aware changes and isolated execution through E2B adapter; test/build logs; no automatic deployment.

**P6 — Productization:** team roles, BYOK, usage limits, billing only after demand and cost model are validated.

## 8. Non-goals for initial release

- Pixel-perfect copying of Genspark.
- Claiming feature parity with every Genspark suite.
- Unbounded autonomous agents.
- Browser/session scraping or undocumented private APIs.
- Unreviewed code execution or automatic production deploys.
- A second competing Vestren product.
- Enabling costly image/video/voice or premium model APIs before a sustainable provider and explicit budget exist.

## 9. Definition of done

A feature is done only when its user-visible behavior, permissions, quota/cost behavior, error state, tests, provider status, and docs agree. A mock test is not a live provider test; a successful build is not a production deployment.
