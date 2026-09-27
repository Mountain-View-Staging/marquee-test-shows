#!/usr/bin/env bash
# Checks every media.lock.json against its folder: each locked file present at its size and
# SHA-256, and no file the lock does not name (within the lock's scope: "*" is every file
# in the folder, ".db" only those). Exits non-zero on the first folder that disagrees,
# after listing every difference. Needs python3 and nothing else.
set -euo pipefail
cd "$(dirname "$0")/.."

python3 - <<'PY'
import hashlib, json, os, sys

def entries(folder, scope):
    out = {}
    for base, dirs, files in os.walk(folder):
        dirs[:] = [d for d in dirs if not d.startswith('.git')]
        for name in files:
            path = os.path.join(base, name)
            rel = os.path.relpath(path, folder)
            if rel == 'media.lock.json' or name == '.DS_Store':
                continue
            if scope != '*' and not rel.endswith(scope):
                continue
            digest = hashlib.sha256()
            with open(path, 'rb') as f:
                for chunk in iter(lambda: f.read(1 << 20), b''):
                    digest.update(chunk)
            out[rel] = (os.path.getsize(path), digest.hexdigest())
    return out

locks = sorted(os.path.join(base, 'media.lock.json')
               for base, dirs, files in os.walk('.')
               if 'media.lock.json' in files and not base.startswith('./.git'))
if not locks:
    sys.exit('verify: no media.lock.json found')
failed = False
for lock_path in locks:
    folder = os.path.dirname(lock_path)
    with open(lock_path) as f:
        lock = json.load(f)
    actual = entries(folder, lock.get('scope', '*'))
    problems = []
    for entry in lock['files']:
        found = actual.get(entry['name'])
        if found is None:
            problems.append(f"missing: {entry['name']}")
        elif found[0] != entry['size']:
            problems.append(f"size: {entry['name']} is {found[0]}, locked {entry['size']}")
        elif found[1] != entry['sha256']:
            problems.append(f"hash: {entry['name']} differs from the lock")
    locked = {e['name'] for e in lock['files']}
    problems += [f'not in the lock: {name}' for name in sorted(actual) if name not in locked]
    total = sum(e['size'] for e in lock['files'])
    if problems:
        failed = True
        print(f"✗ {folder}: {len(problems)} difference(s)")
        for p in problems:
            print(f'    {p}')
    else:
        print(f"✓ {folder}: {len(lock['files'])} files, {total:,} bytes, as locked")
sys.exit(1 if failed else 0)
PY
