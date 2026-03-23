/**
 * Load .env.local and run a script.
 * Usage: npx tsx scripts/run-with-env.ts scripts/backfill-board-type.ts
 */
import { readFileSync } from "fs"
import { resolve } from "path"

const envPath = resolve(__dirname, "../.env.local")
const envContent = readFileSync(envPath, "utf-8")

for (const line of envContent.split("\n")) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) continue
  const eqIdx = trimmed.indexOf("=")
  if (eqIdx === -1) continue
  const key = trimmed.slice(0, eqIdx)
  let val = trimmed.slice(eqIdx + 1)
  // Strip surrounding quotes
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1)
  }
  process.env[key] = val
}

// Now run the target script
const target = process.argv[2]
if (!target) {
  console.error("Usage: npx tsx scripts/run-with-env.ts <script>")
  process.exit(1)
}

import(resolve(__dirname, "..", target)).catch((err) => {
  console.error(err)
  process.exit(1)
})
