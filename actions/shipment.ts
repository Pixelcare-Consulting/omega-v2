"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { ShipmentForm, shipmentFormSchema } from "@/schema/shipment"
import { paramsSchema } from "@/schema/common"
import { Prisma } from "@prisma/client"

const SHIPMENT_INCLUDE = {
  requisition: true,
  supplierQuote: true,
  purchaser: { select: { name: true, email: true } },
} satisfies Prisma.ShipmentInclude

export async function getShipments() {
  try {
    return await prisma.shipment.findMany({
      where: { deletedAt: null, deletedBy: null },
      include: SHIPMENT_INCLUDE,
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getShipmentsByReqCode(reqCode: number) {
  try {
    return await prisma.shipment.findMany({
      where: { requisitionCode: reqCode, deletedAt: null, deletedBy: null },
      include: SHIPMENT_INCLUDE,
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getShipmentByCode(code: number) {
  try {
    return await prisma.shipment.findUnique({ where: { code }, include: SHIPMENT_INCLUDE })
  } catch (error) {
    console.error(error)
    return null
  }
}

export const upsertShipment = action
  .use(authenticationMiddleware)
  .schema(shipmentFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    try {
      const { id, ...data } = parsedInput
      const { userId } = ctx

      if (id && id !== "add") {
        const updatedShipment = await prisma.shipment.update({ where: { id }, data: { ...data, updatedBy: userId } })
        return {
          status: 200,
          message: "Shipment updated successfully!",
          data: { shipment: updatedShipment },
          action: "UPSERT_SHIPMENT",
        }
      }

      const newShipment = await prisma.shipment.create({ data: { ...data, createdBy: userId, updatedBy: userId } })
      return {
        status: 200,
        message: "Shipment created successfully!",
        data: { shipment: newShipment },
        action: "UPSERT_SHIPMENT",
      }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPSERT_SHIPMENT",
      }
    }
  })

export const deleteShipment = action
  .use(authenticationMiddleware)
  .schema(paramsSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const shipment = await prisma.shipment.findUnique({ where: { id: data.id } })

      if (!shipment) return { error: true, status: 404, message: "Shipment not found!", action: "DELETE_SHIPMENT" }

      await prisma.shipment.update({ where: { id: data.id }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })
      return { status: 200, message: "Shipment deleted successfully!", action: "DELETE_SHIPMENT" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_SHIPMENT",
      }
    }
  })
