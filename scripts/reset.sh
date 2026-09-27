#!/usr/bin/env bash
# Puts shows/, brands/ and legacy/ back exactly as committed: every tracked file restored, and
# every file a test left behind (a -wal, a -shm, a copy, a new cartridge) removed. Read-only
# databases (scripts/lock.sh) are replaced like any other file.
set -euo pipefail
cd "$(dirname "$0")/.."
git restore --source=HEAD --staged --worktree -- shows brands legacy
git clean -fdq -- shows brands legacy
echo "shows/, brands/ and legacy/ are as committed"
