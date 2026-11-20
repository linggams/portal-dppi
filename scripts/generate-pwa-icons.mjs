import { mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const outDir = join(root, "public", "icons")
mkdirSync(outDir, { recursive: true })

const TEAL = "#147a84"
const FG = "#f7fafb"

function markSvg(size, { pad = 0.18 } = {}) {
  const inset = Math.round(size * pad)
  const inner = size - inset * 2
  const rx = Math.round(inner * 0.22)
  // Geometric "D" mark matching BrandMark proportions
  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${TEAL}"/>
  <rect x="${inset}" y="${inset}" width="${inner}" height="${inner}" rx="${rx}" fill="${FG}"/>
  <path fill="${TEAL}" d="
    M ${inset + inner * 0.28} ${inset + inner * 0.22}
    H ${inset + inner * 0.52}
    C ${inset + inner * 0.78} ${inset + inner * 0.22}
      ${inset + inner * 0.9} ${inset + inner * 0.36}
      ${inset + inner * 0.9} ${inset + inner * 0.5}
    C ${inset + inner * 0.9} ${inset + inner * 0.64}
      ${inset + inner * 0.78} ${inset + inner * 0.78}
      ${inset + inner * 0.52} ${inset + inner * 0.78}
    H ${inset + inner * 0.28}
    Z
    M ${inset + inner * 0.4} ${inset + inner * 0.34}
    V ${inset + inner * 0.66}
    H ${inset + inner * 0.5}
    C ${inset + inner * 0.64} ${inset + inner * 0.66}
      ${inset + inner * 0.72} ${inset + inner * 0.6}
      ${inset + inner * 0.72} ${inset + inner * 0.5}
    C ${inset + inner * 0.72} ${inset + inner * 0.4}
      ${inset + inner * 0.64} ${inset + inner * 0.34}
      ${inset + inner * 0.5} ${inset + inner * 0.34}
    Z
  "/>
</svg>`)
}

async function writePng(name, size, opts) {
  const svg = markSvg(size, opts)
  await sharp(svg).png().toFile(join(outDir, name))
  console.log(`wrote ${name} (${size}x${size})`)
}

await writePng("icon-192.png", 192, { pad: 0.12 })
await writePng("icon-512.png", 512, { pad: 0.12 })
// Extra padding for Android maskable safe zone
await writePng("icon-maskable-512.png", 512, { pad: 0.22 })
