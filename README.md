# Marquee test shows

Generic test data for Marquee: small shows built from generated media — test patterns,
countdowns with burned-in frame numbers, colour fields, placeholder text — for automated
tests, and for devices that need a show to play without touching a live service.

## Rules for everything in this repository

- **Generic content only.** No client, sponsor, event or brand names; no real show codes; no
  live service URLs or hostnames; no internal identifiers.
- **Generated media and openly licensed fonts only.** Nothing is copied from a real show.
- **Never edited by hand.** A show is regenerated and committed. Git is how a show is recovered,
  compared or reset (`scripts/reset.sh`).
- **Tests copy a show before opening it.** Nothing opens a file here in place.

## Layout

| Path | What |
|---|---|
| `shows/<CODE>/` | One show. It is a Studio project folder and, file for file, what a Surface fetches: `_studio/Marquee.db` (the authoring database), `project.db` and one `<SURFACE>.db` per surface (published cartridges, format 25.0.1), and every media file and rendition at the root under its own name. |
| `shows/<CODE>/media.lock.json` | Every file of the show with its size and SHA-256. |
| `legacy/` | Two synthetic pre-v25 artifacts a v25 reader must refuse, and what it must say ([legacy/README.md](legacy/README.md)). |
| `scripts/` | The checks, and the scripts that reset and lock a checkout (below). |
| `.github/workflows/` | CI, and the Pages deploy of `shows/`. |

## On a device: the Pages URL is a cloud base

GitHub Pages serves `shows/` at

```
https://mountain-view-staging.github.io/marquee-test-shows/
```

which is a cloud base in the sense of the
[Marquee Cartridge Specification](https://github.com/Mountain-View-Staging/marquee-cartridge-spec):
every file is at `<base>/<CODE>/<file>` — `…/RIG26/project.db`, `…/RIG26/PORT1.db`, and each
media file under the name its manifest row or rendition row gives. Point a Surface's cloud base
at it, enter a show code, and pick a location. The names are immutable, every file carries its
size and hash in the cartridge, and the Surface verifies each one as it would from any origin.

The shows' event days are in the past, so a Surface runs its show clock on **Day 1 at the
venue's current time of day** (specification §8.2): a show plays around the clock, whenever it
is opened.

## The shows

### `RIG26` — the workhorse

Seven venue days, 2026-08-27 to 2026-09-02, `America/New_York`. 36 media files (26 stills, 10
clips) with 71 generated renditions, 24 items, three playlists, 1,151 directives, and one
session set with 28 sessions. Published: `project.db` (rev 1) and three surfaces.

| Surface | Locations | Lanes | What it exercises |
|---|---|---|---|
| `PORT1` (rev 2) | `PORT1-A` | portrait only: the Rotation | **Fetching by lane.** The cartridge lists 22 files; a portrait device needs 10, and the 12 files only a landscape slot names stay at the origin. |
| `TAKE1` (rev 2) | `TAKE1-A`, `TAKE1-B` | both: the Takeovers on each | **A heavily directed show**, 1,025 directives over seven days: two entries on a standing ON, a standard entry on the hour (on at :00, off at :50), takeovers at :10–:20 and :30–:40, each armed OFF before Day 1. Two installations sharing one cartridge. 12 files, 6 per lane. |
| `DEMO1` (rev 6) | `DEMO1-A` | landscape: the Rotation; portrait: the Mini player; DemoStation | **A DemoStation.** From before Day 1: a still background with a transparent overlay; from Day 2: a video background with an opaque overlay (landscape only — it covers the picture-in-picture, which is the case to warn about); demo off at 18:00 on Day 3; a still background alone from Day 4. The branding has both orientations except the opaque overlay. A DemoStation host needs all 32 files. |

`project.db` carries the two wallpapers (show and desktop, each with both orientations: 4 files).
The project's default backing (both orientations) rides in every surface cartridge.

**The Rotation** (18 entries): both-slot stills (PNG, JPEG, and a 3840 × 2160 HEIC), a
portrait-only and a landscape-only still, a square file in both slots holding 5 s, a WebP
original, an oversize still (5000 × 2813, over the 3840 px texture ceiling), a transparent lower
third over the default backing, the H.264 and HEVC countdowns, a 20 s loop with a landscape-only
window (2 → 12 s), a countdown trimmed 2.0 → 6.5 in both orientations, and the session board.
Fifteen entries are on a standing ON at 00:00 each day, one of them disabled (a Studio Player
flag no Surface sees); the last three have no directive at all and never play.

**The Takeovers** (5 entries) and **the Mini player** (3 portrait entries, standing ON each day).

**The session board, "Main room"**: four sessions a day for seven days (09:00, 10:30, 13:00 and
15:30, 45 minutes each), the schedule layout, a video backing in both orientations and a
transparent logo. Presenters carry an employer (`companyName`); attributes are indexed by id and
name (`SessionType` / `Session Type`, a repeated `Role`, `Track`); there is no Featuring attribute.

### `EDIT26` — the editor sample

One venue day, 2026-10-06, `America/Chicago`. The playlist **"TEST — Editor parity"** (playlist 2,
entries 2–13) — a still, a still holding 5 s, a still with a window, a countdown trimmed three
ways, the Studio Player's playback flags, an empty slot on each side:

| Row | Entry | Item | Window, both orientations | Studio Player flag |
|---|---|---|---|---|
| 1 | 2 | TEST — Bars | — (8 s default) | |
| 2 | 3 | TEST — Square (holds 5 s) | — (5 s display duration) | |
| 3 | 4 | TEST — Bars | 0 → 3 s | |
| 4 | 5 | TEST — Countdown 10 s | — | |
| 5 | 6 | TEST — Countdown 10 s | 2.0 → 6.5 s | |
| 6 | 7 | TEST — Countdown 10 s | 4 s → end | |
| 7 | 8 | TEST — Countdown 10 s | — | loop |
| 8 | 9 | TEST — Bars | — | pause on entry |
| 9 | 10 | TEST — Square (holds 5 s) | — | pause on completion |
| 10 | 11 | TEST — Lower third (alpha) — landscape only | — | disabled |
| 11 | 12 | TEST — Bars (portrait only) | — | |
| 12 | 13 | TEST — Countdown HEVC — landscape only | — | |

The directives are all on row 4 (entry 5), on 2026-10-06: a standard ON at 8:00 AM, a takeover
ON at 12:00 PM and a takeover OFF at 12:30 PM. So at 11:00 AM in portrait row 4 is on screen
("on since 8:00 AM"), nine rows have no directive yet, and rows 10 and 12 have no portrait file;
at 12:10 PM row 4 is the takeover until 12:30 PM.

Studio's rail reads the running starts **0, 8, 13, 16, 26, 30.5, 36.5, 46.5, 54.5, —, 59.5, —**
in portrait and **0, 8, 13, 16, 26, 30.5, 36.5, 46.5, 54.5, —, —, 59.5** in landscape.

The surface `EDIT1` (location `EDIT1-A`) schedules the playlist on both lanes, so a device can
play the sample: 7 files, 3 for the portrait lane and 5 for the landscape one.

### `legacy/`

`pre-v25-surface.db` is refused with `column_missing`, `pre-v25-project.db` with `not_v25`.

## The media

Every pixel is drawn by the generator; no font file is shipped (text is drawn into the pixels).

- **Stills:** PNG (opaque, and with alpha), JPEG, HEIC, WebP. Opaque stills carry no alpha
  channel, so a reader that asks a file's header whether it has transparency gets the truth.
- **Clips:** H.264 and HEVC in MP4, 30 fps, silent, a keyframe every second. Every frame carries
  its index twice: as a barcode along the top edge — 20 blocks of 48 × 48 px, centred: two sync
  blocks (white, black), 16 bits most significant first (white is 1), two sync blocks (black,
  white) — and as the text `frame NNN · SS.SS s`, so a test can read the frame on screen from
  pixels or by OCR. Countdowns step their colour each second, so a cut on a second shows.
- **Renditions:** every file has its `original`. Most also have an `optimized` rendition (HEIC
  for stills, HEVC for clips) and a `webOptimized` one (JPEG stills with the long edge at most
  1920 px, H.264 clips at most 1080p); a PNG with alpha and a WebP original have no web rendition
  (they are web-ready as they are), and some clips have a `wifiOptimized` HEVC rung. In `EDIT26`
  the H.264 countdowns have no `optimized` rendition, as in the sample they reproduce.
- **No style book.** Boards draw on each platform's baseline design.

## Using a show in a test

- **Copy, then open.** Copy the show's folder (or `sqlite3 … ".backup …"` its database) and
  open the copy. `scripts/lock.sh` makes the authoring databases read-only on disk, so nothing
  opens one here by mistake; `scripts/lock.sh --unlock` undoes it.
- **Reset:** `scripts/reset.sh` puts `shows/` and `legacy/` back exactly as committed.
- The authoring databases are at the schema's newest migration, committed in rollback-journal
  mode with no WAL; Studio switches a copy to WAL when it opens it.
- **Look things up by code, name or id — never by file name.** Media file names are minted at
  import, so every regeneration renames every file.

## Checks

| Script | Runs in | What |
|---|---|---|
| `python3 scripts/leak-scan.py` | CI, and before the Pages deploy | Every file, binary media included (as its printable strings): no live host, machine path, brand name, code-shaped token or internal id. |
| `scripts/verify.sh` | CI, and before the Pages deploy | Every `media.lock.json` against its folder: each file at its size and SHA-256, nothing unlisted. |
| `scripts/budget.sh` | CI | Every file under 20 MB; the repository under 80 MB. |
| `node --no-warnings scripts/load-cartridges.mjs --engine <spec>/engine/dist/node.js` | CI, against the specification at `9285b01` | Every cartridge loads in the reference engine's Loader with no warning; every file a cartridge names verifies; `legacy/` is refused with the expected codes. |

## Regenerating

The shows are generated by a tool kept outside this repository — through the same data layer
Studio writes with, from the migrator to the cartridge writer — and committed. Never edit a
show by hand: regenerate, run the checks, commit. A regeneration renames every media file and
re-encodes every clip, and the lock files change with them.
