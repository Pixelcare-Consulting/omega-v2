"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { productBrandFormSchema } from "@/schema/product-brand"
import { paramsSchema } from "@/schema/common"

export async function getProductBrands() {
  try {
    return await prisma.productBrand.findMany({
      where: { deletedAt: null, deletedBy: null },
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getProductBrandByCode(code: number) {
  try {
    return await prisma.productBrand.findUnique({ where: { code } })
  } catch (error) {
    console.error(error)
    return null
  }
}

export const upsertProductBrand = action
  .use(authenticationMiddleware)
  .schema(productBrandFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id, ...data } = parsedInput
    const { userId } = ctx

    try {
      if (id && id !== "add") {
        const updatedProductBrand = await prisma.productBrand.update({ where: { id }, data: { ...data, updatedBy: userId } })
        return {
          status: 200,
          message: "Product brand updated successfully!",
          data: { productBrand: updatedProductBrand },
          action: "UPSERT_PRODUCT_BRAND",
        }
      }

      const newProductBrand = await prisma.productBrand.create({ data: { ...data, createdBy: userId, updatedBy: userId } })
      return {
        status: 200,
        message: "Product brand created successfully!",
        data: { productBrand: newProductBrand },
        action: "UPSERT_PRODUCT_BRAND",
      }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPSERT_PRODUCT_BRAND",
      }
    }
  })

export const deleteProductBrand = action
  .use(authenticationMiddleware)
  .schema(paramsSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const productBrand = await prisma.productBrand.findUnique({ where: { id: data.id } })

      if (!productBrand) {
        return { error: true, status: 404, message: "Product brand not found!", action: "DELETE_PRODUCT_BRAND" }
      }

      await prisma.productBrand.update({ where: { id: data.id }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })
      return { status: 200, message: "Product brand deleted successfully!", action: "DELETE_PRODUCT_BRAND" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_PRODUCT_BRAND",
      }
    }
  })
