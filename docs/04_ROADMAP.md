# 04 — Roadmap and Acceptance Criteria

**Status:** proposed, not yet completed. Do not interpret roadmap items as shipped functionality.

## Product rule

Implement broad workflow coverage in phases, but each phase must be demonstrably working. Feature count and visual similarity are not substitutes for reliability. Free-tier use must hard-stop on quota and never silently transition into paid usage.

## Phase 0 — Foundation, docs and provider inventory

### Deliverables
- Repository rules and architecture docs.
- Responsive original UI design tokens and shell.
- TypeScript/Vite app skeleton and Worker API skeleton.
- Typed task schema, task states, mock model/tool adapters.
- Provider inventory and usage-state types.
- .env.example with empty placeholders and setup docs.
- Local sample data; no actual provider credentials.

### Acceptance
- Install, typecheck, test and build all pass.
- Empty states, loading, quota-blocked and error states exist.
- No UI button claims a tool is active when it is a mock.
- No deployment and no billable calls.

## Phase 1 — First useful workspace

### Features
- Home prompt composer.
- Chat history, tasks/projects sidebar, settings page.
- Router for Chat, Research, Create, Analyze and Build.
- Visible bounded plan; user can approve, edit or cancel.
- Mock executor for deterministic end-to-end tests.
- One working runtime-model provider selected after live quota and privacy smoke test.
- Provider status UI: Disabled / Needs key / Available / Quota exhausted / Live verified.
- Task states, basic audit and token/cost metadata when provided.

### Acceptance
1. Submit a task and see its plan and execution lifecycle.
2. Real configured provider returns a result in one low-cost test.
3. An absent key or quota exhaustion produces a clear state, never fake success.
4. Timeout, 401/403, 429 and provider 5xx are handled.
5. Free quota is the hard-stop default and no paid fallback exists.
6. Core tests run without external provider credentials by using mock adapters.

## Phase 2 — Research workspace

### Features
- Search provider adapter (Brave API first candidate).
- Public page fetcher and safe HTML/text extraction.
- Source rail with title, URL, retrieval time, publication/event date when known.
- Claim-to-source matrix, conflicting-claim detection and limitations section.
- Research report artifact in Markdown/HTML.
- Quota and provider cost visibility.
- Optional Apify Actor adapter for specifically permitted extraction, off by default.

### Acceptance
- Every factual claim in the tested research output is linked to a real retrieved source or labelled unsupported.
- Links resolve; publication date is not confused with event date.
- Retrieved page text is treated as untrusted.
- Search quota exhaustion stops fresh search and is shown to the user.
- Scraping respects website rules and never bypasses login/CAPTCHA/access controls.

## Phase 3 — Create and Analyze artifacts

### Docs
- Markdown/HTML edit pane, targeted rewrite, savepoints/version history.
- Export Markdown/HTML first.
- Add DOCX/PDF only after round-trip/fidelity QA.

### Data
- CSV upload/import, schema preview, missing-value and type validation.
- Deterministic calculations in TypeScript.
- Basic tables and charts; download CSV and JSON.
- XLSX import/export after formula, date, cell type and formatting tests.

### Slides
- HTML slide canvas, theme tokens, reordering/editable text, speaker notes.
- PptxGenJS export with slide-count and overflow checks.
- PDF via browser print initially.
- No remote image/video generation requirement for initial functionality; use user assets or sourced assets with license/attribution as appropriate.

### Acceptance
- Artifacts are editable and downloadable.
- Source/data lineage and formulas are visible where relevant.
- Spreadsheet arithmetic is deterministic and covered by unit tests.
- Reopening/downloading does not change critical values or corrupt the file.
- Presentation exports are manually reviewed on multiple viewers.

## Phase 4 — Coding assistance and optional sandbox

### Features
- Connect user-authorized GitHub repositories via a documented API/connector after scopes are reviewed.
- Code understanding, proposed diffs, patch files and test plan.
- Local developer uses GenCode CLI for implementation from project folder.
- Optional Daytona sandbox adapter only if free credits are confirmed and a bounded proof is approved.
- Never expose arbitrary cloud shell/code execution to anonymous/public users.

### Acceptance
- No generated code is executed in the Worker runtime.
- Sandbox is isolated, time-limited and scoped to one task.
- Task ID, command result, exit code, logs and cleanup status are correlated.
- Unknown cleanup state is not marked success.
- If the free balance cannot be checked, sandbox stays disabled.
- User approves any write to GitHub; no destructive/default branch modifications without approval.

## Phase 5 — Memory, workflow skills and connectors

### Features
- User-controlled project memory with inspect/edit/delete.
- Versioned workflow definitions, replay and error-handling policy.
- Small allowlist of read-only connectors.
- MCP client tools only after input/output schemas and security reviews.
- Per-user/provider budgets, rate limits and audit.

### Acceptance
- Retrieved docs cannot override system policy.
- Write-capable tools are off unless approval and idempotency are proven.
- Users can remove saved context/artifacts.
- Audit omits secrets and sensitive content not needed for diagnosis.

## Phase 6 — Multimedia, browser and collaboration (conditional)

Potential surfaces: image generation, voice/transcription, meeting notes, AI audio/podcasts, video/music, Chrome extension/browser automation, telephony, multi-user workspaces.

These are **conditional**, not promised for the free-only MVP.

For each capability:
1. Discover a legitimate public provider or suitable local/open-source implementation.
2. Confirm the quota is free for the relevant modality, not just free text inference.
3. Determine privacy, retention, commercial-use and licensing constraints.
4. Run a bounded smoke test and measure consumption.
5. Add explicit provider/quota state, cancellation, failure behavior and user consent.
6. Ship only if the result is genuinely useful and can be supported without hidden billing.

If no qualifying path exists, label the feature “Not implemented yet” or provide a clearly limited local/browser-based alternative.

## Phase 7 — Private beta and production readiness

### Requirements
- Authentication, session revocation, project/artifact ownership.
- Usage dashboard, free quota preflight, no auto-spend, monthly/daily hard ceilings.
- Abuse controls, provider timeouts, retries with limits, idempotency where needed.
- Privacy policy, data retention/deletion, support and incident process.
- Keyboard/accessibility review, responsive QA, performance checks.
- Model/routing regression dataset and citation quality tests.
- Backups or export path for user data.
- Explicit approval to deploy.

## Release checklist

- [ ] Build and typecheck pass.
- [ ] Unit/API/e2e suites pass, actual results recorded.
- [ ] At least one end-to-end provider smoke test passed on a free-eligible route.
- [ ] Search and model quota behavior tested.
- [ ] Secrets not in browser bundle, source code, commits or logs.
- [ ] No fake citations, dummy generated files or placeholder success messages.
- [ ] Actual unavailable capabilities listed in the UI and README.
- [ ] Privacy/data-use warnings shown where appropriate.
- [ ] Artifact exports verified by reopening files.
- [ ] Public deployment specifically approved.
