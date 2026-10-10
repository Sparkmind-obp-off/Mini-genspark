# VestrenHQ — Deployed owner-only BYOK preview and current gaps

Updated 2026-10-10. Verified starting main `e7241219bf8b665dbcc264a14c375560b84aaa7a`; tested initial release source `a2e46a23ef5c58e95c1ad438575c89fabfd004e3`. The final release SHA/version is obtained from actual `/api/health.version` and verified against origin/main after final tagged redeploy; the initial checkpoint is not mislabeled as the final release.

## Executed, not delegated

Owner explicitly authorized autonomous D1 creation/migrations/secret installation/deployment/security acceptance. Secure BYOK identity/inventory verified first. Created one dedicated D1 `vestrenhq-private-preview`, ID **86787a64-0479-4ee6-96ca-5e9387a9b781**, and dedicated Worker; no unrelated resource reuse or changes. Four migrations applied remotely, repeated migration runner reported none pending, schema/index/ledger verified. OWNER_ACCESS_TOKEN securely installed via stdin; real rotation/revocation/recovery verified with a pre-saved NEW replacement, and protected owner credential download prepared. Infrastructure credentials never enter frontend, D1 or that download.

Actual deployed URL returned by Cloudflare: **https://vestrenhq-private-preview.sparkmind-support.workers.dev**. First tagged app version: **8b750ba6-1aaf-4793-8223-4cdd122467b5**. Subsequent secret changes create versions without tags; final explicit redeploy restores a release tag and disables extra version-preview aliases. Public shell/policies/minimal health metadata are intentionally reachable; all private data/admin endpoints remain authenticated. No custom DNS/domain, signup, payment/Duitku, paid provider, Daytona, PR, feature branch, force-push or Actions introduced.

Standalone native Worker identity/private-record authorization, not Genspark Hosted admission/identity. Protected download is only a credential handoff facility, not an application access dependency. It returned 403 to unauthenticated requests. File values/delivery URLs are not in Git or logs; delivery is not an automatically self-deleting/single-use link. Owner should save the credential securely and delete the protected handoff file.

## Capability/evidence matrix

| Capability | Status | Actual evidence |
|---|---|---|
| Cloudflare account access | VERIFIED / PASS | whoami + initial read-only inventory + successful dedicated create/edit/deploy operations |
| D1 target/schema/migrations | PASS remote | Real returned ID matches name; 0001–0004 and indexes/ledger queried; safe rerun |
| Required secret/bindings | VERIFIED remote | Worker secret-name preflight, DB/ASSETS/WORKER_VERSION bindings, real owner login; REQUIRED_SECRETS_CONFIGURED true |
| Owner denial/login/cookies | PASS remote | Anonymous reads/actions 401, invalid login 401, valid login 200, HttpOnly/Secure/SameSite=Strict/__Host cookie |
| CSRF/resource checks | PASS remote | Foreign Origin 403, absent project 404; cross-owner negative tests remain local because single-owner only |
| Sessions | PASS remote | Exactly targeted synthetic expiry rejected; logout/revoke-all reject old cookie; real active session counters |
| Rotation/revocation/recovery | PASS remote | API generates pending candidate; agent installs Worker secret; replacement login works; old cookie rejected/hash rotated. Active token revoked; recovery NEW token installed and verified |
| Credential copy/TXT UI | PASS local, live generation verified | Real local authenticated download/copy; remote owner generation/ordinary-response non-retrieval; protected final handoff denial verified |
| Core workflow | PASS remote | Synthetic project/source/manual brief/replay/reopen/CAS save/export/delete, no provider calls; synthetic business content removed |
| Access & Security | PASS remote | API real counts/events/schema/version plus actual remote Chromium owner panel renders |
| Audit/privacy checks | PASS scoped remote | Server counters updated; no known plaintext tokens in ordinary responses/assets/audit/verifier rows; source/history scans. Sampled 3 trace events with zero console/exception entries; not an exhaustive log guarantee |
| Login rate limit | PASS remote | Bounded probes return 429; valid recovery respected throttle wait, no reset/spoof |
| Local QA | PASS | 67 tests/4 files, typecheck/build/QA/audit/local migrations/browser/workflow at source checkpoint; final release revalidation required/recorded separately |
| Actual cloud deploy | PASS | Wrangler returned workers.dev URL/version; actual health/version/tag verified; final exact metadata must match published main |
| Cloud restore/rollback rehearsal | NOT_TESTED | No prior customer data; recovery plan only. Secret recovery test is not database restore proof |
| Operational alerts/long load/all browsers | NOT_TESTED | No monitored alerts, sustained Free CPU measurements or all-browser/screen-reader proof |
| Public/paid product gates | BLOCKED / NOT_TESTED | No public tenant identity, merchant/payment lifecycle, live vendor entitlement/privacy/quota proof, commercial validation or legal/support readiness |

## Changed implementation surface

`wrangler.preview.jsonc` now holds actual dedicated ID, immutable runtime version binding and preview_urls false. `src/worker.ts` exposes only safe version metadata on public health; `src/security.ts` shows runtime-backed version instead of fabricated deployment state. Worker regression test verifies unavailable vs supplied version binding; total 67 tests. QA additionally scans exact known remote/infrastructure secrets without printing them.

`remote-preview-smoke.mjs` is an explicit bounded operator script, never invoked by normal npm test, CI or automatic deploy. Requires actual dedicated workers.dev URL and RUN_REMOTE_SMOKE=true. Critical token mutations separately require ALLOW_PREVIEW_CREDENTIAL_TESTS=true and an empty newly provisioned preview; do not rerun against the owner's active workspace casually. Respects throttle with a bounded wait; no IP spoof/quota reset. Persists only sanitized checkpoint results, not headers/cookies/body values. Plaintext inputs remain ignored/private only until secure handoff/final verification, then removed.

## Residual security/operational limits

Owner app token must remain private, never distributed to public users. Single-secret installation has no grace period; save replacement before changing it. The browser does not receive Cloudflare deployment credentials and cannot autonomously write Worker secrets; the authorized deployment operator did the current installation/rotation work. Fingerprint/status tombstones persist to prevent revoked/cancelled/rotated token reuse. Session binding invalidates old cookies immediately after secret change.

Counters cover only requests reaching the Worker, UTC hourly windows (boundary hour included), 30-day retention; detailed samples 7 days/200 per hour/latest 50. Not lifetime/edge analytics. Audit failure returns safe 503; ordinary workspace mutation might already have committed, so inspect revisions/idempotency/state before retry. Cloud trace headers were intentionally excluded from sampled application-log evidence. First log sampler cleanup timed out; its own processes were stopped and bounded rerun exited 0. No secrets leaked in tool output.

Manual evidence is supplied-not-retrieved, not AI inference/full-page research. Public/paid launch remains NO-GO despite successful private deployment. Future operational work is recovery/alerts/private dogfooding and separately approved provider/commercial gates—not more deployment instructions handed to the owner.
