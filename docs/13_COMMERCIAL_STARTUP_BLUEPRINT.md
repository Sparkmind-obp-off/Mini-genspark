# VestrenHQ — Commercial Startup Blueprint

**Status:** operating strategy and decision framework, not a claim that capabilities or market traction already exist.

## 1. Company and product

- **Brand:** Vestren.
- **Canonical product/repository:** VestrenHQ — Sparkmind-obp-off/Vestrenhq.
- **Category:** AI work execution workspace.
- **Mission:** turn a request into reliable, reviewable work—not just another chat response.
- **Inspiration:** the all-in-one AI workspace category, including Genspark. Vestren must maintain original code, visual identity, workflows, messaging, and product decisions.
- **Core loop:** Intent → Context/Evidence → Plan → Approved tools → Execute → Verify → Deliverable → User-controlled memory.
- **Commercial principle:** sell a repeatable outcome and trust, not a checklist of AI features.

Vestren is not a consulting project folder, a pile of demos, or a promise of parity with a large AI workspace. It is one product with one source of truth, one backlog, one operating cadence, and measurable release gates.

## 2. First market wedge — do not target everyone yet

A general AI workspace is expensive to differentiate and difficult to market. Start with one repeatable job where Vestren can show a better outcome.

### Initial hypothesis

**Evidence-backed research and work-product creation for solo operators, small teams, and builders.**

The first workflow to validate:
1. Define a business or product question.
2. Gather real, attributable sources.
3. Produce a structured brief with an evidence table and explicit unknowns.
4. Turn the brief into an editable action plan, proposal, or implementation spec.
5. Save the work in a project and repeat the workflow.

This is a hypothesis, not validated demand. Interview prospective users and observe real use before making a broad market claim.

### Candidate ideal customer profile

- Solo founders, operators, independent professionals, and small teams.
- They repeatedly research a market, compare vendors/competitors, prepare briefs/proposals, or turn information into action.
- Their pain is time lost gathering/validating information and rebuilding the same deliverable—not simply lack of access to a chatbot.
- They can provide a real task and judge whether the output was actually used.

### Exclude from the first release

- “Everyone who uses AI.”
- Unlimited general-purpose agent promises.
- Enterprise collaboration, broad browser automation, or many multimedia suites before core workflows are reliable.
- Autonomous publishing, sending, purchasing, or deploying without human approval.

## 3. Differentiation and defensibility

Do not compete on model count or a long feature matrix. Build a reputation for work that is traceable and reusable.

1. **Evidence ledger:** sources are real, links resolve, dates are distinguished, and material claims map to evidence.
2. **Verified deliverables:** outputs are editable/downloadable; calculations are deterministic; build tasks report actual exit codes and test evidence.
3. **Visible execution:** the user sees the plan, active tool, progress, limits, errors, and artifact.
4. **Project continuity:** context and outputs can be inspected, edited, exported, and deleted by the user.
5. **Honest capability status:** mock, configured, and live-verified are visibly different.
6. **Cost control:** no hidden paid fallback or unlimited usage promise.

Potential moat over time: tested workflow recipes, domain-specific evaluation datasets, correction history, repeat use, and trusted integrations. User data is not a moat to exploit; collect only what is necessary and provide export/deletion.

## 4. Product packaging

### Free/private founder tier
Founder dogfooding, bounded daily use, and transparent provider states. No unlimited inference promise. No public access until authentication, data isolation, and deletion flows are verified.

### Design-partner pilot
Recruit 3–5 people with a specific recurring workflow. Offer one clear workflow and one measurable deliverable. Collect permissioned feedback and measure completion, correction time, and repeat use. Do not build one-off features unless multiple target users need them.

### First paid offer
Test a narrow paid outcome before charging for a broad workspace subscription. Candidate: a source-backed market/competitor brief with evidence table, action recommendations, and editable export. Price only after prospect interviews; early prices are experiments, not established market value.

### Subscription later
Only after recurring use is proven. Price against measured support, storage, search, model, and sandbox costs. BYOK may reduce inference subsidy but introduces onboarding, security, and support costs.

## 5. Validation funnel

1. Problem interviews: 10 conversations with target users about their last real attempt, current workaround, time spent, and consequences.
2. Concierge prototype: supervise early outputs, disclose human review, and track manual work.
3. Repeated-use test: get at least 3 users to run the same workflow more than once.
4. Value test: record whether output was used, time saved, factual corrections, and willingness to pay.
5. Payment test: ask for a real purchase or paid pilot, not just a compliment.
6. Scale decision: automate the repeated bottleneck that improves margin or quality.

### Early gates — targets, not achieved results
- 10 problem interviews completed.
- 3 design partners complete a real task.
- At least 3 users repeat the same workflow.
- Research outputs show source provenance or clearly labelled gaps.
- Useful-output rate and correction time are measured.
- At least one genuine paid pilot before a broad subscription build.
- No unresolved critical security or data-loss issue.

If these gates fail, narrow the workflow or reposition the product; do not respond by adding more modes.

## 6. Metrics that matter

### North-star metric
**Verified useful work products per active user per week** — count only outputs the user confirms they used or acted on, not generated tokens or mock runs.

Supporting metrics:
- Activation: first useful artifact completed.
- Time-to-value: time from prompt to usable result.
- Completion rate: tasks ending in verified success.
- Research quality: broken citation rate, unsupported material claims, correction rate.
- Repeat: users rerunning a workflow within 7 days.
- Retention: weekly active users returning in weeks 2 and 4.
- Monetization: paid pilot conversion, revenue, refunds, repeat purchases.
- Unit economics: provider/sandbox/storage cost per useful task, including failures and retries.
- Trust: permission errors, deletion completion, incidents, user-reported incorrect outputs.

No vanity metric replaces useful outcomes, repeat use, or payment.

## 7. Product gaps to close before public launch

| Gap | Why it matters | Release evidence |
|---|---|---|
| Market validation | A polished workspace can still have no buyer | Interviews, repeat use, paid pilot |
| Product wedge | General AI workspace positioning is too broad | One ICP and one core workflow |
| Real research | A Research tab is not live research | Provider smoke test, source ledger, citation checks |
| Daytona execution | Build mode must not simulate execution | Adapter contract tests, bounded real sandbox smoke test, cleanup proof |
| Auth and authorization | Owner token is not a multi-user SaaS security model | Login, tenant/project isolation, session revocation |
| Durable projects/history | Work must survive refresh and be recoverable | D1 migrations, ownership checks, export/delete |
| Artifact handling | Results must be usable and private | Authorized storage/download, file limits |
| Cost economics | Free quotas are finite and change | Per-task usage, hard stops, no paid fallback |
| Product analytics | Without measurements, roadmap becomes guesswork | Privacy-aware event/feedback schema |
| Legal and trust | Commercial product needs clear terms | Privacy policy, terms, retention/deletion, support contact, provider disclosures |
| Reliability operations | A broken release must be recoverable | Manual release checklist, logs, export and rollback |
| Support/feedback | Users need a path to report failure | In-product feedback or documented support channel |
| Distribution | Product does not find customers by existing | Landing page, demos, targeted outreach, case studies with permission |

## 8. Technical operating model — Cloudflare-first, no GitHub Actions

### Source of truth
GitHub remains the source of code and reviewed changes. Work on feature branches, commit, inspect diffs, and push. This project will not depend on GitHub Actions or GitHub CI.

### Deployment
- Cloudflare Workers/Wrangler is the chosen deployment and runtime path.
- Run local npm run typecheck, npm test, and npm run build before push when a Node environment is available.
- Deploy explicitly with Wrangler from the intended branch after reviewing the diff and confirming the target environment.
- Workers can host the API and static assets. Use D1 for structured metadata and R2 for file bodies. Add Durable Objects only for demonstrated coordination needs.
- Use Cloudflare secrets for server-side credentials. Never place provider tokens in Vite-exposed variables or commit them.
- A deployment is not itself a test suite. Use a simple manual release checklist and Cloudflare runtime/logs rather than GitHub CI.

### Environment separation
- Local: local D1 migrations and mock adapters; no accidental provider calls.
- Preview/staging: separate bindings and secrets, small usage limits, test data only.
- Production: explicit deployment, confirmed bindings, quotas, auth, and rollback plan.
- Do not rename or reuse a production D1 binding until its actual ID and data ownership are verified.

## 9. Daytona policy

Daytona is the selected code execution/sandbox provider for V1. It must sit behind a server-side ExecutionProvider adapter. A sandbox is created per bounded task; input files are scoped; execution time, output size, resource use, and cleanup are bounded. Never execute generated code in the Worker process itself. Never pass broad production secrets into the sandbox. Network access and external side effects are restricted; GitHub writes and deployments require a separate approval gate. Do not silently substitute E2B or report mock execution as a real run.

The current VestrenHQ repository tree does not show a Daytona adapter under src/. If the implementation exists elsewhere, bring it into this canonical repository and run contract tests. Until then, the repository itself must report Daytona as not yet integrated/live-verified.

## 10. Operating cadence to avoid abandoned projects

### Weekly product cycle
1. Pick one user-visible outcome for the week.
2. Write acceptance criteria and failure states before coding.
3. Implement the smallest complete slice.
4. Run local QA/typecheck/build, then a bounded live smoke test only if needed.
5. Push a branch and inspect the diff.
6. Deploy explicitly to Cloudflare when ready.
7. Test the deployed URL, record results and usage.
8. Ask a real user to use it; log feedback and decide continue/fix/stop.

### Work-in-progress rule
- One active release objective at a time.
- No new major mode while the current one has unresolved P0/P1 gaps.
- A feature is done only when user behavior, failure handling, cost limits, documentation, and verification evidence agree.
- Maintain NOW.md with the current objective, acceptance criteria, latest commit, deployed URL, known gaps, next action, and blocker.
- Every session ends with one concrete next action. No “finished” status without a deploy/test artifact or a clearly stated external blocker.

## 11. First 30-day plan

### Days 1–3: establish truth
- Confirm Cloudflare Worker/project bindings, D1 database ID, secrets, and deployed version.
- Remove GitHub Actions workflow and update docs to the Cloudflare/manual release model.
- Inventory which modes are real, mock, or disabled.
- Find and port the actual Daytona adapter if it exists outside this repository.

### Days 4–10: make one workflow trustworthy
- Implement/verify a real research provider and source ledger, or focus on source QA and artifact export if research is already live.
- Finish auth and owner/project access boundaries before public multi-user launch.
- Record local QA and a live smoke-test report.

### Days 11–20: dogfood and interview
- Use Vestren for at least 10 genuine work sessions.
- Interview 10 target users; recruit 3 design partners.
- Track useful output, manual corrections, time saved, failures, and costs.

### Days 21–30: paid pilot decision
- Run the same workflow repeatedly with design partners.
- Offer one narrow paid deliverable if there is real demand.
- Continue, narrow, or pivot based on repeat use and willingness to pay—not the amount of code written.

## 12. Decision log

- Brand/product: Vestren / VestrenHQ.
- Canonical repository: Sparkmind-obp-off/Vestrenhq.
- Source control: GitHub; branch + commits + push.
- CI: no GitHub Actions/GitHub CI.
- Runtime/deploy: Cloudflare Workers/Wrangler.
- Metadata: Cloudflare D1.
- Artifacts: Cloudflare R2 where needed.
- Code sandbox: Daytona for V1; no silent E2B fallback.
- Commercial launch: after a narrow workflow demonstrates repeated user value and at least one paid pilot.
- Genspark: category inspiration only; do not copy protected implementation or branding.
