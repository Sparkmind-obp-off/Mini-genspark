# NOW — VestrenHQ Pages release

Updated 2026-10-10. **DEPLOYED / LIVE VERIFIED: new owner-only Cloudflare Pages application.** Primary URL: **https://vestrenhq-private.pages.dev**. BYOK account, not Genspark hosted deployment. Custom domain/DNS/nameservers intentionally untouched per docs/29–30. Public paid launch remains NO-GO.

## Actual release evidence checkpoint

- Project: `vestrenhq-private`, ID `8f0c8bd1-c5fb-4dc1-9e59-87062552e16a`; main production branch, direct CLI upload, no Git integration or Actions.
- Tested application source: `e4cf141c98650fcd4d2d707e108a24d248967226`, normal push to GitHub main verified with `git ls-remote`.
- Preview ID: `5eab4e3d-091a-494f-b761-7290c3c9ebf0`; actual returned URL https://5eab4e3d.vestrenhq-private.pages.dev. Cloudflare deploy stage success, commit hash matches source. Remote acceptance exit 0 at 13:00 UTC.
- First production ID: `2f839c61-68a4-4e67-b377-a410905bf49b`; actual returned URL https://2f839c61.vestrenhq-private.pages.dev. Cloudflare deploy stage success, same source SHA. Full remote acceptance exit 0 on the DEFAULT https://vestrenhq-private.pages.dev at 13:01 UTC.
- This document records real immutable acceptance checkpoints, not an invented self-referencing SHA. Documentation follow-up commits are explicitly rebuilt/redeployed; final deployment ID/SHA are obtained from Cloudflare deployment API and public `/api/health.deployment.commit`, and compared to latest GitHub main in the operator's final verification/report. Earlier IDs above remain historical checkpoints if superseded.

## Real D1/runtime proof

**REUSED**, not recreated: `vestrenhq-private-preview`, ID **86787a64-0479-4ee6-96ca-5e9387a9b781**. Worker binding, actual DB name, expected tables/session/artifact/source/security columns and exact migration ledger 0001–0004 queried before selection. No remote migration replay. Both actual Pages environment configurations (preview and production) expose `DB.id` equal to this ID, compatibility `2026-10-10` and encrypted `OWNER_ACCESS_TOKEN` type `secret_text`.

Credential independently installed through private stdin into EACH Pages environment; not inferred from Worker secrets. Actual valid owner login/session on preview and default production hostname proves use. No secret value or delivery link recorded in Git/chat/bundle. Same current active token retained; no Worker secret change.

Remote Pages created a synthetic project/source, executed an honest manual brief, persisted task/artifact, edited with revision conflict protection, exported four formats, reopened after browser reload, then deleted it. Independently queried the intended D1 via authorized API to find that runtime-written project UUID and verify absence after cleanup. This is actual runtime-binding proof, not a config-only claim. Post-acceptance business counts were zero projects/tasks/artifacts, matching preflight counts; four migration ledger rows unchanged. Only synthetic acceptance business content removed.

## Quality gates actually executed

| Gate | Result |
|---|---|
| Clean `npm ci` | PASS, exit 0 |
| Typecheck | PASS |
| Unit/API/D1/React/provider/Pages tests | PASS, **71 tests / 5 files**, no skips |
| Vite + Pages Functions build | PASS; server bundle directory `dist/_worker.js/index.js`, generated routes all paths |
| Server module syntax / static QA / diff | PASS; known local/remote/infrastructure secret values + patterns scanned across source/server/client/history |
| npm audit | PASS, zero reported vulnerabilities |
| Local D1 migration runner | PASS, second check no migrations pending (LOCAL emulator only) |
| Local Pages browser acceptance | PASS; actual denial/setup/accessibility plus optional provider result explicitly MOCKED |
| Local Pages full workflow | PASS, actual local D1/manual evidence/edit/copy/download/reopen/delete/logout, no vendor/network retrieval |
| Pages cloud preflight `release:check -- --online` | PASS, actual BOTH environment binding IDs/secret types + remote DB identity/ledger |
| Pages preview remote acceptance | PASS, six checkpoint groups |
| Default pages.dev production remote acceptance | PASS, seven checkpoint groups including real 429 rate-limit response |

Initial fixture 415, multipart `--outfile` packaging rejection and unsupported Pages `account_id` were repaired without weakening validation. A clean dependency reinstall while local Pages dev was running removed workerd temporarily and caused a subsequent health/browser timeout; stopped/restarted the process after build and the complete local browser/workflow then passed. First Git push failed authentication; secure GitHub setup was refreshed and normal main push then succeeded. These failures are not misrepresented as passed attempts.

## Remote acceptance boundaries

PASS: deployment ID/SHA/configuration from real Cloudflare API; HTTPS/health/SPA refresh/assets byte equality/policies/security headers; anonymous private reads and credential actions 401; invalid preview login 401; exact Origin 403; secure HttpOnly/Secure/SameSite=Strict host cookie; actual Access & Security with D1/session/counters/schema; unknown API 404 instead of SPA; generated pending token/export authorization/cancellation with active credential preserved; real manual project workflow/replay/CAS/all exports/browser desktop/mobile; exact synthetic-session expiry by cookie hash and logout; bounded throttle 429; known plaintext absence in ordinary assets/dashboard/audit/fingerprint rows. Optional providers remain disabled, not live verified.

Active credential rotation/revocation/recovery and revoke-all are IMPLEMENTED and tested locally in isolated fresh D1; historical isolated Worker acceptance exists. **NOT REPEATED remotely on shared Pages D1**, to avoid invalidating unrelated owner/reference Worker access. Pages smoke only cancels its own pending candidate and expires/logs out its own session. Quotas/audit/fingerprint state is shared across Pages/Worker; cookies are host-specific. Coordinate future secret rotation across both runtimes.

Attempted bounded Pages log tail returned zero events; log sampling **UNAVAILABLE**, not a successful zero-error log proof. Raw trace headers/body not retained. Source/storage/response scans are scoped checks, not a universal platform telemetry guarantee. No active credentials printed. Login-rate probes deliberately respect time windows; any final acceptance wait does not reset counters or spoof IP.

## Preservation and remaining gates

Reference Worker remains HTTP 200/version `06310e94-09f2-498f-8563-0263eb2f93ec`, empty tag; no current release Worker deploy or secret mutation. Legacy Pages `vestren-workbench` retains ID `3c42f3c2-7736-4a32-bdb7-2209fddb27b1`, deployment `4f7aead5-65a5-4aa8-979b-25da63a64e85` and legacy DB `21921969-a688-4e56-9662-17d0bf34e657`; never used or edited. New Pages custom-domain list is empty. No zone/DNS/nameserver operations; owner attaches domain later.

Remote restore/rollback rehearsal, sustained Free CPU/load measurement, all-browser/screen-reader testing, monitored alerts, public tenant identity, provider entitlement/privacy/free-only live proof, legal/support/market validation, Daytona execution and Duitku/payment remain NOT_TESTED/disabled. No paid fallback, public signup, automatic pipeline, PR, feature branch, force push or history rewrite. See docs/24 runbook and docs/27 current status.
