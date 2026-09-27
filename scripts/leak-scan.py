#!/usr/bin/env python3
"""The leak scan for this PUBLIC repository.

    python3 scripts/leak-scan.py

Every file is scanned, binary media included: text files line by line, every other file as
its printable strings (like `strings -a -n 4`). A match fails the scan. What is refused:

- live service hosts, and machine paths (a file must never carry where it was made);
- the shapes real show and screen codes take, and internal record ids — in text and in
  database strings only: random compressed bytes can spell a short code, so media are held
  to the longer literals;
- the real show codes, event names and brand names this project has met. They are listed as SHA-256
  digests, not as text, so that this file does not publish what it guards against. A match
  is reported by position and length, never by its text (CI logs are public too).

This file is the one place the patterns live, and the scan skips it.
"""
import hashlib
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SELF = os.path.relpath(os.path.abspath(__file__), ROOT)

# Literal text anywhere, any case: hosts and machine paths.
LITERALS = re.compile(
    r"mvsmarquee|r2\.dev|workers\.dev|amazonaws|cloudflarestorage|"
    r"/Volumes/|/Users/|/private/(?:var|tmp)/|file:///",
    re.IGNORECASE)

# Shapes of real codes and internal ids, case-sensitive — text and database strings only.
SHAPES = re.compile(
    r"\b(?:DF[0-9]{2,4}[A-Z]*|TBF[0-9]+|RG[0-9]+|SKO[0-9]+)\b|\bAB-[A-Z]-[0-9]{4}\b")

# SHA-256 of the lowercased token, and its length. `exact`: a whole run of letters and
# digits; `inside`: anywhere within one (the longer ones, which cannot occur by chance).
DIGESTS = {
    "9ed74a0838614f73bbb91cf4e5ab52a7af02d18b064e26fec0d194274e99c422": (4, "exact"),
    "7cecbe186d838cb272829496d29ffafa5afc46e1d9b87f85a9473f1d7b60b3df": (3, "exact"),
    "adad24cb2d1632e8c9a67891a6d9ba5a43f37930979a8235eeeb1c15b61f4319": (3, "exact"),
    "808beda98ad925f55141453a512645b8f3b78069503830bfb05655e08e56508e": (3, "exact"),
    "7494995664fd5bffa3eb63c4b731801c28bdb24effd9610736de9625de6606e8": (10, "inside"),
    "8af42a6e29fb80ebe0898079cc9476d88d0aafb37351a1dcc67e9b935dac7c23": (8, "inside"),
    "7abe55ee56dc7d37e97855ca497dcd3065bda1eaaefeb8c45353d584e9e3a893": (7, "inside"),
    "8972ef2d9fa4861c2c8aae088806c536b5669d2eabc5b596f9418dfd62969eb4": (8, "inside"),
    "45135e28ac3348c286e27e9f95c2ad653ab3bd5faa18b14e0ee56816b6df0398": (8, "inside"),
    "0fb6101d02816fc0340db3d12cdc1ad76bca2c28adff214ac02d9ca58e69f34e": (10, "inside"),
    "3ccbd9105a45d8fcd4a0101c6532c599f6f59cfa4d4ce378792f547a869a4bea": (10, "inside"),
    "b5738c169b693bee89e1b74ebd48e0dfa53a34e8571790b7727721a0bfadc470": (10, "inside"),
}
EXACT = {d for d, (_, mode) in DIGESTS.items() if mode == "exact"}
INSIDE_LENGTHS = sorted({n for n, mode in DIGESTS.values() if mode == "inside"})
INSIDE = {d for d, (_, mode) in DIGESTS.items() if mode == "inside"}

TEXT_SUFFIXES = {".md", ".json", ".yml", ".yaml", ".sh", ".py", ".mjs", ".js", ".txt", ".html", ".css"}
TEXT_NAMES = {".gitignore", ".gitattributes", "LICENSE"}
DATABASE_SUFFIXES = {".db"}
RUN = re.compile(rb"[\x20-\x7e]{4,}")
TOKEN = re.compile(r"[A-Za-z0-9]+")


def digest(text):
    return hashlib.sha256(text.encode()).hexdigest()


def digests_in(text, exact):
    """Positions of banned tokens in `text`: (column, length)."""
    found = []
    for token in TOKEN.finditer(text):
        word = token.group(0).lower()
        if exact and digest(word) in EXACT:
            found.append((token.start(), len(word)))
        for n in INSIDE_LENGTHS:
            for i in range(0, len(word) - n + 1):
                if digest(word[i:i + n]) in INSIDE:
                    found.append((token.start() + i, n))
    return found


def scan_line(where, line, full):
    hits = []
    for m in LITERALS.finditer(line):
        hits.append(f"{where}: a banned literal ({len(m.group(0))} chars) at column {m.start() + 1}")
    if full:
        for m in SHAPES.finditer(line):
            hits.append(f"{where}: a code-shaped token ({len(m.group(0))} chars) at column {m.start() + 1}")
    for column, length in digests_in(line, exact=full):
        hits.append(f"{where}: a listed code or name ({length} chars) at column {column + 1}")
    return hits


def main():
    hits, scanned = [], 0
    for base, dirs, files in os.walk(ROOT):
        dirs[:] = sorted(d for d in dirs if d not in (".git", "node_modules"))
        for name in sorted(files):
            path = os.path.join(base, name)
            rel = os.path.relpath(path, ROOT)
            # In a git worktree `.git` is a FILE naming its gitdir (a machine path). Git never
            # tracks a path called `.git`, so it is never published; a clone has a directory.
            if rel == SELF or name in (".DS_Store", ".git"):
                continue
            scanned += 1
            hits += scan_line(f"{rel} (its path)", rel, full=True)
            suffix = os.path.splitext(name)[1].lower()
            with open(path, "rb") as f:
                data = f.read()
            if suffix in TEXT_SUFFIXES or name in TEXT_NAMES:
                for number, line in enumerate(data.decode("utf-8", errors="replace").splitlines(), 1):
                    hits += scan_line(f"{rel}:{number}", line, full=True)
            else:
                full = suffix in DATABASE_SUFFIXES
                for run in RUN.finditer(data):
                    hits += scan_line(f"{rel} @{run.start()}", run.group(0).decode("ascii"), full=full)
    for hit in hits:
        print(f"✗ {hit}")
    if hits:
        print(f"leak scan: {len(hits)} finding(s) in {scanned} files — nothing above may be published")
        return 1
    print(f"leak scan: clean ({scanned} files, binary media included)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
