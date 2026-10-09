# 01 — Research and Feature Parity Map

**Research snapshot:** 2026-10-09  
**Purpose:** map Genspark's publicly documented product surfaces into an original, practical Mini Genspark roadmap, constrained by real free-tier limits.

## 1. Executive finding

Genspark is not a single model or chat page. Its Help Center describes a product suite including Super Agent, AI Chat, AI Slides, AI Sheets, AI Docs, GenCode/Genspark Code, AI Meeting Notes, AI Pods, Custom Agent Hub, Workflows, Chrome Extension, GenTeam, Speakly/realtime voice, GenTerminal, AgentBase, Genspark Design, Skills, SecondBrain, GenClipboard, AI Drive, Gen-1 Slides, and connectors.

We can reproduce the **general functional patterns** of an all-in-one workspace: one prompt surface, plan/execute/check, research with sources, editable artifacts, model/tool routing, saved projects, and reusable workflows. We should not promise exact parity in every modality at zero cost. Commercial text/image/video/audio generation, live meeting bots, telephony, cloud sandboxes, and large-scale scraping use quotas or billable infrastructure and need their own sustainable free-tier proofs.

## 2. Benchmark reference set

Primary references:
- Genspark product Help Center/index: https://www.genspark.ai/helpcenter
- Super Agent overview: https://www.genspark.ai/helpcenter
- AI Chat and web citations/files: https://www.genspark.ai/helpcenter/ai-chat
- AI Slides canvas, batch edits, speaker notes, import/export: https://www.genspark.ai/helpcenter/ai-slides
- AI Sheets collection, cleaning, analysis, formulas, charts, XLSX: https://www.genspark.ai/helpcenter/ai-sheets
- AI Docs rich text/Markdown, edit, version points, export: https://www.genspark.ai/helpcenter/ai-docs
- GenCode (CLI, dynamic model catalog, credit billing): https://www.genspark.ai/helpcenter/gencode
- Credits and free limits: https://www.genspark.ai/helpcenter/credits-guide
- AI Meeting Notes: https://www.genspark.ai/helpcenter/ai-meeting-notes
- AI Pods: https://www.genspark.ai/helpcenter/ai-pods
- Connectors and MCP: https://www.genspark.ai/helpcenter/connectors-and-integrations
- Chrome Extension: https://www.genspark.ai/helpcenter/chrome-extension
- Speakly: https://www.genspark.ai/helpcenter/speakly
- Membership plans: https://www.genspark.ai/helpcenter/membership-plans

All capability and pricing claims must be rechecked before implementation, because Genspark model lineups, plan limits, and features change.

## 3. Product surface map

| Genspark surface/category | Pattern worth learning | Mini Genspark response | Planned phase |
|---|---|---|---|
| Super Agent | Natural language task → plan → coordinated tools → checked output | Visible task plan, bounded steps, progress and verifier | P0/P1 |
| AI Chat | Multi-turn chat, model picker, files, web search and sources | Multi-provider chat, file context and citations | P0/P1 |
| Deep Research / research agent | Source discovery, page retrieval, cross-checking, synthesis | Research pipeline with claim/source map and source ledger | P1 |
| AI Docs | Editable document workspace, targeted rewrite, versions, exports | Markdown-first editor, snapshots, HTML/DOCX/PDF exports when tested | P1/P2 |
| AI Sheets | Import data, clean/analyze, formulas, charts, export XLSX | CSV first; XLSX import/export; editable grid and deterministic calculations | P1/P2 |
| AI Slides / Gen-1 Slides | Research/story structure + canvas + edits + speaker notes + export | HTML/Markdown-based slide editor, theme system, PPTX/PDF export with QA | P2 |
| GenCode / Genspark Code | Coding agent, model selection, file-level work and scripts | Repo-aware coding assistance, patches, testing; code execution gated | P0/P3 |
| AI Drive | Organized project files and downloads | Project asset library with metadata and R2 storage within quota | P1 |
| Skills / Custom Agent Hub / Workflows | Reusable instruction sets and multi-step repeatability | User-authored workflows with versioned JSON/Markdown definitions | P2 |
| Connectors / MCP | Tools accessible through typed interfaces and permissions | Own Tool Registry; support a small number of safe connectors first | P2 |
| AI Meeting Notes / Speakly | Recording/import, transcription, summary, searchable notes | Local file import/transcription path only after reliable no-cost provider; live bot deferred | P4/HOLD |
| AI Pods / AI audio | Script-to-audio or episode outputs | Deferred unless a sustainable free generation path passes a live cost test | P4/HOLD |
| AI Image / Genspark Design | Image creation and visual design | SVG/canvas/design assets, uploaded images and licensed sources first; generative API deferred | P3/HOLD |
| AI Video / AI Music | Generative video/music | Deferred; no claim of equivalent free generation | P4/HOLD |
| Call For Me / telephony | Agent-mediated phone calls | Deferred; inherently external-provider and compliance dependent | HOLD |
| Chrome Extension / browser control | Contextual sidebar and page actions | Read-only page capture first; browser automation only with explicit user consent and safe allowlist | P3/HOLD |
| GenTeam / collaboration | Shared workspace, permissions, activity | Single-owner mode first; multi-user collaboration after access controls are proven | P3 |
| SecondBrain / notes / clipboard | Searchable personal knowledge and context | User-controlled notes, project memory, searchable artifacts | P1/P2 |
| GenTerminal / arbitrary execution | Remote development and command execution | Build-time CLI on developer machine; remote execution isolated and opt-in only | P3/HOLD |

## 4. Original UI/UX direction

Use the broad workspace pattern, not a pixel clone.

### Global layout
- **Left sidebar:** New Task, Chat, Research, Documents, Sheets, Slides, Build, Workflows, Projects, Artifacts, Settings.
- **Main canvas:** a large natural-language composer for a new request; recent projects and tasks when idle.
- **Task view:** user request, proposed plan, step-by-step activity, tools/models selected, errors, approval prompts and result verification.
- **Artifact workspace:** readable/editable result next to task context; source rail for research; tabs for document, table, slide and code artifacts.
- **Provider settings:** configured/unconfigured/disabled/live-verified statuses, remaining quota where available, fallback policy and privacy note.
- **Responsive design:** desktop-first multi-pane layout; mobile collapses sidebar and uses stacked artifact/source panels.
- **Accessible interactions:** keyboard navigation, focus states, semantic controls, reduced motion, adequate contrast.
- **Distinct identity:** original typography, icons, spacing system, color palette and product voice. Do not use Genspark logos, proprietary assets or exact screenshots as copied UI.

### Key interactions
1. User writes one request.
2. Router classifies the request as Chat, Research, Create, Analyze or Build.
3. Planner previews a bounded plan and identifies required external tools.
4. User approves potentially costly/external actions.
5. Each step produces structured status and intermediate results.
6. Verifier checks completion and citations/output shape.
7. Artifact is saved, editable and downloadable.
8. A user can rerun a step or edit an artifact without regenerating the entire task.

## 5. Free-first implementation rules by feature

- **Chat:** choose one runtime API with a usable free quota, with an adapter and usage caps.
- **Research:** combine a free-tier search API while credit remains with direct public-page retrieval. At quota exhaustion, ask the user to wait/configure a permitted alternative; never silently hit a paid fallback.
- **Docs:** own editor + open-source export libraries; do not require paid document generation APIs.
- **Sheets:** use deterministic JavaScript for calculations; model assists with schema/formula suggestions, never authoritative financial calculations without verification.
- **Slides:** make content/layout editable and export from our code; PPTX/PDF can be generated using open-source libraries. AI image generation is optional, not a prerequisite.
- **Build:** assist with code and patches first. Sandbox execution is a separate, budgeted capability.
- **Memory/files:** store project data in D1 and artifacts in R2 only within quotas, with user deletion and size limits.
- **Voice/image/video/music:** do not ship nonfunctional buttons or call a feature "implemented" until a tested free-tier route exists. Allow local/browser-owned functionality as a clearly labelled limited alternative.
- **MCP/integrations:** explicit allowlist, typed schemas, secrets server-side, read-only by default, human confirmation for side effects.
- **Agent loops:** cap steps, wall time, retries and per-task model calls.

## 6. What cannot honestly be promised

The initial free-first product cannot promise "everything Genspark does, with the same quality, unlimited, and free". Genspark itself uses a credit system; its free plan is limited, and even GenCode has separate credit billing. Its provider roster and proprietary orchestration are not automatically accessible as external APIs. Some media and sandbox providers have trial credits rather than perpetual free use.

The product target is to implement the highest-value compatible workflows first and expose explicit capability statuses for the rest: **Available**, **Free quota exhausted**, **Needs owner configuration**, **Experimental**, or **Not implemented**.
