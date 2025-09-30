"use server"

import { action, authenticationMiddleware } from "@/lib/safe-action"
import { callSapServiceLayerApi } from "@/lib/sap-service-layer"
import { z } from "zod"

const sapCredentials = {
  BaseURL: process.env.SAP_BASE_URL || "",
  CompanyDB: process.env.SAP_COMPANY_DB || "",
  UserName: process.env.SAP_USERNAME || "",
  Password: process.env.SAP_PASSWORD || "",
}

export async function getManufacturers() {
  try {
    return await callSapServiceLayerApi(`${sapCredentials.BaseURL}/b1s/v1/Manufacturers`, undefined, {
      Prefer: "odata.maxpagesize=999",
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export const getManufacturersClient = action.use(authenticationMiddleware).action(async () => {
  return getManufacturers()
})

export async function getManufacturerByCode(code: number) {
  try {
    return await callSapServiceLayerApi(`${sapCredentials.BaseURL}/b1s/v1/Manufacturers(${code})`)
  } catch (error) {
    console.error(error)
    return null
  }
}

export const getManufacturerByCodeClient = action
  .use(authenticationMiddleware)
  .schema(z.object({ code: z.number() }))
  .action(async ({ parsedInput: data }) => {
    return getManufacturerByCode(data.code)
  })
