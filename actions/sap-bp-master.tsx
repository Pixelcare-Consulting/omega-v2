"use server"

import { prisma } from "@/lib/db"
import { callSapServiceLayerApi } from "@/lib/sap-service-layer"
import { isAfter, parse } from "date-fns"
import { revalidateTag, unstable_cache } from "next/cache"

const sapCredentials = {
  BaseURL: process.env.SAP_BASE_URL || "",
  CompanyDB: process.env.SAP_COMPANY_DB || "",
  UserName: process.env.SAP_USERNAME || "",
  Password: process.env.SAP_PASSWORD || "",
}

export async function getBpMasters({ cardType }: { cardType: string }) {
  let success = false
  let result: any[] | undefined
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
      result = await unstable_cache(
        async () => {
          return prisma.businessPartner.createManyAndReturn({
            data: sapBpMasters.map((row: any) => ({ ...row, source: "sap" })),
          })
        },
        [cacheKey],
        { tags: [cacheKey] }
      )()

      success = true
    } else {
      //* filter based on card type and filter the records where CreateDate > lastSyncDate or  UpdateDate > lastSyncDate
      const filteredSapBpMasters = sapBpMasters?.value
        ?.filter((row: any) => row.CardType === cardType)
        .filter((row: any) => {
          const createDate = parse(row.CreateDate, "yyyyMMdd", new Date())
          const updateDate = parse(row.UpdateDate, "yyyyMMdd", new Date())
          return isAfter(createDate, lastSyncDate) || isAfter(updateDate, lastSyncDate)
        })

      const upsertPromises = filteredSapBpMasters.map((row: any) => {
        return prisma.businessPartner.upsert({
          where: { CardCode: row.CardCode },
          create: { ...row, source: "sap" },
          update: { ...row, source: "sap" },
        })
      })

      await prisma.$transaction([upsertPromises])

      //*  update the sync meta and query the portal bp master data
      result = await unstable_cache(
        async () => {
          const [_, result] = await prisma.$transaction([
            prisma.syncMeta.update({ where: { code: cardType }, data: { lastSyncAt: new Date() } }),
            prisma.businessPartner.findMany({ where: { CardType: cardType } }),
          ])

          return result
        },
        [cacheKey],
        { tags: [cacheKey] }
      )()

      success = true
    }
  } catch (error) {
    console.error(error)
    result = []
  }

  //* revalidate the cache
  if (success && result) revalidateTag(cacheKey)
}
