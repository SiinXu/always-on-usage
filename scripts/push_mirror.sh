#!/usr/bin/env bash
# Publish dist-mirror/ to the gh-pages branch (GitHub Pages mirror). Used by CI; safe to run locally.
set -euo pipefail
[ -f dist-mirror/index.html ] || { echo "dist-mirror missing: run node scripts/mk_mirror.mjs"; exit 1; }
SHA=$(git rev-parse --short HEAD)
rm -rf .mirror-wt && git fetch -q origin gh-pages && git worktree add -q -f .mirror-wt origin/gh-pages
( cd .mirror-wt && git rm -rq --ignore-unmatch . >/dev/null && cp -a ../dist-mirror/. . && git add -A \
  && if git diff --cached --quiet; then echo "mirror unchanged"; else git -c user.name="${GIT_AUTHOR_NAME:-github-actions[bot]}" -c user.email="${GIT_AUTHOR_EMAIL:-41898283+github-actions[bot]@users.noreply.github.com}" commit -qm "mirror: rebuild from master ${SHA}" && git push -q origin HEAD:gh-pages && echo "mirror pushed"; fi )
git worktree remove -f .mirror-wt
