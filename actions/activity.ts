"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { paramsSchema } from "@/schema/common"
import { activityFormSchema } from "@/schema/activity"

export async function getActivities(leadId?: string) {
  try {
    return await prisma.leadActivity.findMany({
      where: { ...(leadId ? { leadId } : {}), deletedAt: null, deletedBy: null },
      include: { lead: true, createdByUser: true },
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getAcvtityById(id: string) {
  try {
    return await prisma.leadActivity.findUnique({ where: { id }, include: { lead: true } })
  } catch (error) {
    console.error(error)
    return null
  }
}

export const upsertActivity = action
  .use(authenticationMiddleware)
  .schema(activityFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    try {
      const { id, ...data } = parsedInput
      const { userId } = ctx

      if (id && id !== "add") {
        const updatedActivity = await prisma.leadActivity.update({ where: { id }, data: { ...data, updatedBy: userId } })
        return { status: 200, message: "Activity updated successfully!", data: { activity: updatedActivity }, action: "UPSERT_ACTIVITY" }
      }

      const newActivity = await prisma.leadActivity.create({ data: { ...data, createdBy: userId, updatedBy: userId } })
      return { status: 200, message: "Activity created successfully!", data: { activity: newActivity }, action: "UPSERT_ACTIVITY" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPSERT_ACTIVITY",
      }
    }
  })

export const deletedActivity = action
  .use(authenticationMiddleware)
  .schema(paramsSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const activity = await prisma.leadActivity.findUnique({ where: { id: data.id } })

      if (!activity) return { error: true, status: 404, message: "Activity not found!", action: "DELETE_ACTIVITY" }

      await prisma.leadActivity.update({ where: { id: data.id }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })
      return { status: 200, message: "Activity deleted successfully!", action: "DELETE_ACTIVITY" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_ACTIVITY",
      }
    }
  })
