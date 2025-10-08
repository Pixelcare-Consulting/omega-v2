"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { productCommodityFormSchema } from "@/schema/product-commodity"
import { paramsSchema } from "@/schema/common"

export async function getProductCommodities() {
  try {
    return await prisma.productCommodity.findMany({
      where: { deletedAt: null, deletedBy: null },
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getProductCommodityByCode(code: number) {
  try {
    return await prisma.productCommodity.findUnique({ where: { code } })
  } catch (error) {
    console.error(error)
    return null
  }
}

export const upsertProductCommodity = action
  .use(authenticationMiddleware)
  .schema(productCommodityFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id, ...data } = parsedInput
    const { userId } = ctx

    try {
      if (id && id !== "add") {
        const updatedProductCommodity = await prisma.productCommodity.update({ where: { id }, data: { ...data, updatedBy: userId } })
        return {
          status: 200,
          message: "Product commodity updated successfully!",
          data: { productCommodity: updatedProductCommodity },
          action: "UPSERT_PRODUCT_COMMODITY",
        }
      }

      const newProductCommodity = await prisma.productCommodity.create({ data: { ...data, createdBy: userId, updatedBy: userId } })
      return {
        status: 200,
        message: "Product commodity created successfully!",
        data: { productCommodity: newProductCommodity },
        action: "UPSERT_PRODUCT_COMMODITY",
      }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPSERT_PRODUCT_COMMODITY",
      }
    }
  })

export const deleteProductCommodity = action
  .use(authenticationMiddleware)
  .schema(paramsSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const productCommodity = await prisma.productCommodity.findUnique({ where: { id: data.id } })

      if (!productCommodity) {
        return { error: true, status: 404, message: "Product commodity not found!", action: "DELETE_PRODUCT_COMMODITY" }
      }

      await prisma.productCommodity.update({ where: { id: data.id }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })
      return { status: 200, message: "Product commodity deleted successfully!", action: "DELETE_PRODUCT_COMMODITY" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_PRODUCT_COMMODITY",
      }
    }
  })
