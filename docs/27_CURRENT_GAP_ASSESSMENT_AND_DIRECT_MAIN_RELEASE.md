# VestrenHQ — NEW Pages release gap assessment

Updated 2026-10-10. Current authoritative scope: docs/29 and docs/30, new Pages/default pages.dev, no custom domain. Direct main, no PR/feature branch/force push/Actions. Old Worker URL is reference only.

## Audit / selection

Latest upstream main `bc00f2b` normal-merged; connected BYOK account verified. Inventoried Pages and D1 before mutation. New project `vestrenhq-private` created, ID `8f0c8bd1-c5fb-4dc1-9e59-87062552e16a`. Worker `vestrenhq-private-preview`, legacy Pages `vestren-workbench` and its DB are preserved.

REUSED database `vestrenhq-private-preview`, `86787a64-0479-4ee6-96ca-5e9387a9b781`: actual Worker binding ID, D1 metadata, required columns and exact migration ledger 0001–0004 verified through Cloudflare APIs. No raw migration replay or database creation/deletion. Legacy DB `21921969-a688-4e56-9662-17d0bf34e657` never bound. Initial business record counts zero; synthetic acceptance data only.

## Current status at implementation checkpoint

| Area | Status | Evidence / next gate |
|---|---|---|
| New Pages project | IMPLEMENTED | Cloudflare creation returned new name/ID; main production branch |
| Pages owner secret | CONFIGURED | Separate private stdin installation to production and preview; secret type/name read-only API; login proof pending |
| Pages adapter | IMPLEMENTED / TESTED local | Thin EventContext adapter reuses shared backend; real Pages dev/browser workflow |
| D1 schema | VERIFIED remote | Name/ID/Worker binding/columns/exact four migration names queried; preservation counts |
| Pages runtime D1 binding | PENDING remote | Local config is not enough; actual deployment API and synthetic runtime write/read query required |
| QA | TESTED | 71 tests/5 files, typecheck/build/QA/audit; actual local Pages browser workflow passed |
| Packaging | TESTED local | Correct module directory `_worker.js/index.js`, generated routes all paths, node syntax check and real Pages dev |
| Actual Pages deploy/remote acceptance | PENDING | Do not substitute old Worker evidence; NOW.md will record returned IDs/URLs/SHA |
| Custom domain/DNS | INTENTIONALLY NOT DONE | Owner will connect later; not a blocker and no current-task zone/DNS operations |
| Public/paid launch | NO-GO | Tenant identity, legal/support/market evidence, vendor/free-only proof and operations still missing |

## Failures found and repaired

New D1 adapter fixture omitted JSON Content-Type, correctly rejected 415; fixed fixture, did not weaken validation. Wrangler deprecated Functions `--outfile` produced multipart, rejected by Pages dev; switched to module-directory `--outdir` and actual runtime verified. Pages cloud config validation rejected Worker-only `account_id`; removed from Pages configuration and retained verified account selection in operator-only checks. First owner secret command failed before writing due to that config error; later independent production/preview installations succeeded. None was hidden or mislabeled PASS.

## Safety / remaining limits

Shared D1 uses one global owner credential lifecycle. Both runtimes initially use the same securely transferred active token; host cookies differ but projects, audit, quotas and fingerprint state are shared. Active rotation/revocation/revoke-all remotely would affect existing owner access. Local isolated D1 regressions cover those behaviors; current Pages remote smoke intentionally does not repeat destructive lifecycle operations. It generates/cancels its own pending credential and expires/logs out its own synthetic session. Historical isolated Worker rotation/recovery acceptance remains historical, not Pages live proof.

Source/client/server bundle/Git/ordinary remote audit/verifier secret scans are scoped checks, not universal platform telemetry guarantees. Pages platform log sampling, actual cloud restore/rollback rehearsal, sustained Free CPU measurement, all-browser/screen-reader proof and monitored alerts remain NOT_TESTED. Manual evidence is supplied-not-retrieved and not AI. Daytona direction preserved without E2B substitution; Duitku/payments/providers disabled. No automatic infrastructure deployment added.
