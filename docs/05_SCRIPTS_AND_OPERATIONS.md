# 05 — Scripts, Setup and Operations

**Rule:** every script's purpose, inputs, side effects, expected outputs, and cost implications must be documented. Scripts must fail closed if a required tool/provider is missing.

## 1. Repository script policy

- Keep scripts in the repository under scripts/.
- Never put secrets in scripts, sample output, README, logs or commits.
- Never echo full environment values. Print only whether required variables are set.
- Use a harmless default prompt for provider smoke tests.
- Separate local/test mode from live-provider mode.
- Every live smoke test must have a task-size limit, timeout, maximum output, and a note that the provider may account usage.
- Never auto-run a paid or unknown-cost task.
- Scripts must return nonzero exit codes on real failures.
- Do not claim a script is tested until it has actually run in the target environment.

## 2. Current script: GenCode model inventory

File: scripts/gencode-provider-inventory.sh

Purpose:
- Check whether the official GenCode CLI is installed.
- Print CLI version.
- List the model names available to the authenticated Genspark account.
- Does not submit a generation task.
- Does not reveal secrets or claim that GenCode is a generic application API.

Install and authenticate on the developer machine:

    npm install -g @genspark/gencode
    gencode login

Run:

    bash scripts/gencode-provider-inventory.sh

Expected behavior:
- With no CLI installed, prints install instructions and exits 127.
- With the CLI installed, runs version and model inventory commands.
- If not logged in, the official CLI error is passed through; this is not counted as a successful inventory.
- Output may include account-visible model identifiers. Review it before publishing publicly.

Official reference: https://www.genspark.ai/helpcenter/gencode

## 3. Scripts planned for implementation

| Script | Mode | Purpose | Cost/side effects |
|---|---|---|---|
| scripts/dev.sh | Local | Start frontend/API locally | No external model calls unless explicitly configured |
| scripts/test-provider-config.mjs | Local/check | Validate provider ID and presence of required env vars | Must not print secret values; no model calls |
| scripts/smoke-model-provider.mjs | Live/explicit | One short benign request to a configured runtime provider | May use free quota; must hard-stop if cost/quota is unknown |
| scripts/smoke-search-provider.mjs | Live/explicit | One search request and result URL validation | Consumes search quota/credits |
| scripts/test-research-pipeline.mjs | Test | Fixture-based test for source URL, source dates, citations and contradictions | No network by default |
| scripts/qa-workspace.mjs | Test | Routing, permissions, quota stop, artifacts, failures and regressions | Uses mocks by default |
| scripts/cost-report.mjs | Local/report | Summarize recorded provider/task usage | No external calls |
| scripts/daytona-proof.mjs | Live/explicit/disabled default | Create an isolated, bounded code sandbox and prove execution/cleanup | Only run with explicit approval and a verified free-credit balance |
| scripts/apify-smoke.mjs | Live/explicit/disabled default | Execute one approved Actor and record usage | Consumes monthly Apify free credits; Actor/proxy costs vary |
| scripts/export-check.mjs | Test | Generate a sample XLSX/PPTX/DOCX and reopen/inspect output | Local CPU only, if libraries are local |

These planned scripts do not yet exist and are not represented as completed functionality.

## 4. Required local commands once package.json exists

The app implementation should supply the following package scripts (adapt exact names if the chosen test framework differs, then document them accurately):

    npm install
    npm run dev
    npm run typecheck
    npm test
    npm run build

Cloudflare development and deployment require the relevant Wrangler setup and project bindings. Do not create a production deployment as part of ordinary local development. Before deployment, confirm that free-tier limits, auth, secrets, and domain configuration are correct.

## 5. Provider configuration conventions

Use names like:
- CLOUDFLARE_ACCOUNT_ID
- CLOUDFLARE_API_TOKEN (deployment only; never in browser)
- BRAVE_SEARCH_API_KEY
- GEMINI_API_KEY (optional)
- GROQ_API_KEY (optional)
- OPENROUTER_API_KEY (optional)
- APIFY_TOKEN (optional)
- DAYTONA_API_KEY (optional)

Use Cloudflare secret bindings for production credentials, and an ignored local environment file for development. A variable being listed here does not mean its adapter is implemented or enabled. Workers AI and D1/R2 should use Cloudflare bindings where possible instead of exposing account API tokens to the app.

Never paste any of these secret values into a chat, code prompt, README or public issue. Do not commit an .env file. Commit only an .env.example with empty placeholders once the code skeleton exists.

## 6. Operational statuses

Every provider/tool should report one of the following:
- DISABLED — off by design.
- NEEDS_CONFIGURATION — supported adapter exists but required setting/credential is missing.
- DOCUMENTED — vendor interface exists but no successful live smoke test.
- LIVE_VERIFIED — a bounded end-to-end request succeeded and result/usage was recorded.
- QUOTA_EXHAUSTED — free quota is empty or limit reached.
- ERROR — provider failed; includes a redacted error category.
- PAID_REQUIRES_APPROVAL — would incur or might incur payment; no calls without an explicit approval.

Health checks alone do not prove that task execution succeeded.

## 7. No hidden overage policy

Free quota is a hard ceiling, not a soft recommendation. Never use an undocumented endpoint, session cookie, browser automation against private account surfaces, or paid fallback after a free quota is exhausted. If a free provider becomes unavailable, give the user the option to wait, use a configured free alternative, or proceed without that capability.
