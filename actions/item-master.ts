"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { callSapServiceLayerApi } from "@/lib/sap-service-layer"
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
        return prisma.item.findMany()
      },
      [cacheKey],
      { tags: [cacheKey] }
    )()
  } catch (error) {
    return []
  }
}

export async function getItemsByItemCode({ itemCode }: { itemCode: string }) {
  try {
    return await prisma.item.findUnique({ where: { ItemCode: itemCode } })
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function getItemMasterGroups() {
  try {
    return await callSapServiceLayerApi(`${sapCredentials.BaseURL}/b1s/v1/ItemGroups`)
  } catch (error) {
    console.error(error)
    return []
  }
}

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
