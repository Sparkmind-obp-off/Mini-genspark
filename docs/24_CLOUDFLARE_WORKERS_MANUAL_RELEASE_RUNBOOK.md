# VestrenHQ — Owner-operated Cloudflare BYOK release

Updated 2026-10-10. Native Worker + Assets + D1; no Pages conversion, Genspark Hosted Access Rules/identity dependency, Actions, PRs, force-push, DNS, paid providers or payments. Work directly on current main. Owner controls infrastructure credentials and application credentials separately.

## Actual resource status

BYOK setup and `npx wrangler whoami` succeeded in this environment. Read-only inventory: 9 unrelated D1 databases, 1 unrelated Worker, no Vestren match. The intended isolated target name remains `vestrenhq-private-preview`; it is a naming convention, not a platform private-preview dependency. No remote resource, secret, schema or DNS was changed.

- `wrangler.jsonc`: LOCAL ONLY, development stage, emulator database ID. Never use for remote deploy/migrations.
- `wrangler.preview.jsonc`: remote Worker name/account (verified by whoami), DB binding `DB`, migrations directory `migrations`; **`d1_databases[0].database_id` is empty — PENDING_OWNER_ACTION**. No fabricated ID.
- Secrets: only **OWNER_ACCESS_TOKEN** mandatory for the manual workflow. Local ignored `.dev.vars` is configured for tests; remote secret not configured/verified. GROQ_API_KEY and TAVILY_API_KEY are optional and disabled, not required for this release. CLOUDFLARE_API_TOKEN is an infrastructure credential in the owner's shell/manager only; never send it to Vestren APIs/D1/browser or credential downloads.
- `REQUIRED_SECRETS_CONFIGURED = false` until the remote presence/schema/target gate passes; local login does not prove remote setup.

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

## Manual remote sequence — NOT EXECUTED

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

Remote deployment/login/log inspection/rollback/restore are NOT_TESTED here. There is no live Vestren URL or prior release version to roll back. Public registration, commercial launch, payments/Duitku, Daytona, paid inference and DNS changes remain disabled.
