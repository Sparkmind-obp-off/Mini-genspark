# VestrenHQ — Manual Pages release and recovery runbook

Updated 2026-10-10. This filename is retained for stable links. NEW Pages is the primary target per docs/29–30. Worker and legacy Pages are preserved. No GitHub Actions, automatic deploy integration, PR, feature branch, force push, custom-domain, DNS/nameserver changes, payments or paid-provider activation.

## Verified selection

- Account: `a167a50f1272635d3c1145aab3cd8f98`, verified via secure BYOK setup/whoami.
- New Pages name selected after inventory: `vestrenhq-private` (absent at initial audit).
- Canonical Pages configuration: `wrangler.jsonc`, output `dist`, production branch `main`, compatibility `2026-10-10`.
- Reused D1: `vestrenhq-private-preview`, `86787a64-0479-4ee6-96ca-5e9387a9b781`. Actual Worker binding, DB name, expected table columns and exact ledger 0001–0004 verified. No migration replay or new DB required.
- Legacy Pages `vestren-workbench` and DB `21921969-a688-4e56-9662-17d0bf34e657` untouched.
- Old native Worker configuration remains `wrangler.preview.jsonc`; current reference version at audit `06310e94-09f2-498f-8563-0263eb2f93ec`, empty tag. Historical first tagged version is not current release proof.
- See NOW.md for actual Pages deployment IDs, source SHA and acceptance results. Configuration alone is not cloud proof.

## Operator sequence (executed by the authorized agent, not delegated)

1. Fetch/normal-merge current main, inspect clean tree/diff, account/resource inventory, migration ledger and secure token input availability. Never print tokens or full binding values.
2. `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npm run qa`, `npm audit --json`, `git diff --check`.
3. Apply migrations to the LOCAL emulator only with `npm run db:migrate:local`. For an existing remote DB, first compare ledger/schema. Never replay raw ALTER statements. This release already has all remote migrations; no apply operation is needed.
4. Stop PM2 process/clean port 3000, build first, start `ecosystem.config.cjs` (Pages dev), curl health, run `test:browser` and `test:workflow`. Optional provider UI tests are explicitly mocked; actual manual workflow is unmocked.
5. Create the new Pages project once using verified unused name, `main` production branch and compatibility date. No Git integration or workflow creation.
6. Privately pipe the EXISTING current application token into `wrangler pages secret put OWNER_ACCESS_TOKEN --project-name vestrenhq-private`. The infrastructure API token never enters application code. Verify preview and production encrypted secret type via API; secret-name presence is not proof of login.
7. Commit directly main; build the clean commit. Build embeds server-only SHA/dirty provenance in compiled Functions, never plaintext secrets. Do not deploy a dirty build.
8. Deploy a preview using the CLI deployment branch label `pages-acceptance` (not a Git branch). Record returned deployment ID/URL and API `commit_hash`, environment, stages and actual bindings. Run explicit `remote-pages-smoke.mjs` with URL/expected SHA/deployment ID.
9. After preview passes, explicitly deploy the same clean main commit with `--branch main --commit-hash <actual SHA>`, then remote-test returned immutable URL and default project pages.dev hostname. Read-only `release:check -- --online` confirms both environments' D1 ID, owner secret type, ledger and no Git source.
10. Record evidence and push main normally. Verify published main, build health commit, Cloudflare deployment metadata and final health again. Documentation-only follow-up commits distinguish tested application source checkpoint from release evidence checkpoint.

Wrangler has no `pages deploy --dry-run` in the installed CLI. Supported `pages functions build`, generated routing validation, local actual Pages runtime and read-only preflight are the packaging gates; do not claim a nonexistent dry-run command passed.

## Shared credential and recovery safety

The initial Pages secret is independently installed using a secure 0600 input, not assumed inherited from Worker. Reuse the existing current token because D1 owner fingerprints/sessions are global. Pages and Worker host-only cookies differ, but data/usage/audit/lifecycle state is shared.

Replacement generation returns plaintext once after authenticated explicit confirmation; only SHA-256 fingerprint/status persist. Download/copy are explicit authorized actions. Save in password manager before installing. Use Pages secret put and redeploy Pages; coordinate reference Worker secret update before replacement login. Successful new login globally rotates old fingerprint and deletes old-credential sessions. No grace period, no restoration of revoked/cancelled/rotated secrets. A fresh token is needed for lost/compromised-token recovery. Runtime infrastructure secrets never go to browser/chat/D1.

Revoke-all and active credential revoke affect both runtimes. Do not repeat destructive acceptance against a shared owner workspace. Local fresh-workerd/D1 regressions test rotation/revocation/recovery/races. Remote Pages acceptance generates/cancels its own pending candidate, targets exactly its own synthetic session for expiry, logs out only its own session, cleans only its own project, and does not overwrite either runtime's secret. Prior isolated Worker lifecycle evidence is historical, not falsely relabeled Pages live proof.

## Remote acceptance and evidence boundaries

`RUN_REMOTE_SMOKE=true REMOTE_PAGES_URL=<returned URL> EXPECTED_RELEASE_SHA=<actual SHA> EXPECTED_DEPLOYMENT_ID=<actual ID> node scripts/remote-pages-smoke.mjs` is an explicit operator test only, never normal npm test, CI or automatic deployment. Optional invalid-login/rate probes are explicit and respect throttle; no quota reset or IP spoof.

Independent Cloudflare deployment ID/SHA/binding API, HTTPS health/build identity, static assets byte equality, SPA refresh and real policies, denial/CSRF, owner cookie/login, real dashboard/counters/schema, safe candidate cancellation, actual D1 synthetic writes independently queried, manual evidence/provenance/replay/CAS/export/reopen/browser/mobile/deletion, targeted expiry and logout. Sanitized reports live in ignored `.qa/`; no cookies/token payloads retained in reports. Known secret scan covers source/client/server bundle/history and ordinary remote assets/API/audit/verifiers, not a universal platform telemetry guarantee. Pages log sampling, active credential rotation/revoke-all remote retest, sustained load and backup restore are NOT_TESTED unless separately recorded.

## Rollback and data

Inspect Pages deployment history and identify a verified known-good security-capable production deployment. Use Cloudflare Pages' rollback API for that exact project/deployment ID only after checking eligibility; preview deployments are not production rollback targets. An explicit forward-fix/redeploy of known-good main code is another option. No rollback was rehearsed in this release, and no prior Pages production exists before first promotion.

Do not drop tables or reverse migrations; code rollback must remain compatible with 0004 credential/session enforcement. Database restoration requires an approved isolated restore plan and integrity proof. Credential recovery is not database restore proof. Shared data retention remains lazy 30 days; audit aggregates 30 days/events 7 days capped 200/hour/latest 50, tombstones retained. Inspect revisions/idempotency after audit 503 because an ordinary mutation may already have committed.

`vestren.biz.id` is intentionally NOT attached. No DNS or nameserver operation is part of this release; owner connects it later. Optional providers, Duitku and Daytona remain disabled/unimplemented; public paid launch NO-GO.
