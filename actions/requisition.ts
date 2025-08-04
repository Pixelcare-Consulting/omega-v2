"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { paramsSchema } from "@/schema/common"
import { requisitionFormSchema, updateRequisitionReqItemsSchema } from "@/schema/requisition"

export type RequestedItemsJSONData = { code: string; isSupplierSuggested: boolean }[] | null

export async function getRequisitions() {
  try {
    const result = await prisma.requisition.findMany({
      where: { deletedAt: null, deletedBy: null },
      include: {
        salesPersons: { include: { user: { select: { name: true, email: true } } } },
        omegaBuyers: { include: { user: { select: { name: true, email: true } } } },
        customer: { select: { CardName: true, CardCode: true } },
      },
    })

    return result.map((req) => ({
      ...req,
      quantity: req.quantity?.toString(),
      customerStandardPrice: req?.customerStandardPrice?.toString(),
      customerStandardOpportunityValue: req?.customerStandardPrice?.toString(),
    }))
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getRequisitionByCode(code: number) {
  try {
    const result = await prisma.requisition.findUnique({
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
        activities: {
          where: { deletedAt: null, deletedBy: null },
          include: { createdByUser: true },
        },
        createdByUser: true,
      },
    })

    if (!result) return null

    return {
      ...result,
      quantity: result.quantity?.toString(),
      customerStandardPrice: result.customerStandardPrice?.toString(),
      customerStandardOpportunityValue: result.customerStandardPrice?.toString(),
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
