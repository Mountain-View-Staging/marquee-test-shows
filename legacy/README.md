# legacy/

Two synthetic artifacts in the shape a cartridge had before format 25, for the tests that a
v25 reader refuses them — by name, and never as an empty show. Generic rows only; no media
bytes (a Loader refuses both before any file would be fetched).

| File | What it is | A v25 Loader says |
|---|---|---|
| `pre-v25-surface.db` | A surface cartridge from before 25.0.1: `screen_*` tables, a `grdb_migrations` table, and a `cartridge_meta` row in the old shape — `screen_id`, `project_code`, `published_revision`, `cloud_media_base_url` (an `example.net` placeholder), `timezone`, `generated_at`, and no `cartridge_kind` or `format_version`. | `column_missing` — cartridge_meta has no cartridge_kind column |
| `pre-v25-project.db` | A project cartridge from before `cartridge_meta` existed: the project row, one day, no meta table. | `not_v25` — it has no cartridge_meta table |

`expected.json` is the same table for `scripts/load-cartridges.mjs`; `media.lock.json` locks
the two `.db` files. Copy one before opening it: a reader may open a cartridge read-write.
