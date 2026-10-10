# NOW — VestrenHQ

## Current release — 2026-10-10

**DEPLOYED: owner-authenticated Cloudflare BYOK preview. Public/paid production remains NO-GO.**

- Repository: Sparkmind-obp-off/Vestrenhq; direct main, no PR/feature branch/Actions/force-push.
- Verified starting HEAD: `e7241219bf8b665dbcc264a14c375560b84aaa7a`.
- First tested/deployed source checkpoint: `a2e46a23ef5c58e95c1ad438575c89fabfd004e3` (provisioning/version metadata/safe remote acceptance + exact remote/infrastructure secret scan).
- Actual URL returned by Wrangler: **https://vestrenhq-private-preview.sparkmind-support.workers.dev**.
- First tagged app version: `8b750ba6-1aaf-4793-8223-4cdd122467b5`.
- Credential rotation/recovery necessarily created subsequent secret-change versions, initially without commit tags. Final explicit redeploy restores a release-commit tag and disables extra version-preview aliases. Read `/api/health.version` and verify its tag against origin/main; the final ID/SHA are recorded in the operator's final report, not invented/self-referenced here.

## Executed infrastructure work

Connected owner account was authenticated using secure BYOK setup and `wrangler whoami`. Initial inventory: 9 unrelated D1s, 1 unrelated Worker, no Vestren match. With explicit autonomous authorization, created exactly one dedicated D1 and one dedicated Worker named `vestrenhq-private-preview`; unrelated resources were not modified.

Real D1 ID: **86787a64-0479-4ee6-96ca-5e9387a9b781**, captured from successful Cloudflare creation, inserted into wrangler.preview.jsonc and verified against remote name. Migrations 0001–0004 applied in order; rerun reported no pending migrations. Schema, indexes and migration ledger queried remotely. No destructive reset or guessed ID. Existing local emulator configuration remains separate.

OWNER_ACCESS_TOKEN is a separate 256-bit application secret, not a Cloudflare API token. Bootstrap installed via private stdin; real remote rotation/revocation/recovery verified and the final NEW replacement installed. Only fingerprints/session hashes/lifecycle metadata in D1. The final owner credential is delivered through an authenticated private file download; unauthenticated access was tested and returned 403. No value or credential delivery URL committed/printed. Protected delivery is not an automatically expiring/single-use link: import into a password manager and delete the private delivery file afterwards. Local temporary plaintext inputs are removed after final verification/delivery.

`npm run release:check -- --online`: exit 0, real target/schema/required secret name verified, **REQUIRED_SECRETS_CONFIGURED = true**; actual successful remote login proves operational use beyond presence. DB, ASSETS and Cloudflare WORKER_VERSION bindings verified. Providers all remain disabled; no AI binding, payment, sandbox, public signup, DNS or custom domain activated. Version metadata contains public deployment identifiers only.

## Actual QA at source checkpoint a2e46a2

| Check | Exit / observed result |
|---|---|
| `npm ci` | 0 / PASS |
| `npm run typecheck` | 0 / PASS |
| `npm test -- --reporter=dot` | 0 / PASS, **67 tests**, 4 files, no skips |
| `npm run qa` | 0 / PASS, source/build/history plus exact known local/remote/infrastructure secret scans |
| `npm run build` | 0 / PASS, 31 modules, SPA JS 256.11 KB / 79.11 KB gzip |
| `npm audit --json` | 0 / PASS, zero reported vulnerabilities |
| `npm run db:migrate:local` | 0 / PASS, no pending migrations |
| `npm run test:browser` | 0 / PASS, actual denial/setup, optional-provider successful UI explicitly MOCKED |
| `npm run test:workflow` | 0 / PASS, real local owner/security/credential download/copy/cancel and entire manual project workflow |
| `npm run release:check -- --online` | 0 / PASS, remote identity/schema/secret-name gate |
| `wrangler deploy --dry-run --config wrangler.preview.jsonc` | 0 / PASS, 68.42 KiB / 19.92 KiB gzip, no mutation |
| `git diff --check` | 0 / PASS |
| Actual tagged `wrangler deploy --config wrangler.preview.jsonc` | 0 / PASS, returned URL/version above, 1 ms startup |

Final config/documentation commit gets the complete applicable suite rerun before final publish/redeploy; verify that SHA and operation evidence in the final report. Do not mistake an earlier local-only 51/66-test checkpoint for current remote evidence. Lint is not configured. Optional vendor tests are mocked, not live-provider verification.

## Actual remote security acceptance

`RUN_REMOTE_SMOKE=true ALLOW_PREVIEW_CREDENTIAL_TESTS=true` on the NEW empty dedicated preview completed exit 0 with **14 passing checkpoint groups**:

1. Health, owner-only/publicLaunch false and runtime version/commit tag.
2. Anonymous private projects/tasks/artifacts/security and credential actions denied 401.
3. Invalid login rejected; valid login works; HttpOnly/Secure/SameSite=Strict host-cookie/8h expiry; real dashboard/counters/schema.
4. Cross-origin action 403 and absent private-resource 404.
5. Remote D1 project/source/manual evidence provenance/idempotency/CAS/edit/export/reopen/delete.
6. Targeted synthetic session expiry rejected 401.
7. Logout revokes the tested cookie.
8. Actual Worker-secret rotation, replacement login, old-cookie rejection and old fingerprint rotated.
9. Actual active credential revoke, denied protected request, safe recovery with pre-saved NEW replacement, verified login.
10. Known secrets absent from ordinary responses/assets/audit/verifier rows; remote assets equal local built files.
11. Actual remote browser renders owner dashboard with runtime data.
12. Revoke-all denies former cookie.
13. Login throttle returns 429.
14. Server-side counters updated for auth/denial/session/credential events.

Recovery login respected the throttle with a bounded 104-second wait; no spoofed IP or quota reset. All synthetic business records were removed; smoke sessions revoked. Final handoff preserves the verified replacement credential. Repeated destructive lifecycle tests are opt-in only and must not be casually run against an active owner's workspace.

Remote log sampling rerun exited 0: three trace events, zero application console/exception entries, no known credentials; request trace headers were excluded from retained evidence. First sampler wrote results but its tail subprocess lingered and timed out; only those tail processes were terminated and bounded cleanup rerun succeeded. This limited sample is not a universal guarantee about platform telemetry.

## Boundaries and remaining risks

Standalone native Worker application identity/private-record authorization; no Genspark Hosted Access Rules/identity dependency. Public shell, policy pages and minimal non-sensitive health/version metadata are intentionally accessible. Private business data/admin endpoints remain server-authorized. Credential download delivery uses an authenticated file account solely for handoff, not app login.

Remote backup/restore and actual rollback rehearsal, sustained load/Free CPU measurements, all-browser/screen-reader testing, monitored alerts, public tenant identity, live vendor quota/privacy/overage proof, Duitku/Daytona and market/legal/support readiness remain NOT_TESTED/blocked for public paid launch. Manual briefs still do not fetch URLs or perform inference. Audit detail retention is 7 days sampled to 200/hour, aggregates 30 days, lazy cleanup; credential fingerprint tombstones persist for revocation. No credentials in screenshots, Git, public URLs or ordinary application responses.

No routine deployment task remains delegated to the owner. Owner action is only to securely receive/store the delivered application credential and sign in to use the deployed preview. Operational runbook and current gaps are docs/24 and docs/27.
