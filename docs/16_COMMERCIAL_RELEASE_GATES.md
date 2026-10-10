# Vestren — Commercial Release Gates

This document controls the words “ready”, “launch”, “paid”, and “production”. A checklist item is complete only when linked to evidence.

## Release assessment — 2026-10-10 candidate

**Decision: NO-GO for public/paid production.** A tested local, single-owner, manual-evidence workflow is not a complete commercial launch. Generic BYOK deployment request is recorded, but target identity, live provider and mandatory public/payment gates remain open. No deployment/transaction was executed.

| Category | Status | Evidence / remaining gate |
|---|---|---|
| Primary workflow / UX | PASS local manual; BLOCKED live | `npm run test:workflow`: real local login/project/provided excerpts/brief/edit/save/export/reopen/delete, no HTTP mocks; supplied evidence is not independently retrieved |
| Auth/session and tenant isolation | PASS private controls; FAIL public scope | Cookie/Origin/expiry/logout/foreign-record regressions pass. Fixed owner identity is not public signup or tenant membership; public auth absent |
| Persistence/migrations | PASS local; BLOCKED remote | Additive 0002/0003, original migration unchanged, D1 persistence and edit conflict/deletion tested; actual deployment DB ID/backup restore unavailable |
| Retrieval provenance / failures | PASS fixture/manual contracts; BLOCKED live | Sources distinguish supplied versus retrieved; citations checked against current ledger, provider errors tested with mocks; no live search/model account proof |
| Quotas/cost/abuse | PASS app bounds; NOT TESTED vendor economics | Atomic attempts and reservation consumption/release, zero-provider-unit manual flow, idempotency/concurrency tested; account balances/free eligibility/real cost unknown |
| Payments/entitlements | BLOCKED / NOT IMPLEMENTED | Duitku selected, owner says merchant live; no approved SKU/merchant config/signature/callback/reconciliation/refund code or live proof. No live checkout/money accepted |
| Privacy/legal/support | PASS truthful surfaces; BLOCKED operations | Actual public pages match private behavior; jurisdiction/consumer/tax review, monitored SUPPORT_EMAIL and response/refund standards unverified |
| Observability/incident/recovery | PASS safe diagnostics; NOT TESTED production | Correlation IDs and redacted task metadata, safe errors, retention and runbook; cloud alerts/log inspection/restore not rehearsed |
| Accessibility/responsive | PASS Chromium smoke; NOT TESTED comprehensive | Desktop/mobile no overflow/pageerror, dialog focus/Escape, labelled controls; no all-browser/screen-reader certification |
| Performance/dependencies | PASS local packaging/audit; NOT TESTED load | SPA/Worker builds and audit 0 vulnerabilities; no Free-plan CPU/load evidence |
| Cloudflare target/bindings | BLOCKED | BYOK auth/read-only inventory succeeds; 9 D1s / 1 Worker, no Vestren match; placeholder/legacy target intentionally not reassigned |
| Daytona separate Build | BLOCKED / NOT IMPLEMENTED | No adapter/budget/isolation/cleanup proof; no sandbox or substitute invoked; not advertised as executable Build |
| Customer/paid proof | NOT TESTED | No interviews, design-partner repeated use, demand, payment or unit economics evidence invented |
| Source hygiene/manual release | PASS local | No Actions/workflow files, lockfile, secret pattern/exact local-value scan, diff check; push evidence recorded after actual git operation |

Detailed observed commands/capability matrix: NOW.md. Risk reproduction and acceptance: docs/18. Cloud inventory/preflight/recovery: docs/24. Existing checkboxes below remain public-launch requirements, not automatically checked by a local pass.

## Gate 0 — product identity and promise
- [ ] Brand and product name consistent across landing page, app, emails, and legal pages.
- [ ] One primary customer, one primary workflow, one clear outcome.
- [ ] Example output created from a real test task; all sample data labelled accurately.
- [ ] Capability matrix distinguishes live, limited, configured, and unavailable integrations.
- [ ] No copied competitor branding/assets or unsupported parity claims.

## Gate 1 — core workflow
- [ ] New-user journey tested from sign-up to exported deliverable.
- [ ] Real research retrieval works; links, timestamps, and attribution survive export.
- [ ] Unsupported claims and uncertainty are visible.
- [ ] Projects persist across sessions; user can edit/export/delete.
- [ ] Error states never return fabricated successful results.
- [ ] Keyboard, mobile layout, loading, empty, and failure states checked.

## Gate 2 — identity, security, and privacy
- [ ] Public auth/session flow verified.
- [ ] Every resource query enforces tenant/project authorization server-side.
- [ ] Negative tests prove cross-user access is denied.
- [ ] Provider secrets exist only in server-side secrets management.
- [ ] Input validation, rate limits, request size limits, and quota enforcement tested.
- [ ] Prompt-injection and untrusted file/web content are handled as data, not instructions.
- [ ] Logs redact credentials, session tokens, and sensitive content.
- [ ] Data retention, deletion, backup, recovery, and incident response documented.
- [ ] Privacy notice, terms, contact, and relevant consumer/data obligations reviewed for target markets.

## Gate 3 — cost and reliability
- [ ] Per-workflow provider costs measured under representative use.
- [ ] Hard caps exist for request size, output, time, concurrency, retries, and daily/monthly usage.
- [ ] No silent paid provider fallback.
- [ ] Provider timeout, rate limit, outage, and malformed response tested.
- [ ] Monitoring and an operator alert path exist.
- [ ] Restore/rollback and disable-provider procedures rehearsed.

## Gate 4 — payment and customer operations
- [ ] Plan limits and renewal/cancellation rules visible before payment.
- [ ] Billing events are idempotent; entitlement changes follow verified payment state.
- [ ] Failed payment, cancellation, refund, duplicate webhook, and subscription expiry tested.
- [ ] Live payment has been explicitly verified with a controlled transaction; never confuse test and live modes.
- [ ] Support channel, response expectation, refund policy, and complaint handling are operational.
- [ ] Receipts/invoices and applicable tax treatment are understood for the target market.
- [ ] Terms and pricing match actual product behavior.

## Gate 5 — release and distribution
- [ ] Correct Cloudflare account, Worker name, D1 ID, R2 bucket, custom domain, and environment confirmed.
- [ ] Secrets set with Wrangler/Cloudflare secret management; none committed.
- [ ] Production database migration reviewed and rollback/recovery path prepared.
- [ ] Local typecheck, tests, production build, and smoke test recorded with date and commit SHA.
- [ ] No GitHub Actions/GitHub CI introduced; manual release procedure is documented.
- [ ] Domain, TLS, metadata, favicon, email, privacy/terms links, and support CTA checked.
- [ ] Release notes, known limitations, rollback trigger, and responsible operator recorded.

## Gate 6 — commercial proof
- [ ] At least 10 customer interviews documented with evidence of recurring pain.
- [ ] 3–5 design partners have completed a real task.
- [ ] Repeat use and deliverable usefulness measured.
- [ ] At least one paid pilot or equivalent credible payment evidence exists before scaling acquisition.
- [ ] Refund/cancellation and support burden monitored.
- [ ] Unit economics are plausible under measured usage.

## Release labels
- **Prototype:** exploratory; not for customer reliance.
- **Private alpha:** invited users, known gaps disclosed, no unsupported security/payment claims.
- **Paid pilot:** product and payment gates passed for a limited, explicit scope; support is active.
- **Public beta:** core workflow, identity, data isolation, support, and operational gates passed; limitations are visible.
- **Commercially ready for stated scope:** all applicable gates above have evidence and the release owner has signed off.

Passing a build does not mean passing security. Passing security does not prove demand. A domain resolving does not mean the product is sellable. Never promote a release label without evidence.



## Evidence and operating references

- Customer interview and ICP evidence: docs/20_ICP_AND_CUSTOMER_DISCOVERY.md.
- Public positioning and claim substantiation: docs/21_POSITIONING_AND_LANDING_PAGE.md.
- Launch stages and go/no-go: docs/22_GO_TO_MARKET_EXECUTION_PLAYBOOK.md.
- Support operations: docs/23_CUSTOMER_SUPPORT_AND_SUCCESS_RUNBOOK.md.
- Manual Cloudflare release record: docs/24_CLOUDFLARE_WORKERS_MANUAL_RELEASE_RUNBOOK.md.
- Metrics and experiments: docs/25_PRODUCT_METRICS_AND_EXPERIMENT_LOG.md.

A checklist remains open until an actual artifact, test result, customer record, or approval is linked. A document describing a requirement is not evidence that it has been met.
