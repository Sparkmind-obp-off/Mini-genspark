# Vestren — Trust, Privacy, and Customer Operations

**Purpose:** requirements for a sellable service. This is an implementation checklist, not jurisdiction-specific legal advice.

## 1. Data inventory before collecting customer data

Document each data class and purpose:
- account identifiers and authentication/session data;
- prompts, conversations, project context, and uploaded inputs;
- research queries, retrieved source metadata, and excerpts;
- generated artifacts and exports;
- usage, quota, security, and audit events;
- billing/subscription identifiers received from the payment provider;
- support messages and user feedback.

For each class record storage location, access roles, retention period, deletion behavior, backups, subprocessors/providers, and whether it is sent to an AI or search provider. Do not collect data “just in case.”

## 2. Required user-facing disclosures

Before public or paid launch, explain in plain language:
- what Vestren does and does not do;
- what data is collected and why;
- which AI/search/execution providers receive data and for what purpose;
- whether data is used for model training (never claim “not used” until provider contracts/settings confirm it);
- retention, export, deletion, and backup limitations;
- plan quotas, overage behavior, and whether usage can stop when limits are reached;
- how to contact support, cancel, request a refund, or report a security concern.

Publish only policies that match actual code, provider terms, and operational behavior. Obtain qualified local review for applicable Indonesian and other target-market privacy, consumer, electronic-system, tax, and payment obligations.

## 3. Security baseline

- Server-side authentication and authorization on every protected request.
- Tenant isolation verified with negative tests.
- Secure session cookie/token lifecycle and CSRF protections where applicable.
- Secrets stored as Cloudflare secrets or provider secret stores, not in client bundles, D1 plaintext, or Git.
- Strict input schemas, body limits, output validation, and safe error messages.
- Rate limiting and quota enforcement before costly provider calls.
- Untrusted web/file/repository content cannot grant tool permissions or override system policy.
- Execution runs only in a bounded Daytona sandbox with explicit timeout, resource, network, and filesystem policy.
- High-impact external actions require user confirmation.
- Redacted audit logs with access control and retention policy.
- Dependency updates and vulnerability review before release.
- Data export/deletion and recovery tested; backups are not assumed deleted unless their lifecycle supports it.

## 4. Incident procedure

1. Stop the affected integration or feature using a documented kill switch.
2. Preserve minimum necessary redacted evidence; do not copy secrets into tickets.
3. Determine affected tenants, data classes, time window, and provider involvement.
4. Rotate compromised credentials and revoke sessions where appropriate.
5. Restore service only after a verified fix and targeted tests.
6. Assess notification obligations with qualified counsel and communicate accurately to affected users.
7. Record root cause and prevention work.

## 5. Support standard for the first paid cohort

Before taking money, define:
- a monitored support inbox/channel and responsible owner;
- expected response window and service hours;
- incident escalation path;
- refund/cancellation route;
- how users report wrong sources, harmful output, data exposure, or billing errors;
- a public status/known-issues message, even if initially a simple page.

Never promise 24/7 support or uptime guarantees unless staffed and measured.

## 6. Data minimization rules

- Encourage users to remove secrets and unnecessary personal data before submission.
- Do not use real sensitive client files in alpha until storage/access controls are verified.
- Keep provider payloads and logs minimal.
- Do not use customer work for testimonials or training without appropriate permission and disclosure.
- Provide deletion/export mechanisms and test them from the user's perspective.



## Candidate implementation / residual risks — 2026-10-10

Scope inspected: browser → native Worker → real local D1; optional vendor adapters with deterministic mocks; real local manual-evidence workflow; read-only BYOK account inventory. This is an engineering review, not certification, a hosted route-admission policy or a production penetration test. Private owner identity/record authorization is not public tenant authentication.

Implemented defenses: random hashed 8-hour HttpOnly host-cookie sessions, expiry/revocation and UI private-state clearing; exact Origin/CSRF and no wildcard CORS; scoped queries on project/source/task/artifact reads/writes; body/read/time/output limits; UUID input-hashed replay and logical concurrency; mutation/attempt quotas; revision-checked artifact saves; authorized attachments, escaped static HTML and formula-safe CSV; redacted metadata/request IDs; no arbitrary source fetch, code execution, payment or model-selected tool authority. Negative tests cover foreign records, malformed/oversized requests, bad URLs, revoked sessions, source limits, races, provider failures/quotas and partial persistence.

Data: D1 holds necessary questions/results/excerpts/URLs/artifact text, session hashes and minimal counters/audit. Source rows are normalized per project and run evidence snapshots remain immutable. Manual mode does not contact vendors or independently verify its source URLs/content. Optional inference/search sends only bounded data after explicit configuration/policy; provider privacy/account terms remain unverified. No uploads, binary R2, public identity/customer/billing records or tracking are collected by this candidate.

Retention is lazy 30 days on authenticated traffic, not a scheduled guaranteed purge; artifact edits do not extend creation-based retention. Source removal affects future runs, not old snapshots. Project delete cascades source/run/usage/artifact children; anti-abuse daily counters remain content-free. Backups/vendor retention are not silently promised deleted. Exported human edits are not rerun through citation/factual validation, and original task output is not rewritten; exports accurately represent the saved revision.

Unresolved public/paid blockers: no verified public auth/tenant memberships, live provider cost/entitlement/privacy proof, actual Worker/D1 target, cloud alerts/log proof, restored backup rehearsal, legal/consumer/tax review, monitored support/refund process or Duitku payment lifecycle. Shared owner token must not be distributed to customers. Rotate credentials previously shared in chat and configure replacements only via secure runtime settings, never repository/browser files. Application token rotation alone does not revoke old sessions; revoke them with authorized DB tooling.

Prompt injection is handled architecturally as data with no secrets/tool permissions in model context; language-level resistance is not formally proven against a live model. Source-ID validation proves retrieval traceability, not quote truth/claim coverage/entailment. Workers AI wait timeouts cannot necessarily cancel upstream work; no automatic retry/fallback and account usage must be inspected before reruns. App attempt counters cannot prevent other applications' vendor usage/paid overage. Login global throttling can be an availability bottleneck under attack; don't remove it to conceal denial. Dependency audit reported no vulnerabilities, not immunity; secret-pattern scans do not recognize every opaque credential. No Free CPU/load/all-browser/screen-reader/compliance claims are made.

Duitku remains selected but no order/callback/entitlement code is activated. Merchant-live statement does not verify signatures, amount/currency/order matching, callback reachability, duplicate/out-of-order settlement, reversal/refund/expiry/reconciliation, or controlled transactions. Before implementation/activation, approve exact one-time product/price/credit/expiry/refund semantics and separate environment credentials via secrets; implement durable idempotent orders/events/grants and server-side reconciliation, never grant from browser redirects. Signature/amount/refund/payment tests and live transaction are currently NOT RUN, not treated as mock successes. No recurring auto-renewal claim.

Daytona remains selected, not substituted, but no runtime adapter, approved budget, CPU/memory/network/file/timeout/cancellation/cleanup proof exists. No sandbox was created and no shared production keys were passed into execution. Public/private support pages explicitly say channel/response operations are unconfigured until SUPPORT_EMAIL and operator capacity are verified.

## Operating references

- Customer-facing support and escalation: docs/23_CUSTOMER_SUPPORT_AND_SUCCESS_RUNBOOK.md.
- Manual release, secrets, smoke tests and rollback: docs/24_CLOUDFLARE_WORKERS_MANUAL_RELEASE_RUNBOOK.md.
- Public claim substantiation: docs/21_POSITIONING_AND_LANDING_PAGE.md.

The presence of a written policy is not proof of implementation. Verify the deployed behavior, providers, contact details, and retention controls before publishing policies or inviting customers.
