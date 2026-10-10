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



## Operating references

- Customer-facing support and escalation: docs/23_CUSTOMER_SUPPORT_AND_SUCCESS_RUNBOOK.md.
- Manual release, secrets, smoke tests and rollback: docs/24_CLOUDFLARE_WORKERS_MANUAL_RELEASE_RUNBOOK.md.
- Public claim substantiation: docs/21_POSITIONING_AND_LANDING_PAGE.md.

The presence of a written policy is not proof of implementation. Verify the deployed behavior, providers, contact details, and retention controls before publishing policies or inviting customers.
