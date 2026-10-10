# VestrenHQ — Commercial Gap Register

**As of:** 2026-10-10  
**Purpose:** turn strategy into an ordered build queue. Statuses below are based on repository inspection, not a production audit.

## P0 — stop-ship for public paid launch

| Priority | Work item | Current evidence | Required proof |
|---|---|---|---|
| P0 | Real public authentication/session | Current Worker has an owner-token gate; public SaaS auth not confirmed | New-user sign-in/out, expiry/revocation tests |
| P0 | Tenant/project authorization | Not confirmed | Negative tests prove cross-tenant reads/writes fail |
| P0 | Durable project/conversation storage | Not confirmed | Data survives a new session and deployment |
| P0 | Real research retrieval | Worker explicitly says live web search is not enabled | Real provider adapter, source records, valid links, timeout/rate-limit tests |
| P0 | Evidence-backed deliverable and export | UI modes exist; complete end-to-end export not confirmed | User completes and exports a usable source-backed brief |
| P0 | Daytona execution adapter | Selected for V1; adapter not confirmed in canonical repo | Server-side adapter, bounded sandbox, timeout/cleanup and failure tests |
| P0 | Artifacts in controlled storage | R2 lifecycle/access not confirmed | Private storage, authorized download, deletion and expiry behavior |
| P0 | Usage/cost enforcement | D1 usage/audit schema exists; complete product quota behavior needs verification | Hard stop before costly call; no silent paid fallback |
| P0 | Payment and entitlements | No live billing readiness evidence in this repository inspection | Idempotent payment lifecycle and controlled live transaction |
| P0 | Privacy/support/legal surfaces | Documents define requirements; implementation not verified | Accurate policies, contact route, deletion/refund process |
| P0 | Deployment configuration | Wrangler contains legacy name and placeholder D1 ID | Confirm account, Worker, database, secrets, domain before deployment |
| P0 | Local quality checks | Not run in this environment | Record typecheck, test, build, smoke results at exact commit |

## P1 — needed for a credible customer experience

- Onboarding that explains one core workflow and offers a sample output.
- Clear capability status and known limitations in the UI.
- Project history, rename, export, delete, and recoverable error states.
- User-facing usage meter and upgrade/limit behavior.
- Feedback/report-issue action tied to a run ID without exposing secrets.
- Responsive and keyboard-accessible primary workflow.
- Basic product analytics that avoid collecting prompt content unnecessarily.
- Email/domain/support readiness and transactional messages if accounts require them.

## P2 — defer until evidence justifies it

- Team collaboration and shared permissions.
- Large catalog of agents, models, and integrations.
- Unattended actions that publish, message, buy, or deploy.
- Complex enterprise controls.
- Broad multi-modal feature expansion.

## Next engineering order

1. Inspect canonical source and migrations; fix naming/config only after target Cloudflare resources are verified.
2. Make the first workflow work end to end: authenticated project → real source retrieval → evidence-backed brief → export → persisted history.
3. Integrate Daytona separately behind a server-side adapter; do not claim Build execution until smoke tests pass.
4. Add negative authorization, quota, and provider failure tests.
5. Complete privacy, support, and payment implementation for the exact paid scope.
6. Run local checks and a controlled manual Cloudflare release; no GitHub Actions.
7. Test with design partners and measure repeat use before broad launch.

## Rules

- No deploy to a placeholder D1 ID.
- No secrets in the frontend or repository.
- No “live”, “secure”, “production-ready”, “research complete”, or “payment active” claims without test evidence.
- If a capability is missing, either implement it, remove/disable the affordance, or label it unavailable.
- Update this register in the same PR when work changes a status.



## Market and launch evidence dependencies

- ICP discovery and qualification: docs/20_ICP_AND_CUSTOMER_DISCOVERY.md.
- Claim-safe landing page and sample: docs/21_POSITIONING_AND_LANDING_PAGE.md.
- Outreach, design-partner and paid-pilot stages: docs/22_GO_TO_MARKET_EXECUTION_PLAYBOOK.md.
- Support, billing and incident handling: docs/23_CUSTOMER_SUPPORT_AND_SUCCESS_RUNBOOK.md.
- manual Wrangler release evidence: docs/24_CLOUDFLARE_WORKERS_MANUAL_RELEASE_RUNBOOK.md.
- Product metrics and experiment results: docs/25_PRODUCT_METRICS_AND_EXPERIMENT_LOG.md.
