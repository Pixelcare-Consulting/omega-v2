"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { customerExcessFormSchema, updateLineItemFormSchema } from "@/schema/customer-excess"
import { paramsSchema } from "@/schema/common"
import { Prisma } from "@prisma/client"
import { importSchema } from "@/schema/import-export"
import { isValid, parse } from "date-fns"

const CUSTOMER_EXCESS_INCLUDE = {
  customer: { select: { CardCode: true, CardName: true } },
  listOwner: { select: { name: true, email: true } },
} satisfies Prisma.CustomerExcessInclude

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

export async function getCustomerExcesses() {
  try {
    return await prisma.customerExcess.findMany({
      where: { deletedAt: null, deletedBy: null },
      include: CUSTOMER_EXCESS_INCLUDE,
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getCustomerExcessByCode(code: number) {
  try {
    return await prisma.customerExcess.findUnique({ where: { code }, include: CUSTOMER_EXCESS_INCLUDE })
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function getCustomerExcessLineItemsByFileName(fileName: string) {
  try {
    const customerExcess = await prisma.customerExcess.findUnique({ where: { fileName }, include: CUSTOMER_EXCESS_INCLUDE })

    if (!customerExcess) return []

    const lineItems = (customerExcess?.lineItems || []) as LineItemsJSONData

    return lineItems.map((item) => ({
      ...item,
      fileName: customerExcess.fileName,
      listDate: customerExcess.listDate,
      customer: customerExcess.customer,
      listOwner: customerExcess.listOwner,
    }))
  } catch (error) {
    console.error(error)
    return []
  }
}

export const upsertCustomerExcess = action
  .use(authenticationMiddleware)
  .schema(customerExcessFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id, lineItems, ...data } = parsedInput
    const { userId } = ctx

    try {
      const existingCustomerExcess = await prisma.customerExcess.findFirst({
        where: { fileName: data.fileName, ...(id && id !== "add" && { id: { not: id } }) },
      })

      //* check if existing
      if (existingCustomerExcess) {
        return { error: true, status: 401, message: "File name already exists!", action: "UPSERT_CUSTOMER_EXCESS" }
      }

      if (id && id !== "add") {
        const updatedCustomerExcess = await prisma.customerExcess.update({ where: { id }, data: { ...data, lineItems, updatedBy: userId } })
        return {
          status: 200,
          message: "Customer excess updated successfully!",
          data: { customerExcess: updatedCustomerExcess },
          action: "UPSERT_CUSTOMER_EXCESS",
        }
      }

      const newCustomerExcess = await prisma.customerExcess.create({
        data: { ...data, lineItems, createdBy: userId, updatedBy: userId },
      })
      return {
        status: 200,
        message: "Customer excess created successfully!",
        data: { customerExcess: newCustomerExcess },
        action: "UPSERT_CUSTOMER_EXCESS",
      }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPSERT_CUSTOMER_EXCESS",
      }
    }
  })

export const deleteCustomerExcess = action
  .use(authenticationMiddleware)
  .schema(paramsSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const customerExcess = await prisma.customerExcess.findUnique({ where: { id: data.id } })

      if (!customerExcess) return { error: true, status: 404, message: "Customer excess not found!", action: "DELETE_CUSTOMER_EXCESS" }

      await prisma.customerExcess.update({ where: { id: data.id }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })
      return { status: 200, message: "Customer excess deleted successfully!", action: "DELETE_CUSTOMER_EXCESS" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_CUSTOMER_EXCESS",
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

      const existingCustomerExcess = await prisma.customerExcess.findUnique({ where: { id: data.customerExcessId } })

      if (!existingCustomerExcess) {
        return { error: true, status: 404, message: "Customer excess not found!", action: "UPDATE_CUSTOMER_EXCESS_LINE_ITEMS" }
      }

      await prisma.customerExcess.update({ where: { id: existingCustomerExcess.id }, data: { lineItems, updatedBy: userId } })

      return { status: 200, message: `Line item ${data.action}d successfully!`, action: "UPDATE_CUSTOMER_EXCESS_LINE_ITEMS" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPDATE_CUSTOMER_EXCESS_LINE_ITEMS",
      }
    }
  })

export const customerExcessCreateMany = action
  .use(authenticationMiddleware)
  .schema(importSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { data, total, stats, isLastBatch } = parsedInput
    const { userId } = ctx

    const fileNames = data?.map((row: any) => row?.["File Name"]).filter(Boolean) || []
    const customerCodes = data?.map((row: any) => row?.["Customer"]).filter(Boolean) || []

    try {
      const batch: Prisma.CustomerExcessCreateManyInput[] = []

      //* get existing customer excess fileNames, customer codes
      const [existingCustExec, existingCustomer] = await Promise.all([
        prisma.customerExcess.findMany({
          where: { fileName: { in: fileNames } },
          select: { fileName: true },
        }),
        prisma.businessPartner.findMany({
          where: { CardCode: { in: customerCodes } },
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
        if (!row?.["List Date"] || !row?.["Customer"] || !row?.["File Name"]) {
          errors.push("Missing required fields")
        }

        //* check if customer code exists, if not then add to errors
        if (!existingCustomer.find((item) => item.CardCode === row?.["Customer"])) {
          errors.push("Customer code does not exist")
        }

        //* check if fileName already exists
        if (existingCustExec.find((item) => item.fileName === row?.["File Name"])) {
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
        const customerExcessData: Prisma.CustomerExcessCreateManyInput = {
          listDate: parse(row?.["List Date"], "MM-dd-yyyy", new Date()),
          customerCode: row?.["Customer"],
          fileName: row?.["File Name"],
          listOwnerId: userId,
          lineItems,
        }

        // //* add to batch
        batch.push(customerExcessData)
      }

      //* commit the batch
      await prisma.customerExcess.createMany({
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
        message: `${updatedStats.completed} customer excesses created successfully!`,
        action: "BATCH_WRITE_CUSTOMER_EXCESS",
        stats: updatedStats,
      }
    } catch (error) {
      console.error("Batch Write Error - ", error)

      stats.error.push(...data.map((row) => ({ rowNumber: row.rowNumber, entries: ["Unexpected batch write error"], row })))

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Batch write error!",
        action: "BATCH_WRITE_CUSTOMER_EXCESS",
        stats,
      }
    }
  })
