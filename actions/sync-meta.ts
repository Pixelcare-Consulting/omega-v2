"use server"

import { prisma } from "@/lib/db"

export async function getSyncMetaByCode(code: string) {
  try {
    return await prisma.syncMeta.findUnique({ where: { code } })
  } catch (error) {
    return null
  }
}
