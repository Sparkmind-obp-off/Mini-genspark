# VestrenHQ — Customer Support and Success Runbook

**Status:** minimum operating standard for design partners and the first paid cohort. Fill in real contact details and response windows before inviting external users.

## Support ownership
Before an external cohort, publish a monitored support email/channel, responsible owner and backup, operating hours/response window, escalation route for security/privacy/payment/data loss, known-issues/status notice, and refund/cancellation route if accepting payment. Never publish placeholder contacts or promise 24/7 support without staffing.

## Intake template
Capture ticket ID/date, affected account/project/run ID (never passwords/tokens), category, expected vs actual behavior, reproducible steps and safe error code, impact/severity, owner/next update, resolution and prevention. Do not ask for API keys, payment credentials, sensitive files, or full private artifacts through public channels.

## Severity and action

| Severity | Example | First action |
|---|---|---|
| S0 Critical | Confirmed cross-account exposure, credential leak, uncontrolled spending | Disable affected route/provider, preserve minimal redacted evidence, restrict access, begin incident procedure immediately |
| S1 High | Data loss, incorrect payment entitlement, core workflow unavailable | Acknowledge within published support hours, stop harmful processing, escalate |
| S2 Normal | Export failure, source quality issue, repeatable defect | Reproduce safely, offer safe workaround, track fix |
| S3 Request | Feature idea, cosmetic issue, general question | Log and clarify; do not promise roadmap dates |

Publish actual response targets only after deciding who can meet them.

## First response checklist
1. Acknowledge the report and explain next step.
2. Check run ID, logs, and provider state without exposing private content.
3. Reproduce with sanitized input.
4. Determine whether one account or multiple tenants are affected.
5. Escalate immediately if security, privacy, payment, or data loss is plausible.
6. Give an accurate status and next update time.
7. Close after user confirmation or recorded verification.

## Product success check-in
Ask whether the output was used, what was verified/rewritten, task time before/after, what was missing/wrong, when the user would repeat it, and what prevents payment. Separate observed behavior from intention. A generated artifact is not useful until the user confirms use/action.

## Billing and refunds
Verify status server-side; browser redirects are not proof of payment. Duplicate callbacks must not duplicate grants/refunds. Keep auditable order, entitlement and reversal records. If status is uncertain, do not grant credits without recorded approval and reconciliation. Follow published policy and applicable law. Reconcile internal orders against the payment dashboard during pilot.

## Incidents
Follow the trust/privacy operations document. Maintain a minimal log of timeline, affected services/data classes, actions, communications, root cause, recovery evidence and prevention. Rotate exposed credentials and revoke sessions when appropriate. Never include secrets in incident records.

## Closure and learning
Every resolved issue should produce a test, monitoring signal, documentation/product fix, known-issue notice, or explicit decision not to change. Review recurring support categories weekly. Support burden is part of unit economics.
