"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { paramsSchema } from "@/schema/common"
import { importSchema } from "@/schema/import-export"
import { requisitionFormSchema, updateRequisitionReqItemsSchema } from "@/schema/requisition"
import { Prisma } from "@prisma/client"
import { parse } from "date-fns"

export type RequestedItemsJSONData = { code: string; isSupplierSuggested: boolean }[] | null

export async function getRequisitions() {
  try {
    const result = await prisma.requisition.findMany({
      where: { deletedAt: null, deletedBy: null },
      include: {
        salesPersons: { include: { user: { select: { name: true, email: true } } } },
        omegaBuyers: { include: { user: { select: { name: true, email: true } } } },
        customer: { select: { CardName: true, CardCode: true } },
        supplierQuotes: true,
      },
    })

    return result.map((req) => ({
      ...req,
      quantity: req.quantity?.toString(),
      customerStandardPrice: req?.customerStandardPrice?.toString(),
    }))
  } catch (error) {
    console.error(error)
    return []
  }
}

export const getRequisitionsClient = action.use(authenticationMiddleware).action(async () => {
  try {
    return await prisma.requisition.findMany({
      where: { deletedAt: null, deletedBy: null },
    })
  } catch (error) {
    console.error(error)
    return []
  }
})

export async function getRequisitionByCode(code: number) {
  try {
    const [requisition, activities] = await Promise.all([
      prisma.requisition.findUnique({
        where: { code: code },
        include: {
          salesPersons: { include: { user: { select: { name: true, email: true } } } },
          omegaBuyers: { include: { user: { select: { name: true, email: true } } } },
          customer: { select: { CardName: true, CardCode: true } },
          supplierQuotes: {
            where: { deletedAt: null, deletedBy: null },
            include: {
              requisition: { include: { salesPersons: { include: { user: { select: { name: true, email: true } } } } } },
              supplier: true,
              buyers: { include: { user: { select: { name: true, email: true } } } },
            },
          },
          createdByUser: true,
        },
      }),
      prisma.activity.findMany({
        where: { module: "requisition", referenceId: String(code), deletedAt: null, deletedBy: null },
        include: { createdByUser: { select: { name: true, email: true } } },
      }),
    ])

    if (!requisition) return null

    const contact = requisition.contactId
      ? await prisma.contact.findUnique({ where: { id: requisition.contactId }, select: { FirstName: true, LastName: true } })
      : null

    return {
      ...requisition,
      activities,
      quantity: requisition.quantity?.toString(),
      customerStandardPrice: requisition.customerStandardPrice?.toString(),
      contact,
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

export const upsertRequisition = action
  .use(authenticationMiddleware)
  .schema(requisitionFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id, salesPersons, omegaBuyers, ...data } = parsedInput
    const { userId } = ctx
    const requestedItems = data.requestedItems.map((item) => ({ code: item.code, isSupplierSuggested: item.isSupplierSuggested }))

    try {
      if (id && id !== "add") {
        const [updatedRequisition] = await prisma.$transaction([
          //* update requisition
          prisma.requisition.update({
            where: { id },
            data: { ...data, requestedItems, reqReviewResult: data?.reqReviewResult || [], updatedBy: userId },
          }),

          //* delete the existing requisition's salespersons
          prisma.requisitionSalesPerson.deleteMany({ where: { requisitionId: id } }),

          //* delete the existing requisition's omegabuyers
          prisma.requisitionOmegaBuyer.deleteMany({ where: { requisitionId: id } }),

          //* create new requisition salespersons
          prisma.requisitionSalesPerson.createMany({
            data: salesPersons?.map((salesPerson) => ({ requisitionId: id, userId: salesPerson })) || [],
          }),

          //* create new requisition omegabuyers
          prisma.requisitionOmegaBuyer.createMany({
            data: omegaBuyers?.map((omegaBuyer) => ({ requisitionId: id, userId: omegaBuyer })) || [],
          }),
        ])

        return {
          status: 200,
          message: "Requisition updated successfully!",
          data: { requisition: updatedRequisition },
          action: "UPSERT_REQUISITION",
        }
      }

      const newRequisition = await prisma.requisition.create({
        data: {
          ...data,
          requestedItems,
          reqReviewResult: data?.reqReviewResult || [],
          createdBy: userId,
          updatedBy: userId,
          salesPersons: {
            create: salesPersons?.map((salesPerson) => ({ userId: salesPerson })) || [],
          },
          omegaBuyers: {
            create: omegaBuyers?.map((omegaBuyer) => ({ userId: omegaBuyer })) || [],
          },
        },
      })

      return {
        status: 200,
        message: "Requisition created successfully!",
        data: { requisition: newRequisition },
        action: "UPSERT_REQUISITION",
      }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPSERT_REQUISITION",
      }
    }
  })

export const deleteRequisition = action
  .use(authenticationMiddleware)
  .schema(paramsSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const requisition = await prisma.requisition.findUnique({ where: { id: data.id } })

      if (!requisition) return { error: true, status: 404, message: "Requisition not found!", action: "DELETE_REQUISITION" }

      await prisma.requisition.update({ where: { id: requisition.id }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })
      return { status: 200, message: "Requisition deleted successfully!", action: "DELETE_REQUISITION" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_REQUISITION",
      }
    }
  })

export const updateRequisitionReqItems = action
  .use(authenticationMiddleware)
  .schema(updateRequisitionReqItemsSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const requisition = await prisma.requisition.findUnique({ where: { id: data.reqId } })
      const requestedItems = data.requestedItems.map((item) => ({ code: item.code, isSupplierSuggested: item.isSupplierSuggested }))

      if (!requisition) return { error: true, status: 404, message: "Requisition not found!", action: "UPDATE_REQUISITION_REQ_ITEMS" }

      await prisma.requisition.update({
        where: { id: requisition.id },
        data: { requestedItems, updatedBy: ctx.userId },
      })

      return { status: 200, message: "Requested items updated successfully!", action: "UPDATE_REQUISITION_REQ_ITEMS" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPDATE_REQUISITION_REQ_ITEMS",
      }
    }
  })

export const requisitionCreateMany = action
  .use(authenticationMiddleware)
  .schema(importSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { data, total, stats, isLastBatch } = parsedInput
    const { userId } = ctx

    try {
      const batch: Prisma.RequisitionCreateManyInput[] = []

      const itemCodes = data.map((row) => row?.["Requested Items"]?.map((item: any) => item?.code)?.filter(Boolean) || []).flat()
      const uniqueItemCodes = [...new Set(itemCodes)]

      const customerCodes = data.map((row) => row?.["Customer"]).filter(Boolean)
      const uniqueCustomerCodes = [...new Set(customerCodes)]

      //* get existing item, customer
      const [existingItems, existingCustomers] = await Promise.all([
        prisma.item.findMany({ where: { ItemCode: { in: uniqueItemCodes } }, select: { ItemCode: true } }),
        prisma.businessPartner.findMany({ where: { CardCode: { in: uniqueCustomerCodes } }, select: { CardCode: true } }),
      ])

      for (let i = 0; i < data.length; i++) {
        const errors: string[] = []
        const row = data[i]

        const quantity = parseFloat(row?.["Requested Quantity"])
        const customerStandardPrice = parseFloat(row?.["Cust. Standard Price"])
        const customerStandardOpportunityValue = parseFloat(row?.["Cust. Standard Opportunity Value"])
        const reqItemCodes: string[] = row?.["Requested Items"]?.length > 0 ? row?.["Requested Items"]?.map((item: any) => item?.code)?.filter(Boolean) || [] : [] // prettier-ignore

        //* check required fields
        if (
          !row?.["Date"] ||
          !row?.["Sales Category"] ||
          !row?.["Purchasing Status"] ||
          !row?.["Customer"] ||
          isNaN(quantity) ||
          isNaN(customerStandardPrice) ||
          isNaN(customerStandardOpportunityValue) ||
          !quantity ||
          !customerStandardPrice ||
          !customerStandardOpportunityValue
        ) {
          errors.push("Missing required fields")
        }

        //* check if there is any requested items
        if (row?.["Requested Items"]?.length < 1) {
          errors.push("Missing requested items")
        }

        //* check if all items in requested items exist, if one of them doesn't exist, skip the row
        if (!reqItemCodes.every((i) => existingItems.find((item) => item.ItemCode === i))) {
          errors.push("One or more requested items not found")
        }

        //* check if customer exist, if not, skip the row
        if (!existingCustomers.find((c) => row["Customer"] === c.CardCode)) {
          errors.push("Customer not found")
        }

        //* if errors array is not empty, then update/push to stats.error
        if (errors.length > 0) {
          console.log("ERRORS:")
          console.log({ rowNumber: row.rowNumber, entries: errors }, "\n")

          stats.error.push({ rowNumber: row.rowNumber, entries: errors, row })
          continue
        }

        //* reshape data
        const requisitionData: Prisma.RequisitionCreateManyInput = {
          date: parse(row?.["Date"], "MM/dd/yyyy", new Date()),
          urgency: row?.["Urgency"],
          salesCategory: row?.["Sales Category"],
          purchasingStatus: row?.["Purchasing Status"],
          result: row?.["Result"],
          reason: row?.["Reason"],
          customerCode: row["Customer"],
          quantity: row?.["Requested Quantity"],
          customerStandardPrice: row?.["Cust. Standard Price"],
          requestedItems: row?.["Requested Items"],
          createdBy: userId,
          updatedBy: userId,
        }

        //* add to batch
        batch.push(requisitionData)
      }

      //* commit the batch
      await prisma.requisition.createMany({
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
        message: `${updatedStats.completed} requisitions created successfully!`,
        action: "BATCH_WRITE_REQUISITION",
        stats: updatedStats,
      }
    } catch (error) {
      console.error("Batch Write Error - ", error)

      stats.error.push(...data.map((row) => ({ rowNumber: row.rowNumber, entries: ["Unexpected batch write error"], row })))

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Batch write error!",
        action: "BATCH_WRITE_REQUISITION",
        stats,
      }
    }
  })
