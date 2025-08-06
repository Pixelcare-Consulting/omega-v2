"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { paramsSchema } from "@/schema/common"
import { supplierQuoteFormSchema } from "@/schema/supplier-quote"

export async function getSupplierQuotes() {
  try {
    const result = await prisma.supplierQuote.findMany({
      where: { deletedAt: null, deletedBy: null },
      include: {
        requisition: { include: { salesPersons: { include: { user: { select: { name: true, email: true } } } } } },
        supplier: true,
        buyers: { include: { user: { select: { name: true, email: true } } } },
      },
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

export async function getSupplierQuoteByCode(code: number) {
  try {
    const result = await prisma.supplierQuote.findUnique({
      where: { code: code },
      include: {
        requisition: true,
        supplier: { include: { buyer: { select: { name: true, email: true } } } },
        buyers: { include: { user: { select: { name: true, email: true } } } },
      },
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
