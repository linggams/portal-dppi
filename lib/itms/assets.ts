import type { ItmsAssetStatus } from "@prisma/client"

export const ASSET_STATUS_LABEL: Record<ItmsAssetStatus, string> = {
  in_stock: "In Stock",
  assigned: "Assigned",
  in_repair: "In Repair",
  retired: "Retired",
  disposed: "Disposed",
  lost: "Lost",
}

export const ASSET_TYPE_OPTIONS = [
  "Laptop",
  "Desktop",
  "Monitor",
  "Server",
  "Network",
  "Printer",
  "Mobile",
  "Peripheral",
  "Other",
] as const
