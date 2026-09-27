#!/usr/bin/env bash
# Makes every show's authoring database read-only on disk, so a Studio pointed at this
# checkout by mistake cannot migrate one in place (a test copies a show; it never opens one
# here). Git does not record the mode, so run this after a clone or a reset.
#
#   scripts/lock.sh            the databases read-only
#   scripts/lock.sh --unlock   writable again
set -euo pipefail
cd "$(dirname "$0")/.."
mode=a-w
[ "${1:-}" = "--unlock" ] && mode=u+w
count=0
while IFS= read -r -d '' db; do
    chmod "$mode" "$db"
    count=$((count + 1))
done < <(find shows -path '*/_studio/Marquee.db' -type f -print0)
if [ "$mode" = a-w ]; then
    echo "$count authoring database(s) read-only"
else
    echo "$count authoring database(s) writable"
fi
