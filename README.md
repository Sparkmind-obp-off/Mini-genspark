# Mini Genspark

**An original, free-tier-first AI workspace inspired by the all-in-one AI workspace category.**

Mini Genspark aims to bring research, chat, document creation, spreadsheet analysis, presentations, coding assistance, tools, and reusable workflows into one workspace. It will use free/open-source software and genuinely free quotas first, with explicit feature gates when a capability requires paid compute or an unavailable provider API.

> **Important status:** This repository is being initialized with research and implementation specifications. These documents are not evidence that the application, provider connections, or Genspark feature parity have already been implemented.

## Principles

1. **Free-tier first:** no paid subscription, automatic top-up, paid API call, or production billing without explicit approval.
2. **Provider-neutral:** every model/tool is behind an adapter; never rely on undocumented private endpoints or browser-session extraction.
3. **Evidence before claims:** a provider is labelled *documented*, *configured*, or *live-verified* separately. A listing in Genspark is not proof of a public API.
4. **Original product:** benchmark general interaction patterns, not Genspark code, trademarks, logos, proprietary assets, or distinctive pixel-exact layouts.
5. **Scripts are visible:** commands, environment variables, costs, side effects, and test outcomes must be documented.
6. **Safe by default:** budget/rate limits, user approval for external side effects, secret redaction, source citations, and fail-closed tool permissions.
7. **No fake parity:** image/video/audio/music, phone calling, meeting bots, browser automation, code execution, and third-party connectors remain unavailable until safely implemented and tested.

## Repository status

- Repository: https://github.com/Sparkmind-obp-off/Mini-genspark
- Initial scope: research + implementation specification.
- Current app implementation: not yet established by this documentation commit.
- Production deployment: not authorized by this initial plan.
- Runtime provider credentials: none included.
- No paid service will be activated by the documented plan.

## Start here

1. [Research summary and product benchmark](docs/01_RESEARCH_AND_FEATURE_PARITY.md)
2. [Provider and free-tier registry](docs/02_PROVIDER_FREE_TIER_REGISTRY.md)
3. [Architecture](docs/03_ARCHITECTURE.md)
4. [Roadmap and acceptance criteria](docs/04_ROADMAP.md)
5. [Scripts, provider setup and safety](docs/05_SCRIPTS_AND_OPERATIONS.md)
6. [Implementation master prompt for GenCode](docs/06_GENCODE_IMPLEMENTATION_PROMPT.md)
7. [Research-quality test case: Indonesia's 6 October 2026 MK decision](docs/07_RESEARCH_ACCEPTANCE_CASE_MK.md)

## Target user experience

A single prompt workspace routes work to bounded workflows:
- **Research:** live search, page retrieval, source ledger, claim/evidence mapping, neutral synthesis.
- **Chat:** model selection, Auto/Best Fit, saved conversations, optional tools.
- **Create:** editable Markdown/HTML docs, slide decks, tables and downloadable artifacts.
- **Analyze:** CSV/XLSX import, validation, formulas/calculations, tables/charts and exports.
- **Build:** repository-aware code assistance and safe diffs; arbitrary untrusted code execution is a separately gated capability.
- **Workflows:** visible plan, step status, bounded retries, artifacts, audit and reusable user-authored instructions.
- **Project memory:** user-visible, editable and deletable; no hidden or irreversible memory.

## Initial technical direction

- Frontend: React + TypeScript + Vite, responsive original UI.
- API/control plane: Cloudflare Workers.
- Durable metadata: Cloudflare D1.
- Artifacts: Cloudflare R2 within free quotas, with local/download fallback.
- Runtime inference: provider adapters; first live provider selected only after a zero-cost end-to-end smoke test and privacy review.
- Research: Brave Search API's currently advertised monthly credits, plus direct public-page retrieval where permitted; provider quota is monitored and must fail clearly at zero.
- Optional code sandbox: Daytona's advertised free compute credit is finite promotional/trial usage, not a permanent free runtime. Keep off by default and limit to explicitly approved tasks.
- Testing: unit tests, provider mocks, API tests and real smoke tests separately labelled.

This is a proposed baseline. Actual free quotas, model availability, terms and billing status must be rechecked before enabling each integration.

## What “free-tier first” means

A free tier is a quota, not unlimited service. The application must stop or downgrade safely before exceeding quotas. Provider-specific privacy terms matter too: a provider's free tier may use prompts for service improvement, so confidential user content must not be sent there by default.

The product can aim for broad *workflow coverage* similar to an all-in-one AI workspace, but it cannot honestly promise Genspark-equivalent video/audio/image generation, meeting bots, real-time voice, or autonomous browser control entirely free until a sustainable, compliant implementation is verified for each capability.

## Official research sources

- Genspark Help Center: https://www.genspark.ai/helpcenter
- Genspark AI Chat: https://www.genspark.ai/helpcenter/ai-chat
- Genspark Super Agent: https://www.genspark.ai/helpcenter
- GenCode: https://www.genspark.ai/helpcenter/gencode
- Connectors & Integrations: https://www.genspark.ai/helpcenter/connectors-and-integrations
- Genspark Credits Guide: https://www.genspark.ai/helpcenter/credits-guide
- Cloudflare Workers limits: https://developers.cloudflare.com/workers/platform/limits/
- Cloudflare Workers AI pricing: https://developers.cloudflare.com/workers-ai/platform/pricing/
- Cloudflare D1 pricing: https://developers.cloudflare.com/d1/platform/pricing/
- Cloudflare R2 pricing: https://developers.cloudflare.com/r2/pricing/
- Gemini API pricing: https://ai.google.dev/gemini-api/docs/pricing
- Groq rate limits: https://console.groq.com/docs/rate-limits
- OpenRouter free models: https://openrouter.ai/collections/free-models
- Brave Search API: https://brave.com/search/api/
- Apify pricing: https://apify.com/pricing
- Daytona pricing: https://www.daytona.io/pricing
- Daytona limits: https://www.daytona.io/docs/limits/

See the research documents for current details, caveats, and what still requires a live account check.


## First provider inventory (developer machine)

Install and sign in to the official Genspark GenCode CLI if you want to see which models are actually available to your account:

    npm install -g @genspark/gencode
    gencode login
    bash scripts/gencode-provider-inventory.sh

This is a read-only model inventory. It does not submit a generation task and does not prove that the same model catalog is available as an application-facing REST API. GenCode uses Genspark credits, so check your balance before running actual tasks.

## Current repository files

- Documentation set: docs/01 through docs/07.
- Implemented script: scripts/gencode-provider-inventory.sh.
- App code, package.json, runtime provider adapters, production authentication and deployment are not yet claimed as implemented.
