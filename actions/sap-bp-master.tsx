"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { callSapServiceLayerApi } from "@/lib/sap-service-layer"
import { syncBpMasterSchema } from "@/schema/sap-bp-master"
import { isAfter, parse } from "date-fns"
import { revalidateTag, unstable_cache } from "next/cache"

const sapCredentials = {
  BaseURL: process.env.SAP_BASE_URL || "",
  CompanyDB: process.env.SAP_COMPANY_DB || "",
  UserName: process.env.SAP_USERNAME || "",
  Password: process.env.SAP_PASSWORD || "",
}

export async function getBpMasters({ cardType }: { cardType: string }) {
  try {
    const cacheKey = `bp-master-${cardType.toLowerCase()}`

    return await unstable_cache(
      async () => {
        return prisma.businessPartner.findMany({ where: { CardType: cardType } })
      },
      [cacheKey],
      { tags: [cacheKey] }
    )()
  } catch (error) {
    return []
  }
}

export async function getBpMasterByCardCode({ cardCode }: { cardCode: string }) {
  try {
    return await prisma.businessPartner.findUnique({ where: { CardCode: cardCode } })
  } catch (error) {
    console.error(error)
    return null
  }
}

export const syncBpMaster = action
  .use(authenticationMiddleware)
  .schema(syncBpMasterSchema)
  .action(async ({ ctx, parsedInput }) => {
    let success = false

    const { userId } = ctx
    const cardType = parsedInput.cardType
    const cacheKey = `bp-master-${cardType.toLowerCase()}`

    try {
      //* fetch SAP bp master data, portal bp master data, sync meta
      const data = await Promise.allSettled([
        callSapServiceLayerApi(`${sapCredentials.BaseURL}/b1s/v1/SQLQueries('query1')/List`, `CardType='${cardType}'`),
        prisma.businessPartner.findMany({ where: { CardType: cardType } }),
        prisma.syncMeta.findUnique({ where: { code: cardType } }),
      ])

      const sapBpMasters = data[0].status === "fulfilled" ? data[0]?.value?.value || [] : []
      const portalBpMasters = data[1].status === "fulfilled" ? data[1]?.value || [] : []
      const lastSyncDate = data[2].status === "fulfilled" ? data[2]?.value?.lastSyncAt || new Date("01/01/2020") : new Date("01/01/2020")

      //* check if portalBpMasters has data or not, if dont have data insert sapBpMasters into portal, otherwise update portalBpMasters based on sapBpMasters
      if (portalBpMasters.length === 0) {
        const filteredSapBpMasters = sapBpMasters?.filter((row: any) => row.CardType === cardType) || []

        await prisma.$transaction([
          prisma.businessPartner.createMany({
            data: filteredSapBpMasters?.map((row: any) => ({ ...row, source: "sap" })),
          }),
          prisma.syncMeta.update({ where: { code: cardType }, data: { lastSyncAt: new Date(), updatedBy: userId } }),
        ])

        success = true
      } else {
        //* filter based on card type and filter the records where CreateDate > lastSyncDate or  UpdateDate > lastSyncDate
        const filteredSapBpMasters =
          sapBpMasters
            ?.filter((row: any) => row.CardType === cardType)
            ?.filter((row: any) => {
              const createDate = parse(row.CreateDate, "yyyyMMdd", new Date())
              const updateDate = parse(row.UpdateDate, "yyyyMMdd", new Date())
              return isAfter(createDate, lastSyncDate) || isAfter(updateDate, lastSyncDate)
            }) || []

        const upsertPromises = filteredSapBpMasters.map((row: any) => {
          return prisma.businessPartner.upsert({
            where: { CardCode: row.CardCode },
            create: { ...row, source: "sap" },
            update: { ...row, source: "sap" },
          })
        })

        //* perform upsert and  update the sync meta
        await prisma.$transaction([
          ...upsertPromises,
          prisma.syncMeta.update({ where: { code: cardType }, data: { lastSyncAt: new Date(), updatedBy: userId } }),
        ])

        success = true
      }
    } catch (error) {
      console.error(error)
    }

    //* revalidate the cache
    if (success) {
      revalidateTag(cacheKey)
      return { status: 200, message: "Sync completed successfully!", action: "BP_MASTER_SYNC" }
    } else return { error: true, status: 500, message: "Failed to sync, please try again later!", action: "BP_MASTER_SYNC" }
  })
