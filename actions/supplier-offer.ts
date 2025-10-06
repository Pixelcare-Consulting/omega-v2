"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { supplierOfferFormSchema, updateLineItemFormSchema } from "@/schema/supplier-offer"
import { paramsSchema } from "@/schema/common"
import { Prisma } from "@prisma/client"
import { importSchema } from "@/schema/import-export"
import { isValid, parse } from "date-fns"

const SUPPLIER_OFFER_INCLUDE = {
  supplier: { select: { CardCode: true, CardName: true } },
  listOwner: { select: { name: true, email: true } },
} satisfies Prisma.SupplierOfferInclude

export type LineItemsJSONData = {
  cpn?: string | null
  mpn?: string | null
  mfr?: string | null
  qtyOnHand?: number | null
  qtyOrdered?: number | null
  unitPrice?: number | null
  dateCode?: string | null
  notes?: string | null
}[]

export async function getSupplierOffers() {
  try {
    return await prisma.supplierOffer.findMany({
      where: { deletedAt: null, deletedBy: null },
      include: SUPPLIER_OFFER_INCLUDE,
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getSupplierOfferByCode(code: number) {
  try {
    return await prisma.supplierOffer.findUnique({ where: { code }, include: SUPPLIER_OFFER_INCLUDE })
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function getSupplierOfferLineItemsByFileName(fileName: string) {
  try {
    const supplierOffer = await prisma.supplierOffer.findUnique({ where: { fileName }, include: SUPPLIER_OFFER_INCLUDE })

    if (!supplierOffer) return []

    const lineItems = (supplierOffer?.lineItems || []) as LineItemsJSONData

    return lineItems.map((item) => ({
      ...item,
      fileName: supplierOffer.fileName,
      listDate: supplierOffer.listDate,
      supplier: supplierOffer.supplier,
      listOwner: supplierOffer.listOwner,
    }))
  } catch (error) {
    console.error(error)
    return []
  }
}

export const upsertSupplierOffer = action
  .use(authenticationMiddleware)
  .schema(supplierOfferFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id, lineItems, ...data } = parsedInput
    const { userId } = ctx

    try {
      const existingSupplierOffer = await prisma.supplierOffer.findFirst({
        where: { fileName: data.fileName, ...(id && id !== "add" && { id: { not: id } }) },
      })

      //* check if existing
      if (existingSupplierOffer) {
        return { error: true, status: 401, message: "File name already exists!", action: "UPSERT_SUPPLIER_OFFER" }
      }

      if (id && id !== "add") {
        const updatedSupplierOffer = await prisma.supplierOffer.update({ where: { id }, data: { ...data, lineItems, updatedBy: userId } })
        return {
          status: 200,
          message: "Supplier offer updated successfully!",
          data: { supplierOffer: updatedSupplierOffer },
          action: "UPSERT_SUPPLIER_OFFER",
        }
      }

      const newSupplierOffer = await prisma.supplierOffer.create({
        data: { ...data, lineItems, createdBy: userId, updatedBy: userId },
      })
      return {
        status: 200,
        message: "Supplier offer created successfully!",
        data: { supplierOffer: newSupplierOffer },
        action: "UPSERT_SUPPLIER_OFFER",
      }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPSERT_SUPPLIER_OFFER",
      }
    }
  })

export const deleteSupplierOffer = action
  .use(authenticationMiddleware)
  .schema(paramsSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const supplierOffer = await prisma.supplierOffer.findUnique({ where: { id: data.id } })

      if (!supplierOffer) return { error: true, status: 404, message: "Supplier offer not found!", action: "DELETE_SUPPLIER_OFFER" }

      await prisma.supplierOffer.update({ where: { id: data.id }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })
      return { status: 200, message: "Supplier offer deleted successfully!", action: "DELETE_SUPPLIER_OFFER" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_SUPPLIER_OFFER",
      }
    }
  })

export const updateLineItems = action
  .use(authenticationMiddleware)
  .schema(updateLineItemFormSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const { userId } = ctx
      const lineItems = data.lineItems

      const existingSupplierOffer = await prisma.supplierOffer.findUnique({ where: { id: data.supplierOfferId } })

      if (!existingSupplierOffer) {
        return { error: true, status: 404, message: "Supplier offer not found!", action: "UPDATE_SUPPLIER_OFFER_LINE_ITEMS" }
      }

      await prisma.supplierOffer.update({ where: { id: existingSupplierOffer.id }, data: { lineItems, updatedBy: userId } })

      return { status: 200, message: `Line item ${data.action}d successfully!`, action: "UPDATE_SUPPLIER_OFFER_LINE_ITEMS" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPDATE_SUPPLIER_OFFER_LINE_ITEMS",
      }
    }
  })

export const supplierOfferCreateMany = action
  .use(authenticationMiddleware)
  .schema(importSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { data, total, stats, isLastBatch } = parsedInput
    const { userId } = ctx

    const fileNames = data?.map((row: any) => row?.["File Name"]).filter(Boolean) || []
    const supplierCodes = data?.map((row: any) => row?.["Supplier"]).filter(Boolean) || []

    try {
      const batch: Prisma.SupplierOfferCreateManyInput[] = []

      //* get existing supplier offer fileNames, supplier codes
      const [existingSuppOff, existingSupplier] = await Promise.all([
        prisma.supplierOffer.findMany({
          where: { fileName: { in: fileNames } },
          select: { fileName: true },
        }),
        prisma.businessPartner.findMany({
          where: { CardCode: { in: supplierCodes } },
          select: { CardCode: true },
        }),
      ])

      for (let i = 0; i < data.length; i++) {
        const errors: string[] = []
        const row = data[i]

        const lineItems = row?.["Line Items"]?.filter(Boolean) || []

        const isEveryItemQtyOnHandValid = lineItems.every((item: any) => {
          const qtyOnHand = parseFloat(item?.["Qty On Hand"])
          if (!item?.["Qty On Hand"]) return true
          return item?.["Qty On Hand"] && !isNaN(qtyOnHand)
        })

        const isEveryItemQtyOrderedValid = lineItems.every((item: any) => {
          const qtyOrdered = parseFloat(item?.["Qty Ordered"])
          if (!item?.["Qty Ordered"]) return true
          return item?.["Qty Ordered"] && !isNaN(qtyOrdered)
        })

        const isEveryItemUnitPriceValid = lineItems.every((item: any) => {
          const unitPrice = parseFloat(item?.["Unit Price"])
          if (!item?.["Unit Price"]) return true
          return item?.["Unit Price"] && !isNaN(unitPrice)
        })

        //* check required fields
        if (!row?.["List Date"] || !row?.["Supplier"] || !row?.["File Name"]) {
          errors.push("Missing required fields")
        }

        //* check if supplier code exists, if not then add to errors
        if (!existingSupplier.find((item) => item.CardCode === row?.["Supplier"])) {
          errors.push("Supplier code does not exist")
        }

        //* check if fileName already exists
        if (existingSuppOff.find((item) => item.fileName === row?.["File Name"])) {
          errors.push("File name already exists")
        }

        //* check if list date is valid
        if (!isValid(parse(row?.["List Date"], "MM-dd-yyyy", new Date()))) {
          errors.push("List date is invalid")
        }

        //* if all qty on hand of each line item is valid
        if (!isEveryItemQtyOnHandValid) {
          errors.push("One or more line items have invalid qty on hand")
        }

        //* if qty ordered exist, check if qty ordered is valid
        if (!isEveryItemQtyOrderedValid) {
          errors.push("One or more line items have invalid qty ordered")
        }

        //* if unit price exist, check if unit price is valid
        if (!isEveryItemUnitPriceValid) {
          errors.push("One or more line items have invalid unit price")
        }

        //* if errors array is not empty, then update/push to stats.error
        if (errors.length > 0) {
          console.log("ERRORS:")
          console.log({ rowNumber: row.rowNumber, entries: errors }, "\n")

          stats.error.push({ rowNumber: row.rowNumber, entries: errors, row })
          continue
        }

        //* reshape data
        const supplierOfferData: Prisma.SupplierOfferCreateManyInput = {
          listDate: parse(row?.["List Date"], "MM-dd-yyyy", new Date()),
          supplierCode: row?.["Supplier"],
          fileName: row?.["File Name"],
          listOwnerId: userId,
          lineItems,
        }

        // //* add to batch
        batch.push(supplierOfferData)
      }

      //* commit the batch
      await prisma.supplierOffer.createMany({
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
        message: `${updatedStats.completed} supplier offers created successfully!`,
        action: "BATCH_WSUPPLIER_OFFER",
        stats: updatedStats,
      }
    } catch (error) {
      console.error("Batch Write Error - ", error)

      stats.error.push(...data.map((row) => ({ rowNumber: row.rowNumber, entries: ["Unexpected batch write error"], row })))

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Batch write error!",
        action: "BATCH_WSUPPLIER_OFFER",
        stats,
      }
    }
  })
