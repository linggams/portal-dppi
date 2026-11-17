import {
  NIST_MAPPING_DATA,
  type NistCategory,
  type NistFunction,
} from "@/lib/itms/nist-mapping-data"

export { NIST_MAPPING_DATA, type NistFunction }

export const NIST_FUNCTION_ORDER = [
  "govern",
  "identify",
  "protect",
  "detect",
  "respond",
  "recover",
] as const

type NistSearchHit = {
  functionKey: string
  functionTitle: string
  category: NistCategory
  subcategory?: string
  offering?: string
}

export function searchNistMapping(searchTerm: string): NistSearchHit[] {
  const q = searchTerm.trim().toLowerCase()
  if (!q) return []

  const results: NistSearchHit[] = []
  for (const [key, fn] of Object.entries(NIST_MAPPING_DATA)) {
    for (const category of fn.categories) {
      if (
        category.name.toLowerCase().includes(q) ||
        category.code.toLowerCase().includes(q)
      ) {
        results.push({
          functionKey: key,
          functionTitle: fn.title,
          category,
        })
      }
      for (const subcategory of category.subcategories) {
        if (subcategory.toLowerCase().includes(q)) {
          results.push({
            functionKey: key,
            functionTitle: fn.title,
            category,
            subcategory,
          })
        }
      }
      for (const offering of category.offerings) {
        if (offering.name.toLowerCase().includes(q)) {
          results.push({
            functionKey: key,
            functionTitle: fn.title,
            category,
            offering: offering.name,
          })
        }
      }
    }
  }
  return results
}

export function filterNistFunction(
  fn: NistFunction,
  searchTerm: string
): NistFunction | null {
  const q = searchTerm.trim().toLowerCase()
  if (!q) return fn

  const categories = fn.categories.filter((category) => {
    if (
      category.name.toLowerCase().includes(q) ||
      category.code.toLowerCase().includes(q)
    ) {
      return true
    }
    if (category.subcategories.some((s) => s.toLowerCase().includes(q))) {
      return true
    }
    if (category.offerings.some((o) => o.name.toLowerCase().includes(q))) {
      return true
    }
    return false
  })

  if (categories.length === 0) return null
  return { ...fn, categories }
}
