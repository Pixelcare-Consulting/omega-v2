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
