#!/usr/bin/env node
/**
 * Migrasi bar tombol aksi ke <PageActions> (separator full width via PageActionsBar di layout).
 *
 * Penggunaan:
 *   node scripts/migrate-page-actions.mjs           # terapkan perubahan
 *   node scripts/migrate-page-actions.mjs --dry-run   # hanya tampilkan yang akan diubah
 *
 * Pola yang diganti:
 *   <div className="flex justify-end items-center">...</div>
 *     → <PageActions>...</PageActions>
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const dryRun = process.argv.includes("--dry-run")

const SCAN_DIRS = [
  path.join(root, "app", "(dashboard)"),
  path.join(root, "components"),
]

const ACTION_DIV_RE =
  /<div\s+className="flex justify-end items-center">([\s\S]*?)<\/div>/g

function walkTsx(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) walkTsx(full, out)
    else if (ent.name.endsWith(".tsx")) out.push(full)
  }
  return out
}

function hasPageActionsImport(content) {
  return /import\s*\{[^}]*\bPageActions\b[^}]*\}/.test(content)
}

function ensurePageActionsImport(content) {
  if (hasPageActionsImport(content)) return content

  const layoutImport = content.match(
    /import\s*\{([^}]+)\}\s*from\s*"@\/components\/layout"/
  )
  if (layoutImport) {
    const names = layoutImport[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    if (!names.includes("PageActions")) {
      names.push("PageActions")
      return content.replace(
        layoutImport[0],
        `import { ${names.join(", ")} } from "@/components/layout"`
      )
    }
    return content
  }

  if (content.includes("DashboardLayout")) {
    const dashImport = content.match(
      /import\s*\{([^}]+)\}\s*from\s*"@\/components\/layout\/DashboardLayout"/
    )
    if (dashImport) {
      return content.replace(
        dashImport[0],
        `${dashImport[0]}\nimport { PageActions } from "@/components/layout"`
      )
    }
  }

  return content
}

function migrateContent(content) {
  if (!content.includes('className="flex justify-end items-center"')) {
    return { content, replacements: 0 }
  }

  let replacements = 0
  const next = content.replace(ACTION_DIV_RE, (_, inner) => {
    replacements++
    return `<PageActions>${inner}</PageActions>`
  })

  if (replacements === 0) return { content, replacements: 0 }

  return {
    content: ensurePageActionsImport(next),
    replacements,
  }
}

function migrateFile(filePath) {
  const original = fs.readFileSync(filePath, "utf8")
  const { content, replacements } = migrateContent(original)

  if (replacements === 0 || content === original) {
    return null
  }

  if (!dryRun) {
    fs.writeFileSync(filePath, content, "utf8")
  }

  return { filePath, replacements }
}

const files = SCAN_DIRS.flatMap((d) => walkTsx(d))
const results = files.map(migrateFile).filter(Boolean)

console.log(
  dryRun
    ? `[dry-run] ${results.length} file akan diubah:`
    : `Diperbarui ${results.length} file:`
)
for (const r of results) {
  console.log(`  - ${path.relative(root, r.filePath)} (${r.replacements} blok)`)
}

if (results.length === 0) {
  console.log("Tidak ada pola flex justify-end items-center yang ditemukan.")
}
