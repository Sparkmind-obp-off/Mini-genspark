# 03 — VestrenHQ Architecture

Updated 2026-10-10. Primary release target is a NEW Cloudflare Pages project, per docs/29 and docs/30. The old Worker and legacy Pages application are preserved reference resources, not the product deployment target. No Actions, automatic Git integration, public signup or paid-provider activation.

## Implemented architecture

```text
React 19 + TypeScript + Vite -> dist/index.html and /assets/*
Cloudflare Pages Functions functions/[[path]].ts
  -> src/pages.ts thin EventContext adapter
  -> src/worker.ts existing shared Request/Response backend
     -> auth, exact-Origin CSRF, owner-scoped data, quotas, audit
     -> D1 projects/sources/tasks/artifacts/session hashes/fingerprints
     -> optional Workers AI/Groq/Tavily (disabled)
  -> context.next() for Pages static assets and SPA fallback
```

Every request is included in generated `_routes.json` (`/*`, no excludes), so shared security headers and real policy pages are retained. API failures never reach SPA fallback. The Pages Functions compiler produces `dist/_worker.js`; this is a Pages runtime bundle, not a separate deployed Worker or proxy to the old Worker. `/privacy`, `/terms`, `/support`, `/pricing`, `/status` remain server-rendered policies. React route refresh uses Pages' normal SPA asset fallback; API JSON errors retain their status.

`src/worker.ts` remains the native Worker entry and shared implementation. `wrangler.preview.jsonc` is the preserved Worker reference configuration. Canonical `wrangler.jsonc` now uses supported Pages fields (`pages_build_output_dir`, compatibility date, vars, D1), without Worker `main`, `assets`, `version_metadata`, routes or cron fields. PM2 runs `wrangler pages dev dist` on port 3000, using local D1, not remote persistence.

## D1 identity and shared-state implications

The selected database is the verified existing `vestrenhq-private-preview`, ID `86787a64-0479-4ee6-96ca-5e9387a9b781`. Worker settings confirm that actual ID. Remote schema and exact migration ledger 0001–0004 were queried before binding Pages; no raw migration replay, recreation, data migration or deletion. Legacy `vestren-workbench` DB `21921969-a688-4e56-9662-17d0bf34e657` is not used.

Data: owner-scoped conversations/projects, immutable task evidence snapshots, normalized provided sources, editable artifacts with revision CAS, usage reservations, session hashes, credential fingerprints/lifecycle, hourly access counters and sampled events. Small bounded artifacts live in D1; R2 is not required. Manual briefs use supplied excerpts, no URL fetch or inference.

Pages and reference Worker share D1 and the same active owner secret. Secret values transfer privately, never through frontend configuration. Host-only cookies are separate per hostname; project data, quotas, audit and fingerprint lifecycle are shared. Active credential rotation/revocation or revoke-all affects shared state globally. Operators must coordinate secret updates across both runtimes; remote acceptance cancels only its own candidate and expires/logs out only its own synthetic session. Destructive regressions use fresh isolated local D1.

## Security and provenance

Eight-hour HttpOnly/Secure/SameSite=Strict `__Host-` sessions, SHA-256 verifiers, fixed server owner ID, exact same-origin mutations, bounded input/output/concurrency, idempotency and optimistic artifact edits are reused, not reimplemented. No tokens in D1/browser storage/audit. New replacement plaintext is returned once after authenticated explicit generation; dashboard has no retrieval API.

Build script records actual Git HEAD and dirty status in the server bundle, not client assets. `/api/health.deployment` exposes only build provenance; no invented Cloudflare version ID. Pages dashboard marks build identity CONFIGURED, runtime D1/schema queries VERIFIED; independent API deployment ID/SHA and remote login/workflow acceptance are separate release evidence.

## Future targets, NOT implemented

Daytona remains the selected sandbox direction, no E2B substitution. Public multi-tenant identity, arbitrary execution, uploads, full-page retrieval, R2 binary artifacts, Duitku, monitored alerts and cloud restore rehearsal remain separate gates. Optional providers require verified free quota/privacy/overage policy and explicit approval. Public paid launch stays NO-GO.

## Release

Direct main commits and normal pushes only. Clean install/typecheck/tests/Pages build/static secret scan, real local Pages browser workflow, read-only cloud preflight, explicit CLI preview then main deployment, remote Pages API/browser acceptance. No PR, force push, Actions or automatic pipeline. Domain/DNS/nameservers are intentionally untouched; the owner will attach the custom domain later. See NOW.md and docs/24 for actual evidence and rollback.
