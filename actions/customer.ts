"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { paramsSchema } from "@/schema/common"
import { customerFormSchema } from "@/schema/customer"

export async function getCustomers() {
  try {
    return await prisma.customer.findMany({ where: { deletedAt: null, deletedBy: null } })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getCustomerById(id: string) {
  try {
    return await prisma.customer.findUnique({ where: { id } })
  } catch (error) {
    console.error(error)
    return null
  }
}

export const upsertCustomer = action
  .use(authenticationMiddleware)
  .schema(customerFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id, ...data } = parsedInput
    const { userId } = ctx

    try {
      const existingCustomer = await prisma.customer.findFirst({
        where: { CardCode: data.CardCode, ...(id && id !== "add" && { id: { not: id } }) },
      })

      if (existingCustomer) return { error: true, status: 401, message: "Customer code already exists!" }

      if (id && id !== "add") {
        const updatedCustomer = await prisma.customer.update({ where: { id }, data: { ...data, updatedBy: userId } })
        return { status: 200, message: "Customer updated successfully!", data: { customer: updatedCustomer }, action: "UPSERT_CUSTOMER" }
      }

      const newCustomer = await prisma.customer.create({ data: { ...data, createdBy: userId, updatedBy: userId } })
      return { status: 200, message: "Customer created successfully!", data: { customer: newCustomer }, action: "UPSERT_CUSTOMER" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPSERT_CUSTOMER",
      }
    }
  })

export const deleteCustomer = action
  .use(authenticationMiddleware)
  .schema(paramsSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const customer = await prisma.customer.findUnique({ where: { id: data.id } })

      if (!customer) return { status: 404, message: "Customer not found!", action: "DELETE_CUSTOMER" }

      await prisma.customer.update({ where: { id: data.id }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })
      return { status: 200, message: "Customer deleted successfully!", action: "DELETE_CUSTOMER" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_CUSTOMER",
      }
    }
  })
