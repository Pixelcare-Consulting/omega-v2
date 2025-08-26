"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { callSapServiceLayerApi } from "@/lib/sap-service-layer"
import { paramsSchema } from "@/schema/common"
import { addressMasterFormSchema, syncAddressMasterByBpSchema } from "@/schema/master-address"
import { Address } from "@prisma/client"
import { isAfter, parse } from "date-fns"
import { revalidateTag, unstable_cache } from "next/cache"
import { z } from "zod"
import { getCountries, getStates } from "./master-bp"

const sapCredentials = {
  BaseURL: process.env.SAP_BASE_URL || "",
  CompanyDB: process.env.SAP_COMPANY_DB || "",
  UserName: process.env.SAP_USERNAME || "",
  Password: process.env.SAP_PASSWORD || "",
}

export async function getAddresses(cardCode: string) {
  try {
    const cacheKey = `address-master-${cardCode}`

    return await unstable_cache(
      async () => {
        return prisma.address.findMany({ where: { CardCode: cardCode, deletedAt: null, deletedBy: null } })
      },
      [cacheKey],
      { tags: [cacheKey] }
    )()
  } catch (error) {
    console.error(error)
    return []
  }
}

export const getAddressesClient = action
  .use(authenticationMiddleware)
  .schema(z.object({ cardCode: z.string() }))
  .action(async ({ parsedInput: data }) => {
    try {
      const [addresses, countries] = await Promise.all([prisma.address.findMany({ where: { CardCode: data.cardCode } }), getCountries()])

      const addressFullDetails = await Promise.all(
        addresses.map(async (ad) => {
          const states = ad.Country ? await getStates(ad.Country) : []
          const countryName = countries?.value?.find((country: any) => country?.Code === ad?.Country)?.Name || ""
          const stateName = states?.value?.find((state: any) => state?.Code === ad?.State)?.Name || ""

          return { ...ad, countryName, stateName }
        })
      )

      return addressFullDetails
    } catch (error) {
      console.error(error)
      return []
    }
  })

export async function getAddressById(id: string) {
  try {
    return await prisma.address.findUnique({ where: { id } })
  } catch (error) {
    console.error(error)
  }
}

export const upsertAddressMaster = action
  .use(authenticationMiddleware)
  .schema(addressMasterFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id, ...data } = parsedInput
    const { userId } = ctx

    const cardCode = data.CardCode

    if (!cardCode) return { error: true, status: 401, message: "Invalid card code!" }

    const cacheKey = `address-master-${cardCode}`

    try {
      if (id && id !== "add") {
        const updatedAddress = await prisma.address.update({ where: { id }, data: { ...data, CardCode: cardCode, updatedBy: userId } })

        revalidateTag(cacheKey)

        return { status: 200, message: "Address updated successfully!", data: { address: updatedAddress }, action: "UPSERT_ADDRESS_MASTER" }
      }

      const addresses = (await prisma.$queryRaw`SELECT * FROM "Address" WHERE "id" ~ '^A[0-9]+$'`) as Address[]
      const addressesIdNumber = addresses
        .map((address) => address.id.slice(1))
        .filter((num) => !isNaN(parseInt(num)))
        .map((num) => parseInt(num))
        .sort((a, b) => a - b)

      let lastIdNumber = addressesIdNumber.pop()
      const newIdNumber = lastIdNumber !== 0 && lastIdNumber !== undefined && lastIdNumber !== null ? ++lastIdNumber : 1
      const newAddressId = `A${newIdNumber}`

      const newAddress = await prisma.address.create({
        data: {
          ...data,
          CardCode: cardCode,
          id: newAddressId,
          createdBy: userId,
          updatedBy: userId,
        },
      })

      revalidateTag(cacheKey)

      return {
        status: 200,
        message: "Address created successfully!",
        data: { address: newAddress },
        action: "UPSERT_ADDRESS_MASTER",
      }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPSERT_ADDRESS_MASTER",
      }
    }
  })

export const deleteAddressMaster = action
  .use(authenticationMiddleware)
  .schema(paramsSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const cacheKey = "address-master"

      const address = await prisma.address.findUnique({ where: { id: data.id } })

      if (!address) return { status: 404, message: "Address not found!", action: "DELETE_ADDRESS" }

      await prisma.address.update({ where: { id: address.id }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })

      revalidateTag(cacheKey)

      return { status: 200, message: "Address deleted successfully!", action: "DELETE_ADDRESS" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_ADDRESS",
      }
    }
  })

export const syncAddressMaster = action
  .use(authenticationMiddleware)
  .schema(syncAddressMasterByBpSchema)
  .action(async ({ ctx, parsedInput }) => {
    let success = false

    const { userId } = ctx
    const cardCode = parsedInput.cardCode
    const cacheKey = `address-master-${cardCode}`
    const SYNC_META_CODE = `address-${cardCode}`

    try {
      //* fetch SAP address master data, portal address master data by BP Card Code
      const data = await Promise.allSettled([
        callSapServiceLayerApi(`${sapCredentials.BaseURL}/b1s/v1/SQLQueries('query6')/List`, `CardCode='${cardCode}'`),
        prisma.address.findMany({ where: { CardCode: cardCode } }),
        prisma.syncMeta.findUnique({ where: { code: SYNC_META_CODE } }),
      ])

      const sapAddressMasters = data[0].status === "fulfilled" ? data[0]?.value?.value || [] : []
      const portalAddressMasters = data[1].status === "fulfilled" ? data[1]?.value || [] : []
      const lastSyncDate = data[2].status === "fulfilled" ? data[2]?.value?.lastSyncAt || new Date("01/01/2020") : new Date("01/01/2020")

      //* check if portalAddressMasters has data or not, if dont have data insert sapAddressMasters into portal, otherwise update sapAddressMasters based on sapItemMasters
      if (portalAddressMasters.length === 0) {
        await prisma.$transaction([
          prisma.address.createMany({
            data: sapAddressMasters?.map((row: any) => ({ ...row, id: row.address, source: "sap", syncStatus: "synced" })),
          }),
          prisma.syncMeta.upsert({
            where: { code: SYNC_META_CODE },
            create: { code: SYNC_META_CODE, description: `Customer - ${cardCode} Address`, lastSyncAt: new Date(), updatedAt: userId },
            update: { code: SYNC_META_CODE, description: `Customer - ${cardCode} Address`, lastSyncAt: new Date(), updatedAt: userId },
          }),
        ])

        success = true
      } else {
        //*  filter the records where CreateDate > lastSyncDate or  UpdateDate > lastSyncDate
        const filteredSapAddressMasters =
          sapAddressMasters?.filter((row: any) => {
            const createDate = parse(row.CreateDate, "yyyyMMdd", new Date())
            const updateDate = parse(row.UpdateDate, "yyyyMMdd", new Date())
            return isAfter(createDate, lastSyncDate) || isAfter(updateDate, lastSyncDate)
          }) || []

        const upsertPromises = filteredSapAddressMasters.map((row: any) => {
          return prisma.address.upsert({
            where: { id: row.address },
            create: { ...row, source: "sap", syncStatus: "synced" },
            update: { ...row, source: "sap", syncStatus: "synced" },
          })
        })

        //* perform upsert and  update the sync meta
        await prisma.$transaction([
          ...upsertPromises,
          prisma.syncMeta.upsert({
            where: { code: SYNC_META_CODE },
            create: { code: SYNC_META_CODE, description: `Customer - ${cardCode} Address`, lastSyncAt: new Date(), updatedAt: userId },
            update: { code: SYNC_META_CODE, description: `Customer - ${cardCode} Address`, lastSyncAt: new Date(), updatedAt: userId },
          }),
        ])

        success = true
      }
    } catch (error) {
      console.error(error)
    }

    //* revalidate the cache
    if (success) {
      revalidateTag(cacheKey)
      return { status: 200, message: "Sync completed successfully!", action: "ADDRESS_MASTER_SYNC" }
    } else return { error: true, status: 500, message: "Failed to sync, please try again later!", action: "ADDRESS_MASTER_SYNC" }
  })
