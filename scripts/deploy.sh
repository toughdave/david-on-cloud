#!/usr/bin/env bash
# Porkbun GitHub Connect deploys the repository's main branch.
set -euo pipefail
cd "$(dirname "$0")/.."
DRY_RUN=0
case "${1:-}" in
    --dry-run|-d) DRY_RUN=1 ;;
    --help|-h) echo 'Usage: bash scripts/deploy.sh [--dry-run]'; exit 0 ;;
    '') ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
esac
npm run build
if [[ "$DRY_RUN" == 1 ]]; then
    echo 'Build and checks passed. No deployment was requested.'
    exit 0
fi
[[ "$(git branch --show-current)" == main ]] || { echo 'Switch to main before publishing.' >&2; exit 1; }
git diff --quiet && git diff --cached --quiet || { echo 'Commit the reviewed site and generated CSS before publishing.' >&2; exit 1; }
git fetch origin main
git merge-base --is-ancestor origin/main HEAD || { echo 'Remote main has changes; integrate and test them first.' >&2; exit 1; }
git push origin HEAD:refs/heads/main
echo 'Sent to GitHub. Porkbun will deploy this commit; checking the public site...'
node scripts/check-live.js
