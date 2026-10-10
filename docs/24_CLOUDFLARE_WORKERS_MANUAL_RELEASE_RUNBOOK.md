# VestrenHQ — Owner-operated Cloudflare BYOK release

Updated 2026-10-10. Native Worker + Assets + D1; no Pages conversion, Genspark Hosted Access Rules/identity dependency, Actions, PRs, force-push, DNS, paid providers or payments. Work directly on current main. Owner controls infrastructure credentials and application credentials separately.

## Actual resource status

BYOK setup and `npx wrangler whoami` succeeded. Initial read-only inventory had 9 unrelated D1 databases and 1 unrelated Worker, no Vestren match. With explicit autonomous provisioning authorization, the dedicated `vestrenhq-private-preview` D1 and Worker were created; no unrelated resource or DNS was changed. D1 ID: `86787a64-0479-4ee6-96ca-5e9387a9b781`. Migrations 0001–0004 completed remotely; rerun reported no migrations to apply and schema/index/ledger queries verified them. Preview URL returned by actual deployment: https://vestrenhq-private-preview.sparkmind-support.workers.dev.

- `wrangler.jsonc`: LOCAL ONLY, development stage, emulator database ID. Never use for remote deploy/migrations.
- `wrangler.preview.jsonc`: remote Worker name/account (verified by whoami), DB binding `DB`, migrations directory `migrations`; **`d1_databases[0].database_id` is the verified real dedicated ID above**. Version metadata binds WORKER_VERSION, and extra version-preview URLs are explicitly disabled. No fabricated ID.
- Secrets: only **OWNER_ACCESS_TOKEN** mandatory for the manual workflow. Local ignored `.dev.vars` is configured for tests; a separate remote secret was securely installed, rotated, revoked/recovered and verified by real login. Active owner credential was delivered as an authenticated private download, not committed or printed. GROQ_API_KEY and TAVILY_API_KEY are optional and disabled, not required for this release. CLOUDFLARE_API_TOKEN is an infrastructure credential in the owner's shell/manager only; never send it to Vestren APIs/D1/browser or credential downloads.
- `REQUIRED_SECRETS_CONFIGURED = true`: read-only remote target/schema/secret-name preflight passed, then actual valid owner login confirmed the secret. Local login alone never proves remote setup.

## Local QA and owner bootstrap

```sh
npm ci
npm run typecheck
npm test -- --reporter=dot
npm run qa
npm run build
npm run db:migrate:local
pm2 start ecosystem.config.cjs
curl -fsS http://localhost:3000/api/health
npm run test:browser
npm run test:workflow
git diff --check
```

Build before PM2; on restart stop the registered process and clean port 3000. Browser tests use explicit mocked providers; workflow test uses real local Worker/D1, including credential generation/TXT download/copy/cancellation. No vendor calls or remote secret installation. Original migration files 0001–0003 remain unchanged; apply additive 0004. Legacy sessions must re-login. Tests instantiate fresh workerd/D1 per case to isolate the installed alpha Miniflare proxy lifetimes.

First login or lost-token recovery requires an owner-operated bootstrap; never fetch old plaintext or put it in chat. In your trusted checkout, generate a separate 256-bit application secret into a private ignored file without printing it:

```sh
node --input-type=module -e 'import {randomBytes} from "node:crypto"; import {writeFileSync} from "node:fs"; writeFileSync(".dev.vars.owner-bootstrap.txt",randomBytes(32).toString("hex"),{flag:"wx",mode:0o600});'
```

Store it in your password manager using a private editor/import. For local use, privately set OWNER_ACCESS_TOKEN in ignored `.dev.vars`, chmod 600, then restart Worker. For remote use, after verifying the target, pipe only the raw application token into the secret command below. Do not use shell literals, VITE variables or the Cloudflare API token. Remove the bootstrap file after secure storage; use separate local/remote credentials.

## Reusable explicit remote release sequence

The initial provisioning/deployment and acceptance below were executed by the authorized agent, not delegated to the owner. Reuse these commands only after inspecting actual target state; do not create duplicate databases. There is still no CI or unattended deployment workflow.

1. Verify current main/clean tree and final commit, run complete local QA at that commit, scan source/history/assets; record every exit code.
2. Securely load the owner's Cloudflare token; `npx wrangler whoami`. Inspect read-only D1/Worker inventory and confirm exact account and target. Never reuse unrelated resources.
3. Owner may create the dedicated D1 later, only if absent:
   `npx wrangler d1 create vestrenhq-private-preview`
   Insert the actual returned ID into **wrangler.preview.jsonc → d1_databases[0].database_id**, review/commit directly to main. Do not edit the emulator ID to pretend release readiness.
4. For an existing target, export a backup to ignored `.qa/` with a verified owner-approved command such as:
   `npx wrangler d1 export vestrenhq-private-preview --remote --config wrangler.preview.jsonc --output .qa/preview-backup.sql`
   Review actual schema/migration history and rehearse recovery in a separately approved isolated DB. Backups can contain sensitive data; never upload/commit them casually.
5. After target/schema review, manually apply additive migrations:
   `npx wrangler d1 migrations apply vestrenhq-private-preview --remote --config wrangler.preview.jsonc`
   Confirm all four migrations, session fields and intact project data. No destructive schema reset.
6. Securely set the owner app secret through your own terminal/dashboard, for example:
   `npx wrangler secret put OWNER_ACCESS_TOKEN --config wrangler.preview.jsonc < .dev.vars.owner-bootstrap.txt`
   Wrangler can create a missing Worker during secret setup; this is a remote mutation requiring verified target/owner authorization. Never use the metadata-rich downloaded TXT as stdin: import only its token line privately, without printing it.
7. `npx wrangler secret list --config wrangler.preview.jsonc` shows names only. Run `npm run release:check -- --online`: read-only account/DB identity, Worker secret-name and required schema check. Exit 2 means BLOCKED; do not deploy. A successful presence gate is not proof of token entropy/value or a successful deployed login.
8. Validate packaging with `npx wrangler deploy --dry-run --config wrangler.preview.jsonc`; with the gate passing, clean final main and approved release scope, manually run `npx wrangler deploy --config wrangler.preview.jsonc`.
9. Record actual deployment/version ID and workers.dev URL. No URL may be guessed or claimed before Cloudflare returns it. Keep all provider flags false, no AI binding, no custom domain/routes.
10. Perform deployed smoke tests below. Only promote remote auth to VERIFIED after actual successful login and revocation checks; if any fails, stop, retain sanitized request IDs and use recovery/rollback.

The read-only preflight script never creates resources, installs secrets, migrates or deploys. No deployment automation was added. The account ID is configuration, not an authentication credential; it was obtained from actual whoami, not guessed.

## App credential lifecycle and recovery

Authenticated Access & Security → Authentication & Credentials → Generate replacement. Server Web Crypto generates 32 random bytes. Only generation response contains plaintext; no GET retrieval. Save/download/copy explicitly; each export action rechecks owner session and Origin. Browser memory is cleared on panel close/logout/reload; filename/URL/audit contain no token. D1 stores SHA-256 fingerprint, creation date (NULL for externally created tokens) and lifecycle status only.

Generation is PENDING and does not change the Worker secret. Install through your own Cloudflare account, then click Verify replacement login. Single-secret architecture has **no grace period**: old sessions fail as soon as the runtime secret changes; successful new login marks the old fingerprint rotated and deletes old sessions. A failed verification cannot install or revoke credentials automatically. Save replacement before installation; confirm secret length/target and recover with a NEW token through Cloudflare if needed. Cancelled/revoked/rotated fingerprints are never valid again, including after rollback. Do not restore a rotated old token as a recovery shortcut.

Revoke all sessions leaves the current application token usable. Revoke ACTIVE credential deletes all sessions and blocks that fingerprint; restoring access requires installing a NEW secret through the owner's Cloudflare account. Keep a separate infrastructure recovery channel/password manager. Never distribute owner credentials to customers.

## Smoke checklist

- Public shell/health/policies return no private data; health says owner-only/publicLaunch false.
- Unauthenticated GET projects/tasks/artifacts/security and POST credential generation/export authorization fail 401; cross-origin mutations fail 403. Missing owner secret fails safely.
- Owner login returns HttpOnly/SameSite=Strict/Secure host cookie on HTTPS; no raw token in dashboard/events/errors.
- Real dashboard has successful/failed/unauthorized counters, actual active sessions/expiry and schema probes; cloud deployment/alerts remain UNAVAILABLE unless separately operator-proven.
- Generate → download/copy → cancel; confirm candidate was not installed. Test actual rotation only after secure replacement/recovery preparation; do not lock out the operator just for a smoke test.
- Create source/project/manual brief, edit/save/export/reopen/delete; no vendor calls.
- Logout/revoke-all deny the former cookie; reload and delayed responses cannot restore private state.
- Inspect redacted application events and Cloudflare logging configuration. Never log cookies, authorization headers, secret responses or content. Provider/payment flags stay disabled.

## Audit and rollback

Counters: requests reaching this Worker only, UTC hourly buckets, 30-day lazy retention; boundary hour included, not lifetime/edge analytics. Detailed events retain 7 days, max 200/hour, latest 50 shown. AUTH_SUCCESS also increments SESSION_CREATED; revocation counts are actions, not number of removed sessions. Expiry events are observed rejected requests, not unique idle expirations. Fixed action categories/request UUIDs, no raw paths/body/tokens/IP. Credential fingerprint/status tombstones persist to enforce revocation; plaintext does not. Failed audit writes return 503; login/revocation/generation metadata+audit are transactional. Other workspace mutations may already have committed: inspect state and use idempotency/revisions, never retry blindly.

For a bad deployed version: inspect `npx wrangler deployments list --config wrangler.preview.jsonc`, identify the known-good version, and use `npx wrangler rollback <verified-version-id> --config wrangler.preview.jsonc` only after checking installed CLI help/target. Preserve additive schema; do not drop populated tables. Rolling back to pre-0004 auth code can lose credential binding/revocation enforcement—prefer a forward fix or a known-good security-capable version. Data recovery requires a verified backup restored into an explicitly approved isolated DB, integrity checks, then deliberate binding switch. Rotate compromised app secrets through the owner account; Cloudflare infra credentials never enter app recovery.

## Executed remote acceptance — 2026-10-10

First tagged app deployment of source `a2e46a23ef5c58e95c1ad438575c89fabfd004e3`: version `8b750ba6-1aaf-4793-8223-4cdd122467b5`. Secret rotation/recovery created new versions and removed their commit tag; final explicit redeploy restores a commit-tagged version. Obtain the final ID/tag from `/api/health` and the release record; do not mistake a secret-change version or earlier checkpoint for the final release.

`RUN_REMOTE_SMOKE=true ALLOW_PREVIEW_CREDENTIAL_TESTS=true` acceptance against the new empty dedicated preview passed 14 checkpoint groups: health/version; anonymous private API/action denial; invalid/valid login and HTTPS cookie flags; exact-Origin rejection; real D1 project/source/manual brief/idempotency/CAS/export/reopen/delete; targeted synthetic session expiry; logout; real Worker-secret rotation with old-session rejection; active credential revocation and recovery using a securely saved NEW token; no known plaintext credentials in ordinary responses/assets/audit/verifiers; actual browser owner dashboard; revoke-all; login throttle 429; server counters. One valid recovery login respected the throttle by waiting 104 seconds, with no counter reset/IP spoof. All synthetic business records were deleted, and smoke sessions revoked.

Remote log sampler observed three trace events, zero application console/exception entries and no known secrets. Request trace headers were deliberately excluded from persisted evidence. Initial sampler cleanup timed out after writing results; its own lingering tail processes were terminated and bounded rerun exited 0. This small sample is not a guarantee about all Cloudflare/provider logging or future behavior.

Credential delivery uses an owner-authenticated file wrapper; unauthenticated access was actually tested and returned 403. No delivery URL/value is stored in this repository. This is a protected download, not an automatically self-deleting/single-use link; owner should securely import then delete the private delivery file. Local temporary plaintext inputs are removed after final verification/delivery. App plaintext remains non-retrievable after generation.

Remote rollback/restore rehearsal, sustained load/all-browser testing, monitored alerts and paid/vendor integrations remain NOT_TESTED. No public registration, commercial launch, payments/Duitku, Daytona, paid inference, custom-domain or DNS activation occurred.
