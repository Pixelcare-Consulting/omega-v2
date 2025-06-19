"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { paramsSchema } from "@/schema/common"
import { itemFormSchema } from "@/schema/item"

export async function getItems() {
  try {
    return await prisma.item.findMany({ where: { deletedAt: null, deletedBy: null } })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getItemById(id: string) {
  try {
    return await prisma.item.findUnique({ where: { id } })
  } catch (error) {
    console.error(error)
    return null
  }
}

export const upsertItem = action
  .use(authenticationMiddleware)
  .schema(itemFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id, ...data } = parsedInput
    const { userId } = ctx

    try {
      const existingItem = await prisma.item.findFirst({
        where: { ItemCode: data.ItemCode, ...(id && id !== "add" && { id: { not: id } }) },
      })

      if (existingItem) return { error: true, status: 401, message: "Item code already exists!" }

      const isManageBatchNumbers = data?.ManageBatchNumbers ? "Y" : "N"

      if (id && id != "add") {
        const updatedItem = await prisma.item.update({
          where: { id },
          data: { ...data, ManageBatchNumbers: isManageBatchNumbers, updatedBy: userId },
        })
        return { status: 200, message: "Item updated successfully!", data: { item: updatedItem }, action: "UPSERT_ITEM" }
      }

      const newItem = await prisma.item.create({
        data: { ...data, ManageBatchNumbers: isManageBatchNumbers, createdBy: userId, updatedBy: userId },
      })
      return { status: 200, message: "Item created successfully!", data: { item: newItem }, action: "UPSERT_ITEM" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPSERT_ITEM",
      }
    }
  })

export const deleteItem = action
  .use(authenticationMiddleware)
  .schema(paramsSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const item = await prisma.item.findUnique({ where: { id: data.id } })

      if (!item) return { status: 404, message: "Item not found!", action: "DELETE_ITEM" }

      await prisma.item.update({ where: { id: data.id }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })
      return { status: 200, message: "Item deleted successfully!", action: "DELETE_ITEM" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_ITEM",
      }
    }
  })
