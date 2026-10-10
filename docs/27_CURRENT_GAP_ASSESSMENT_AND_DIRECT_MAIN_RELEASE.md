# VestrenHQ — Current gap assessment and direct-main BYOK release

Updated 2026-10-10. Verified starting main: **b526133cfe1dae480f359a2e38e5f10accce9b90**. The final release SHA is obtained from `git rev-parse HEAD` and verified against origin/main after push; do not relabel a prior documentation checkpoint as a final implementation SHA.

## Owner-controlled scope

Native Cloudflare Worker + Assets + D1 in the owner's own account. No Genspark Hosted Access Rules, hosted identity or paid membership dependency; app owner identity/record authorization are separate server-side concerns. Work/push directly to main, no PR/feature branch/Actions/force-push. Public shell/policy pages contain no private data. Public registration, payments/Duitku, paid providers, Daytona execution and DNS remain disabled. Existing proposed target name `vestrenhq-private-preview` is retained for isolation, not a requirement to use a hosted platform preview.

## Capability and evidence matrix

| Capability | Status | Actual implementation/evidence |
|---|---|---|
| Existing project/source/manual brief/editor/export/reopen/delete | PASS locally | Existing workflow preserved; real Worker/D1/browser test |
| Secure owner sessions/CSRF/ownership/logout/expiry | PASS locally | Existing gate strengthened with mandatory secret validation and per-session credential binding; old cookies invalid after secret rotation |
| Replacement generation | PASS locally | Web Crypto 32 random bytes; authenticated POST + exact Origin + explicit confirmation/rate limit; fingerprint-only D1 metadata |
| One-time credential copy/TXT download | PASS locally | New response only; explicit reauthorized export, memory-only browser Blob, fixed filename; no old credential retrieval API |
| Rotation | PASS locally, manual installation | Generated candidate PENDING; owner installs Worker secret; new login verifies current runtime secret, marks old fingerprint rotated/deletes old sessions. No automatic cloud mutation or grace period |
| Pending cancellation / active credential revocation / revoke-all | PASS locally | Cancelled/revoked/rotated fingerprints reject login; credential revoke deletes sessions; recovery uses a NEW secret through owner infrastructure |
| Access & Security | PASS locally | Private owner endpoint, real counts/events/session expiry; dashboard unavailable/error states tested; no fabricated cloud deployment/alerts |
| Additive migration 0004 | PASS locally | Fresh and populated upgrades preserve legacy quota/event rows; old sessions reauthenticate; transactional login audit failure has no orphan session |
| Core automation | PASS locally | 66 tests, 4 files; intermediate failures recorded in NOW; optional vendors mocked, real local workflow unmocked |
| Cloudflare BYOK identity/inventory | PASS read-only | 9 D1/1 Worker, no Vestren targets; current environment does have checkout/credentials, unlike prior historical session |
| Dedicated remote D1 ID/schema | PENDING_OWNER_ACTION | wrangler.preview.jsonc d1_databases[0].database_id empty; no fabricated ID/reuse/remote migration |
| Mandatory remote OWNER_ACCESS_TOKEN | PENDING_OWNER_ACTION | Local ignored secret configured; no dedicated Worker/remote secret exists/verified; REQUIRED_SECRETS_CONFIGURED false |
| Cloud deployment, runtime log proof, rollback/restore | BLOCKED / NOT_TESTED | Packaging/dry-run is not deployment or target verification; no workers.dev URL/version claimed |
| Public/paid product gates | BLOCKED / NOT_TESTED | Public identity, commercial evidence, live retrieval/privacy/quotas, support/legal/alerts/recovery and relevant payment lifecycle still absent |

## Files and purpose

- `src/worker.ts`: credential-bound owner sessions, transactional login/revocation audit, security/credential API delegation, safe errors and atomic run limit.
- `src/security.ts`: cryptographic generation, one-time payload, lifecycle metadata, safe audit categories/counters/window queries and schema probes.
- `src/AccessSecurity.tsx`, `src/App.tsx`, `src/styles.css`: authenticated panel, explicit generation/copy/download/cancel/manual install/verify/revoke controls; unmount/logout clears one-time UI and ignores delayed responses.
- `migrations/0004_owner_security.sql`: additive session fields and security metadata; 0001–0003 untouched.
- Tests in App/worker and real `scripts/workflow-acceptance.mjs`: denial/CSRF/randomness/plaintext non-retrieval/rotation/revoke/counts/audit failure/upgrades/logout and actual TXT download.
- `wrangler.jsonc`: local-only emulator; `wrangler.preview.jsonc`: isolated remote target/account with D1 empty; no AI binding in either default config.
- `scripts/release-preflight.mjs`, package script `release:check`: read-only target/secret/schema gate, no deployment automation; QA scans new security code and root configuration/templates too.
- README/NOW/docs24/27 and privacy/trust text: corrected historical environment and token-rotation claims; actual boundaries/secret inventory/recovery.

## Audit semantics and limitations

Counters are trusted server writes, not frontend events. Auth success also counts session creation; auth failures include rejected/rate-limited login requests. Unauthorized/forbidden counters record request rejections, not unique people. Revocation counters count operations, not deleted sessions. Active sessions are real unexpired owner rows matching the installed credential hash. Dashboard self-read appears on next refresh.

UTC hourly windows 1h/24h/7d/30d include boundary hour; aggregates retain 30 days. Detailed events retain 7 days, sampled to 200/hour, latest 50; not a complete forensic/lifetime/edge analytics feed. Expiry events record rejected attempts, not unique idle sessions. Credential fingerprint/status tombstones persist to prevent revoked-token reuse, creation NULL when unknown. No raw token/cookie/auth header/URL/query/prompt/source/IP in access events. Logging failures fail closed to safe 503; ordinary project mutations may have completed before the audit fails, so inspect state before retry. D1-outage load/denial economics, monitored alerts, all-browser/screen-reader testing and remote recovery remain unmeasured.

## Owner action and no-go conditions

Follow docs/24 manual runbook. Owner may create dedicated D1 later using `npx wrangler d1 create vestrenhq-private-preview`, verify account/name/ID, fill the explicit remote config field, review schema/backup, apply migrations with `--remote --config wrangler.preview.jsonc`, and install OWNER_ACCESS_TOKEN privately. Bootstrap/recovery happens in owner terminal/Cloudflare, not chat. Infrastructure credentials never enter the application or generated TXT file.

`npm run release:check -- --online` must verify real resources/schema/secret name. Missing ID/secret/binding/schema, wrong target, failed QA, unsafe access or unreviewed recovery => NO-GO. Presence gate alone does not prove entropy or deployed login: record returned deployment ID/URL and run actual auth/security/core/revocation smoke tests after explicit manual deploy. No existing resources are deleted or repurposed. Public/paid launch remains NO-GO; BYOK readiness is not evidence of commercial validation.
