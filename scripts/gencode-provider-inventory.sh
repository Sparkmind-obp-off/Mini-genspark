#!/usr/bin/env bash
# Read-only account-specific model inventory using the official Genspark GenCode CLI.
# Does not submit a generation task or print environment secrets.
set -euo pipefail

if ! command -v gencode >/dev/null 2>&1; then
  cat >&2 <<'EOF'
GenCode CLI is not installed.
Install it from the official package:
  npm install -g @genspark/gencode
Then sign in:
  gencode login
EOF
  exit 127
fi

printf '\n== GenCode CLI version ==\n'
gencode --version

printf '\n== Models available to the authenticated Genspark account ==\n'
printf 'This is an account-level inventory. Model availability and credit costs can change.\n\n'
gencode models

printf '\n== Boundary ==\n'
printf 'A listed model is not proof of a public app-facing REST API.\n'
printf 'This script does not submit a generation request.\n'
