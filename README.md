# VestrenHQ — Vestren AI Workspace

**Vestren is building an AI workspace that turns requests into useful, evidence-backed and reviewable work products.** This is a commercial product effort, not a collection of disconnected demos.

## Product direction

One workspace, shared core services:
- **Chat** — reason, decide, and iterate.
- **Research** — retrieve sources, track evidence, show dates and uncertainty.
- **Create** — produce editable documents and deliverables.
- **Analyze** — inspect structured data and run deterministic calculations.
- **Build** — plan repository changes, inspect diffs, and use bounded execution.
- **Agent runs** — visible plans, progress, permissions, verification, and artifacts.
- **Projects and memory** — user-controlled context and durable work history.

The product inspiration is the broad all-in-one AI workspace category, including Genspark. Vestren must have its own implementation, brand, visual language, and product decisions; it does not claim feature parity with Genspark.

## Commercial strategy

The first market hypothesis is evidence-backed research and work-product creation for solo operators, small teams, and builders. This is not yet validated. The next proof is real repeated use, 3–5 design partners, and a narrow paid pilot—not adding more modes.

Read:
- [Commercial Startup Blueprint](docs/13_COMMERCIAL_STARTUP_BLUEPRINT.md)
- [Product Constitution](docs/00_VESTREN_PRODUCT_CONSTITUTION.md)
- [Architecture](docs/03_ARCHITECTURE.md)
- [Roadmap and acceptance criteria](docs/04_ROADMAP.md)
- [Full-stack architecture](docs/12_VESTREN_FULL_STACK_ARCHITECTURE.md)
- [Migration plan](docs/11_VESTREN_MIGRATION_PLAN.md)

## Operating decisions

- **Canonical repository:** VestrenHQ.
- **Source control:** GitHub; branch, commit, inspect diff, push.
- **No GitHub Actions / GitHub CI.** Use local checks and a manual release checklist.
- **Runtime and deployment:** Cloudflare Workers + Wrangler.
- **Metadata:** Cloudflare D1.
- **File bodies/artifacts:** Cloudflare R2 when needed.
- **Code sandbox:** Daytona selected for V1. It must run through a server-side adapter; no E2B fallback and no fake success.
- **Cost policy:** free-tier-first, hard quota stops, no hidden paid fallback.
- **Production:** no deployment until target bindings, secrets, auth, and rollback are verified.

## Current implementation truth

The current codebase is a small React + TypeScript + Vite workspace with a Cloudflare Worker, Workers AI binding, D1 usage/audit tables, and an owner-token gate. UI modes do not imply all integrations are live. The Worker currently states that live web search and file upload are not enabled. Public multi-user SaaS auth, durable project/conversation storage, complete artifact storage, and the Daytona adapter are not confirmed in this repository tree.

The current Wrangler config still contains a placeholder D1 database ID and legacy resource naming. Do not deploy remotely until real Cloudflare bindings and target environment are verified. Do not put provider secrets in frontend variables or committed files.

## Local checks

From a local checkout with Node/npm installed:

    npm install
    npm run typecheck
    npm test
    npm run build

These commands are not reported as passing unless actually run. GitHub Actions are intentionally not used. For an approved deployment, use Wrangler explicitly after reviewing the target account, Worker name, bindings, and secrets.

## Product rule

A feature is done only when the user-visible behavior, authorization, cost/quota behavior, failure state, documentation, and verification evidence agree. A mock is not a live provider test. A successful deployment is not proof that a workflow is useful. The startup must prove repeat usage and willingness to pay.
