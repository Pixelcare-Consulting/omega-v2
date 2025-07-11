"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { paramsSchema } from "@/schema/common"
import { deleteLeadAccountSchema, deleteLeadContactSchema, leadFormSchema, updateStatusSchema } from "@/schema/lead"

export async function getLeads() {
  try {
    return await prisma.lead.findMany({
      where: { deletedAt: null, deletedBy: null },
      include: {
        activities: {
          where: { deletedAt: null, deletedBy: null },
          include: { createdByUser: true },
        },
        account: true,
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
        account: true,
        contacts: { include: { contact: true } },
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
      const { id, relatedContacts, ...data } = parsedInput
      const { userId } = ctx

      if (id && id !== "add") {
        const [updatedLead] = await prisma.$transaction([
          //* update lead
          prisma.lead.update({ where: { id }, data: { ...data, updatedBy: userId } }),

          //* delete the existing lead's contacts
          prisma.leadContact.deleteMany({ where: { leadId: id } }),

          //* create new lead's contacts
          prisma.leadContact.createMany({
            data: relatedContacts?.map((contactId) => ({ leadId: id, contactId })) || [],
          }),
        ])

        return { status: 200, message: "Lead updated successfully!", data: { lead: updatedLead }, action: "UPSERT_LEAD" }
      }

      const newLead = await prisma.lead.create({
        data: {
          ...data,
          createdBy: userId,
          updatedBy: userId,
          contacts: {
            create: relatedContacts?.map((contactId) => ({ contactId })) || [],
          },
        },
      })
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

      if (!lead) return { error: true, status: 404, message: "Lead not found!", action: "DELETE_LEAD" }

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

      if (!lead) return { error: true, status: 404, message: "Lead not found!", action: "UPDATE_LEAD_STATUS" }

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

export const deleteLeadAccount = action
  .use(authenticationMiddleware)
  .schema(deleteLeadAccountSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const leadAccount = await prisma.lead.findFirst({ where: { id: data.leadId, accountId: data.accountId } })

      if (!leadAccount) return { error: true, status: 404, message: "lead account not found!", action: "DELETE_LEAD_ACCOUNT" }

      await prisma.lead.update({ where: { id: leadAccount.id }, data: { accountId: null, updatedBy: ctx.userId } })
      return { status: 200, message: "lead account removed successfully!", action: "DELETE_LEAD_ACCOUNT" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_LEAD_ACCOUNT",
      }
    }
  })

export const deleteLeadContact = action
  .use(authenticationMiddleware)
  .schema(deleteLeadContactSchema)
  .action(async ({ parsedInput: data }) => {
    try {
      const leadContact = await prisma.leadContact.findUnique({ where: { leadId_contactId: { ...data } } })

      if (!leadContact) return { error: true, status: 404, message: "Lead contact not found!", action: "DELETE_LEAD_CONTACT" }

      await prisma.leadContact.delete({ where: { leadId_contactId: { ...data } } })
      return { status: 200, message: "Lead contact removed successfully!", action: "DELETE_LEAD_CONTACT" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_LEAD_CONTACT",
      }
    }
  })
