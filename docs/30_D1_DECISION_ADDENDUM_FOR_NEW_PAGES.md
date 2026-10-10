# Addendum — D1 Database Decision for the New VestrenHQ Pages Project

This addendum clarifies and overrides any ambiguity in the database instructions in document `docs/29_MASTER_PROMPT_NEW_PAGES_PROJECT_NO_CUSTOM_DOMAIN.md`.

## Owner's decision

The owner believes a D1 database may already exist. You must verify it. If a correct dedicated VestrenHQ D1 exists and its schema/migration ledger is compatible, reuse it. If it does not exist, cannot be identified confidently, is incompatible, or access cannot verify that it is the right database, create a NEW dedicated D1 database for the NEW Pages project and configure that project to use it.

Do not ask the owner to create the database manually. Do not make database uncertainty a reason to stop the deployment.

## Required safe procedure

1. Inspect the connected Cloudflare account's available D1 databases and the repository's Wrangler configuration and migrations.
2. Identify the database currently used by the existing VestrenHQ Worker, if accessible. Verify its actual name, identifier, expected schema, and migration ledger without exposing secrets.
3. Never use the D1 database associated with the legacy `vestren-workbench` project.
4. If the existing VestrenHQ D1 is confidently identified and schema-compatible, reuse it; preserve its data and avoid rerunning already-applied migrations.
5. If no suitable database can be verified, create a new dedicated D1 database with a distinct name such as `vestrenhq-pages` (confirm the name is unused first). Configure the NEW Pages project's D1 binding to that actual database ID.
6. Apply the repository's migrations to the selected database in order, checking the remote migration ledger first. Ensure migrations are compatible with both an empty new database and the chosen deployment code. Do not blindly rerun non-idempotent migrations.
7. Validate the actual Pages Functions runtime binding and perform safe remote read/write tests using synthetic acceptance data.
8. If a new database is created, do not delete the previous D1 or migrate/delete existing records without an explicit data migration plan. If the old database contains required owner data, determine a safe non-destructive way to preserve access and clearly document which database the new Pages project uses.
9. Record the selected database name/ID (IDs are not secrets), schema/migration status, and proof that the Pages runtime uses the intended binding.

## Completion requirement

The NEW Pages deployment must have a verified, functioning D1 binding. Report whether the existing D1 was reused or a new one was created. Do not say “D1 configured” merely because a local configuration file contains a database ID; verify the real Pages environment.

Proceed with the new Pages project and default `pages.dev` deployment regardless of whether reuse or creation is required. Do not touch the custom domain or DNS; the owner will connect `vestren.biz.id` manually.
