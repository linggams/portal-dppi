import { prisma } from "@/lib/db/prisma"
import {
  buildPermintaanDailyLimitStatus,
  getTodayDateWIB,
  parseDateOnly,
  type PermintaanDailyLimitStatus,
} from "./permintaan-daily-limit-types"

export {
  PERMINTAAN_DAILY_LIMIT_MESSAGE,
  getTodayDateWIB,
  parseDateOnly,
  type PermintaanDailyLimitStatus,
} from "./permintaan-daily-limit-types"

export async function hasSubmittedPermintaanOnDate(
  unit: string,
  dateStr: string
): Promise<boolean> {
  const existing = await prisma.permintaan.findFirst({
    where: {
      unit,
      tglPermintaan: parseDateOnly(dateStr),
    },
    select: { idPermintaan: true },
  })
  return existing != null
}

export async function hasSubmittedPermintaanToday(
  unit: string
): Promise<boolean> {
  return hasSubmittedPermintaanOnDate(unit, getTodayDateWIB())
}

export async function getPermintaanDailyLimitStatus(
  unit: string
): Promise<PermintaanDailyLimitStatus> {
  const alreadySubmitted = await hasSubmittedPermintaanToday(unit)
  return buildPermintaanDailyLimitStatus(alreadySubmitted)
}
