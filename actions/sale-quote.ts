"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { paramsSchema } from "@/schema/common"
import { saleQuoteFormSchema, updateLineItemForm } from "@/schema/sale-quote"
import { getSupplierQuoteByCode } from "./supplier-quote"
import { getBpMasterByCardCode } from "./master-bp"
import { Contact, Prisma } from "@prisma/client"
import { importSchema } from "@/schema/import-export"
import { parse } from "date-fns"

export type LineItemsJSONData = {
  requisitionCode: number
  supplierQuoteCode: number
  code: string
  unitPrice: number
  quantity: number
  leadTime: string
  details: {
    mpn?: string
    mfr?: string
    dateCode?: string
    condition?: string
    coo?: string
    leadTime?: string
    notes?: string
  }
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
    const saleQuote = await prisma.saleQuote.findUnique({
      where: { code, deletedAt: null, deletedBy: null },
      include: {
        salesRep: { select: { name: true, email: true } },
        approval: { select: { name: true, email: true } },
      },
    })

    if (!saleQuote) return null

    const customer = await getBpMasterByCardCode(saleQuote.customerCode)
    const lineItems = (saleQuote?.lineItems || []) as LineItemsJSONData
    const [supplierQuotes, contact] = await Promise.all([
      Promise.all(lineItems.map((li) => getSupplierQuoteByCode(li.supplierQuoteCode))).then((data) => data.filter((sq) => sq !== null)),
      ...(customer?.CntctPrsn ? [prisma.contact.findUnique({ where: { id: customer?.CntctPrsn } })] : []),
    ])

    return {
      ...saleQuote,
      customer,
      supplierQuotes,
      contact,
    } as typeof saleQuote & {
      customer: NonNullable<Awaited<ReturnType<typeof getBpMasterByCardCode>>>
      contact: Contact | null
      supplierQuotes: NonNullable<Awaited<ReturnType<typeof getSupplierQuoteByCode>>>[]
    }
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
      details: item.details,
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

export const updateLineItems = action
  .use(authenticationMiddleware)
  .schema(updateLineItemForm)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const { userId } = ctx
      const saleQuote = await prisma.saleQuote.findUnique({ where: { id: data.saleQuoteId } })
      const lineItems = data.lineItems.map((item) => ({
        requisitionCode: item.requisitionCode,
        supplierQuoteCode: item.supplierQuoteCode,
        code: item.code,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        details: item.details,
      }))

      if (!saleQuote) return { error: true, status: 404, message: "Sale quote not found!", action: "UPDATE_LINE_ITEMS" }

      await prisma.saleQuote.update({ where: { id: saleQuote.id }, data: { lineItems, updatedBy: userId } })

      return { status: 200, message: `Line item ${data.action}d successfully!`, action: "UPDATE_LINE_ITEMS" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPDATE_LINE_ITEMS",
      }
    }
  })

export const salesQuoteCreateMany = action
  .use(authenticationMiddleware)
  .schema(importSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { data, total, stats, isLastBatch } = parsedInput
    const { userId } = ctx

    try {
      const batch: Prisma.SaleQuoteCreateManyInput[] = []

      for (let i = 0; i < data.length; i++) {
        const row = data[i]

        const paymentTerms = parseInt(row?.["Payment Terms"])

        //* check required fields
        if (
          !row?.["Date"] ||
          !row?.["Customer"] ||
          !row?.["Sales Rep"] ||
          isNaN(paymentTerms) ||
          !paymentTerms ||
          !row?.["Valid Until"] ||
          !row?.["Approval"] ||
          !row?.["Approval Date"]
        ) {
          console.log("Skipping row due to missing required fields", row)
          stats.error.push({ rowNumber: row.rowNumber, description: "Missing required fields", row })
          continue
        }

        if (row?.["Line Items"]?.length < 1) {
          console.log("Skipping row due to missing line items", row)
          stats.error.push({ rowNumber: row.rowNumber, description: "Missing line items", row })
          continue
        }

        //* reshape data
        const requisitionData: Prisma.SaleQuoteCreateManyInput = {
          date: parse(row?.["Date"], "MM/dd/yyyy", new Date()),
          customerCode: row?.["Customer"],
          salesRepId: row?.["Sales Rep"],
          billTo: row?.["Bill To"],
          shipTo: row?.["Ship To"],
          paymentTerms: paymentTerms,
          fobPoint: row?.["FOB Point"],
          shippingMethod: row?.["Shipping Method"],
          validUntil: parse(row?.["Valid Until"], "MM/dd/yyyy", new Date()),
          approvalId: row?.["Approval"],
          approvalDate: parse(row?.["Approval Date"], "MM/dd/yyyy", new Date()),
          lineItems: row?.["Line Items"],
          createdBy: userId,
          updatedBy: userId,
        }

        //* add to batch
        batch.push(requisitionData)
      }

      //* commit the batch
      await prisma.saleQuote.createMany({
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
        message: `${updatedStats.completed} sales quotes created successfully!`,
        action: "BATCH_WRITE_SALES_QUOTE",
        stats: updatedStats,
      }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Batch write error!",
        action: "BATCH_WRITE_SALES_QUOTE",
      }
    }
  })
