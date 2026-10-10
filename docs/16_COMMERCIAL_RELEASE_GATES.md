# Vestren — Commercial Release Gates

This document controls the words “ready”, “launch”, “paid”, and “production”. A checklist item is complete only when linked to evidence.

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
