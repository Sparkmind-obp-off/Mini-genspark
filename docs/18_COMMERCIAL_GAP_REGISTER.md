# VestrenHQ — Commercial Gap Register

Updated 2026-10-10 against remote main `8a3d0ae` and the local candidate `feat/vestren-research-deliverable`. Evidence: NOW.md, `src/*.test.*`, `scripts/workflow-acceptance.mjs`, docs/16 and docs/24. Local tests are not a production audit.

## Findings converted to fixes

| Priority / severity | Finding, path and impact | Reproduction / implemented fix | Acceptance evidence |
|---|---|---|---|
| P0 / high | `src/App.tsx` retained owner credential in sessionStorage; history buttons did not reopen | Replaced with HttpOnly session flow, no browser credential persistence; real project/run reopen | Cookie/expiry/logout/IDOR tests + real local browser journey |
| P0 / high | `src/worker.ts` parsed unbounded request JSON, no timeout/idempotency | Actual byte/read/time bounds, UUID replay/input hash, server-owned history and logical run lock | Oversize/slow body/timeout/duplicate/concurrent tests |
| P0 / high | No durable project/artifact operations | Ported tested additive 0002 foundation; 0003 normalized provided-source records, edit revisions and usage ledger; scoped queries and guarded cascading delete | Real local D1 create/reopen/rename/edit/export/delete; clean/populated upgrade tests |
| P0 / high | Source-backed workflow absent; Research tab could only give background/demo | Explicit Tavily/inference adapters and fail-closed gates; useful manual excerpt fallback with provenance, no fabricated fetch date/AI output | Live providers BLOCKED; manual end-to-end PASS with no HTTP/provider mocks |
| P0 / medium | Editable deliverable absent; racing edits could silently overwrite | `src/workspace.ts` content bounds, expected revision in atomic UPDATE, conflict 409, exports saved revision | Editor/CAS/export tests; real browser edited MD download matches |
| P0 / medium | Failed calls/quota semantics ambiguous | Anti-abuse attempts remain capped separately; `usage_ledger` settles consumed/released once; manual provider units zero | Reservation release, replay and exhausted provider/search/rate tests |
| P1 / medium | Old QA required obsolete README links and no behavior coverage | `scripts/qa-workspace.mjs` now checks canonical contract/no-workflow guards and secret patterns/exact local secret values; lockfile + 51 behavioral tests | Baseline QA/test FAIL recorded; final behavior checks PASS, audit 0 reported vulnerabilities |
| P1 / medium | Missing trust/support/pricing pages | `src/policies.ts` accurately declares private scope, manual provenance, limits, lazy retention, disabled payments, unconfigured support | Public policy tests; source/secret review; legal/support operations still BLOCKED |
| P1 / medium | Private text remained at risk in stale editor/project state after expiry/logout | `clearPrivateView` clears project/source/artifact drafts and snapshots unconditionally on unauthorized/logout, with no discard prompt preventing revocation | Session expiry regression + real browser logout |

## Remaining stop-ship gates

| Priority / scope | Status | Exact blocker / required next proof |
|---|---|---|
| P0 / public | BLOCKED: public auth and tenant identity | Shared owner token is private founder auth only. Configure verified public identity/tenant membership and prove fresh-user signup, expiry, revocation and cross-user isolation before inviting customers |
| P0 / live core | BLOCKED: real inference/retrieval | Account/model free-only quotas, overage and privacy not verified; selected runtime keys/binding not configured/live-smoke-tested. Supplied source URLs are not page fetches |
| P0 / remote release | BLOCKED: target identity | BYOK account auth works. Read-only inventory has 9 unrelated D1s / 1 unrelated Worker, none matching Vestren. Approve dedicated isolated Worker/D1 creation or identify actual owner-approved targets; do not reuse another product DB |
| P0 / remote data | NOT TESTED: production backup/restore | Additive local migrations pass; remote ID still placeholder. Back up confirmed DB, rehearse restore and rollback in isolated preview before approved remote migration |
| P0 / paid | NOT IMPLEMENTED: Duitku lifecycle/entitlements | Owner says merchant access is production-live; no merchant config/code/signature/callback/ledger/reconciliation/refund proof exists. Need separate environment secrets, approved one-time offer/amount/expiry/refund policy, verified callback origin, official adapter tests and separately approved controlled transaction. No payment accepted |
| P0 / operations | BLOCKED: legal/support/alerts | Pages match code, not legal review. SUPPORT_EMAIL, monitored operator, response/refund expectations, jurisdiction/tax/privacy review, alert path and incident restore proof remain unverified |
| P1 / separate Build | NOT IMPLEMENTED: Daytona | Selected direction retained; no adapter in current or preserved local tree, verified budget/isolation/network/cleanup unavailable. Existing shared credential is not secure runtime setup or cost proof. No E2B substitute or sandbox creation. Not required to pretend the manual research workflow executes code |
| P1 / measured cost/performance | NOT TESTED | No live provider cost/Free-plan CPU measurements, full-scale load, all-browser/screen-reader evaluation or vendor account balance monitoring |
| P1 / product memory | LIMITED | Small text artifacts use D1; 50 projects / 30 runs/project; no pagination/version-history editor, account-level deletion/signup, uploads or binary R2. R2 not justified for current bounded text workflow |
| P1 / market proof | NOT TESTED | No customer interviews, design partners, repeated real use, willingness to pay, payments or unit economics were fabricated; docs/20–25 remain protocols |

## Conflicts resolved using constitution and actual code

- GitHub verified repository rename to Vestrenhq; work starts from latest remote main, not older unpushed local main. Historical NOW branch/PR-not-merged claims were stale because PR #4 is already on remote main.
- No Actions invariant wins over the previous local CI implementation; files were selectively ported, no workflow/cherry-pick that reintroduces Actions.
- Native Worker+Assets remains canonical. BYOK Pages skill guidance supplies auth/preflight, not permission to convert to Pages or deploy a static SPA without the Worker API.
- Existing conversation aggregate serves as the private project record; no duplicate schema invented. R2 is deferred per docs/19 small-output policy, not falsely claimed integrated.
- Provider failure attempt caps and customer credits are different: anti-abuse counts are not refunded; run reservations release on failure. No commercial payment/credit policy is invented.
- Manual source provenance is provided-not-retrieved, timestamps are supplied-at with retrievedAt null; verified facts section says none. This useful fallback is not promoted to passing the real-retrieval release gate.

## Single next owner action

Approve/identify an isolated Vestren private-preview BYOK Worker + D1 target in the authenticated account, without DNS, payment, sandbox or inference activation. Then separately configure verified live providers and complete recovery/public identity/payment gates before GO. Work/push does not authorize a PR merge or commercial launch.
