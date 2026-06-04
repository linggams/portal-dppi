import pdfMake from "pdfmake/build/pdfmake"
import pdfFonts from "pdfmake/build/vfs_fonts"

let initialized = false

function ensureInitialized() {
  if (initialized) return
  // pdfmake butuh vfs fonts di browser
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(pdfMake as any).vfs = (pdfFonts as any).vfs
  initialized = true
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function downloadPdf(docDefinition: any, filename: string) {
  ensureInitialized()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(pdfMake as any).createPdf(docDefinition).download(filename)
}

