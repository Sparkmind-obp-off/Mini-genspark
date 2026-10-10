# NOW — VestrenHQ

Updated 2026-10-10. Canonical repository: Sparkmind-obp-off/Vestrenhq. Branch: **main**, verified starting HEAD **b526133cfe1dae480f359a2e38e5f10accce9b90**, matching remote main. Earlier divergent local Mini implementation was preserved under a local archive tag; no published history rewrite/force-push. No feature branch, PR, Actions or branch-protection change in this work.

## Current objective and implementation

Owner-operated development/deployment in the owner's Cloudflare BYOK account; native Worker + Assets + D1. No Genspark Hosted Access Rules, hosted identity, Dispatcher or paid membership dependency. The earlier Hosted-rule membership error applied only to platform-hosted admission; it is not a BYOK limitation. Application owner identity and private record authorization are server-side Worker responsibilities, not an attempted Hosted descriptor substitute.

Implemented: existing projects/excerpts/manual briefs/artifact editing/export/reopen/delete preserved. New authenticated **Access & Security / Authentication & Credentials** panel, real D1 counters/events and session expiry; 256-bit Web Crypto replacement token generated once, explicit authenticated TXT/copy actions, no plaintext retrieval/storage, pending cancellation, manual Worker secret installation and replacement-login verification, revoke-all and active-credential revoke/recovery. Owner secret rotation invalidates old session credential bindings; missing mandatory secret fails closed even for existing cookies. Task reservation now checks the per-project run limit atomically.

0004 is additive: session credential hash/audit ID/date, fingerprint-only credential metadata, access_counts and access_events. 0001–0003 unchanged. Legacy sessions require re-login. Credential creation timestamp is UNAVAILABLE for externally created secrets (NULL, not invented). Dashboard cloud deployment/alerts are UNAVAILABLE; runtime/schema and counters are based on queries. Single-secret installation has no grace period; save the replacement before changing it. No automatic Cloudflare secret write from browser.

## Observed candidate QA

The following were actually executed after implementation, before source commit; final committed-SHA rerun and push evidence must be checked in the release operator's final report/git, not inferred from an old baseline. Ordinary tests use mocked optional vendors; local workflow has no HTTP/vendor mocks.

| Command | Exit / actual result |
|---|---|
| `npm ci` baseline | 0 / PASS; locked dependencies; final-commit reinstall remains part of release sequence |
| `npm run typecheck` | 0 / PASS |
| `npm test -- --reporter=dot` | 0 / PASS, **66 tests**, 4 files, no skips |
| `npm run qa` | 0 / PASS; no workflows, guard/config/source/build/history and exact ignored local-secret scans |
| `npm run build` | 0 / PASS, 31 modules, SPA JS 256.11 KB / 79.11 KB gzip |
| `npm run db:migrate:local` | 0 / PASS, 0004 applied to local emulator only |
| `curl -fsS http://localhost:3000/api/health` | 0 / PASS, owner-only/publicLaunch false |
| `npm run test:browser` | 0 / PASS, actual denial/setup; optional provider success explicitly MOCKED |
| `npm run test:workflow` | 0 / PASS, real local dashboard → token TXT download → failed replacement verification retains owner access → cancel → existing full project/edit/export/reopen/delete/logout workflow; explicit clipboard completion checked |
| `npm audit --json` | 0 / PASS, no reported vulnerabilities |
| `git diff --check` | 0 / PASS |
| `npx wrangler deploy --dry-run --config wrangler.jsonc --outdir .qa/worker` | 0 / PASS local packaging only, 68.07 KiB / 19.80 KiB gzip; no deploy |
| `npm run release:check` | 2 / **PENDING_OWNER_ACTION**, expected stop on missing remote configuration; NOT a deploy PASS |

Intermediate checks failed: TypeScript unused-env/optional-secret typing, corrected; long-lived alpha Miniflare integration instances timed out/bridge failed, corrected with fresh workerd/D1 per test and bounded integration timeout. Full 65-test rerun then passed; the added transactional revocation-race regression brought the final candidate to 66 passing tests. A browser copy assertion initially read the clipboard before asynchronous authorization/copy completed; waiting for the actual completion notice corrected the test, and the real workflow rerun passed. Failures were not hidden by selected-test evidence. Lint not configured. Remote provider/payment/Daytona/Cloudflare deployment/backup restore remain NOT_TESTED.

## BYOK/resource/secret evidence

Secure BYOK setup and `wrangler whoami` succeed. Read-only inventory in current environment: **9 D1 databases, 1 Worker, zero Vestren matches**. Prior documentation that this environment lacked checkout/Cloudflare credentials was historical and is superseded.

`wrangler.jsonc` is local-only; `wrangler.preview.jsonc` has the verified owner account and proposed existing target `vestrenhq-private-preview`. Real remote ID belongs at **d1_databases[0].database_id**, currently empty: **PENDING_OWNER_ACTION**. No invented ID or unrelated DB reuse. OWNER_ACCESS_TOKEN is configured in ignored local .dev.vars for tests, not installed/verified remotely. GROQ_API_KEY/TAVILY_API_KEY optional and disabled; no AI binding. CLOUDFLARE_API_TOKEN is deployment infrastructure only, never in app/UI/downloads/Git. **REQUIRED_SECRETS_CONFIGURED = false** for release.

No remote resource creation, secret installation, migrations, deployment, DNS, payments or sandbox actions occurred. Deployment URL/version: none. BYOK remote release is **BLOCKED by actual D1/secret setup**, not by Hosted membership. Public/paid production remains NO-GO.

## Next owner action

Create/identify the dedicated D1 in the verified account (owner may do this later), insert its actual ID in wrangler.preview.jsonc, review schema/backups, apply migrations, install a NEW separate owner application credential privately, and run read-only `npm run release:check -- --online` followed by explicit manual deploy and authenticated/unauthenticated smoke tests. Exact commands, bootstrap/download/rotation/recovery, counter definitions, retention and rollback are in docs/24; current gaps in docs/27.

Credential fingerprints/status tombstones persist for revocation; no plaintext. Access counters retain 30 days, sampled detail 7 days/200 per hour/latest 50; lazy authenticated cleanup, not scheduled purge. Audit failure returns 503; ordinary workspace mutations may already have completed, so inspect state/revisions/idempotency before retry. Remote restore/rollback and monitored alerts remain NOT_TESTED. No public signup/payment/provider/DNS activation is authorized by this implementation.
