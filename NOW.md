# NOW — VestrenHQ Pages release

Updated 2026-10-10. Current owner direction is docs/29 + docs/30: NEW Pages project, default pages.dev only, no custom domain/DNS/nameserver operations. Worker URL is reference only, not the deliverable.

## Audit and implementation checkpoint

- Actual upstream main `bc00f2b` normal-merged into local main; no PR/feature branch/force rewrite/Actions.
- Selected NEW Pages name `vestrenhq-private`; verified unused in connected account inventory before creation.
- Existing Worker `vestrenhq-private-preview` preserved, health HTTP 200; current version at audit `06310e94-09f2-498f-8563-0263eb2f93ec`, tag empty. No current-task Worker deploy or secret mutation.
- Legacy Pages `vestren-workbench` and its unrelated DB preserved, not selected.
- REUSE verified D1 `vestrenhq-private-preview`, ID `86787a64-0479-4ee6-96ca-5e9387a9b781`. Actual Worker binding, DB name, expected session/artifact/source/security columns and exact four migration names queried remotely. No already-applied migration replay. Initial projects/tasks/artifacts all zero; acceptance creates/removes only synthetic data.
- Pages adapter `functions/[[path]].ts` -> `src/pages.ts` -> existing shared router/security/D1 contracts. `context.next()` handles assets/SPA only; API errors/policies remain real. Generated `_worker.js` and `_routes.json` include all paths. Root config is supported Pages configuration, reference Worker config retained.
- Build embeds server-only real HEAD/dirty provenance. Dashboard says Pages build CONFIGURED; Cloudflare deployment ID/SHA/bindings require independent remote verification, not fabricated version metadata.

## QA checkpoint

Clean `npm ci`, typecheck and Pages build succeeded. First new Pages D1 adapter test failed with 415 because its fixture omitted the required JSON Content-Type; fixed fixture header without weakening validation. Rerun: **71 tests, 5 files, all passed**. Optional providers remain MOCKED in unit/UI tests; no live vendor proof.

Further local Pages browser workflow, read-only cloud preflight, project creation, secret installation, deployment and remote acceptance are PENDING until factual evidence is recorded below. No deployment completion is inferred from this implementation checkpoint. Historical Worker a2e46a2 had 67 tests and prior isolated remote lifecycle acceptance; that is not new Pages proof.

## Safety boundaries

Pages will independently install the same current active owner token via private input; Worker secret presence does not prove Pages setup. Shared D1 fingerprint state means destructive credential rotation/revoke-all impacts both runtimes. Those regressions are tested in fresh isolated local D1; Pages remote acceptance generates/cancels its own pending candidate, expires/logs out only its own synthetic session and cleans only its own project.

No paid AI/search/sandbox/payment, public registration, custom domain, DNS or nameserver operations. Domain will be connected manually later by the owner. Public/paid launch remains NO-GO; live retrieval/inference, tenant identity, monitored alerts, backup restore/rollback rehearsal, sustained load, Daytona and Duitku remain NOT_TESTED/disabled.

## Release evidence

PENDING actual Pages output and remote verification. Final release will record exact source SHA, preview and production deployment IDs/returned URLs, actual runtime D1/secret verification, acceptance results, preservation checks and Git push proof here. See docs/24 for operator process and docs/27 for capability status.
