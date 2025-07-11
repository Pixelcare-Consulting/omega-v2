"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { paramsSchema } from "@/schema/common"
import { requisitionActivityFormSchema } from "@/schema/requisition-activity"

export async function getRequisitionActivities(requisitionId?: string) {
  try {
    return await prisma.requisitionActivity.findMany({
      where: { ...(requisitionId ? { requisitionId } : {}), deletedAt: null, deletedBy: null },
      include: { requisition: true, createdByUser: true },
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getRequisitionAcvtityById(id: string) {
  try {
    return await prisma.requisitionActivity.findUnique({ where: { id }, include: { requisition: true } })
  } catch (error) {
    console.error(error)
    return null
  }
}

export const upsertRequisitionActivity = action
  .use(authenticationMiddleware)
  .schema(requisitionActivityFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    try {
      const { id, ...data } = parsedInput
      const { userId } = ctx

      if (id && id !== "add") {
        const updatedActivity = await prisma.requisitionActivity.update({ where: { id }, data: { ...data, updatedBy: userId } })
        return {
          status: 200,
          message: "Requisition activity updated successfully!",
          data: { activity: updatedActivity },
          action: "UPSERT_REQUISITION_ACTIVITY",
        }
      }

      const newActivity = await prisma.requisitionActivity.create({ data: { ...data, createdBy: userId, updatedBy: userId } })
      return {
        status: 200,
        message: "Requisition activity created successfully!",
        data: { activity: newActivity },
        action: "UPSERT_REQUISITION_ACTIVITY",
      }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPSERT_REQUISITION_ACTIVITY",
      }
    }
  })

export const deleteRequisitionActivity = action
  .use(authenticationMiddleware)
  .schema(paramsSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const activity = await prisma.requisitionActivity.findUnique({ where: { id: data.id } })

      if (!activity) return { error: true, status: 404, message: "Requisition activity not found!", action: "DELETE_REQUISITIUON_ACTIVITY" }

      await prisma.requisitionActivity.update({ where: { id: data.id }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })
      return { status: 200, message: "Requisition activity deleted successfully!", action: "DELETE_REQUISITIUON_ACTIVITY" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_REQUISITIUON_ACTIVITY",
      }
    }
  })
