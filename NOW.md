# NOW — VestrenHQ

**Current objective:** ship a sellable, narrowly scoped Vestren product—not a documentation-only prototype.

- **Canonical repo:** Sparkmind-obp-off/Vestrenhq
- **Active branch:** feat/commercial-foundation-cloudflare-daytona
- **Operating model:** GitHub branch/commit/push; no GitHub Actions; local QA + manual Cloudflare Wrangler release.
- **Selected sandbox:** Daytona; no E2B substitution without explicit decision.
- **Commercial wedge:** evidence-backed research brief → editable action deliverable for solo operators and small teams. This is a hypothesis until validated with real users.
- **Current release status:** development/prototype; not yet ready to claim public paid launch.

## Commercial documents added
- `docs/13_COMMERCIAL_STARTUP_BLUEPRINT.md` — product thesis and validation plan.
- `docs/14_COMMERCIAL_PRODUCT_SPEC.md` — customer journey, V1 scope, acceptance criteria.
- `docs/15_PRICING_AND_GO_TO_MARKET.md` — pricing experiments and acquisition funnel.
- `docs/16_COMMERCIAL_RELEASE_GATES.md` — evidence required before alpha, paid pilot, and public launch.
- `docs/17_TRUST_PRIVACY_AND_OPERATIONS.md` — data inventory, privacy, security, incident response, and support.
- `docs/18_COMMERCIAL_GAP_REGISTER.md` — prioritized stop-ship gaps and engineering order.
- `docs/19_FREE_FIRST_BOOTSTRAP_AND_MONETIZATION.md` — free-first infrastructure, dogfooding phases, usage packs, and Duitku payment lifecycle.

## Immediate next action
Implement the first end-to-end workflow using the lowest safe-cost infrastructure: real sign-in → project persistence → live source retrieval with evidence → editable/exportable brief → usage limits → deletion. Dogfood before inviting customers. Keep all integrations capped; add Duitku as a server-side payment adapter only after merchant environment, callback verification, idempotency, and entitlement logic are tested. Treat Daytona Build execution as a separate capability until the real adapter is located/integrated and bounded smoke tests pass.

## Known blockers to verify
- Worker currently states live web search and file upload are not enabled.
- Public multi-user auth and tenant/project authorization are not confirmed.
- Durable project/conversation persistence and full artifact access controls are not confirmed.
- Daytona adapter is not confirmed in this repository tree.
- Wrangler still uses legacy `mini-genspark` naming and a placeholder D1 ID. Do not deploy until actual Cloudflare targets are verified.
- Local typecheck, tests, and build have not been run in this environment.
- Customer interviews, repeat use, willingness to pay, and paid pilot are not yet evidenced.

## Session close rule
Update this file with the latest commit, exact test results, deployment URL (if any), remaining gaps, and one next action. Never mark a task done without evidence.
