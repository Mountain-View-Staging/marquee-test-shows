# Marquee test shows

Generic test data for Marquee: small shows built from generated media — test patterns,
countdowns with burned-in frame numbers, colour fields, placeholder text — for automated
tests, and for devices that need a show to play without touching a live service.

## Rules for everything in this repository

- **Generic content only.** No client, sponsor, event or brand names; no real show codes; no
  live service URLs or hostnames; no internal identifiers.
- **Generated media and openly licensed fonts only.** Nothing is copied from a real show.
- **Never edited by hand.** A show is regenerated and committed. Git is how a show is recovered,
  compared or reset (`git restore`, `git clean`).
- **Tests copy a show before opening it.** Nothing opens a file here in place.

## Layout (arrives with the first shows)

| Path | What |
|---|---|
| `shows/<CODE>/` | Each show as an authoring project, for tests that publish or preview. |
| `site/<CODE>/` | What a Surface fetches — `project.db`, `<SURFACE>.db` and the media — served by GitHub Pages. |

A Surface pointed at this repository's Pages URL as its cloud base plays a test show exactly as
it would play a published one: the same file names, conditional GETs and cartridges as the
[Marquee Cartridge Specification](https://github.com/Mountain-View-Staging/marquee-cartridge-spec).
