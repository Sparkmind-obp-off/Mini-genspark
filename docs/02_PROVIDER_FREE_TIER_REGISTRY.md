# 02 — Provider and Free-Tier Registry

**Checked:** 2026-10-09  
**Policy:** use $0 APIs/open-source first; never allow an automatic fallback to a paid endpoint. Recheck each provider's current limits before shipping.

## 1. Important distinction

A model appearing inside Genspark does **not** mean we can call it through a public API or reuse Genspark's internal provider account. Mini Genspark may use external public APIs only with our own authorized credentials and documented terms. The model router must record provider, model ID, quota status, privacy classification and estimated cost.

## 2. Genspark's disclosed model families vs our access

Genspark's official GenCode catalog spans nine model families: Claude/Anthropic, GPT/OpenAI, Gemini/Google, DeepSeek, GLM/Z.ai, MiniMax, Kimi/Moonshot AI, Grok/xAI and Nemotron/NVIDIA. The current account's exact variants should be discovered using the live picker or `gencode models`.

Official: https://www.genspark.ai/helpcenter/gencode

Genspark says some open-weight models it offers (including DeepSeek, Kimi, GLM, MiniMax and Qwen) run on US inference platforms including Fireworks AI and Baseten, with zero-data-retention agreements for that provider relationship.

Official: https://www.genspark.ai/helpcenter/troubleshooting-guide

**Boundary:** this disclosure identifies parts of Genspark's infrastructure. It is not permission to use Genspark-owned Fireworks/Baseten credentials, does not make their public API permanently free, and does not prove an external API for Genspark's private routing/orchestration.

## 3. Runtime and infrastructure candidates

| Provider/tool | Role | Advertised no-cost allowance at check | Recommended use | Decision / cautions |
|---|---|---|---|---|
| Cloudflare Workers | Hosting and API control plane | Free Workers plan: 100,000 requests/day; 10 ms CPU/request on Free plan | Default hosting for API and static workspace | **Selected baseline.** CPU-heavy tasks should be delegated or kept out of request handlers. Monitor limits. |
| Cloudflare Workers AI | Model inference | 10,000 Neurons/day on Workers Free; excess requires Workers Paid. Some listed frontier models specifically require a paid billing method or prepaid AI Gateway credits. | First candidate for runtime LLM because binding + hosting can be kept in one stack | **Preferred first smoke test**, but select only a currently free-eligible model and prove the daily quota for the chosen task. |
| Cloudflare D1 | Durable app metadata | Workers Free: 5 million rows read/day, 100,000 rows written/day, 5 GB total | Projects, tasks, step status, source metadata, user settings | **Selected baseline.** Keep uploaded large artifacts outside D1. |
| Cloudflare R2 | Artifacts | Standard storage: 10 GB-month, 1 million Class A ops/month, 10 million Class B ops/month; internet egress free in listed quota | Optional artifact storage | **Selected optional.** Enforce file size, retention and quota; no assumption of infinite storage. |
| Brave Search API | Live web search | Advertises $5 free credits/month; list price $5/1,000 requests, so about 1,000 requests at stated standard price if the full credit is applicable to the selected endpoint | Research/search adapter | **Preferred search candidate.** Confirm current account credit and endpoint pricing; hard stop on quota exhausted. |
| Apify | Managed actors for crawling/extraction | Free plan advertises $5/month in prepaid usage; no credit card required. Usage at $0.20/compute unit in listed Free plan; excess use blocks access until next monthly cycle | Optional targeted extraction via selected Actors after legal/robots/terms review | **Optional, not the default crawler.** Each Actor has its own price/terms; test runs and proxies may consume credits rapidly. Never scrape logged-in/private data or bypass access controls. |
| OpenRouter free models | LLM aggregation/fallback | Pricing page currently lists 25+ free models, 4 free providers and 50 requests/day on Free | Optional fallback/testing | **Optional and dynamic.** Availability, quality and rate limits change. No guaranteed SLA; no sensitive prompts without reviewing privacy terms. |
| GroqCloud | Fast inference | Free Plan with model-dependent rate limits; exact active limits appear in account settings/docs and can change | Optional low-latency provider | **Optional candidate.** Before selection, test the target model's free limits and current terms. Do not infer one global quota from a model table. |
| Gemini Developer API | LLM, possible multimodal | Official pricing currently shows free-tier options for some models; quota is per model/project and visible in AI Studio. Free-tier prompt use may be used to improve Google products. | Optional alternative for public or non-sensitive content | **Optional, privacy-gated.** Do not send confidential work by default on free tier; exact model/rate limits need live verification. |
| Daytona | Isolated coding/runtime sandbox | Pricing advertises $200 free compute included and a trial without a credit card. This is finite compute credit, not an unlimited perpetual free compute runtime. Tier 1 requires email verification; higher tiers require card/top-ups. | Optional sandbox for controlled low-risk code tasks and private pilot | **Use only behind explicit opt-in, cost ceiling and timeout.** Start/stop/delete, verify cleanup independently, and disable when free balance is absent. No arbitrary public shell endpoint. |
| Genspark GenCode / Code | Build-time coding agent and model catalog | GenCode bills directly to Genspark credits and is not covered by the Standard agent Free Quota. Genspark Free plan has 100 credits/day up to a lifetime free allowance (per current guide). | Use the user's authorized account to build Mini Genspark, when credits justify it | **Selected build-time workbench, not assumed runtime API.** The model catalog is account-specific; use `gencode models`. Do not spend credits automatically. |
| Fireworks AI | Inference | Public serverless pricing is usage-based; no perpetual free baseline is assumed here | Future direct provider only if public, allowed and cost-capped | **Not selected as free default.** Any trial/credits must be verified on our own account; Genspark's provider agreement cannot be reused. |
| Baseten | Inference | Public pricing/usage depends on the product; no perpetual free baseline is assumed here | Future direct provider only if public, allowed and cost-capped | **Not selected as free default.** Genspark's infrastructure arrangement is not our free API entitlement. |
| Browser-native APIs / OSS libraries | Local dictation, basic UI charts, office/PPTX/CSV generation | No per-call hosted AI API for local processing; still incurs device/browser limits and engineering time | Local capability and artifact export | **Preferred where appropriate.** Browser support varies; file libraries do not provide AI reasoning by themselves. |
| Local model runtime (e.g. Ollama) | Optional self-hosted inference | No provider token fee once running on owner hardware; hardware, power, storage and setup are not economically zero | Developer/local fallback | **Developer-only optional.** Do not claim always-on public inference without suitable hardware and operations. |

### Official pricing/limit references

- Workers limits: https://developers.cloudflare.com/workers/platform/limits/
- Workers AI pricing and list of model exceptions: https://developers.cloudflare.com/workers-ai/platform/pricing/
- D1 pricing: https://developers.cloudflare.com/d1/platform/pricing/
- R2 pricing: https://developers.cloudflare.com/r2/pricing/
- Brave Search API: https://brave.com/search/api/
- Apify: https://apify.com/pricing
- OpenRouter pricing: https://openrouter.ai/pricing/
- OpenRouter free model catalog: https://openrouter.ai/collections/free-models
- Groq limits: https://console.groq.com/docs/rate-limits
- Gemini API pricing: https://ai.google.dev/gemini-api/docs/pricing
- Gemini API rate limits: https://ai.google.dev/gemini-api/docs/rate-limits
- Daytona pricing: https://www.daytona.io/pricing
- Daytona tier/resource limits: https://www.daytona.io/docs/limits
- GenCode: https://www.genspark.ai/helpcenter/gencode
- Genspark credits: https://www.genspark.ai/helpcenter/credits-guide
- Fireworks public pricing: https://fireworks.ai/pricing
- Genspark's stated inference platform use: https://www.genspark.ai/helpcenter/troubleshooting-guide

## 4. Recommended no-paid-dependency first stack

### Initial baseline
1. Cloudflare Pages/Workers for deployment and APIs.
2. D1 for metadata and execution state.
3. Workers AI as first model candidate after selecting an eligible model and proving it on the free quota.
4. Brave Search API as first live search candidate while monthly free credits remain.
5. Open-source code for document, CSV, HTML slide and export features.
6. R2 only when persistent binary storage is needed and quota permits.
7. Daytona and Apify remain optional tools that require a visible quota balance or a strict stop gate.

### Fallback behavior
- If the primary model quota is exhausted: return a useful, clear quota message; optionally offer another provider only if the user explicitly configured and allowed it.
- If Search quota is exhausted: continue with provided sources/known files or ask the user to configure another permitted provider. Never pretend a non-live answer has fresh citations.
- If a sandbox's free credit cannot be confirmed: do not create a sandbox. Provide static code analysis/diff instead.
- If artifact storage quota is exceeded: block the upload/export with an explanation; never silently switch to billable storage.
- If any provider cannot give usage cost/quota details: treat it as a potential billable dependency and disable it by default.

## 5. Provider selection, privacy and account rules

Every provider adapter must declare:
- Supported modalities/tasks and known model ID(s).
- Whether use is free-tier, paid, trial-only, local, or unknown.
- Quota source and when it was last checked.
- Whether account key/credit card is required.
- Prompt/data retention/training caveats known from current official terms.
- Input/output limits, timeout and retry budget.
- Known cost reporting support.
- Status: `DOCUMENTED`, `CONFIGURED`, `LIVE_VERIFIED`, `QUOTA_EXHAUSTED`, or `DISABLED`.

No adapter may silently enable billable overage, prepaid top-up, GPU, proxy usage or an external side effect. A trial credit counts as **finite free credit**, not as an indefinitely free plan.

## 6. Cost guardrails required in code

- Default per-task target spend: $0.00 (hard stop).
- No automatic spend-through; no auto-reload; no card top-up.
- Max plan steps and retries are configurable and small by default (start with 5 steps and 1 retry).
- Require approval before multi-model fan-out, image/video/audio generation, telephony, cloud execution or paid search/scraping Actors.
- Use cost/quota preflight if available; if not available, mark it unknown and do not invoke without explicit opt-in.
- Record provider/model, task ID, start/end time, status, known token/credit usage and error class; never store secrets.
- Unit tests must simulate exhausted quota, HTTP 429, timeout, provider outage and absent credentials.

## 7. Go/no-go rule

A provider is eligible for the free-only MVP only after:
1. It has a documented public integration surface.
2. Its free quota is checked against a live account.
3. A bounded, harmless request succeeds.
4. Usage and any cost impact are checked after the test.
5. Data/privacy terms are acceptable for that class of prompt.
6. The app correctly blocks calls at quota/credential boundaries.

This registry is a research snapshot, not a guarantee that providers will maintain these quotas in future.
