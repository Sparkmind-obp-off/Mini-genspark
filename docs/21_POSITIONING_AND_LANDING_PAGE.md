# VestrenHQ — Positioning and Landing Page Specification

**Status:** implementation brief. Verify every claim against the deployed product before publication.

## Positioning
**Category:** AI work execution workspace.  
**V1 wedge hypothesis:** source-backed research briefs and editable action deliverables.  
**Primary promise:** turn a business question into a traceable brief and a clear next step.

Do not claim “AI for everything,” guaranteed accuracy, comprehensive web coverage, autonomous execution, parity with another product, or customer outcomes without evidence.

## Audience and job
Initial audience hypothesis: solo operators, founders, independent professionals, and small teams who repeatedly research a business/product question and need a useful brief, proposal, or action plan. Validate the specific segment before narrowing public copy.

## Landing page structure
1. Hero: outcome-first headline, one-sentence explanation, primary CTA.
2. Workflow: ask a focused question → inspect sources → review findings/unknowns → edit/export.
3. Sample artifact: reproducible example with source URLs and clear sample label.
4. Trust: provenance, retrieval dates, limitations, usage caps, human review.
5. Who it is for: one validated segment and recurring job.
6. Capability status: available, limited, setup required, unavailable.
7. Pricing/usage: included operations, limits, expiry, failure behavior; publish only when implemented.
8. Privacy/control: data purposes, providers, retention, export, deletion, contact.
9. FAQ: accuracy, source coverage, provider handling, usage, support, refunds, cancellation.
10. Footer: privacy, terms, support/contact, status/known issues.

## Draft copy — not publish-ready until product gates pass

### Hero
**Turn a business question into a brief you can act on.**

Vestren helps you organize research, review the evidence behind findings, and turn what you learn into an editable next-step deliverable. You stay in control of the work, sources, and final decision.

Primary CTA: Try the research workflow  
Secondary CTA: View a sample brief

### How it works
1. Start with a real question. Tell Vestren what decision or deliverable you need.
2. Review the evidence. Inspect sources and see where information is uncertain or missing.
3. Make it useful. Edit the brief, turn findings into next steps, and export the result.

### Trust statement
Vestren should show what it actually retrieved and completed. Source links, limitations, and failed operations must remain visible; generated text alone is not proof.

### Scope note
The first release focuses on one evidence-backed research-to-deliverable workflow. Other workspace modes are launch commitments only when implemented and verified.

## Claim substantiation

| Claim | Evidence required |
|---|---|
| Source-backed | Real retrieval, source ledger, URL validation, attribution survives export |
| Saves time | Observed baseline and measured time-to-useful-output; state sample size |
| Private/secure | Security review, access-control tests, accurate provider and retention disclosures |
| Free | Exact allowance, provider terms/eligibility, abuse controls, no hidden charge |
| Export your work | End-to-end export test and artifact reopen check |
| Integration with a provider | Configured integration and reproducible live smoke test |
| Trusted by X users | Auditable count and permission to publish |
| Accurate | Defined evaluation set and measured quality; never imply guaranteed correctness |

## Conversion instrumentation
Measure landing CTA, signup start/completion, first project, first completed workflow, artifact export, confirmed usefulness, seven-day repeat, checkout start/success, refund/cancellation, and support request. Prefer aggregate metadata; do not collect full prompts or artifact content for analytics by default.

## Publication checklist
- [ ] Copy matches deployed release, not roadmap.
- [ ] Sample output is labelled and sources open.
- [ ] Pricing/quotas match actual enforcement.
- [ ] Privacy, terms, and support links work.
- [ ] No invented testimonials, logos, user counts, or performance claims.
- [ ] CTA leads to a working flow; unavailable features are not advertised as live.
- [ ] Mobile, keyboard, loading, empty, and error states reviewed.
