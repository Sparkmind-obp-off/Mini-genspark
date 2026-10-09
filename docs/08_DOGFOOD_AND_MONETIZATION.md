# 08 — Dogfood Strategy and Monetization Plan

**Product principle:** use it ourselves first, prove repeated value, then sell the specific value—not generic access to an AI chat box.

## 1. Positioning

Mini Genspark is an original AI workspace that turns one request into a sourced, structured, editable result across research, documents, data, and project workflows.

Do not position it initially as “a free clone of Genspark with every feature”. That promise is not economically or technically credible under free-tier limits. Position the early product as:

**A personal AI workbench that turns research and instructions into reliable, editable work products, with visible sources, reusable workflows, and strict cost control.**

The first user is the founder/operator. Personal use is the initial test harness, not proof of external market demand.

## 2. Dogfooding loop (first 14 days)

Use Mini Genspark for at least 10 real work sessions:
- Research a current topic and save a source-backed report.
- Turn a prompt into a repository implementation brief and tracked checklist.
- Analyze a CSV and export a result.
- Prepare a document and a slide-outline artifact.
- Compare two models on one fixed benchmark prompt if budget/quota allows.
- Save one reusable workflow and rerun it with new input.
- Track where the app saved time and where manual repair was needed.

For every session record:
- Task category and expected output.
- Minutes spent with and without Mini Genspark (rough estimate is sufficient).
- Whether sources were reliable.
- Corrections/rework needed.
- Provider and quota consumption when known.
- Whether the output was actually used.
- Failure, false citation, or privacy issue.

Do not inflate metrics by counting mock runs as completed AI tasks.

### Dogfooding success gate
Proceed to external pilot only if:
- The workspace is used repeatedly, not just demonstrated once.
- The same workflow can be run by following written steps.
- Output quality is acceptable without hidden manual repair.
- There are at least 3 specific recurring workflows that save meaningful time.
- Cost and quota behavior are understood.
- No unresolved critical secret-leak or unsafe-action defect exists.

## 3. Monetization models to test

### Model A — Open-core/self-hosted + paid workflow packs
- Core: free or openly available self-hosted workspace, with users supplying their own provider credentials where applicable.
- Paid: workflow packs, import/export templates, domain-specific agent configuration, versioned task recipes, and setup/support.
- Why it fits a small startup: minimal inference subsidy by the founder.
- Risk: generic prompts are easy to copy; packs must save time and include useful validation and repeatable artifacts.

### Model B — BYOK hosted workspace
- Free: account/workspace features, local/mock mode, limited app orchestration.
- User-configured providers: users connect their own keys to providers that allow such use; the model provider bills the user directly.
- Paid plan: collaboration, saved workflows, project history, exports, advanced permissions, and higher app-side quotas.
- Why it fits: avoids paying all inference costs for every subscriber.
- Risks: keys/security, support burden, users need provider accounts, and certain free provider keys cannot be redistributed or pooled. Review terms before implementation.

### Model C — Vertical workflow outcome product
- Sell a finished workflow rather than a blank canvas: e.g. research report with evidence matrix, competitor/market scan, business proposal generator, recurring business intelligence brief, or codebase audit pack.
- Charge per deliverable or per workflow bundle; add subscription only when recurring use is validated.
- Why it fits: customers pay for completed work and quality, not a model picker.
- Risks: must define scope and quality, and cannot falsely claim automated results without human checks.

### Model D — Team workspace
- Only after the solo workflow works.
- Paid seats for team projects, shared artifacts, permissions, workflow versioning, reusable internal knowledge, review/approval, and audit.
- Do not build multi-tenancy until auth and access boundaries have passed security review.

## 4. Recommended monetization sequence

1. **Dogfood (free/private):** founder-only use; no public promises.
2. **Design-partner pilot:** invite 3–5 people with a specific workflow; measure completion and actual repeat usage. Do not assume they are willing to pay just because they like it.
3. **Paid workflow pilot:** test one clear offer with a real price and defined deliverable. No need to charge for generic access first.
4. **Freemium/BYOK:** only if activation and repeat usage make the workspace itself valuable.
5. **Subscription/team tier:** only after support load, hosted/storage costs, quota use and paid conversion are known.

## 5. Pricing experiments (hypotheses, not final pricing)

For an Indonesia-first workflow offer:
- One-off workflow/report: test IDR 29k–99k depending on scope and human review.
- Founder-assisted setup/pilot: test IDR 149k–499k where it demonstrably saves significant work.
- Hosted workspace: do not set a subscription until real average cost per active user and repeat usage are observed; test price sensitivity with prospective users.

For global distribution, prefer testing a narrowly scoped deliverable before pricing a broad “AI workspace” subscription. Avoid a large price table before evidence exists.

Any price test must have a plainly described scope, support expectation, turnaround time, refund terms and actual sample outputs. Prices are hypotheses; no willingness to pay has yet been proved.

## 6. Cost and quota economics

Track per task:
- Provider/model and version if known.
- Input/output tokens or usage units where reported.
- Search API requests and quota balance if available.
- Storage and artifact size.
- Sandbox wall-clock time and compute credit consumption.
- Failure/retry count.
- Cost to serve and whether the provider actually reported a charge.

Hard policy:
- No payment method or auto-reload without owner approval.
- Default task budget is $0 of paid usage.
- Free quota exhaustion must block or explicitly ask for an allowed alternative.
- Do not pool consumer free quotas into a paid multi-tenant service unless the provider terms clearly permit it.
- Do not advertise unlimited AI use while depending on finite free credits.
- Never treat $200 trial credits as perpetual free compute.

## 7. Moat strategy

The moat will not be “we use many AI models”. Competitors can do that too.

Build defensibility through:
- Trusted source/evidence workflows with tests and correction history.
- Personal/project context that is user-owned, exportable and useful.
- Repeatable task graphs and artefact generation with auditability.
- Benchmarks showing which workflow produces reliable outputs.
- Integration into a user's repeated work with explicit consent.
- Later, domain-specific workflow packs and distribution relationships.

Store customer data only with a clear purpose and permission. Aggregate benchmarks across users only with an appropriate legal basis, privacy protections and explicit disclosure where needed.

## 8. Metrics for the first startup decision

Weekly:
- Number of real tasks completed with actual provider execution.
- Useful artifact completion rate.
- Citation/source error rate.
- Average manual correction time.
- Active users who return within 7 days.
- Number of users who repeat the same workflow.
- Conversion from pilot invitation to completed test.
- Number of paid transactions and refunds.
- Cost per completed task and quota failure rate.

Do not use views, signups or positive feedback as a substitute for recurring use and payment.

## 9. Stop / pivot conditions

Pause broad feature development if:
- The product is used less often than existing free chat tools.
- Users only value a feature available equally in existing tools and do not value the workflow wrapper.
- The provider quota cannot support the target usage.
- A feature needs paid infrastructure but customers won't pay enough to cover it.
- Source errors or unsafe actions undermine trust.

Pivot toward a specific workflow and paid outcome rather than adding more generic features.

## Decision

Start as an owner-only, free-tier-first workspace. Use the product every day. Keep a log of outputs, time saved, failures and provider quotas. Test a narrow paid workflow before selling a broad AI workspace subscription. Build app-side monetization only after the value and serving costs are observed.
