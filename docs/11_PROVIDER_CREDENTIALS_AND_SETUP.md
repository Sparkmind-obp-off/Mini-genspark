# 11 — Provider Credentials and Setup Checklist

This document is a setup inventory for Mini-genspark. **Never commit real secrets or paste them into prompts, issues, chat, screenshots, or source files.** Configure secrets directly in the target provider/runtime.

## Recommended order (free-first)

| Priority | Provider | Purpose | Secret / configuration | Enablement rule |
|---|---|---|---|---|
| P0 | Cloudflare Workers + D1 | API runtime and metadata/task storage | Cloudflare account access; Worker bindings; D1 database ID; runtime secrets configured with `wrangler secret put` or Cloudflare dashboard | Core runtime. Verify account plan and actual quota before enabling AI. |
| P1 | Groq | Primary external text inference | `GROQ_API_KEY` | Enable only after verifying account/model quota and terms. Server-side only. |
| P1 | Tavily | Search API for research | `TAVILY_API_KEY` | Optional adapter; stop at quota exhaustion. |
| P1 | Firecrawl | Crawl/scrape/extract public webpages | `FIRECRAWL_API_KEY` | Optional adapter; obey robots, provider terms, URL allow/deny rules and rate limits. |
| P2 | Apify | Selected actors for structured public data collection | `APIFY_TOKEN`; configured actor IDs as non-secret variables | Optional; allowlist actors, estimate usage, require owner approval before any billable actor or run. |
| P2 | OpenRouter | Optional model aggregation | `OPENROUTER_API_KEY` | Optional only; use explicitly approved models and known free-tier limits. No silent paid model fallback. |
| P3 | Daytona | Isolated remote code execution sandbox | Provider token and workspace/org configuration according to current official docs | Disabled by default; enable only after checking current balance, quotas, cleanup, timeout and isolation. |
| P3 | Cloudflare R2 | Artifact/object storage if needed | R2 binding or scoped credentials, only if binding cannot cover use case | Defer until the core artifact persistence design needs it. |

## Safe configuration destinations

- **Cloudflare Worker runtime:** use Cloudflare dashboard secrets or `wrangler secret put SECRET_NAME`. GitHub Actions secrets do not automatically become Worker runtime secrets.
- **Local development:** use `.dev.vars` only if it is already covered by `.gitignore`; never commit it. Keep `.dev.vars.example` values empty or obvious placeholders.
- **GitHub Actions:** repository/environment Actions secrets only for CI tasks that truly need them. Do not expose secrets to untrusted pull-request workflows.
- **GenCode/Genspark prompt:** include variable names and setup instructions only, never secret values.
- Do not put provider keys in `VITE_*` variables, client-side code, logs, database rows, issue comments, or build artifacts.

## Owner setup checklist

- [ ] Confirm the Cloudflare account and repository access are the intended accounts.
- [ ] Confirm Workers/D1 plan, current quotas, and whether the selected Workers AI model is eligible.
- [ ] Create a Groq API key if using Groq; verify the exact model and rate limits shown in the account.
- [ ] Create a Tavily API key if using Tavily search.
- [ ] Create a Firecrawl API key if scraping/extraction is required.
- [ ] Create an Apify token only if a specific allowlisted Actor provides a necessary capability; record the Actor ID and expected usage.
- [ ] Create an OpenRouter key only if the model aggregation adapter is actually needed.
- [ ] Set each selected secret directly in the correct runtime.
- [ ] Run a secret-presence check that reports only configured/not configured; it must never print secret values or prefixes.
- [ ] Run mocked tests first, then one bounded live smoke test per configured provider.
- [ ] Record test result, model/endpoint, date, status and usage without recording secrets or sensitive prompts.

## Runtime variable names (placeholders only)

```dotenv
# Optional external providers; values are supplied securely at runtime.
GROQ_API_KEY=
TAVILY_API_KEY=
FIRECRAWL_API_KEY=
APIFY_TOKEN=
OPENROUTER_API_KEY=

# Non-secret configuration examples; validate against actual adapter implementation.
LLM_PROVIDER=cloudflare
SEARCH_PROVIDER=tavily
SCRAPE_PROVIDER=firecrawl
FREE_PLAN_CONFIRMED=false
ALLOW_PAID_USAGE=false
```

Do not add `DAYTONA_API_KEY` until a real Daytona adapter and an explicit sandbox approval gate exist. Do not enable any provider just because a secret is present.

## Required behavior when providers are absent or exhausted

- A missing key means the adapter is unavailable, not a fatal application crash.
- Return a clear provider status and a useful configuration hint; never reveal secret values.
- Quota/rate-limit errors must be normalized and surfaced to the user.
- No silent provider switching, no paid fallback, no auto top-up and no hidden retry loop.
- Research results must cite URLs actually retrieved. If search is unavailable, say live research is unavailable.
- Live provider tests are `NOT RUN` until run against the actual configured account. Mocks do not count as live verification.

## Official documentation starting points

- Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/
- Cloudflare Workers secrets: https://developers.cloudflare.com/workers/configuration/secrets/
- Groq: https://console.groq.com/docs
- Tavily: https://docs.tavily.com/
- Firecrawl: https://docs.firecrawl.dev/
- Apify: https://docs.apify.com/
- OpenRouter: https://openrouter.ai/docs
- Daytona: https://www.daytona.io/docs/

Provider prices, free allocations, eligibility, and terms change. Verify them from official sources and the actual account before enabling a provider.
