#!/usr/bin/env node
/*
  load-cartridges.mjs — every cartridge in this repository through the reference engine's
  Loader (the Marquee Cartridge Specification's engine/dist/node.js, Node 22.13 or later).

    node --no-warnings scripts/load-cartridges.mjs --engine <spec checkout>/engine/dist/node.js

  - shows/<CODE>/project.db and every shows/<CODE>/<SURFACE>.db load with no warning, and
    name this folder's show code (and, for a surface, their own file name);
  - every file a manifest names and every rendition a cartridge offers is in the show's
    folder, at its size and SHA-256 — what a device would fetch and verify;
  - legacy/ is refused with exactly the codes legacy/expected.json names.

  It prints, for each surface, the files a device fetches per lane (§7.7).
*/
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const at = process.argv.indexOf('--engine')
const enginePath = at > 0 ? resolve(process.argv[at + 1] ?? '') : null
if (!enginePath || !existsSync(enginePath)) {
  console.error('usage: node scripts/load-cartridges.mjs --engine <spec checkout>/engine/dist/node.js')
  process.exit(2)
}
const { loadCartridge, filesForLanes, CartridgeError } = await import(pathToFileURL(enginePath).href)

let failures = 0
const fail = (what) => { failures++; console.log(`  ✗ ${what}`) }
const sha256 = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`

const showsDir = join(root, 'shows')
for (const code of readdirSync(showsDir).filter((n) => !n.startsWith('.')).sort()) {
  const folder = join(showsDir, code)
  const cartridges = readdirSync(folder).filter((n) => n.endsWith('.db'))
    .sort((a, b) => (a === 'project.db' ? -1 : b === 'project.db' ? 1 : a.localeCompare(b)))
  if (!cartridges.includes('project.db')) fail(`${code}: no project.db`)
  console.log(`${code}`)
  const checked = new Map()   // file name → problem or null, across this show's cartridges
  for (const name of cartridges) {
    const kind = name === 'project.db' ? 'project' : 'surface'
    let snapshot
    try {
      snapshot = await loadCartridge(readFileSync(join(folder, name)), { kind })
    } catch (error) {
      fail(`${code}/${name}: refused — ${error.code ?? ''} ${error.message}`)
      continue
    }
    const { meta } = snapshot
    if (meta.projectCode !== code) fail(`${code}/${name}: names show ${meta.projectCode}`)
    if (kind === 'surface' && `${meta.surfaceId}.db` !== name) fail(`${code}/${name}: names surface ${meta.surfaceId}`)
    for (const w of snapshot.warnings) fail(`${code}/${name}: warning ${w.code} — ${w.message}`)

    // What a device would fetch and verify.
    const wanted = []
    for (const m of snapshot.manifest.values()) wanted.push([m.deliverableFileName, m.fileSize, m.contentHash])
    for (const list of snapshot.variants.values()) for (const v of list) wanted.push([v.fileName, v.fileSize, v.contentHash])
    for (const [file, size, hash] of wanted) {
      if (!checked.has(file)) {
        const path = join(folder, file)
        if (!existsSync(path)) checked.set(file, 'absent')
        else {
          const bytes = readFileSync(path)
          checked.set(file, bytes.length !== size ? `is ${bytes.length} bytes, not ${size}`
            : sha256(bytes) !== hash ? 'does not match its hash' : null)
        }
      }
      if (checked.get(file)) fail(`${code}/${name}: ${file} ${checked.get(file)}`)
    }

    const lanes = (list, demo = false) => filesForLanes(snapshot, { lanes: list, demo }).size
    const renditions = [...snapshot.variants.values()].reduce((n, list) => n + list.length, 0)
    let line = `  ${name}: rev ${meta.publishedRevision}, ${snapshot.manifest.size} files, ${renditions} renditions`
      + ` — portrait lane ${lanes(['portrait'])}, landscape lane ${lanes(['landscape'])}`
    if (kind === 'surface') {
      const slots = snapshot.scheduleBySlot
      line += `; DemoStation host ${lanes(['portrait'], true)} / ${lanes(['landscape'], true)}`
        + `; scheduled: portrait ${slots.portrait.length}, landscape ${slots.landscape.length}, demo ${slots.demo_station.length}`
        + `; locations ${snapshot.locations.map((l) => l.locationId).join(', ')}`
    }

    // The style book a cartridge names (the Marquee Branding Specification §7): its style.json
    // is a file of this cartridge and parses, every face it declares — on every platform — is
    // a file of this cartridge too, and every lane fetches all of them (the Cartridge Specification §7.7).
    const styleItemId = snapshot.project.brandStyleItemId
    if (styleItemId !== null) {
      const item = snapshot.mediaItems.get(styleItemId)
      const entry = item && snapshot.manifest.get(item.portraitFileId ?? item.landscapeFileId)
      if (!entry) fail(`${code}/${name}: the style book item ${styleItemId} names no file of this cartridge`)
      else {
        const idOf = new Map([...snapshot.manifest.entries()].map(([id, m]) => [m.deliverableFileName, id]))
        const files = JSON.parse(readFileSync(join(folder, entry.deliverableFileName), 'utf8'))?.fonts?.family?.files ?? {}
        const declared = Object.values(files).flat()
        const absent = declared.filter((f) => !idOf.has(f))
        if (!declared.length || absent.length) fail(`${code}/${name}: the style book declares ${declared.length} faces, ${absent.length} not in the cartridge`)
        for (const lane of ['portrait', 'landscape']) {
          const fetched = filesForLanes(snapshot, { lanes: [lane] })
          if (!declared.every((f) => fetched.has(idOf.get(f)))) fail(`${code}/${name}: the ${lane} lane does not fetch every face`)
        }
        line += `; style book ${snapshot.project.brandStyle}: ${Object.entries(files).map(([p, list]) => `${list.length} ${p}`).join(' + ')} faces, in every lane`
      }
    }
    console.log(line + `; ${snapshot.warnings.length} warnings`)
  }
}

// The pre-v25 artifacts: refused, each with its code.
const expected = JSON.parse(readFileSync(join(root, 'legacy', 'expected.json'), 'utf8'))
console.log('legacy')
for (const [file, { kind, refusal }] of Object.entries(expected.artifacts)) {
  try {
    await loadCartridge(readFileSync(join(root, 'legacy', file)), { kind })
    fail(`legacy/${file}: loaded; expected ${refusal}`)
  } catch (error) {
    if (!(error instanceof CartridgeError)) fail(`legacy/${file}: ${error.message}`)
    else if (error.code !== refusal) fail(`legacy/${file}: refused with ${error.code}; expected ${refusal}`)
    else console.log(`  ${file}: refused — ${error.code}: ${error.message}`)
  }
}

if (failures) {
  console.log(`load-cartridges: ${failures} failure(s)`)
  process.exit(1)
}
console.log('load-cartridges: every show loads with no warning; every file verifies; legacy/ is refused as expected')
