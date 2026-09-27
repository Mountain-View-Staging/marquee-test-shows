#!/usr/bin/env bash
# The size budget: every file under 20 MB, the whole repository (its history aside) under
# 80 MB. A show that outgrows it is regenerated smaller, never moved to LFS.
set -euo pipefail
cd "$(dirname "$0")/.."

python3 - <<'PY'
import os, sys
FILE_LIMIT = 20 * 1000 * 1000
TOTAL_LIMIT = 80 * 1000 * 1000
total, largest, over = 0, (0, ''), []
for base, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d != '.git']
    for name in files:
        path = os.path.join(base, name)
        size = os.path.getsize(path)
        total += size
        largest = max(largest, (size, path))
        if size >= FILE_LIMIT:
            over.append(f'{path}: {size:,} bytes')
print(f'repository: {total:,} bytes (limit {TOTAL_LIMIT:,}); largest file {largest[1]} at {largest[0]:,} bytes (limit {FILE_LIMIT:,})')
for line in over:
    print(f'✗ {line}')
if total >= TOTAL_LIMIT:
    print('✗ the repository is over its budget')
sys.exit(1 if over or total >= TOTAL_LIMIT else 0)
PY
