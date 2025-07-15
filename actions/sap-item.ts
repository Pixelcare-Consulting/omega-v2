"use server"

import { callSapServiceLayerApi } from "@/lib/sap-service-layer"

const sapCredentials = {
  BaseURL: process.env.SAP_BASE_URL || "",
  CompanyDB: process.env.SAP_COMPANY_DB || "",
  UserName: process.env.SAP_USERNAME || "",
  Password: process.env.SAP_PASSWORD || "",
}

export async function getItems() {
  try {
    //TODO: initial implement sync logic

    //*  Initial Sync Loginc
    //*  1. fetch SAP data
    //*  2. from SAP data select/filter the records **where `UpdateDate >= last_sync_time`**.
    //*  3. do write batch update into postresql based on the filtered records
    //*  4. fetch from postgresql using unstable_cache and include path for  revalidation on demand
    //*  5. return data

    return await callSapServiceLayerApi(`${sapCredentials.BaseURL}/b1s/v1/SQLQueries('query2')/List`)
  } catch (error) {
    console.error(error)
    return []
  }
}
