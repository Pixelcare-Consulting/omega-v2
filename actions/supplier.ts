"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { paramsSchema } from "@/schema/common"
import { supplierFormSchema } from "@/schema/supplier"

export async function getSuppliers() {
  try {
    return await prisma.supplier.findMany({ where: { deletedAt: null, deletedBy: null } })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getSupplierById(id: string) {
  try {
    return await prisma.supplier.findUnique({ where: { id } })
  } catch (error) {
    console.error(error)
    return null
  }
}
export const upsertSupplier = action
  .use(authenticationMiddleware)
  .schema(supplierFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id, ...data } = parsedInput
    const { userId } = ctx

    try {
      const existingSupplier = await prisma.supplier.findFirst({
        where: { CardCode: data.CardCode, ...(id && id !== "add" && { id: { not: id } }) },
      })

      if (existingSupplier) return { error: true, status: 401, message: "Supplier code already exists!" }

      if (id && id !== "add") {
        const updatedSupplier = await prisma.supplier.update({ where: { id }, data: { ...data, updatedBy: userId } })
        return { status: 200, message: "Supplier updated successfully!", data: { supplier: updatedSupplier }, action: "UPSERT_SUPPLIER" }
      }

      const newSupplier = await prisma.supplier.create({ data: { ...data, createdBy: userId, updatedBy: userId } })
      return { status: 200, message: "Supplier created successfully!", data: { supplier: newSupplier }, action: "UPSERT_SUPPLIER" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPSERT_SUPPLIER",
      }
    }
  })

export const deleteSupplier = action
  .use(authenticationMiddleware)
  .schema(paramsSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const supplier = await prisma.supplier.findUnique({ where: { id: data.id } })

      if (!supplier) return { status: 404, message: "Supplier not found!", action: "DELETE_SUPPLIER" }

      await prisma.supplier.update({ where: { id: data.id }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })
      return { status: 200, message: "Supplier deleted successfully!", action: "DELETE_SUPPLIER" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_SUPPLIER",
      }
    }
  })
