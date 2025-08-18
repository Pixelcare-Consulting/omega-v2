"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { paramsSchema } from "@/schema/common"
import { itemMasterFormSchema } from "@/schema/master-item"

export async function getItems() {
  try {
    return await prisma.item.findMany({ where: { deletedAt: null, deletedBy: null } })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getItemByCode(code: string) {
  try {
    return await prisma.item.findUnique({ where: { ItemCode: code } })
  } catch (error) {
    console.error(error)
    return null
  }
}
