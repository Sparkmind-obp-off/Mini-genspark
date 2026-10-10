# Vestren — AI Workspace

**Vestren is an original, free-tier-first AI workspace designed to turn a prompt into a researched answer, a useful artifact, an analysis, or a bounded build task.**

This branch begins the rebrand of the Mini Genspark workspace baseline into Vestren. It also adopts selected architectural principles from the existing [Vestren Workbench repository](https://github.com/Sparkmind-obp-off/vestren): explicit identity and authorization boundaries, provider-neutral interfaces, project-scoped execution, auditable workflows, and isolated execution.

## Product direction

Vestren should feel like one workspace, not a collection of disconnected chatbots:

- **Chat** — reasoning and iterative work.
- **Research** — web research with retrieved sources, dates, citations, and uncertainty clearly shown.
- **Create** — editable documents and other deliverables.
- **Analyze** — structured data inspection, calculations, tables, and charts.
- **Build** — repository-aware planning and code changes, with tests and human review.
- **Agent runs** — multi-step tasks with a visible plan, tool permissions, progress, artifacts, and verification.
- **Projects and memory** — user-controlled context and durable work history, added only with explicit privacy and access controls.

The product may learn from general AI-workspace interaction patterns, including Genspark's unified workflow approach. It must not copy proprietary code, logos, protected assets, or distinctive pixel-exact UI. Vestren's implementation, visual identity, prompts, and product decisions remain original.

## Architecture principles adopted from the existing Vestren Workbench

1. **Identity is not authorization.** A verified login is not enough; server-side project membership and permissions must be checked for each protected resource.
2. **Control plane is separate from execution plane.** Do not run untrusted generated code inside a normal Worker request.
3. **Provider-neutral interfaces.** Model, search, tools, storage, and sandbox providers are adapters behind stable internal contracts.
4. **Visible, bounded agent execution.** Plans, allowed tools, limits, status, errors, artifacts, and verification outcomes are inspectable.
5. **Project-scoped persistence.** Conversations, executions, and artifacts must be isolated by tenant/project where multi-user support is enabled.
6. **Fail closed.** No configured provider, missing authorization, exhausted quota, or failed verification must not silently fall back to paid or unsafe execution.
7. **Human approval for consequential actions.** External writes, publishing, deployments, sending messages, and spending money require explicit approval.
8. **Evidence over claims.** Distinguish local/mock tests, configured providers, and live-verified integrations.

## Current branch scope

This branch applies the initial product name in the existing Mini Genspark UI and worker prompt, and records the product/architecture blueprint. It is **not** a completed merge of both repositories, and it is not a production launch.

The current Mini Genspark codebase is a smaller React/Vite + Cloudflare Worker/D1 workspace. The separate Vestren Workbench repository has the more developed Auth0/OIDC, tenant/project authorization, R2 artifact, and E2B execution-provider boundaries. Those capabilities must be integrated deliberately rather than copied over blindly.

## Target architecture

- **Experience layer:** React + TypeScript workspace; Chat, Research, Create, Analyze, Build, Projects, Runs, Artifacts.
- **Control plane:** Cloudflare Pages/Workers API for identity, authorization, quotas, planning, approvals, and audit.
- **Intelligence plane:** provider-neutral LLM and research adapters; route by capability, privacy, availability, and cost.
- **Execution plane:** ExecutionProvider interface; E2B as the existing Vestren adapter, with a deterministic mock for tests. Other sandbox providers remain optional adapters, not hard-coded dependencies.
- **Data plane:** D1 for relational metadata and authorization; R2 for artifact bodies; Durable Objects only when live session coordination needs them.
- **Tool plane:** typed internal tools and, where justified, MCP adapters with strict schemas, allowlists, timeouts, and audit events.
- **Quality plane:** unit/integration/browser tests, provider contract tests, explicit live smoke tests, artifact verification, and security checks.

## Free-tier-first policy

- No automatic paid fallback, auto top-up, or production deployment without explicit approval.
- A free quota is finite and may change. Configure hard limits and stop safely at quota exhaustion.
- Keep provider credentials server-side; never log or expose secrets.
- Mark every integration as mock, configured, or live-verified.
- Do not claim a capability is live until an actual provider smoke test passes.

## Migration guardrails

- Keep this work on a feature branch until review.
- Do not rename production Cloudflare resources, D1 database bindings, secrets, or deployment projects as part of a UI-only rebrand.
- Preserve existing tests and migrations; add tests before changing authentication, persistence, or execution.
- Treat the existing Vestren Workbench repo as a source of architecture patterns, not as a reason to maintain two competing Vestren products.
- The eventual canonical repository name can be chosen separately (for example, vestren or vestren-hq). Repository renaming and deployment/domain changes are not performed by this branch.

## Status and verification

The remote main branch is the pre-rebrand baseline. This feature branch is a proposal for the initial Vestren workspace rebrand. No production deployment, live model call, live search, Auth0 login, or real sandbox execution is implied by the presence of these files.

## References

- [Existing Vestren Workbench](https://github.com/Sparkmind-obp-off/vestren)
- [Mini Genspark baseline](https://github.com/Sparkmind-obp-off/Mini-genspark)
- [Genspark AI Workspace 6.0 overview](https://www.genspark.ai/blog/genspark-ai-workspace-6)
- [Genspark Super Agent](https://www.genspark.ai/helpcenter/super-agent)
