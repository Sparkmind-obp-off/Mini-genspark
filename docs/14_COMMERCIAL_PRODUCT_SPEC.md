# Vestren — Commercial Product Specification (V1)

**Document status:** binding scope proposal. **Release status:** not yet commercially ready; implementation and proof gates remain.

## 1. Customer-facing promise

Vestren helps a solo operator or small team turn a real question into a source-backed brief and an editable next-step deliverable, with clear visibility into evidence, limitations, and what was actually done.

Do not market V1 as an unrestricted autonomous agent, a replacement for every productivity app, or feature-equivalent to another named product.

## 2. Initial buyer and job

**ICP hypothesis:** independent operators, founders, consultants, and small teams who repeatedly research a business/product question and convert findings into a brief, proposal, or action plan.

**Job to be done:** “When I need to make a decision, help me gather traceable evidence and turn it into a useful deliverable without rebuilding the workflow from scratch.”

This remains a hypothesis until customer interviews and observed usage support it.

## 3. V1 user journey

1. Visitor understands the product, limitations, privacy basics, and plan before creating an account.
2. User signs in and starts a project.
3. User enters a specific research question and desired output.
4. Vestren creates a plan and asks for missing constraints when necessary.
5. Research adapter retrieves sources; each source records URL, title, retrieval timestamp, and relevant excerpt where legally and technically appropriate.
6. The system drafts findings, separates sourced claims from inference, and flags unanswered questions.
7. User turns findings into an editable brief or action plan.
8. User can rename, revisit, export, and delete their work.
9. User sees usage/cost limits and can contact support or cancel a paid plan.

**No step may be represented as working until implemented and verified end to end.**

## 4. Launch-blocking capabilities

P0 — required before charging:
- Real authentication and server-side authorization; no shared owner token as public SaaS auth.
- Durable project and artifact persistence with tenant isolation.
- One real research/search provider, source ledger, citation-link validation, and explicit degraded/error states.
- One reliable export format for the primary deliverable.
- Usage accounting, hard quotas, clear limits, abuse controls, and no hidden paid fallback.
- User-facing privacy notice, terms, support contact, data deletion path, and billing/refund terms appropriate to the actual payment setup.
- Error handling, backups/recovery plan, redacted logs, basic monitoring, and incident response owner.
- Mobile/responsive UX, empty/loading/error states, onboarding, and accessibility smoke test.
- Billing lifecycle verified in test mode where available, then an explicit controlled live-payment verification before public sale.
- Product support and cancellation process documented.

P1 — useful after P0:
- Multiple export formats.
- Reusable project templates and prompt recipes.
- Team seats and shared workspaces.
- More model/provider choices.
- Advanced analytics and automation.

Out of V1 until validated:
- Unlimited agent execution.
- Unattended publishing, messaging, purchases, or production deployment.
- Broad enterprise SSO, complex roles, or many integrations.
- Claims of guaranteed accuracy or complete research coverage.

## 5. Product modes and truthful labels

The interface may expose Chat, Research, Create, Analyze, and Build, but visible modes are not proof that integrations exist. Display capability status in product and internal admin:
- **Available:** end-to-end tested for the current release.
- **Limited:** works with explicit constraints.
- **Setup required:** credentials/configuration missing.
- **Unavailable:** do not invite users to rely on it.
- **Failed:** operation attempted and did not complete.

Mock data must be labelled demo data and must never be mixed with live evidence.

## 6. Acceptance criteria for the first workflow

A release candidate passes only if a fresh test user can:
- create/sign into an account;
- create a project and submit a question;
- receive real retrieved sources with working URLs;
- distinguish source-supported findings from inference and unknowns;
- produce and export a usable brief;
- revisit the project after a new session;
- see usage/limit information;
- delete the project/account through the documented flow;
- access another user's data only if explicitly authorized (negative tests must prove isolation);
- recover from provider timeout, rate limit, invalid input, and storage failure without fabricated success.

Record build/test commands, environment, date, and results. No screenshots, test badges, or marketing claims may imply a gate passed without evidence.
