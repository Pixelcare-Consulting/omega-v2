"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { activityFormSchema } from "@/schema/activity"
import { paramsSchema } from "@/schema/common"
import { Activity } from "@prisma/client"

export async function getActivitiesByType(type: string[]) {
  try {
    return await prisma.activity.findMany({
      where: { type: { in: type }, deletedAt: null, deletedBy: null },
      include: { createdByUser: { select: { name: true, email: true } } },
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getActivitiesByModule(module: string, referenceId?: string) {
  try {
    let queryReference

    if (referenceId) {
      switch (module) {
        case "lead":
          queryReference = prisma.lead.findUnique({ where: { id: referenceId } })
          break

        case "requisition":
          queryReference = prisma.requisition.findUnique({ where: { id: referenceId } })
          break

        default:
          queryReference = new Promise((resolve) => resolve(null))
      }
    }

    const [activities, reference] = await Promise.all([
      prisma.activity.findMany({
        where: { ...(referenceId ? { referenceId } : {}), deletedAt: null, deletedBy: null },
      }),
      queryReference,
    ])

    return { ...activities, reference } as Activity[] & { reference: any }
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getAcvtityById(id: string) {
  try {
    const activity = await prisma.activity.findUnique({ where: { id } })

    if (!activity) return null

    let reference

    if (activity?.module && activity?.referenceId) {
      switch (activity.module) {
        case "lead":
          reference = await prisma.lead.findUnique({ where: { id: activity.referenceId } })
          break

        case "requisition":
          reference = await prisma.requisition.findUnique({ where: { id: activity.referenceId } })
          break

        default:
          reference = await new Promise((resolve) => resolve(null))
      }
    }

    return { ...activity, reference } as Activity & { reference: any }
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
        const updatedActivity = await prisma.activity.update({ where: { id }, data: { ...data, updatedBy: userId } })
        return {
          status: 200,
          message: "Activity updated successfully!",
          data: { activity: updatedActivity },
          action: "UPSERT_ACTIVITY",
        }
      }

      const newActivity = await prisma.activity.create({ data: { ...data, createdBy: userId, updatedBy: userId } })
      return {
        status: 200,
        message: "Activity created successfully!",
        data: { activity: newActivity },
        action: "UPSERT_ACTIVITY",
      }
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

export const deleteActivity = action
  .use(authenticationMiddleware)
  .schema(paramsSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const activity = await prisma.activity.findUnique({ where: { id: data.id } })

      if (!activity) return { error: true, status: 404, message: "Activity not found!", action: "DELETE_ACTIVITY" }

      await prisma.activity.update({ where: { id: data.id }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })
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
