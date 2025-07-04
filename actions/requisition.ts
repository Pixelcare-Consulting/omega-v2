"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { paramsSchema } from "@/schema/common"
import { requisitionFormSchema } from "@/schema/requisition"

export async function getRequisitions() {
  try {
    return await prisma.requisition.findMany({ where: { deletedAt: null, deletedBy: null } })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getRequisitionById(id: string) {
  try {
    return await prisma.requisition.findUnique({ where: { id } })
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

    try {
      if (id && id !== "add") {
        const [updatedRequisition] = await prisma.$transaction([
          //* update requisition
          prisma.requisition.update({ where: { id }, data: { ...data, reqReviewResult: data?.reqReviewResult || [], updatedBy: userId } }),

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

      if (!requisition) return { status: 404, message: "Requisition not found!", action: "DELETE_REQUISITION" }

      await prisma.requisition.update({ where: { id: data.id }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })
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
