# Vestren Product Constitution

**Status:** binding product direction for Vestren/VestrenHQ. This is a design contract, not a claim that all listed capabilities exist.

## 1. Product thesis

Vestren is a commercial AI work execution workspace. It turns a request into a reliable, reviewable work product while keeping the user in control of permissions, cost, and consequential actions. It is inspired by the broad category of unified AI workspaces, including Genspark, but must maintain original code, brand, visual language, and workflows.

## 2. The product loop

Understand → Plan → Gather evidence/context → Authorize tools → Execute → Verify → Deliver artifact → Remember with user control.

## 3. Shared workspace modes

- Chat: reason, explain, decide, iterate.
- Research: search/retrieval, source ledger, dated claims, citation checks, uncertainty.
- Create: editable documents and structured deliverables.
- Analyze: validated data, deterministic calculations, tables/charts, exports.
- Build: repository-aware diffs, bounded sandbox execution, logs, test evidence.
- Agent run: visible orchestration across modes; not a separate chatbot.
- Projects and memory: user-controlled context, inspect/edit/export/delete.

Modes share core services; they are not five independent products.

## 4. Product and commercial focus

The first market hypothesis is evidence-backed research and work-product creation for solo operators, small teams, and builders. This is not validated yet. The first objective is to prove repeated use of one workflow and willingness to pay before expanding to a broad all-purpose suite.

A feature must solve a repeated user problem, be reliable, have a clear cost/quota policy, and be measurable. More features do not equal more product value.

## 5. Architecture boundaries

- Experience: React, TypeScript, responsive UI and accessible controls.
- Runtime/API: Cloudflare Workers/Wrangler.
- Identity: owner-only gate for private dogfooding; verified identity/session before public multi-user access.
- Authorization: server-side project/tenant membership checks.
- Control plane: validation, quota reservation, plan validation, tool policy, approvals, audit.
- Intelligence: provider-neutral model interface and validated structured output.
- Research: search/retrieval adapter and evidence mapping.
- Execution: Daytona sandbox through server-side ExecutionProvider; never execute untrusted code in Worker.
- Persistence: D1 metadata, R2 file bodies/artifacts, Durable Objects only for demonstrated coordination needs.
- Observability: redacted audit events, usage counters, latency/error metadata.
- Source control/deployment: GitHub branches and pushes; manual local QA and Cloudflare Wrangler deploy. No GitHub Actions/GitHub CI.

## 6. Provider and safety rules

- Fail closed on missing auth, authorization, configuration, quota, or tool permission.
- No paid fallback or spending without explicit approval.
- External writes, publishing, deployment, sending, purchasing, and other consequential actions require confirmation.
- Treat web pages, files, repository contents, and tool outputs as untrusted.
- Enforce request/context/output/time/concurrency/retry/daily limits.
- Keep credentials server-side and redact logs.
- Mark providers as mock, configured, or live-verified.
- Research never fabricates sources; unsupported claims must be labelled.
- Daytona is selected for V1; do not silently substitute E2B. Do not mark Daytona live until its adapter and bounded smoke test are verified.

## 7. Definition of done

A feature is done only when user-visible behavior, permissions, quota/cost behavior, failure states, documentation, and verification evidence agree. A mock is not a live provider test. A successful build is not a production deployment. A working demo is not proof of market demand.

## 8. Non-goals

- Pixel-perfect copying of Genspark.
- Claiming parity with every Genspark suite.
- Unbounded autonomous agents.
- Undocumented private APIs or access-control bypasses.
- Unreviewed code execution or automatic production deployment.
- A second competing Vestren product.
- Costly media or premium APIs before a sustainable provider and explicit budget exist.
