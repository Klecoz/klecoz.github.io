#!/usr/bin/env bash
#
# Push, then make sure exactly one deploy run exists for the commit just pushed.
#
# This used to be `git push && gh workflow run deploy.yml --ref master`. That
# raced: `--ref master` resolves the branch server-side, and if it lands before
# GitHub registers the push it dispatches a run for the *previous* commit. On
# 2026-08-07 that published a stale build with every check green.
#
# Push events create runs again now, so the dispatch is only a fallback for the
# window where they were silent (see README). Dispatching after confirming no
# push-triggered run appeared can't race, because the push has already landed.

set -euo pipefail

branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$branch" != "master" ]; then
  echo "On '$branch', not master. Deploys publish master only." >&2
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree is dirty — commit or stash before deploying." >&2
  exit 1
fi

git push origin master
sha=$(git rev-parse HEAD)
short=${sha:0:7}

# Wait for the push-triggered run rather than assuming it. When push events
# were broken this loop is what falls through to the dispatch.
echo "Waiting for a deploy run for $short..."
for _ in $(seq 1 10); do
  if [ -n "$(gh run list --workflow=deploy.yml --commit "$sha" --limit 1 --json databaseId --jq '.[0].databaseId // empty')" ]; then
    echo "Push triggered a run for $short."
    echo "Watch it with: gh run watch"
    exit 0
  fi
  sleep 3
done

echo "No push-triggered run after 30s — dispatching explicitly."
gh workflow run deploy.yml --ref master
echo "Watch it with: gh run watch"
