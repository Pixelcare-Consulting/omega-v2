"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { paramsSchema } from "@/schema/common"
import { importSchema } from "@/schema/import-export"
import { supplierQuoteFormSchema } from "@/schema/supplier-quote"
import { Prisma } from "@prisma/client"
import { parse } from "date-fns"
import { z } from "zod"

const SUPPLIER_QUOTE_INCLUDE = {
  requisition: {
    include: {
      salesPersons: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  },
  supplier: {
    include: {
      buyer: {
        select: { name: true, email: true },
      },
    },
  },
  buyers: {
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  },
} satisfies Prisma.SupplierQuoteInclude

export async function getSupplierQuotes() {
  try {
    const result = await prisma.supplierQuote.findMany({
      where: { deletedAt: null, deletedBy: null },
      include: SUPPLIER_QUOTE_INCLUDE,
    })

    return result.map((quote) => ({
      ...quote,
      quotedQuantity: quote?.quotedQuantity?.toString(),
      quotedPrice: quote?.quotedPrice?.toString(),
    }))
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getSupplierQuotesByReqCode(reqCode: number) {
  try {
    const result = await prisma.supplierQuote.findMany({
      where: { requisitionCode: reqCode, deletedAt: null, deletedBy: null },
      include: SUPPLIER_QUOTE_INCLUDE,
    })

    return result.map((quote) => ({
      ...quote,
      quotedQuantity: quote?.quotedQuantity?.toString(),
      quotedPrice: quote?.quotedPrice?.toString(),
    }))
  } catch (error) {
    console.error(error)
    return []
  }
}

export const getSupplierQuotesByReqCodeClient = action
  .use(authenticationMiddleware)
  .schema(z.object({ reqCode: z.number() }))
  .action(async ({ parsedInput: data }) => {
    return getSupplierQuotesByReqCode(data.reqCode)
  })

export async function getSupplierQuoteByCode(code: number) {
  try {
    const result = await prisma.supplierQuote.findUnique({
      where: { code: code },
      include: SUPPLIER_QUOTE_INCLUDE,
    })

    if (!result) return null

    return {
      ...result,
      quotedQuantity: result?.quotedQuantity?.toString(),
      quotedPrice: result?.quotedPrice?.toString(),
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function getSupplierQuotesByPartialMpn(partialMpn: string) {
  if (!partialMpn) return []

  try {
    const result = await prisma.supplierQuote.findMany({
      where: {
        item: {
          ItemCode: {
            startsWith: partialMpn,
            mode: "insensitive",
          },
        },
        deletedAt: null,
        deletedBy: null,
      },
      include: {
        supplier: { select: { CardCode: true, CardName: true } },
        item: { select: { ItemCode: true, ItemName: true, FirmCode: true, FirmName: true } },
      },
    })

    return result.map((item) => ({
      ...item,
      quotedQuantity: item?.quotedQuantity?.toString(),
      quotedPrice: item?.quotedPrice?.toString(),
    }))
  } catch (error) {
    console.error(error)
    return []
  }
}

export const getSupplierQuotesByPartialMpnClient = action
  .use(authenticationMiddleware)
  .schema(z.object({ partialMpn: z.string() }))
  .action(async ({ parsedInput: data }) => {
    return await getSupplierQuotesByPartialMpn(data.partialMpn)
  })

export const upsertSupplierQuote = action
  .use(authenticationMiddleware)
  .schema(supplierQuoteFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id, buyers, requisitionCode, ...data } = parsedInput
    const { userId } = ctx

    try {
      if (id && id !== "add") {
        const [updatedSupplierQuote] = await prisma.$transaction([
          //* update supplier quote
          prisma.supplierQuote.update({
            where: { id },
            data: { ...data, requisitionCode: parseInt(String(requisitionCode)), updatedBy: userId },
          }),

          //* delete the existing supplier quote's buyers
          prisma.supplierQuoteBuyer.deleteMany({ where: { supplierQuoteId: id } }),

          //* create new supplier quote buyers
          prisma.supplierQuoteBuyer.createMany({
            data: buyers?.map((buyer) => ({ supplierQuoteId: id, userId: buyer })) || [],
          }),
        ])

        return {
          status: 200,
          message: "Supplier quote updated successfully!",
          action: "UPSERT_SUPPLIER_QUOTE",
          data: { supplierQuote: updatedSupplierQuote },
        }
      }

      const newSupplierQuote = await prisma.supplierQuote.create({
        data: {
          ...data,
          requisitionCode: parseInt(String(requisitionCode)),
          createdBy: userId,
          updatedBy: userId,
          buyers: {
            create: buyers?.map((buyer) => ({ userId: buyer })) || [],
          },
        },
      })

      return {
        status: 200,
        message: "Supplier quote created successfully!",
        data: { supplierQuote: newSupplierQuote },
        action: "UPSERT_SUPPLIER_QUOTE",
      }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPSERT_SUPPLIER_QUOTE",
      }
    }
  })

export const deleteSupplierQuote = action
  .use(authenticationMiddleware)
  .schema(paramsSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const supplierQuote = await prisma.supplierQuote.findUnique({ where: { id: data.id } })

      if (!supplierQuote) return { error: true, status: 404, message: "Supplier quote not found!", action: "DELETE_SUPPLIER_QUOTE" }

      await prisma.supplierQuote.update({ where: { id: supplierQuote.id }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })
      return { status: 200, message: "Supplier quote deleted successfully!", action: "DELETE_SUPPLIER_QUOTE" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_SUPPLIER_QUOTE",
      }
    }
  })

export const supplierQuoteCreateMany = action
  .use(authenticationMiddleware)
  .schema(importSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { data, total, stats, isLastBatch } = parsedInput
    const { userId } = ctx

    try {
      const batch: Prisma.SupplierQuoteCreateManyInput[] = []

      const reqCodes = data
        .map((row) => (isNaN(parseInt(String(row?.["Requisition"]))) ? 0 : parseInt(String(row?.["Requisition"]))))
        .filter(Boolean)
      const uniqueReqCodes = [...new Set(reqCodes)]

      const supplierCodes = data.map((row) => row?.["Supplier"]).filter(Boolean)
      const uniqueSupplierCodes = [...new Set(supplierCodes)]

      const itemCodes = data.map((row) => row?.["Item"]).filter(Boolean)
      const uniqueItemCodes = [...new Set(itemCodes)]

      //* get existing requisition, supplier, item
      const [existingRequisitions, existingSuppliers, existingItems] = await Promise.all([
        prisma.requisition.findMany({ where: { code: { in: uniqueReqCodes } }, select: { code: true } }),
        prisma.businessPartner.findMany({ where: { CardCode: { in: uniqueSupplierCodes } }, select: { CardCode: true } }),
        prisma.item.findMany({ where: { ItemCode: { in: uniqueItemCodes } }, select: { ItemCode: true } }),
      ])

      for (let i = 0; i < data.length; i++) {
        const errors: string[] = []
        const row = data[i]

        const quantity = parseFloat(row?.["Quantity Quoted"])
        const price = parseFloat(row?.["Quoted Price"])

        //* check required fields
        if (
          !row?.["Date"] ||
          !row?.["Requisition"] ||
          !row?.["Status"] ||
          !row?.["Supplier"] ||
          !row?.["Item"] ||
          isNaN(quantity) ||
          isNaN(price) ||
          !quantity ||
          !price
        ) {
          errors.push("Missing required fields")
        }

        //* check if requisition exist, if not skip the row
        if (!existingRequisitions.find((r) => r.code == row?.["Requisition"])) {
          errors.push("Requisition not found")
        }

        if (!existingSuppliers.find((s) => s.CardCode === row?.["Supplier"])) {
          errors.push("Supplier not found")
        }

        if (!existingItems.find((i) => i.ItemCode === row?.["Item"])) {
          errors.push("Item not found")
        }

        //* if errors array is not empty, then update/push to stats.error
        if (errors.length > 0) {
          console.log("ERRORS:")
          console.log({ rowNumber: row.rowNumber, entries: errors }, "\n")

          stats.error.push({ rowNumber: row.rowNumber, entries: errors, row })
          continue
        }

        //* reshape data
        const supplierQuoteData: Prisma.SupplierQuoteCreateManyInput = {
          date: parse(row.Date, "MM/dd/yyyy", new Date()),
          requisitionCode: parseInt(String(row.Requisition)),
          status: row?.["Status"] || "",
          result: row?.["Result"] || "",
          sourcingRound: row?.["Sourcing Round"] || "",
          followUpDate: row?.["Follow Up Date"] ? parse(row["Follow Up Date"], "MM/dd/yyyy", new Date()) : null,
          supplierCode: row?.["Supplier"] || "",
          itemCode: row?.["Item"] || "",
          quotedQuantity: quantity,
          quotedPrice: price,
          createdBy: userId,
          updatedBy: userId,
        }

        // //* add to batch
        batch.push(supplierQuoteData)
      }

      //* commit the batch
      await prisma.supplierQuote.createMany({
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
        message: `${updatedStats.completed} supplier quotes created successfully!`,
        action: "BATCH_WRITE_SUPPLIER_QUOTE",
        stats: updatedStats,
      }
    } catch (error) {
      console.error("Batch Write Error - ", error)

      stats.error.push(...data.map((row) => ({ rowNumber: row.rowNumber, entries: ["Unexpected batch write error"], row })))

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Batch write error!",
        action: "BATCH_WRITE_SUPPLIER_QUOTE",
        stats,
      }
    }
  })
