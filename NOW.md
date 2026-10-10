# NOW — VestrenHQ

**Current objective:** turn the workspace prototype into one trustworthy workflow that can be validated with real users.

- **Canonical repo:** Sparkmind-obp-off/Vestrenhq
- **Operating model:** GitHub branch/commit/push; no GitHub Actions; local QA + manual Cloudflare Wrangler release.
- **Selected sandbox:** Daytona; adapter must be verified in this canonical repository before Build claims real execution.
- **First market hypothesis:** evidence-backed research and work-product creation for solo operators, small teams, and builders.
- **Current release status:** private development; do not describe as production-ready or commercially validated.

## Next action
Run local typecheck, test, and build in a Node environment. Then inspect Cloudflare bindings and confirm the real D1 database ID before any remote deployment.

## Known gaps to verify
- Real search/retrieval in current Worker.
- Durable project/conversation persistence.
- Production identity/session and project authorization.
- Daytona adapter location/integration and real bounded smoke test.
- Artifact storage and access control.
- Real user interviews, repeat use, and paid pilot.

## Session close rule
Update this file with the latest commit, test results, deployed URL (if any), known gaps, and one next action. Never mark a task done without evidence.
