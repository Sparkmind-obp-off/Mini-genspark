# VestrenHQ — Cloudflare Workers Manual Release Runbook

**Binding operating rule:** use the repository and local terminal for implementation and QA, GitHub for versioned source and push, and Cloudflare Workers/Wrangler for runtime and deployment. Do not use GitHub Actions or GitHub CI.

## Tool responsibilities
- Development environment: edit code, inspect repository, run terminal commands, review diffs, and work against explicit acceptance criteria. Tool suggestions are not proof that code works.
- GitHub: canonical source history and commits/pushes directly to `main`, as explicitly requested by the owner. Do not create branches or pull requests for routine work.
- Cloudflare Workers/Wrangler: local Worker development, configuration, D1 migrations, secrets, deployments, logs, and rollback/version management.
- D1/R2/Workers AI: use only after bindings, limits, access policy, and actual account entitlements are confirmed.
- Daytona: selected Build sandbox provider; no live claim until the adapter and bounded smoke test pass.

## Local workflow
1. Confirm repository and branch with git status --short --branch.
2. Install dependencies using the repository's lockfile/package manager.
3. Run npm run typecheck.
4. Run npm test.
5. Run npm run build.
6. Run npm run dev and npm run dev:worker as appropriate; test the primary path and failure states.
7. Run git diff --check; inspect the diff and check for secrets/generated files.
8. Record exact commands, results, date, and commit. If a command cannot run, record why; never mark it passed.

## Cloudflare preflight — mandatory before remote mutation
Never deploy while Wrangler config contains a placeholder D1 ID or unverified Worker/resource name.
1. Confirm the authenticated account and intended environment.
2. Verify exact Worker name, environment, domain/routes, and production-vs-preview intent.
3. Verify every D1 database name and real ID; review migrations and data ownership.
4. Verify R2 buckets, AI bindings, variables, and required secrets.
5. Confirm secrets exist without printing values.
6. Confirm quotas, cost ceilings, kill switches, retention, and rollback.
7. Inspect current live deployment and planned target.
8. Require explicit release-owner approval before production deploy or live payment.

The Worker and D1 are now named `vestrenhq-private-preview`; the D1 ID is still a placeholder. Do not deploy or run remote migrations until the dedicated D1 has been created in the owner-authorized BYOK account and its actual ID has been recorded. Never attach to an unrelated product database.

## Manual release sequence
1. Commit reviewed changes directly to `main`; verify GitHub SHA and clean working tree.
2. Complete local QA and inspect the exact commit.
3. Run npx wrangler deploy --dry-run to validate the bundle without deploying.
4. After preflight and approval, run the appropriate Wrangler deploy command for the confirmed environment.
5. Capture actual deployment/version ID and URL.
6. Smoke-test the deployed URL: landing/health, auth, project isolation, core workflow, export, quota stop, deletion, and relevant error paths.
7. Inspect Cloudflare logs and verify no secrets/sensitive content were emitted.
8. Confirm rollback/version strategy and rehearse rollback when safe.
9. Update NOW.md with commit SHA, environment/URL, smoke-test evidence, gaps, and next action.

Wrangler commands and flags can change. Check the installed CLI's help and current official documentation before a release.

## Secret handling
- Use Cloudflare/Wrangler secret management for server-side credentials.
- Never commit .dev.vars, .env secrets, access tokens, merchant keys, or private user data.
- Never expose credentials via VITE variables, browser code, logs, screenshots, or support tickets.
- Use separate credentials for local/preview/production where supported.
- Rotate exposed secrets immediately; document the incident without recording the secret.

## Manual release record
Record release ID/date/operator; branch and commit SHA; typecheck/test/build results; Wrangler version/dry-run result; environment and Worker name; migration/binding verification; deployment URL/version; smoke-test cases/results; provider status/cost limits; rollback version/steps; known issues and approval.

## Observed candidate preflight — 2026-10-10

- Repository/branch: verified Vestrenhq rename; `feat/vestren-research-deliverable`, baseline remote main `8a3d0aecb981a67157a2ca16b39cdda1913a773d`. Push is an explicit owner request; no merge/protection change is authorized.
- BYOK skill activated, secure Deploy-panel Cloudflare token loaded by `setup_cloudflare_api_key`, `npx wrangler whoami` succeeded for the single available owner account. Token values were never printed or copied into the repository.
- `npx wrangler d1 list --json` succeeded read-only: nine databases, none named Vestren/mini-genspark. Read-only Workers scripts inventory returned HTTP 200, one Worker, no name match. Other product resources were not read for content, attached, renamed or modified.
- Target Worker/database/origin/routes/environment: **BLOCKED**, not invented. Current Wrangler `mini-genspark` / placeholder D1 ID remains a local test target, not an approved production target.
- `npm run typecheck`, 51 tests, build, audit (0 vulnerabilities), local migrations and real local workflow passed; detailed statuses/commands are in NOW.md. Updated lockfile is used for final `npm ci` verification.
- `npx wrangler deploy --dry-run --outdir .qa/worker` succeeded with Wrangler 4.149.0: 51.43 KiB upload bundle / 15.61 KiB gzip, explicitly exited dry-run. This validates Worker packaging only. It did not upload/deploy, verify placeholder binding existence or set secrets.
- Provider flags remain false; local app token exists only in ignored `.dev.vars` (mode 0600). App/schema/source/artifact/provider error contracts were tested locally; actual inference/search/account quotas are not live-verified.
- Real local browser journey used user-supplied labelled fixture evidence, not mocked API responses or live research. Test project and session were deleted/revoked afterwards. `.qa/` screenshots/bundles and temporary credentials are ignored, not production artifacts or committed data.
- GitHub Actions/workflows remain absent. The Pages-oriented BYOK skill was not used to create a Pages project or convert this native Worker; constitution and actual Worker arrangement remain authoritative.
- No production resources/migrations/secrets/DNS/payments/Daytona sandbox were changed. Deployment URL/version and rollback version: **none / NOT RUN**.

### Exact unblocking sequence (owner action; not executed)

1. Approve/identify dedicated isolated private-preview Worker+D1 resources in the authenticated BYOK account; define preview versus production intent. Do not reuse an unrelated DB. Confirm account plan/quota/cost policy and expected operator.
2. With explicit resource-creation authorization, obtain actual IDs from Cloudflare, create a separately reviewed preview config with those IDs/name/origin, and keep production config untouched. Never generate guessed UUIDs or substitute platform-managed hosting.
3. Use runtime secret prompts/dashboard for `OWNER_ACCESS_TOKEN` and only approved providers (`GROQ_API_KEY` / `TAVILY_API_KEY`, or verified Workers AI binding). Set/verify `APP_ORIGIN`; revoke sessions when rotating owner access. Keys belong in secrets, never command-line literals, VITE or GitHub Actions.
4. Export/verify a backup of the intended existing database before an approved remote migration. Apply additive migrations to isolated preview first; inspect schema/row integrity and rehearse restore into a separate test DB.
5. Approve a bounded live provider test only after balance/free-only overage/privacy checks. `npm run test:live` requires `RUN_LIVE_SMOKE`, `COST_QUOTA_VERIFIED`, `LIVE_BASE_URL`, securely loaded `OWNER_ACCESS_TOKEN`, and optional `SMOKE_MODE`. It makes one task, no retries/fallback, consumes vendor allowance and must be followed by account usage inspection. No live proof is claimed here.
6. Reassess docs/16. For an explicitly approved private scope, run manual Worker deployment only after real config/credentials/backup are valid, then smoke-test its actual URL and auth/data/error/usage/delete paths. Public or paid scope stays NO-GO until public identity/tenant, legal/support, recovery and payment gates pass.

### Recovery plan and rehearsal gap

- Kill switches: leave/reset `FREE_PLAN_CONFIRMED`, `GROQ_FREE_PLAN_CONFIRMED`, `TAVILY_FREE_PLAN_CONFIRMED` false; no automatic fallback. Manual supplied-evidence workflow remains useful without vendors.
- On auth compromise, revoke affected/all sessions with approved database tooling and rotate application/vendor secrets. Changing application token alone does not invalidate existing cookie sessions.
- Restore the prior approved Worker version, preserving additive database tables. Do not drop populated schema as a routine rollback. If data recovery is needed, restore a verified backup into a new isolated database and switch bindings only with explicit owner approval.
- No prior live release/version/backup of this candidate exists; cloud rollback, restore, monitoring/alert delivery and legal incident notification procedures remain NOT TESTED. A written plan is not a rehearsal.
- Failure triggers: unauthorized record access, secret leakage, incorrect edit/persistence/deletion, unbounded cost, failed retrieval provenance, or ambiguous payment state. Stop the affected capability and preserve sanitized request IDs/error/status metadata, not prompt bodies or credentials.

## No-CI invariant
- Do not add .github/workflows files for CI/deployment.
- Do not rely on GitHub checks to authorize release.
- A push does not deploy production by itself.
- Use local commands + manual Wrangler preflight/deploy/smoke test.
- Update documentation if the operating model changes; do not introduce an alternative pipeline silently.


## Owner-directed private-preview release — 2026-10-10

The owner has explicitly authorized an isolated private-preview deployment to dedicated `vestrenhq-private-preview` Worker + D1 resources in the Cloudflare BYOK account. This is **not** authorization for public launch, custom DNS, paid provider activation, or payments.

- Direct-to-`main` workflow; no new PRs/branches for routine changes.
- Current `wrangler.jsonc` still contains the placeholder D1 ID `00000000-0000-0000-0000-000000000001`. Create the dedicated D1 with `npx wrangler d1 create vestrenhq-private-preview`, replace the ID using the real returned value in a direct `main` commit, then rerun QA before remote migrations.
- The current ChatGPT execution environment has no Cloudflare/Wrangler connector or authenticated Cloudflare credentials, and cannot resolve GitHub from its shell. Therefore it cannot truthfully create the remote D1/Worker or deploy in this session. No deployment URL/version is claimed.
- Once authenticated Cloudflare access is available, follow the full command sequence in `docs/27_CURRENT_GAP_ASSESSMENT_AND_DIRECT_MAIN_RELEASE.md`. Do not activate providers or payments during the private preview.
