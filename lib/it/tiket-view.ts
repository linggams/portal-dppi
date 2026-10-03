const actorSelect = {
  select: { idUser: true, username: true, jabatan: true },
} as const

export const tiketActorInclude = {
  pemohon: actorSelect,
  petugas: actorSelect,
} as const

type Penulis = { penulis: { username: string } }

export function flattenTiket<
  T extends {
    pemohon: { username: string; jabatan: string }
    petugas: { username: string } | null
    komentar?: Penulis[]
  },
>(row: T) {
  const { pemohon, petugas, komentar, ...rest } = row
  return {
    ...rest,
    username: pemohon.username,
    jabatan: pemohon.jabatan,
    ditugaskanKe: petugas?.username ?? null,
    ...(komentar
      ? {
          komentar: komentar.map((item) => {
            const { penulis, ...comment } = item
            return { ...comment, username: penulis.username }
          }),
        }
      : {}),
  }
}
