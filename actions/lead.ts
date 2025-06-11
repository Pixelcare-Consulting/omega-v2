"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { paramsSchema } from "@/schema/common"
import { leadFormSchema, updateStatusSchema } from "@/schema/lead"

export async function getLeads() {
  try {
    return await prisma.lead.findMany({
      where: { deletedAt: null, deletedBy: null },
      include: {
        activities: {
          where: { deletedAt: null, deletedBy: null },
          include: { createdByUser: true },
        },
      },
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getLeadById(id: string) {
  try {
    return await prisma.lead.findUnique({
      where: { id },
      include: {
        activities: {
          where: { deletedAt: null, deletedBy: null },
          include: { createdByUser: true },
        },
        createdByUser: true,
      },
    })
  } catch (error) {
    console.error(error)
    return null
  }
}

export const upsertLead = action
  .use(authenticationMiddleware)
  .schema(leadFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    try {
      const { id, ...data } = parsedInput
      const { userId } = ctx

      if (id && id !== "add") {
        const updatedLead = await prisma.lead.update({ where: { id }, data: { ...data, updatedBy: userId } })
        return { status: 200, message: "Lead updated successfully!", data: { lead: updatedLead }, action: "UPSERT_LEAD" }
      }

      const newLead = await prisma.lead.create({ data: { ...data, createdBy: userId, updatedBy: userId } })
      return { status: 200, message: "Lead created successfully!", data: { lead: newLead }, action: "UPSERT_LEAD" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPSERT_LEAD",
      }
    }
  })

export const deleteLead = action
  .use(authenticationMiddleware)
  .schema(paramsSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const lead = await prisma.lead.findUnique({ where: { id: data.id } })

      if (!lead) return { status: 404, message: "Lead not found!", action: "DELETE_LEAD" }

      await prisma.lead.update({ where: { id: data.id }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })
      return { status: 200, message: "Lead deleted successfully!", action: "DELETE_LEAD" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_LEAD",
      }
    }
  })

export const updateLeadStatus = action
  .use(authenticationMiddleware)
  .schema(updateStatusSchema)
  .action(async ({ ctx, parsedInput }) => {
    try {
      const { id, status } = parsedInput

      const lead = await prisma.lead.findUnique({ where: { id } })

      if (!lead) return { status: 404, message: "Lead not found!", action: "UPDATE_LEAD_STATUS" }

      const updatedLead = await prisma.lead.update({ where: { id }, data: { status, createdBy: ctx.userId } })
      return { status: 200, message: "Lead status updated successfully!", data: { lead: updatedLead }, action: "UPDATE_LEAD_STATUS" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPDATE_LEAD_STATUS",
      }
    }
  })
