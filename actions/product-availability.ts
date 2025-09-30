"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { productAvailabilityFormSchema } from "@/schema/product-availability"
import { paramsSchema } from "@/schema/common"
import { Prisma } from "@prisma/client"
import { getManufacturerByCode } from "./manufacturer"
import { getItemGroupByCode } from "./master-item"

const PRODUCT_AVAILABILITY_INCLUDE = {
  supplier: {
    select: { CardCode: true, CardName: true, status: true, scope: true },
  },
} satisfies Prisma.ProductAvailabilityInclude

export async function getProductAvailabilities() {
  try {
    const productAvailabilities = await prisma.productAvailability.findMany({ include: PRODUCT_AVAILABILITY_INCLUDE })

    const manufacturerPromises = Promise.all([
      ...productAvailabilities
        .map((pa) => (pa.manufacturerCode ? getManufacturerByCode(pa.manufacturerCode) : Promise.resolve(null)))
        .filter(Boolean),
    ])

    const itemGroupPromises = Promise.all([
      ...productAvailabilities
        .map((pa) => (pa.itemGroupCode ? getItemGroupByCode(pa.itemGroupCode) : Promise.resolve(null)))
        .filter(Boolean),
    ])

    //* fetch manufacturers and item groups
    const [manufacturers, itemGroups] = await Promise.all([manufacturerPromises, itemGroupPromises])

    return productAvailabilities.map((pa) => {
      const manufacturer = (manufacturers?.find((m) => m?.code == pa?.manufacturerCode)?.ManufacturerName || "" )as string
      const itemGroup = (itemGroups?.find((g) => g?.number == pa?.itemGroupCode)?.GroupName || "") as string

      return { ...pa, manufacturer, itemGroup }
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getProductAvailabilityByCode(code: number) {
  try {
    return await prisma.productAvailability.findUnique({ where: { code }, include: PRODUCT_AVAILABILITY_INCLUDE })
  } catch (error) {
    console.error(error)
    return null
  }
}

export const upsertProductAvailability = action
  .use(authenticationMiddleware)
  .schema(productAvailabilityFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    try {
      const { id, ...data } = parsedInput
      const { userId } = ctx

      if (id && id !== "add") {
        const updatedProductAvailability = await prisma.productAvailability.update({ where: { id }, data: { ...data, updatedBy: userId } })
        return {
          status: 200,
          message: "Product availability updated successfully!",
          data: { productAvailability: updatedProductAvailability },
          action: "UPSERT_PRODUCT_AVAILABILITY",
        }
      }

      const newProductAvailability = await prisma.productAvailability.create({ data: { ...data, createdBy: userId, updatedBy: userId } })
      return {
        status: 200,
        message: "Product availability created successfully!",
        data: { productAvailability: newProductAvailability },
        action: "UPSERT_PRODUCT_AVAILABILITY",
      }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPSERT_PRODUCT_AVAILABILITY",
      }
    }
  })

export const deleteProductAvailability = action
  .use(authenticationMiddleware)
  .schema(paramsSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const productAvailability = await prisma.productAvailability.findUnique({ where: { id: data.id } })

      if (!productAvailability) {
        return { error: true, status: 404, message: "Product availability not found!", action: "DELETE_PRODUCT_AVAILABILITY" }
      }

      await prisma.productAvailability.update({ where: { id: data.id }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })
      return { status: 200, message: "Product availability deleted successfully!", action: "DELETE_PRODUCT_AVAILABILITY" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_PRODUCT_AVAILABILITY",
      }
    }
  })
