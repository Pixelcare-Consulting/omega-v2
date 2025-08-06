"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { paramsSchema } from "@/schema/common"
import { saleQuoteFormSchema } from "@/schema/sale-quote"

export type LineItemsJSONData = {
  requisitionCode: number
  supplierQuoteCode: number
  code: string
  unitPrice: number
  quantity: number
  leadTime: string
}[]

export async function getSaleQuotes() {
  try {
    return await prisma.saleQuote.findMany({
      where: { deletedAt: null, deletedBy: null },
      include: {
        customer: true,
        salesRep: { select: { name: true, email: true } },
        approval: { select: { name: true, email: true } },
      },
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getSaleQuoteByCode(code: number) {
  try {
    return await prisma.saleQuote.findUnique({
      where: { code, deletedAt: null, deletedBy: null },
      include: {
        customer: true,
        salesRep: { select: { name: true, email: true } },
        approval: { select: { name: true, email: true } },
      },
    })
  } catch (error) {
    console.error(error)
    return null
  }
}

export const upsertSaleQuote = action
  .use(authenticationMiddleware)
  .schema(saleQuoteFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id, ...data } = parsedInput
    const { userId } = ctx
    const lineItems = data.lineItems.map((item) => ({
      requisitionCode: item.requisitionCode,
      supplierQuoteCode: item.supplierQuoteCode,
      code: item.code,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      leadTime: item.leadTime,
    }))

    try {
      if (id && id !== "add") {
        const updatedSaleQuote = await prisma.saleQuote.update({ where: { id }, data: { ...data, lineItems, updatedBy: userId } })
        return {
          status: 200,
          message: "Sale quote updated successfully!",
          data: { saleQuote: updatedSaleQuote },
          action: "UPSERT_SALE_QUOTE",
        }
      }

      const newSaleQuote = await prisma.saleQuote.create({ data: { ...data, lineItems, createdBy: userId, updatedBy: userId } })

      return {
        status: 200,
        message: "Sale quote created successfully!",
        data: { saleQuote: newSaleQuote },
        action: "UPSERT_SALE_QUOTE",
      }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPSERT_SALE_QUOTE",
      }
    }
  })

export const deleteSaleQuote = action
  .use(authenticationMiddleware)
  .schema(paramsSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const saleQuote = await prisma.saleQuote.findUnique({ where: { id: data.id } })

      if (!saleQuote) return { error: true, status: 404, message: "Sale quote not found!", action: "DELETE_SALE_QUOTE" }

      await prisma.saleQuote.update({ where: { id: saleQuote.id }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })
      return { status: 200, message: "Sale quote deleted successfully!", action: "DELETE_SALE_QUOTE" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_SALE_QUOTE",
      }
    }
  })
