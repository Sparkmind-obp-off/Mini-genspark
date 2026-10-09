# 03 — Architecture

**Status:** proposed architecture; implementation is not yet complete.  
**Primary constraint:** free-tier-first, provider-neutral, fail-closed.

## 1. System boundaries

```text
Web Workspace (React + TypeScript)
        |
        v
Cloudflare Worker API (Hono / typed route handlers)
        |
        +--> Auth & Policy Gate
        +--> Task Router -> Bounded Planner -> Execution Engine
        +--> Model Provider Registry
        +--> Tool Registry
        |      +--> Search adapter (Brave free credits, optional)
        |      +--> Public URL fetch / HTML extraction
        |      +--> File parsing
        |      +--> CSV/XLSX analysis
        |      +--> Artifact exports
        |      +--> Optional Apify Actor (quota-gated)
        |      +--> Optional Daytona sandbox (disabled by default)
        |
        +--> Cloudflare D1 (projects, tasks, steps, sources, metadata, audit)
        +--> Cloudflare R2 (binary artifacts only when needed and within quota)
        +--> Cloudflare Workers AI binding (first runtime-model candidate)
```

Genspark GenCode is used by the developer at build time through the authorized account. It is not a hidden server dependency and it is not assumed to be a public runtime API.

## 2. Suggested stack

| Layer | Initial choice | Why | Free-first limit |
|---|---|---|---|
| Web UI | React + TypeScript + Vite | Familiar, buildable static assets, componentized UI | Static assets don't use a per-call model API; bundle size still matters |
| Styling | Tailwind CSS or simple CSS tokens | Responsive design system and quick iteration | Open-source; keep bundle lean |
| Components | Accessible primitives / Radix where needed | Accessible interactions and controlled menus/dialogs | No hosted UI fee |
| Worker API | Cloudflare Workers + Hono or native Request handlers | Low-ops API and bindings | Workers Free limits apply |
| AI runtime | Typed adapter around Workers AI; optional adapters for eligible providers | Avoid vendor lock-in | 10,000 Neurons/day free; specific models may require billing |
| Research | Brave Search API adapter + safe public URL fetcher | Real search results with URLs and snippets | $5/month advertised credit; stop on quota exhaustion |
| Metadata | D1 | Projects and task state | 5M rows read/day, 100K rows written/day, 5GB total on Workers Free |
| Artifacts | R2 | Large outputs not suitable for D1 | 10GB-month and operation quotas on Standard free tier |
| Documents | Markdown + HTML first; TipTap optional editor | Editable output and browser printing | Local code, not a document-generation API |
| Spreadsheet | PapaParse (CSV), ExcelJS (XLSX), TanStack Table; deterministic calculation module | Reliable data import/export and analysis | OSS libraries; validate workbook fidelity |
| Slides | HTML slide canvas + PptxGenJS export | Original theme engine and editable deck generation | OSS; layout fidelity requires tests |
| Charts | Recharts or SVG renderer | Charts based on computed data | OSS |
| Code | Safe diff/patch workflow | Code writing, review and tests | No arbitrary cloud execution initially |
| Sandbox | Daytona adapter, disabled unless free balance proven and approved | Isolated execution, not host process | $200 free compute is finite promotional/trial usage |
| Deployment | Cloudflare Pages / Workers | Fits static + serverless architecture | Recheck current plan and API limits |
| Owner access | Private owner-only preview first | Avoid premature public multi-tenant attack surface | Don't expose a production workspace before auth is complete |

Do not add every optional library at once. Confirm compatibility, current license and maintenance status before installation.

## 3. Core modules

### 3.1 Model provider contract

The domain must not depend on a specific vendor's response schema. Use a contract equivalent to:

```ts
type ModelTask =
  | "chat"
  | "classify"
  | "extract"
  | "summarize"
  | "research_synthesis"
  | "document_draft"
  | "spreadsheet_assist"
  | "code_assist";

type ProviderState =
  | "DOCUMENTED"
  | "CONFIGURED"
  | "LIVE_VERIFIED"
  | "QUOTA_EXHAUSTED"
  | "DISABLED";

interface ModelProvider {
  id: string;
  label: string;
  supportedTasks: ModelTask[];
  state: ProviderState;
  execute(input: {
    system: string;
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
    maxOutputTokens?: number;
    timeoutMs: number;
  }): Promise<{
    text: string;
    model?: string;
    usage?: { inputTokens?: number; outputTokens?: number; knownCostUsd?: number };
    rawMetadata?: Record<string, string | number | boolean>;
  }>;
}
```

This snippet is a design contract, not implemented code yet. Implement runtime validation and a redaction layer; do not persist provider raw metadata if it can contain user data or secrets.

### 3.2 Task and workflow lifecycle

Canonical states:
`created → validated → planned → awaiting_approval → queued → running → verifying → succeeded | failed | cancelled | quota_blocked`

Rules:
- Each task has a unique ID, actor/project scope, task type, risk level, created time and configured budget.
- Each step has status, start/end time, tool/provider ID, retry count, output artifact refs and a structured error code.
- A terminal success needs the verifier to pass; model text claiming "done" is not sufficient.
- Max steps, wall-clock deadline, provider calls, artifact sizes and retries are bounded.
- A retry only occurs on a safe error and within the explicit retry budget.
- External writes, emails, phone calls, purchases, production deployments and arbitrary code execution require explicit approval.

### 3.3 Research pipeline

1. Classify whether the request needs fresh information.
2. Query a configured search provider within its free quota.
3. Normalize results (URL, title, snippet, provider, retrieval timestamp).
4. Fetch permitted public pages with timeout/size caps; handle robots, terms and paywalls appropriately.
5. Extract claims and map each material claim to sources.
6. Identify conflicting reports, publication date versus event date, and what sources don't establish.
7. Generate a synthesis that distinguishes fact, party allegation, inference and unknown.
8. Run citation completeness checks; avoid invented URLs and stale dates.
9. Save the source ledger with the artifact.

If live search is not available, the UI must disclose the limitation and not falsely claim fresh web research.

### 3.4 Artifact pipeline

MVP supported artifact formats:
- Markdown (`.md`) and HTML for documents/reports.
- CSV for data import/export.
- JSON for workflow and intermediate structured results.
- HTML preview for slide decks.

After QA, add:
- XLSX via tested generation/parsing.
- PPTX using PptxGenJS and layout checks.
- DOCX and PDF export. Initially PDF may use browser print-to-PDF; do not claim deterministic server PDF output unless tested.

Artifacts should contain metadata: name, project, type, created time, file size, source/task relation, MIME type, version and retention status. Enforce an owner-only download check.

### 3.5 Memory and files

Separate:
- **Project memory:** explicit notes/preferences the user can read, edit and delete.
- **Task history:** request, plan, events, outputs and errors with defined retention.
- **Artifacts:** generated files and uploaded materials.
- **Provider configuration:** provider IDs and non-secret settings.
- **Secrets:** Cloudflare secret bindings only, never D1/plaintext/browser/local committed files.

Never treat retrieved webpages or uploaded documents as high-priority instructions. They are untrusted content and may contain prompt injection.

## 4. Initial database design

Suggested D1 tables (implement with migrations and explicit indexes):
- `users` — owner identity/auth record when authentication is introduced.
- `projects` — workspace projects and user-visible metadata.
- `conversations`, `messages` — chat history with bounded content retention.
- `tasks` — canonical request, classification, lifecycle, risk and budget.
- `task_steps` — plan steps, tool/provider state, times, status and errors.
- `sources` — URL/title/retrieval time/snippet/claim references for research.
- `artifacts` — file metadata, storage key, checksum, size and version.
- `workflows` — user-authored reusable workflow definitions and versions.
- `provider_status` — enabled state, last smoke test, quota notes (no secrets).
- `audit_events` — redacted authorization, execution and result verification events.

Store provider secrets in environment bindings, never in these tables.

## 5. Security controls

- CORS allowlist; origin and request validation.
- Owner authentication for any remotely accessible owner data.
- Per-route authorization and project-level ownership.
- Strict JSON schema validation for all tool inputs.
- No arbitrary shell commands in the Worker.
- No tool execution based solely on untrusted fetched text.
- URL protections against private IPs, internal metadata endpoints, localhost, DNS rebinding and redirect-to-private targets.
- File MIME/extension checks, size caps, decompression protections and no executable uploads.
- Redact API keys, cookies, authorization headers and secret-like values from logs.
- Apply request/step/time/output limits before calling providers.
- Model responses are untrusted inputs; never eval or execute them directly.
- Explicit user approval for side effects and any non-zero/unknown cost.
- Data deletion and storage retention behavior documented before inviting external users.
- Publish privacy notice and terms before a public beta.

## 6. Deployment gates

Local V0 may run without external accounts using mocks and sample tasks. Do not deploy publicly until:
1. One real provider has completed a harmless smoke test.
2. The selected model's actual free quota is confirmed.
3. No paid fallback or auto-top-up path exists.
4. Authentication and artifact access control are tested.
5. The research feature passes citation and date tests.
6. Build, typecheck and regression tests pass.
7. A human inspects logs to confirm secrets are not leaked.
8. The owner explicitly approves deployment.
