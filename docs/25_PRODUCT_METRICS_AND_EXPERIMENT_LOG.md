# VestrenHQ — Product Metrics and Experiment Log

**Purpose:** replace feature-count progress with evidence of useful customer outcomes. This file defines measurement; actual results must be added only from observed data.

## North-star metric
**Verified useful work products per active user per week.** Count a work product only when the user confirms it was used or informed a real action. Do not count mock runs, failures, or generated text alone.

## Core metrics

| Metric | Definition | Guardrail |
|---|---|---|
| Activation | New account completes and exports/saves a usable first artifact | Track cohort and sample size |
| Workflow completion | Verified successful artifacts / eligible workflows started | Model-only success is not verified |
| Time to useful output | Time from task start to user-confirmed result | Report median and sample size |
| Correction burden | Rework time and material error count | Separate minor edits from factual corrections |
| Source integrity | Broken links, missing provenance, unsupported claims per evaluated run | Track coverage and unknowns |
| Seven-day repeat | Users completing another real task within seven days / eligible activated users | Exclude internal tests from customer cohorts |
| Paid conversion | Paying customers / eligible trial cohort | Include refunds and failed payments |
| Unit cost | AI + search + sandbox + storage + payment + support cost per useful artifact | Include failed calls, retries and cleanup |
| Trust | Cross-tenant failures, deletion failures, incidents, billing mismatches | Critical incidents are stop-ship |
| Support load | Support minutes/tickets per active customer | Include founder-assisted work |

## Minimum privacy posture
Collect event metadata needed to improve the product; avoid full prompts, output content, or source excerpts in analytics by default. Use pseudonymous IDs where possible. Document event purpose, access, retention, and deletion. Never emit session tokens, secrets, payment credentials, or sensitive personal data.

## Event vocabulary
Potential events, implement only when behavior exists:
- signup_completed
- project_created
- workflow_started
- workflow_completed
- workflow_failed
- artifact_exported
- artifact_usefulness_confirmed
- repeat_workflow_completed
- quota_blocked
- payment_started
- payment_verified
- refund_or_reversal
- support_issue_created
- account_or_project_deleted

Events should include timestamp, environment, pseudonymous account ID, workflow/run ID, outcome category, and schema version where appropriate. Never emit prompt content or credentials.

## Experiment template
For each experiment record ID/date range, segment/job hypothesis, change tested, target sample/recruitment, primary metric/guardrail, baseline if known, result with denominator, unexpected observations, permissioned user quotes, cost/support impact, decision (continue/change/stop), next experiment, and owner.

## Weekly review
Review actual use, useful outputs, seven-day repeat, source/correction quality, costs, support load, and payments/refunds. If data is not implemented or trustworthy, mark it **not measured** rather than estimating. Keep this log separate from roadmap promises.
