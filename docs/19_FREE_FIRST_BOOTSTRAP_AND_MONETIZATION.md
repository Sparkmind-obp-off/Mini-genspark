# Vestren — Free-First Bootstrap and Monetization Architecture

**Decision status:** proposed operating baseline for V1.  
**Core rule:** prove a customer outcome with the lowest safe recurring cost. Upgrade only when real demand, measured limits, or a paid customer justifies it.

## 1. Product form

Vestren launches as a responsive web AI workspace—not a collection of internal tools and not an unrestricted “AI does everything” promise.

The first sellable workflow is:
**Question → evidence-backed research brief → editable action deliverable → saved project/export.**

The interface can grow into Chat, Research, Create, Analyze, and Build, but only the primary workflow is a launch commitment. Other modes must be visibly limited or marked unavailable until they pass end-to-end tests.

## 2. Bootstrap phases

### Phase A — founder dogfood (free-first)
- Use the product ourselves for real research, planning, and deliverable tasks.
- Keep a small evaluation set of repeatable tasks and expected quality checks.
- Use free tiers and existing account allowances where available; do not assume a vendor's free tier is permanent or sufficient for commercial production.
- No customer-sensitive data until access controls, retention, provider handling, and deletion are verified.
- No unattended paid calls; hard limits and a visible kill switch are required.
- Record failures, time-to-useful-output, source quality, token/compute usage, and actual cost.

### Phase B — invited alpha
- Invite 3–5 design partners only after identity, tenant isolation, data handling, and core workflow tests pass.
- Disclose the alpha's scope and limitations.
- Keep usage capped; pause expensive integrations when quota or cost thresholds are hit.
- Ask for real tasks, observe the result being used, and collect structured feedback.

### Phase C — first paid pilot
- Charge for a narrow, explicit outcome with a defined usage allowance and support expectation.
- Activate a paid provider or upgrade only when required for that pilot, with a cost cap.
- Confirm the customer understands what is automated versus manually assisted.
- Reconcile every payment and entitlement change against verified payment-provider events.

### Phase D — wider distribution
- Expand sign-up and marketing only after repeat use, support, refunds/cancellation, security, and unit economics are demonstrated.
- Upgrade infrastructure by measured bottleneck, not by assumption.

## 3. Infrastructure policy

| Layer | Bootstrap choice | Upgrade trigger |
|---|---|---|
| Web UI + API | Cloudflare Workers/Pages or the existing Worker+Assets pattern | measured CPU/runtime, reliability, or product need |
| Metadata/projects | Cloudflare D1 | measured query/storage limits or feature need |
| Generated files | Keep small outputs in the existing supported path first; add R2 when artifact persistence/size warrants it | file size, retention, or download requirements |
| AI inference | Existing Cloudflare Workers AI binding where suitable; provider adapter for alternatives | quality, latency, quota, or paid-customer requirement |
| Live research | A provider with an explicit free allowance if available; cache and cap requests | evidence quality or quota limits prevent customer outcomes |
| Build sandbox | Daytona selected for V1, server-side only, with strict lifecycle cleanup | only if usage, reliability, or economics justify it; no silent E2B substitution |
| Auth | Use a suitable low-cost/free identity provider or implement only if security expertise and scope justify it | user count, security, or product needs |
| Payment | Duitku integration after its live merchant configuration and callback flow are verified | not applicable; payment choice remains Duitku unless a concrete blocker appears |
| Observability | Cloudflare dashboard/logging plus minimal redacted application events | support/incident requirements and measured scale |

**Free tier is a budget, not a product guarantee.** Vendor terms, quotas, eligibility, and limits can change. Confirm current account entitlements before promising a customer any included usage.

## 4. Monetization recommendation

### Start with prepaid usage packs / one-time pilot purchase
For the first paid cohort, prefer a one-time purchase of a defined number of workflow credits or a fixed-scope pilot. It is easier to explain and reconcile than pretending an automatic recurring subscription exists before it is implemented.

A “credit” must map to a clear, bounded operation—not an arbitrary number disconnected from compute cost. Show what one workflow includes, the maximum usage, what happens on failure, and whether unused credits expire. Do not charge for failed provider operations unless the terms and behavior are clear and fair.

### Add recurring plans only after renewal operations are proven
Duitku's official FAQ currently says recurring payment is not available as a native recurring charge; a merchant can instead send a reminder to pay again. Therefore V1 should not promise automatic monthly renewal. A manual monthly renewal plan is possible only if reminders, expiry, grace periods, cancellation, and entitlement updates are built and disclosed. Re-check Duitku's current product capabilities before implementation.

### Pricing formula
Do not set final prices from competitor screenshots. Measure:
- AI/search provider cost per successful workflow;
- sandbox cost per run and cleanup/storage time;
- payment fees and taxes;
- support/onboarding minutes per customer;
- refunds and failed transactions;
- desired contribution margin.

Then define a minimum price that covers variable cost and support. Keep a free capped evaluation tier only if the allowance can be safely funded and abuse-limited.

## 5. Payment lifecycle (Duitku)

Implement behind a server-side payment adapter. Never put merchant API keys in browser code.

1. User chooses a clearly described product/pack.
2. Server creates a unique internal order ID and stores amount, currency, customer, plan/credits, and pending status.
3. Server requests a Duitku payment using the official integration and merchant credentials stored as secrets.
4. User is redirected to the provider's payment page or approved checkout flow.
5. Backend verifies provider callback/signature and reconciles status server-side; never trust the browser redirect as proof of payment.
6. Callback handling is idempotent: repeated events cannot grant credits twice.
7. Only verified successful payment grants the defined entitlement.
8. Expiry, failed, cancelled, refunded, or disputed orders update entitlements according to documented rules.
9. Store a minimal audit trail; do not log secrets or sensitive payment data.
10. Reconcile internal orders against the merchant dashboard during pilot.

Before live launch: verify merchant code, API key, live-vs-test environment, allowed return/callback URLs, callback reachability, payment channels, transaction fees, settlement timing, refund procedure, and controlled low-value live transaction. Never use sandbox credentials against live configuration or vice versa.

## 6. Usage and entitlement model

Keep a provider-neutral internal ledger:
- account_id / tenant_id;
- order_id and provider transaction reference where applicable;
- product/plan/pack ID;
- granted, consumed, reversed, and remaining units;
- operation/run ID;
- timestamp and reason;
- idempotency key.

Reserve quota before expensive work. Commit consumption only according to documented operation semantics; release reservations on failure. Never allow negative balance, double grant, or a silent paid fallback. Define per-request limits, daily caps, concurrent-run caps, maximum output, sandbox timeout, and storage retention.

## 7. Distribution assets required before selling

- A clear landing page with one audience, one workflow, a sample output, honest limitations, CTA, pricing/usage terms, privacy, terms, and support contact.
- A first-run onboarding path and demo/sample project.
- A working sign-up/login and account/project deletion flow.
- Product status page or at least a maintained known-issues page.
- A support inbox and refund/cancellation procedure.
- An operator runbook for payment reconciliation, quota exhaustion, provider outage, incident response, and rollback.
- A release record tying each release to commit SHA and real test evidence.

## 8. Upgrade rule

An upgrade is approved only when all are true:
1. A specific user/customer problem is blocked by the current tier or provider.
2. The current limit/failure is measured and recorded.
3. The proposed upgrade resolves that blocker.
4. Cost and expected revenue are written down.
5. The spending owner approves the change.
6. There is a stop/rollback plan.

## 9. Definition of bootstrap success

Bootstrap succeeds when Vestren can reliably deliver one useful workflow, users return for another real task, at least one customer pays or commits credibly to paying, costs are understood, and the system can pause safely at quota. It does not mean every feature is free forever or that the full general-purpose workspace is already complete.



## Execution references

- Use docs/20 to validate the initial buyer and job before committing to a public ICP.
- Use docs/21 for the landing page and evidence-backed marketing claims.
- Use docs/22 for dogfood, design-partner, paid-pilot, and beta stages.
- Use docs/23 for customer support, billing issues, refunds, and incidents.
- Use docs/24 for Cursor/local QA and manual Cloudflare Wrangler release.
- Use docs/25 to measure useful artifacts, repeat use, cost, and experiments.

Free-first does not mean cost-free or safe by default. Confirm actual account limits, provider terms, quotas, and cost ceilings. No customer payment or public launch until the relevant gates are evidenced.
