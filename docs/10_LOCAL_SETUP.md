# 10 — Local Setup and Free-Tier Guard

This is an owner-only prototype. There is no public signup, no multi-user authentication, no live web search, no file upload, and no sandbox execution in V0.1. Do not deploy the API to a public audience.

## Requirements

- Node.js 20 or newer.
- npm.
- A Cloudflare account that is confirmed to remain on the **Workers Free plan** for this prototype.
- Wrangler login only if you choose to test the Cloudflare Workers AI binding. AI inference is remote and can consume your account's daily free allowance.

## 1. Install and build

From the repository root:

    npm install
    npm run typecheck
    npm run build

Run the visual UI only (no Worker API):

    npm run dev

At this stage the browser explicitly uses local demo responses. These are not AI responses and do not retrieve sources.

## 2. Configure local Worker testing

First authenticate Wrangler if you want to test real Cloudflare Workers AI:

    npx wrangler login

Run the local D1 migration:

    npm run db:migrate:local

Create a local file named .dev.vars in the repository root. It is ignored by Git:

    OWNER_ACCESS_TOKEN="generate-a-long-random-owner-token"
    FREE_PLAN_CONFIRMED="true"

Use a random owner-specific token of at least 32 characters. Do not reuse a Cloudflare API token. Do not commit this file or paste secrets into chat/issues.

**Free-tier gate:** set FREE_PLAN_CONFIRMED=true only after verifying the account remains on Workers Free and you understand that the application submits requests to remote Workers AI. If the account is on Workers Paid, can bill inference overages, or its billing status is uncertain, leave this unset/false and keep model execution disabled. The app-level limit is 20 requests/day with restricted input/output size, but it does not replace account-level billing verification.

Build and start the Worker with assets:

    npm run build
    npm run dev:worker

Open the localhost URL printed by Wrangler (normally http://localhost:8787). Do not use Vite's port 5173 when testing the Worker endpoint; Vite serves the frontend only.

## 3. How to configure the owner token in the UI

1. Open the workspace.
2. Open Settings & provider.
3. Paste the value matching OWNER_ACCESS_TOKEN from .dev.vars.
4. Select Save for this tab.
5. Send one short harmless prompt.
6. Check that the response names the configured model and reports the daily app-request count.

The token is stored in the current browser tab's session storage. It is not a provider API key. The Worker does not log prompt text or return provider exception details.

## 4. Database and cap behavior

Migration 0001 creates:
- daily_usage — one counter per UTC day; reserves a slot before model inference.
- task_events — basic status/provider/model/duration metadata without prompt content.

The prototype hard-caps calls at 20 per UTC day by default (with short input and output limits). A failed inference still consumes one app slot. This conservative local cap is not a reliable measurement of Cloudflare Neurons: use the Cloudflare dashboard for the account-level limit. The Workers Free allocation currently lists 10,000 Neurons/day and resets at 00:00 UTC, but other workers/projects on the same account may also consume that account allowance. If you cannot ensure account-level no-paid usage, do not enable AI.

If the model quota/capacity is exhausted, the API returns an error. It does not automatically fall back to OpenRouter, Gemini, Groq, a paid model, Apify or Daytona.

## 5. Deploying later (not part of V0.1)

Production deployment requires, at minimum:
- Create a real Cloudflare D1 database, replace the placeholder database ID in wrangler.jsonc, and apply migrations remotely.
- Set OWNER_ACCESS_TOKEN with npx wrangler secret put OWNER_ACCESS_TOKEN.
- Only confirm a free-tier account in configuration after verifying account plan/billing; keep false otherwise.
- Run build, typecheck, security checks and an actual authenticated smoke test.
- Add real user authentication, abuse controls and data isolation before inviting any external user.
- Verify that no paid fallback or auto-top-up exists.
- Obtain explicit owner approval before deployment.

Do not deploy a public unauthenticated inference endpoint. Owner token is a single-operator preview measure, not production multi-tenant authentication.
