# Marquee test shows

Generic test data for Marquee: small shows built from generated media — test patterns,
countdowns with burned-in frame numbers, colour fields, placeholder text — and one generic
style book in an openly licensed typeface, for automated tests, and for devices that need a
show to play without touching a live service.

## Rules for everything in this repository

- **Generic content only.** No client, sponsor, event or brand names; no real show codes; no
  live service URLs or hostnames; no internal identifiers.
- **Generated media, and Inter 4.1 under the SIL Open Font License 1.1, whose licence is in
  `LICENSES/`.** Nothing is copied from a real show.
- **Never edited by hand.** A show is regenerated and committed. Git is how a show is recovered,
  compared or reset (`scripts/reset.sh`).
- **Tests copy a show before opening it.** Nothing opens a file here in place.

## Layout

| Path | What |
|---|---|
| `shows/<CODE>/` | One show. It is a Studio project folder and, file for file, what a Surface fetches: `_studio/Marquee.db` (the authoring database), `project.db` and one `<SURFACE>.db` per surface (published cartridges, format 25.0.1), and every media file and rendition at the root under its own name. |
| `shows/<CODE>/media.lock.json` | Every file of the show with its size and SHA-256. |
| `brands/<company>/<style>/<version>/` | A style book as a brand portal publishes one, in the Marquee Branding Specification's §7.2 layout: `style.json`, `fonts/apple/*.otf`, `fonts/web/*.woff2`, `assets/…`. A stand-in portal for import tests; `BRAND26` imports it. One today: `example/example-2026/1`. |
| `brands/media.lock.json` | Every file under `brands/` with its size and SHA-256. |
| `LICENSES/` | The licences of what this repository ships under a licence other than its own: `Inter-OFL-1.1.txt`. |
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

Every surface has **one schedule**, whatever the orientation (specification §5.1): a device plays
the scheduled playlist with the files of the orientation it renders, so a lane is simply one
orientation over that schedule.

| Surface | Locations | Schedule | What it exercises |
|---|---|---|---|
| `PORT1` (rev 2) | `PORT1-A` (a portrait sign) | the Rotation | **Fetching by lane.** The cartridge lists 22 files; a portrait device needs 10, and the 12 files only a landscape slot names stay at the origin (a landscape device needs 14). |
| `TAKE1` (rev 1) | `TAKE1-A`, `TAKE1-B` | the Takeovers | **A heavily directed show**, 1,025 directives over seven days: two entries on a standing ON, a standard entry on the hour (on at :00, off at :50), takeovers at :10–:20 and :30–:40, each armed OFF before Day 1. Two installations sharing one cartridge. 12 files, 6 per lane. |
| `DEMO1` (rev 5) | `DEMO1-A` | the Rotation; DemoStation | **A DemoStation.** While a demo is on, its picture-in-picture plays the same Rotation with the other orientation's files. From before Day 1: a still background with a transparent overlay; from Day 2: a video background with an opaque overlay (landscape only — it covers the picture-in-picture, which is the case to warn about); demo off at 18:00 on Day 3; a still background alone from Day 4. The branding has both orientations except the opaque overlay. 29 files: a portrait device needs 13 and a landscape one 18, and a DemoStation host of either orientation all 29. |

`project.db` carries the two wallpapers (show and desktop, each with both orientations: 4 files).
The project's default backing (both orientations) rides in every surface cartridge.

**The Rotation** (18 entries): both-slot stills (PNG, JPEG, and a 3840 × 2160 HEIC), a
portrait-only and a landscape-only still, a square file in both slots holding 5 s, a WebP
original, an oversize still (5000 × 2813, over the 3840 px texture ceiling), a transparent lower
third over the default backing, the H.264 and HEVC countdowns, a 20 s loop with a landscape-only
window (2 → 12 s), a countdown trimmed 2.0 → 6.5 in both orientations, and the session board.
Fifteen entries are on a standing ON at 00:00 each day, one of them disabled (a Studio Player
flag no Surface sees); the last three have no directive at all and never play.

**The Takeovers** (5 entries). **The Mini player** (3 portrait entries, standing ON each day)
is scheduled nowhere: a DemoStation's picture-in-picture is the surface's own rotation, so no
cartridge carries it.

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

The surface `EDIT1` (location `EDIT1-A`) schedules the playlist, so a device of either
orientation can play the sample: 7 files, 3 for the portrait lane and 5 for the landscape one.

### `BRAND26` — the branded show

Two venue days, 2026-09-14 and 2026-09-15, `America/Los_Angeles`. The style book
[`example/example-2026/1`](#the-style-book-exampleexample-20261) imported the way Studio imports
one — every face of every platform as ordinary media, `style.json` rewritten to the names the faces
were delivered under and imported itself, every item marked with the style's address, the
project's reference recorded — and one room's session board, in both layouts, dressed in it.

| | |
|---|---|
| **Media** | 16 files: 13 **brand members** (6 `font/otf`, 6 `font/woff2`, the delivered `style.json`) and 3 assets selected from the style's catalogue (the backing in both orientations, the mark), each the portal's file byte for byte. 5 generated renditions (HEIC `optimized` for all three assets, JPEG `webOptimized` for the two backings; the mark, a PNG with alpha, has none). |
| **Sessions** | 48: one on every hour of both days, 45 minutes each, in one room ("Main hall"). Titles of every length, with accents, an en dash, an ampersand and a curly apostrophe; the two breaks name no presenter. Whenever a Surface opens the show, a session is on or starts within 15 minutes. |
| **Boards** | Two session sets over the same sessions: `["schedule"]` and `["now-next"]`, both named for the room, both with the style's backing and mark. The playlist **"Boards"** holds both, on from 00:00 of each day. |
| **Published** | `project.db` (rev 1): no files — the style book rides in the surface cartridge, and `project.db` keeps only the address. `BRAND1.db` (rev 1), location `BRAND1-A`, the Boards on its one schedule: 16 files, 21 renditions. |

**Files per lane:** a portrait device fetches **15** of `BRAND1.db`'s 16 files (the 13 brand members,
the portrait backing, the mark), and a landscape device 15 (the landscape backing instead). **Brand
members per platform:** 6 Apple faces and 6 web faces plus the `style.json` — all 13 in every lane,
because a cartridge carries every platform's faces and each client registers its own.

Finding them: the project's `brand_style` is `example/example-2026/1` and its `brand_style_item_id`
names the item **"Style book — example/example-2026/1"**, whose file is the delivered `style.json`.
Each face is an item named for its file (`Inter-Regular.otf`, `Inter-Regular.woff2`, …) with that
file in its portrait slot, and every member carries `brand_member = example/example-2026/1`. The
delivered `style.json` is the portal's book with each font path renamed to its deliverable name,
serialized as Apple's `JSONSerialization` writes it (sorted keys, `"key" : value`, no trailing
newline). Its `assets` still name the portal's paths (`assets/…`): an import delivers faces; the
backing and mark reach the board as the session sets' ordinary media.

### The style book `example/example-2026/1`

`brands/example/example-2026/1/` is what a brand portal would publish: its `style.json` is the
bytes `JSON.stringify` writes, as a portal publishes a version. Format 1.1; displayName
"Example 2026".

- **Faces:** Inter 4.1 — family `Inter`, cssFamily `Inter`. The table: up to 449 `Inter-Regular`,
  italic `Inter-Italic`; up to 649 `Inter-SemiBold`, `italic: null` (the family's declared gap);
  up to 1000 `Inter-Bold`, italic `Inter-BoldItalic`. The display face, used by name, is
  `InterDisplay-Black`. `fonts/apple/` holds the release's own OTF source files and
  `fonts/web/` its own WOFF2 builds, unmodified. Every file carries the PostScript name of the
  face it is named for, in both formats.
- **Measured, not assumed:** `tabularFigures` is `"tnum"` — every face has nine distinct digit
  advances, and its `tnum` feature sets all ten to one width. `lineHeight` is `1.21` — every face's
  natural height is 2478/2048 = 1.2099609375 em (`hhea`, OS/2 typo and OS/2 win agree), rounded up
  to four places.
- **Colour:** palette primary `#2E9BFF`, secondary `#122B5C`, tertiary `#FFB547`, quaternary
  `#5E7188`. Text: onLight `#0D1A30` (17.4:1 on white), onDark `#F7F9FC` (19.9:1 on black),
  mutedOnLight `#4F5B6E`. The primary is a brand colour and not a text colour (2.9:1 on white).
  `onDark` is deliberately not pure white, so a client that renders its own fallback instead of the
  declared value shows it; `mutedOnDark` is deliberately absent, so a client derives it (30 %
  toward onLight: `#B1B6BF`).
- **Assets:** `backing-portrait` (2160 × 3840) and `backing-landscape` (3840 × 2160), JPEG, a dark
  plate; `mark-white` (800 × 240), a transparent PNG drawn in the style's display face. Over both
  backings, in every row band, `text.onDark` reads at least 9.6:1 and `text.onLight` at most
  1.4:1, so a client measuring them picks the dark variant; neither needs a scrim.
- **Licence block:** holder "Example Co", agreement "EXAMPLE-0001", scope "test signage, all
  platforms" — placeholders. The faces' real licence is the OFL, below.

The Inter font files — the twelve under `brands/example/example-2026/1/fonts/`, and the same
twelve under the names BRAND26 delivered them as (its `font/otf` and `font/woff2` files) — are the
Inter Project's, under the SIL Open Font License 1.1 ([`LICENSES/Inter-OFL-1.1.txt`](LICENSES/Inter-OFL-1.1.txt)),
not under this repository's licence.

### `legacy/`

`pre-v25-surface.db` is refused with `column_missing`, `pre-v25-project.db` with `not_v25`.

## The media

Every pixel is drawn by the generator (text is drawn into the pixels): the shows' media in the
system's own face, the style book's mark in Inter.

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
- **Style book:** only `BRAND26` carries one. `RIG26`'s and `EDIT26`'s boards draw on each
  platform's baseline design.

## Using a show in a test

- **Copy, then open.** Copy the show's folder (or `sqlite3 … ".backup …"` its database) and
  open the copy. `scripts/lock.sh` makes the authoring databases read-only on disk, so nothing
  opens one here by mistake; `scripts/lock.sh --unlock` undoes it. A copy keeps the file's mode
  (`cp`, `FileManager.copyItem` and Node's `copyFileSync` alike), so a copy of a locked
  database must be made writable (`chmod u+w`) before Studio's data layer can open it; a
  `sqlite3 ".backup"` copy is writable already. A fresh clone is unlocked.
- **A style book is imported from a copy too.** Copy `brands/example/example-2026/1/` (or read
  it) as a portal's version folder: `style.json` plus the files it names. Nothing writes there.
- **Reset:** `scripts/reset.sh` puts `shows/`, `brands/` and `legacy/` back exactly as committed.
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
| `node --no-warnings scripts/load-cartridges.mjs --engine <spec>/engine/dist/node.js` | CI, against the specification at `a34e6d2` | Every cartridge loads in the reference engine's Loader with no warning; every file a cartridge names verifies; a cartridge that names a style book carries every face its `style.json` declares, in every lane; `legacy/` is refused with the expected codes. |

## Regenerating

The shows are generated by a tool kept outside this repository — through the same data layer
Studio writes with, from the migrator to the cartridge writer — and committed. Never edit a
show by hand: regenerate, run the checks, commit. A regeneration renames every media file and
re-encodes every clip, and the lock files change with them. A show can be regenerated alone —
`BRAND26` with the style book it imports — leaving every other show, and its lock, as it was.
The style book itself regenerates byte for byte: a published version never changes its files.
