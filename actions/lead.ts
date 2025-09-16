"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { paramsSchema } from "@/schema/common"
import { deleteLeadAccountSchema, deleteLeadContactSchema, leadFormSchema, updateStatusSchema } from "@/schema/lead"
import { getCountries, getStates } from "./master-bp"
import { importSchema } from "@/schema/import-export"
import { Prisma } from "@prisma/client"

export async function getLeads() {
  try {
    return await prisma.lead.findMany({
      where: { deletedAt: null, deletedBy: null },
      include: {
        account: true,
      },
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export const getLeadsClient = action.use(authenticationMiddleware).action(async () => {
  try {
    return await prisma.lead.findMany({
      where: { deletedAt: null, deletedBy: null },
    })
  } catch (error) {
    console.error(error)
    return []
  }
})

export async function getLeadById(id: string) {
  try {
    const [lead, activities, countries] = await Promise.all([
      prisma.lead.findUnique({
        where: { id },
        include: {
          createdByUser: true,
          account: true,
        },
      }),
      prisma.activity.findMany({
        where: { module: "lead", referenceId: id, deletedAt: null, deletedBy: null },
        include: { createdByUser: { select: { name: true, email: true } } },
      }),
      getCountries(),
    ])

    if (!lead) return null

    const states = lead.country ? await getStates(lead.country) : []
    const countryName = countries?.value?.find((country: any) => country?.Code === lead?.country)?.Name || ""
    const stateName = states?.value?.find((state: any) => state?.Code === lead?.state)?.Name || ""

    return { ...lead, activities, countryName, stateName }
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

      const newLead = await prisma.lead.create({
        data: {
          ...data,
          createdBy: userId,
          updatedBy: userId,
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

export const leadCreateMany = action
  .use(authenticationMiddleware)
  .schema(importSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { data, total, stats, isLastBatch } = parsedInput
    const { userId } = ctx

    try {
      const batch: Prisma.LeadCreateManyInput[] = []

      for (let i = 0; i < data.length; i++) {
        const errors: string[] = []
        const row = data[i]

        //* check required fields
        if (!row?.["Name"] || !row?.["Email"] || !row?.["Phone"] || !row?.["Status"]) {
          errors.push("Missing required fields")
        }

        //* if errors array is not empty, then update/push to stats.error
        if (errors.length > 0) {
          console.log("ERRORS:")
          console.log({ rowNumber: row.rowNumber, entries: errors }, "\n")

          stats.error.push({ rowNumber: row.rowNumber, entries: errors, row })
          continue
        }

        //* reshape data
        const leadData: Prisma.LeadCreateManyInput = {
          name: row.Name,
          email: row.Email,
          phone: row.Phone,
          status: row.Status,
          title: row?.["Title"] || "",
          accountId: row?.["Related Account"] || null,
          street1: row?.["Street 1"] || "",
          street2: row?.["Street 2"] || "",
          street3: row?.["Street 3"] || "",
          streetNo: row?.["Street No"] || "",
          buildingFloorRoom: row?.["Building/Floor/Room"] || "",
          block: row?.["Block"] || "",
          city: row?.["City"] || "",
          zipCode: row?.["Zip Code"] || "",
          county: row?.["County"] || "",
          country: row?.["Country"] || "",
          state: row?.["State"] || "",
          gln: row?.["GLN"] || "",
          createdBy: userId,
          updatedBy: userId,
        }

        //* add to batch
        batch.push(leadData)
      }

      //* commit the batch
      await prisma.lead.createMany({
        data: batch,
        skipDuplicates: true,
      })

      const progress = ((stats.completed + batch.length) / total) * 100

      const updatedStats = {
        ...stats,
        completed: stats.completed + batch.length,
        progress,
        status: progress >= 100 || isLastBatch ? "completed" : "processing",
      }

      return {
        status: 200,
        message: `${updatedStats.completed} leads created successfully!`,
        action: "BATCH_WRITE_LEAD",
        stats: updatedStats,
      }
    } catch (error) {
      console.error("Batch Write Error - ", error)

      stats.error.push(...data.map((row) => ({ rowNumber: row.rowNumber, entries: ["Unexpected batch write error"], row })))

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Batch write error!",
        action: "BATCH_WRITE_LEAD",
        stats,
      }
    }
  })
