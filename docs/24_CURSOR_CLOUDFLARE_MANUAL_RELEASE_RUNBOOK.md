# VestrenHQ — Cursor + Cloudflare Workers Manual Release Runbook

**Binding operating rule:** Cursor for implementation/local review, GitHub for versioned source and push, Cloudflare Workers/Wrangler for runtime and deployment. Do not use GitHub Actions or GitHub CI.

## Tool responsibilities
- Cursor: edit code, inspect repository, run terminal commands, review diffs, and work against explicit acceptance criteria. Agent suggestions are not proof that code works.
- GitHub: canonical source history, feature branches, commits, pushes, and pull requests when useful.
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

The repository baseline has placeholder D1 ID and legacy mini-genspark naming. Do not silently rename or attach to an existing production database; identify the correct resource first.

## Manual release sequence
1. Commit reviewed changes on the intended branch.
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

## No-CI invariant
- Do not add .github/workflows files for CI/deployment.
- Do not rely on GitHub checks to authorize release.
- A push does not deploy production by itself.
- Use Cursor + local commands + manual Wrangler preflight/deploy/smoke test.
- Update documentation if the operating model changes; do not introduce an alternative pipeline silently.
