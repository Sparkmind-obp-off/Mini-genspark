# 03 — VestrenHQ Architecture

**Status:** target architecture; implementation is incomplete.  
**Operating constraints:** Cloudflare-first, free-tier-first, provider-neutral, fail-closed, no GitHub Actions.

## 1. System boundaries

```text
React + TypeScript + Vite (static assets)
        |
        v
Cloudflare Worker API (typed handlers; Hono only if useful)
        |
        +--> Auth + server-side project authorization
        +--> Control plane: quotas, approvals, audit, task lifecycle
        +--> Agent planner -> validated tool registry -> verifier
        +--> Workers AI / optional model adapters
        +--> Research/search adapter + safe public URL fetch
        +--> File parsing, deterministic analysis, artifact generation
        +--> ExecutionProvider -> Daytona sandbox (V1 target)
        |
        +--> D1: users, projects, conversations, runs, sources, metadata, audit
        +--> R2: uploaded/generated file bodies and artifacts
        +--> Durable Objects only if live coordination needs them
```

## 2. Stack decisions

| Layer | V1 decision | Guardrail |
|---|---|---|
| UI | React + TypeScript + Vite | Accessible, responsive, honest capability states |
| API | Cloudflare Worker / Wrangler | Validate all input; never run untrusted code in Worker |
| Auth | Existing owner-only gate during private dogfooding; OIDC/session layer before public multi-user release | A shared owner token is not production multi-user auth |
| Authorization | Server-side project/tenant checks | Fail closed; never trust client-supplied owner/project IDs |
| Model | Workers AI initial candidate plus adapters only when justified | Hard caps; no hidden paid fallback |
| Search | Provider-neutral SearchProvider | Real URLs, retrieval timestamps, citation checks, quota hard stop |
| Metadata | D1 | Migrations, scoped queries, export/deletion |
| Artifacts | R2 when needed | Authorize every download through server-side metadata |
| Sandbox | Daytona behind ExecutionProvider | Time/resource/output limits, task-scoped files, cleanup proof |
| Source control | GitHub branches/commits/push | Review diff; require approval for external writes |
| Deployment | Wrangler + Cloudflare Workers | Manual preflight and post-deploy smoke test; no GitHub Actions |

Do not add every optional library or provider at once. Keep vendor SDKs behind adapters. Durable Objects are not mandatory unless a real coordination requirement is demonstrated.

## 3. Canonical task lifecycle

`created → validated → planned → awaiting_approval → queued → running → verifying → succeeded | failed | cancelled | quota_blocked`

A task is not successful because the model says “done.” Verification must use real evidence appropriate to the task: valid source links, deterministic calculation checks, file reopening, sandbox exit status, or explicit user acceptance.

## 4. Daytona execution boundary

Daytona is the selected V1 sandbox. The Worker should authorize a task, create a bounded sandbox via a server-side adapter, transfer only scoped files, execute approved commands, collect bounded logs/artifacts, and attempt cleanup on success, failure, and timeout. Enforce execution deadlines, output limits, safe paths, concurrency limits, and network restrictions. Do not pass broad production credentials into the sandbox.

No E2B fallback and no mock-as-production-success. The current repository tree does not show the Daytona adapter under src/. If it exists in another implementation, port it into this canonical repository and test its contract before enabling Build execution.

## 5. Trust and cost

- Secrets are server-side Cloudflare secrets, never frontend variables or committed files.
- Missing identity, authorization, provider configuration, quota, or tool permission fails closed.
- Retrieved pages, uploaded files, repository content, and model output are untrusted data.
- External writes, publishing, deployments, sending, purchasing, and spending require explicit approval.
- Bound request size, context, output, time, concurrency, retries, and daily usage.
- Provider status must distinguish disabled, configured, live-verified, quota-exhausted, and error.
- Do not pool free quotas into a paid multi-user service unless provider terms clearly allow it.
- Use D1 for metadata and R2 for binary bodies; authorize every read and delete.

## 6. Commercial readiness is also architecture

Before public multi-user release, add verified login/session revocation, tenant/project isolation, durable conversation and project storage, user export/deletion, usage accounting, support/feedback, privacy/terms, and a manual incident/rollback process. Product-market fit cannot be solved by infrastructure alone: instrument task completion, corrections, repeat use, and cost per useful work product.

## 7. Release process without GitHub CI

1. Work on a feature branch and push to GitHub.
2. Run npm run typecheck, npm test, and npm run build locally.
3. Inspect the diff and confirm no secrets or unrelated changes.
4. Verify Cloudflare account, Worker target, D1 IDs, bindings, secrets, and quota ceilings.
5. Deploy explicitly with Wrangler only after preflight.
6. Run a small deployed smoke test and inspect Cloudflare logs.
7. Record commit, deployment URL, smoke-test result, provider state, known gaps, and rollback steps.

The Cloudflare deployment is not a replacement for tests. GitHub Actions are intentionally excluded; release verification is manual and recorded.
