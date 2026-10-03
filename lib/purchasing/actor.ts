export const pemohonInclude = {
  pemohon: {
    select: {
      idUser: true,
      username: true,
      jabatan: true,
    },
  },
} as const

type ActorRow = {
  pemohon: {
    idUser: number
    username: string
    jabatan: string
  }
  stokbarang?: { idJenis: number } | null
}

export function flattenActor<T extends ActorRow>(row: T) {
  const { pemohon, stokbarang, ...rest } = row
  return {
    ...rest,
    ...(stokbarang !== undefined ? { stokbarang } : {}),
    idUser: pemohon.idUser,
    unit: pemohon.username,
    instansi: pemohon.jabatan,
    ...(stokbarang ? { idJenis: stokbarang.idJenis } : {}),
  }
}

export function requireUserId(id: string) {
  const parsed = Number.parseInt(id, 10)
  if (!Number.isFinite(parsed)) {
    throw new Error("Sesi user tidak valid")
  }
  return parsed
}
