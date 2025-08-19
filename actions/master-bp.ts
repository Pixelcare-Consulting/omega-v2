"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { callSapServiceLayerApi } from "@/lib/sap-service-layer"
import { bpMasterFormSchema, BpPortalFields, BpSapFields, deleteBpMasterSchema, syncBpMasterSchema } from "@/schema/master-bp"
import { Address } from "@prisma/client"
import { isAfter, parse } from "date-fns"
import { revalidateTag, unstable_cache } from "next/cache"
import { z } from "zod"

const sapCredentials = {
  BaseURL: process.env.SAP_BASE_URL || "",
  CompanyDB: process.env.SAP_COMPANY_DB || "",
  UserName: process.env.SAP_USERNAME || "",
  Password: process.env.SAP_PASSWORD || "",
}

const cardTypeMap: Record<string, string> = { S: "Supplier", C: "Customer" }

export async function getBpMasters(cardType: string) {
  try {
    const cacheKey = `bp-master-${cardType.toLowerCase()}`

    return await unstable_cache(
      async () => {
        return prisma.businessPartner.findMany({
          where: { CardType: cardType, deletedAt: null, deletedBy: null },
          include: {
            buyer: { select: { name: true, email: true } },
            salesEmployee: { select: { name: true, email: true } },
            bdrInsideSalesRep: { select: { name: true, email: true } },
            accountExecutive: { select: { name: true, email: true } },
            accountAssociate: { select: { name: true, email: true } },
            assignedExcessManagers: { include: { user: { select: { name: true, email: true } } } },
          },
        })
      },
      [cacheKey],
      { tags: [cacheKey] }
    )()
  } catch (error) {
    return []
  }
}

export async function getBpMasterByCardCode(cardCode: string) {
  try {
    const [bpMaster, addresses, countries] = await Promise.all([
      prisma.businessPartner.findUnique({
        where: {
          CardCode: cardCode,
        },
        include: {
          buyer: { select: { name: true, email: true } },
          salesEmployee: { select: { name: true, email: true } },
          bdrInsideSalesRep: { select: { name: true, email: true } },
          accountExecutive: { select: { name: true, email: true } },
          accountAssociate: { select: { name: true, email: true } },
          assignedExcessManagers: { include: { user: { select: { name: true, email: true } } } },
        },
      }),
      prisma.address.findMany({ where: { CardCode: cardCode } }),
      getCountries(),
    ])

    if (!bpMaster) return null

    const addressFullDetails = await Promise.all(
      addresses.map(async (ad) => {
        const states = ad.Country ? await getStates(ad.Country) : []
        const countryName = countries?.value?.find((country: any) => country?.Code === ad?.Country)?.Name || ""
        const stateName = states?.value?.find((state: any) => state?.Code === ad?.State)?.Name || ""

        return { ...ad, countryName, stateName }
      })
    )

    return { ...bpMaster, addresses: addressFullDetails } as typeof bpMaster & {
      addresses: (Address & { countryName: string; stateName: string })[]
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function getBpMasterGroups() {
  try {
    return await callSapServiceLayerApi(`${sapCredentials.BaseURL}/b1s/v1/BusinessPartnerGroups`, undefined, {
      Prefer: "odata.maxpagesize=999",
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getPaymentTerms() {
  try {
    return await callSapServiceLayerApi(`${sapCredentials.BaseURL}/b1s/v1/SQLQueries('query4')/List`, undefined, {
      Prefer: "odata.maxpagesize=999",
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getCurrencies() {
  try {
    return await callSapServiceLayerApi(`${sapCredentials.BaseURL}/b1s/v1/SQLQueries('query5')/List`, undefined, {
      Prefer: "odata.maxpagesize=999",
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getStates(countryCode: string) {
  try {
    return await callSapServiceLayerApi(`${sapCredentials.BaseURL}/b1s/v1/SQLQueries('query7')/List`, `Country='${countryCode}'`, {
      Prefer: "odata.maxpagesize=999",
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export const getStatesClient = action
  .use(authenticationMiddleware)
  .schema(z.object({ countryCode: z.string().min(1, { message: "Country code is required" }) }))
  .action(async ({ parsedInput: data }) => {
    try {
      return await callSapServiceLayerApi(`${sapCredentials.BaseURL}/b1s/v1/SQLQueries('query7')/List`, `Country='${data.countryCode}'`, {
        Prefer: "odata.maxpagesize=999",
      })
    } catch (error) {
      console.error(error)
      return []
    }
  })

export async function getCountries() {
  try {
    return await callSapServiceLayerApi(`${sapCredentials.BaseURL}/b1s/v1/SQLQueries('query8')/List`, undefined, {
      Prefer: "odata.maxpagesize=999",
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export const upsertBpMaster = action
  .use(authenticationMiddleware)
  .schema(bpMasterFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    const entries = Object.entries(parsedInput)
    const { userId } = ctx
    const cacheKey = `bp-master-${parsedInput.CardType.toLowerCase()}`

    //* separate the data - startsWith uppercase letter are SAP fields, others are portal fields
    const sapEntries = entries.filter(([key]) => /^[A-Z]/.test(key))
    const portalEntries = entries.filter(([key]) => /^[a-z]/.test(key))

    const sapData = Object.fromEntries(sapEntries) as BpSapFields
    const { id, assignedExcessManagers, billingAddress, shippingAddress, ...portalData } = Object.fromEntries(
      portalEntries
    ) as BpPortalFields
    const data = { ...sapData, ...portalData }

    const existingBpMaster = await prisma.businessPartner.findFirst({
      where: { CardCode: data.CardCode, ...(id && id !== "add" && { id: { not: id } }) },
    })

    //* check if bpmaster code is existing
    if (existingBpMaster) return { error: true, status: 401, message: "Code already exists!", action: "UPSERT_BP_MASTER" }

    try {
      //* get latest address id number
      const addresses = (await prisma.$queryRaw`SELECT * FROM "Address" WHERE "id" ~ '^A[0-9]+$'`) as Address[]
      const addressesIdNumber = addresses
        .map((address) => address.id.slice(1))
        .filter((num) => !isNaN(parseInt(num)))
        .map((num) => parseInt(num))
        .sort((a, b) => a - b)

      let lastIdNumber = addressesIdNumber.pop()
      let newIdNumber = lastIdNumber !== 0 && lastIdNumber !== undefined && lastIdNumber !== null ? ++lastIdNumber : 1

      if (id && id !== "add") {
        //* check if source is sap or portal, if portal only update the portal otherwise update both
        if (portalData.source === "portal") {
          const updatedBpMaster = await prisma.$transaction(async (tx) => {
            //* upsert billing address
            const updatedBillingAddress = billingAddress
              ? await tx.address.upsert({
                  where: { id: billingAddress.id },
                  create: { ...billingAddress, CardCode: data.CardCode, id: `A${String(newIdNumber).padStart(6, "0")}` },
                  update: { ...billingAddress, CardCode: data.CardCode },
                })
              : null

            //* upsert shipping address
            const updatedShippingAddress = shippingAddress
              ? await tx.address.upsert({
                  where: { id: shippingAddress.id },
                  create: {
                    ...shippingAddress,
                    CardCode: data.CardCode,
                    id: billingAddress ? `A${String(++newIdNumber).padStart(6, "0")}` : `A${String(newIdNumber).padStart(6, "0")}`,
                  },
                  update: { ...shippingAddress, CardCode: data.CardCode },
                })
              : null

            //* update busines partner
            const result = tx.businessPartner.update({
              where: { CardCode: data.CardCode },
              data: {
                ...data,
                type: data.type || "",
                scope: data.scope || "",
                BillToDef: updatedBillingAddress?.id || null,
                ShipToDef: updatedShippingAddress?.id || null,
                updatedBy: userId,
              },
            })

            //* delete existiong business partner (customer) excess managers
            tx.businessPartnerExcessManager.deleteMany({ where: { bpCode: data.CardCode } })

            //* create new business partner (customer) excess managers
            tx.businessPartnerExcessManager.createMany({
              data: assignedExcessManagers?.map((userId) => ({ bpCode: data.CardCode, userId })) || [],
            })

            return result
          })

          revalidateTag(cacheKey)

          return {
            status: 200,
            message: `${cardTypeMap[sapData.CardType]} updated successfully!`,
            data: { bpMaster: updatedBpMaster },
            action: "UPSERT_BP_MASTER",
          }
        }

        // TODO: add functionality to update in the portal and SAP
        //* update portal data and SAP data
      }

      //* check if source is sap or portal, if portal only update the portal other wise update both
      if (portalData.source === "portal") {
        const newBpMaster = await prisma.$transaction(async (tx) => {
          //* create default billing address
          const newBillingAddress = billingAddress
            ? await tx.address.create({
                data: { ...billingAddress, CardCode: data.CardCode, id: `A${String(newIdNumber).padStart(6, "0")}` },
              })
            : null

          //* create default shipping address
          const newShippingAddress = shippingAddress
            ? await prisma.address.create({
                data: {
                  ...shippingAddress,
                  CardCode: data.CardCode,
                  id: billingAddress ? `A${String(++newIdNumber).padStart(6, "0")}` : `A${String(newIdNumber).padStart(6, "0")}`,
                },
              })
            : null

          //* create newBpMaster
          const result = await prisma.businessPartner.create({
            data: {
              ...data,
              type: data.type || "",
              scope: data.scope || "",
              createdBy: userId,
              updatedBy: userId,
              BillToDef: newBillingAddress?.id || null,
              ShipToDef: newShippingAddress?.id || null,
              assignedExcessManagers: {
                create: assignedExcessManagers?.map((userId) => ({ userId })) || [],
              },
            },
          })

          return result
        })

        revalidateTag(cacheKey)

        return {
          status: 200,
          message: `${cardTypeMap[data.CardType]} created successfully!`,
          data: { bpMaster: newBpMaster },
          action: "UPSERT_BP_MASTER",
        }
      }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPSERT_BP_MASTER",
      }
    }
  })

export const deleteBpMaster = action
  .use(authenticationMiddleware)
  .schema(deleteBpMasterSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const cacheKey = `bp-master-${data.type.toLowerCase()}`
      const bpMaster = await prisma.businessPartner.findUnique({ where: { CardCode: data.code } })

      if (!bpMaster) return { error: true, status: 404, message: `${cardTypeMap[data.type]} not found!`, action: "DELETE_BPMASTER" }

      await prisma.businessPartner.update({ where: { CardCode: data.code }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })

      revalidateTag(cacheKey)

      return { status: 200, message: `${cardTypeMap[data.type]} deleted successfully!`, action: "DELETE_BPMASTER" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_BPMASTER",
      }
    }
  })

export const syncBpMaster = action
  .use(authenticationMiddleware)
  .schema(syncBpMasterSchema)
  .action(async ({ ctx, parsedInput }) => {
    let success = false

    const { userId } = ctx
    const cardType = parsedInput.type
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
            data: filteredSapBpMasters?.map((row: any) => ({ ...row, source: "sap", syncStatus: "synced" })),
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
            create: { ...row, source: "sap", syncStatus: "synced" },
            update: { ...row, source: "sap", syncStatus: "synced" },
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
