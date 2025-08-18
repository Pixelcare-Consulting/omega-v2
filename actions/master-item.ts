"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { callSapServiceLayerApi } from "@/lib/sap-service-layer"
import { paramsSchema } from "@/schema/common"
import { deleteItemMasterSchema, itemMasterFormSchema } from "@/schema/master-item"
import { isAfter, parse } from "date-fns"
import { revalidateTag, unstable_cache } from "next/cache"

const sapCredentials = {
  BaseURL: process.env.SAP_BASE_URL || "",
  CompanyDB: process.env.SAP_COMPANY_DB || "",
  UserName: process.env.SAP_USERNAME || "",
  Password: process.env.SAP_PASSWORD || "",
}

export async function getItems() {
  try {
    const cacheKey = "item-master"

    return await unstable_cache(
      async () => {
        return prisma.item.findMany({ where: { deletedAt: null, deletedBy: null } })
      },
      [cacheKey],
      { tags: [cacheKey] }
    )()
  } catch (error) {
    return []
  }
}

export async function getItemsByItemCode(code: string) {
  try {
    return await prisma.item.findUnique({ where: { ItemCode: code } })
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function getItemMasterGroups() {
  try {
    return await callSapServiceLayerApi(`${sapCredentials.BaseURL}/b1s/v1/ItemGroups`, undefined, {
      Prefer: "odata.maxpagesize=999",
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export const upsertItem = action
  .use(authenticationMiddleware)
  .schema(itemMasterFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id, ...data } = parsedInput
    const { userId } = ctx

    const cacheKey = "item-master"

    try {
      const existingItem = await prisma.item.findFirst({
        where: { ItemCode: data.ItemCode, ...(id && id !== "add" && { id: { not: id } }) },
      })

      if (existingItem) return { error: true, status: 401, message: "Code already exists!" }

      const isManageBatchNumbers = data?.ManBtchNum ? "Y" : "N"
      const isVatLiable = data?.VATLiable ? "Y" : "N"
      const isPurchaseItem = data?.PrchseItem ? "Y" : "N"
      const isSalesItem = data?.SellItem ? "Y" : "N"
      const isInventoryItem = data?.InvntItem ? "Y" : "N"

      if (id && id != "add") {
        const updatedItem = await prisma.item.update({
          where: { id },
          data: {
            ...data,
            VATLiable: isVatLiable,
            PrchseItem: isPurchaseItem,
            SellItem: isSalesItem,
            InvntItem: isInventoryItem,
            ManBtchNum: isManageBatchNumbers,
            updatedBy: userId,
          },
        })

        revalidateTag(cacheKey)

        return { status: 200, message: "Item updated successfully!", data: { item: updatedItem }, action: "UPSERT_ITEM" }
      }

      const newItem = await prisma.item.create({
        data: {
          ...data,
          VATLiable: isVatLiable,
          PrchseItem: isPurchaseItem,
          SellItem: isSalesItem,
          InvntItem: isInventoryItem,
          ManBtchNum: isManageBatchNumbers,
          createdBy: userId,
          updatedBy: userId,
        },
      })

      revalidateTag(cacheKey)

      return { status: 200, message: "Item created successfully!", data: { item: newItem }, action: "UPSERT_ITEM" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPSERT_ITEM",
      }
    }
  })

export const deleteItem = action
  .use(authenticationMiddleware)
  .schema(deleteItemMasterSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const cacheKey = "item-master"

      const item = await prisma.item.findUnique({ where: { ItemCode: data.code } })

      if (!item) return { status: 404, message: "Item not found!", action: "DELETE_ITEM" }

      await prisma.item.update({ where: { ItemCode: data.code }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })

      revalidateTag(cacheKey)

      return { status: 200, message: "Item deleted successfully!", action: "DELETE_ITEM" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_ITEM",
      }
    }
  })

export const syncItemMaster = action.use(authenticationMiddleware).action(async ({ ctx }) => {
  let success = false

  const { userId } = ctx
  const cacheKey = "item-master"
  const SYNC_META_CODE = "item"

  try {
    //* fetch SAP master item data, portal master item data, sync meta
    const data = await Promise.allSettled([
      callSapServiceLayerApi(`${sapCredentials.BaseURL}/b1s/v1/SQLQueries('query2')/List`),
      prisma.item.findMany(),
      prisma.syncMeta.findUnique({ where: { code: SYNC_META_CODE } }),
    ])

    const sapItemMasters = data[0].status === "fulfilled" ? data[0]?.value?.value || [] : []
    const portalItemMasters = data[1].status === "fulfilled" ? data[1]?.value || [] : []
    const lastSyncDate = data[2].status === "fulfilled" ? data[2]?.value?.lastSyncAt || new Date("01/01/2020") : new Date("01/01/2020")

    //* check if portalItemMasters has data or not, if dont have data insert sapItemMasters into portal, otherwise update portalItemMasters based on sapItemMasters
    if (portalItemMasters.length === 0) {
      await prisma.$transaction([
        prisma.item.createMany({
          data: sapItemMasters?.map((row: any) => ({ ...row, source: "sap", syncStatus: "synced" })),
        }),
        prisma.syncMeta.update({ where: { code: SYNC_META_CODE }, data: { lastSyncAt: new Date(), updatedBy: userId } }),
      ])

      success = true
    } else {
      //*  filter the records where CreateDate > lastSyncDate or  UpdateDate > lastSyncDate
      const filteredSapItemMasters =
        sapItemMasters?.filter((row: any) => {
          const createDate = parse(row.CreateDate, "yyyyMMdd", new Date())
          const updateDate = parse(row.UpdateDate, "yyyyMMdd", new Date())
          return isAfter(createDate, lastSyncDate) || isAfter(updateDate, lastSyncDate)
        }) || []

      const upsertPromises = filteredSapItemMasters.map((row: any) => {
        return prisma.item.upsert({
          where: { ItemCode: row.ItemCode },
          create: { ...row, source: "sap", syncStatus: "synced" },
          update: { ...row, source: "sap", syncStatus: "synced" },
        })
      })

      //* perform upsert and  update the sync meta
      await prisma.$transaction([
        ...upsertPromises,
        prisma.syncMeta.update({ where: { code: SYNC_META_CODE }, data: { lastSyncAt: new Date(), updatedBy: userId } }),
      ])

      success = true
    }
  } catch (error) {
    console.error(error)
  }

  //* revalidate the cache
  if (success) {
    revalidateTag(cacheKey)
    return { status: 200, message: "Sync completed successfully!", action: "ITEM_MASTER_SYNC" }
  } else return { error: true, status: 500, message: "Failed to sync, please try again later!", action: "ITEM_MASTER_SYNC" }
})
