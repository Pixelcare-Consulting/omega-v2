"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { paramsSchema } from "@/schema/common"
import { leadActivityFormSchema } from "@/schema/lead-activity"

export async function getLeadActivities(leadId?: string) {
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

export async function getLeadAcvtityById(id: string) {
  try {
    return await prisma.leadActivity.findUnique({ where: { id }, include: { lead: true } })
  } catch (error) {
    console.error(error)
    return null
  }
}

export const upsertLeadActivity = action
  .use(authenticationMiddleware)
  .schema(leadActivityFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    try {
      const { id, ...data } = parsedInput
      const { userId } = ctx

      if (id && id !== "add") {
        const updatedActivity = await prisma.leadActivity.update({ where: { id }, data: { ...data, updatedBy: userId } })
        return {
          status: 200,
          message: "Lead activity updated successfully!",
          data: { activity: updatedActivity },
          action: "UPSERT_LEAD_ACTIVITY",
        }
      }

      const newActivity = await prisma.leadActivity.create({ data: { ...data, createdBy: userId, updatedBy: userId } })
      return {
        status: 200,
        message: "Lead activity created successfully!",
        data: { activity: newActivity },
        action: "UPSERT_LEAD_ACTIVITY",
      }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPSERT_LEAD_ACTIVITY",
      }
    }
  })

export const deletedActivity = action
  .use(authenticationMiddleware)
  .schema(paramsSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const activity = await prisma.leadActivity.findUnique({ where: { id: data.id } })

      if (!activity) return { error: true, status: 404, message: "Lead activity not found!", action: "DELETE_LEAD_ACTIVITY" }

      await prisma.leadActivity.update({ where: { id: data.id }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })
      return { status: 200, message: "Lead activity deleted successfully!", action: "DELETE_LEAD_ACTIVITY" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_LEAD_ACTIVITY",
      }
    }
  })
