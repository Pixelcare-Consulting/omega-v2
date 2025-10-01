"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { callSapServiceLayerApi } from "@/lib/sap-service-layer"
import { delay } from "@/lib/utils"
import { importSchema } from "@/schema/import-export"
import {
  bpMasterAddressSetAsDefaultSchema,
  bpMasterContactSetAsDefaultSchema,
  bpMasterFormSchema,
  BpPortalFields,
  BpSapFields,
  deleteBpMasterSchema,
  syncBpMasterSchema,
} from "@/schema/master-bp"
import { Address, Contact, Prisma } from "@prisma/client"
import { format, isAfter, parse } from "date-fns"
import { revalidateTag, unstable_cache } from "next/cache"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"

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

export const getBpMastersClient = action
  .use(authenticationMiddleware)
  .schema(z.object({ cardType: z.string() }))
  .action(async ({ parsedInput: data }) => {
    return getBpMasters(data.cardType)
  })

export async function getBpMasterByCardCode(cardCode: string) {
  try {
    const [bpMaster, contacts, addresses, countries] = await Promise.all([
      prisma.businessPartner.findUnique({
        where: { CardCode: cardCode },
        include: {
          buyer: { select: { name: true, email: true } },
          salesEmployee: { select: { name: true, email: true } },
          bdrInsideSalesRep: { select: { name: true, email: true } },
          accountExecutive: { select: { name: true, email: true } },
          accountAssociate: { select: { name: true, email: true } },
          assignedExcessManagers: { include: { user: { select: { name: true, email: true } } } },
        },
      }),
      prisma.contact.findMany({ where: { CardCode: cardCode, deletedAt: null, deletedBy: null } }),
      prisma.address.findMany({ where: { CardCode: cardCode, deletedAt: null, deletedBy: null } }),
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

    return { ...bpMaster, contacts, addresses: addressFullDetails } as typeof bpMaster & {
      addresses: (Address & { countryName: string; stateName: string })[]
      contacts: Contact[]
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

export const getBpMasterByCardCodeClient = action
  .use(authenticationMiddleware)
  .schema(z.object({ cardCode: z.string() }))
  .action(async ({ parsedInput: data }) => {
    return getBpMasterByCardCode(data.cardCode)
  })

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

export const getBpMasterGroupsClient = action.use(authenticationMiddleware).action(async () => {
  return getBpMasterGroups()
})

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

export const getPaymentTermsClient = action.use(authenticationMiddleware).action(async () => {
  return getPaymentTerms()
})

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

export const getCurrenciesClient = action.use(authenticationMiddleware).action(async () => {
  return getCurrencies()
})

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
  .schema(z.object({ countryCode: z.string() }))
  .action(async ({ parsedInput: data }) => {
    return getStates(data.countryCode)
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

export const getCountriesClient = action.use(authenticationMiddleware).action(async () => {
  return getCountries()
})

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

export const bpMasterAddressSetAsDefault = action
  .use(authenticationMiddleware)
  .schema(bpMasterAddressSetAsDefaultSchema)
  .action(async ({ parsedInput: data, ctx }) => {
    try {
      const { cardCode, addressType, addressId } = data

      const bpMaster = await prisma.businessPartner.findUnique({ where: { CardCode: cardCode } })

      if (!bpMaster) return { error: true, status: 404, message: "Business partner not found!", action: "BP_MASTER_ADDRESS_SET_AS_DEFAULT" }

      const fieldToUpdate = addressType === "B" ? "BillToDef" : addressType === "S" ? "ShipToDef" : null

      //* update default shipping or billing address based on type
      await prisma.businessPartner.update({
        where: { CardCode: cardCode },
        data: { ...(fieldToUpdate && fieldToUpdate !== null && { [fieldToUpdate]: addressId, updatedBy: ctx.userId }) },
      })

      return { status: 200, message: "Address set as default successfully!", action: "BP_MASTER_ADDRESS_SET_AS_DEFAULT" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "BP_MASTER_ADDRESS_SET_AS_DEFAULT",
      }
    }
  })

export const bpMasterContactSetAsDefault = action
  .use(authenticationMiddleware)
  .schema(bpMasterContactSetAsDefaultSchema)
  .action(async ({ parsedInput: data, ctx }) => {
    try {
      const { cardCode, contactId } = data

      const bpMaster = await prisma.businessPartner.findUnique({ where: { CardCode: cardCode } })

      if (!bpMaster) return { error: true, status: 404, message: "Business partner not found!", action: "BP_MASTER_CONTACT_SET_AS_DEFAULT" }

      //* update default contact person
      await prisma.businessPartner.update({
        where: { CardCode: cardCode },
        data: { CntctPrsn: contactId, updatedBy: ctx.userId },
      })

      return { status: 200, message: "Contact set as default successfully!", action: "BP_MASTER_CONTACT_SET_AS_DEFAULT" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "BP_MASTER_CONTACT_SET_AS_DEFAULT",
      }
    }
  })

export const bpMasterCreateMany = action
  .use(authenticationMiddleware)
  .schema(importSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { data, total, stats, isLastBatch, metaData } = parsedInput
    const { userId } = ctx

    const bpGroups = metaData?.bpGroups || []
    const paymentTerms = metaData?.paymentTerms || []
    const currencies = metaData?.currencies || []
    const itemGroups = metaData?.itemGroups || []
    const manufacturers = metaData?.manufacturers || []

    const cardType = metaData?.cardType

    const cardCodes = data?.map((row: any) => row?.["Code"]).filter(Boolean) || []
    const cacheKey = `bp-master-${cardType.toLowerCase()}`

    const userIds =
      data
        ?.map((row: any) => {
          const salesEmployee = row?.["Sales Employee"]
          const bdrInsideSalesRep = row?.["BDR / Inside Sales Rep"]
          const accountExecutive = row?.["Account Executive"]
          const accountAssociate = row?.["Account Associate"]
          const assignBuyery = row?.["Assigned Buyer"]

          const rowIds: string[] = row?.["Excess Managers"]?.split(",")?.filter(Boolean) || []

          return [...(rowIds?.length > 0 ? rowIds : []), salesEmployee, bdrInsideSalesRep, accountExecutive, accountAssociate, assignBuyery]
            .map((item: any) => item.trim())
            .filter(Boolean)
        })
        ?.flat() || []
    const uniqueUserIds = [...new Set(userIds)]

    try {
      const bpBatch: Prisma.BusinessPartnerCreateManyInput[] = []
      const addressBatch: Prisma.AddressCreateManyInput[] = []
      const excessManagersBatch: Prisma.BusinessPartnerExcessManagerCreateManyInput[] = []

      //* get existing BP CardCodes, get the latest numeric address id
      const [existingBpMasterCodes, latestAddress, existingUsers] = await Promise.all([
        prisma.businessPartner.findMany({
          where: { CardCode: { in: cardCodes } },
          select: { CardCode: true },
        }),
        prisma.$queryRaw<{ maxId: number }[]>`
        SELECT MAX(CAST(SUBSTRING("id" FROM 2) AS INT)) AS "maxId" 
        FROM "Address" WHERE "id" ~ '^A[0-9]+$'`,
        prisma.user.findMany({ where: { id: { in: uniqueUserIds } }, select: { id: true } }),
      ])

      let addressCounter = latestAddress?.[0]?.maxId || 0

      for (let i = 0; i < data.length; i++) {
        const errors: string[] = []
        const row = data[i]

        const group = bpGroups.find((group: any) => group?.Code == row?.["Group"])
        const terms = paymentTerms.find((term: any) => term?.GroupNum == row?.["Terms"])
        const currency = currencies.find((currency: any) => currency?.CurrCode == row?.["Currency"])

        //* reshape address data
        const billingAddress: Prisma.AddressCreateInput = {
          id: "",
          CardCode: "",
          AddrType: "B",
          Street: row?.["Billing - Street 1"] || "",
          Address2: row?.["Billing - Street 2"] || "",
          Address3: row?.["Billing - Street 3"] || "",
          StreetNo: row?.["Billing - Street No"] || "",
          Building: row?.["Billing - Building/Floor/Room"] || "",
          Block: row?.["Billing - Block"] || "",
          City: row?.["Billing - City"] || "",
          ZipCode: row?.["Billing - Zip Code"] || "",
          County: row?.["Billing - County"] || "",
          Country: row?.["Billing - Country"] || "",
          State: row?.["Billing - State"] || "",
          GlblLocNum: row?.["Billing - GLN"] || "",
          CreateDate: format(new Date(), "yyyyMMdd"),
          createdBy: userId,
          updatedBy: userId,
        }

        const shippingAddress: Prisma.AddressCreateInput = {
          id: "",
          CardCode: "",
          AddrType: "S",
          Street: row?.["Shipping - Street 1"] || "",
          Address2: row?.["Shipping - Street 2"] || "",
          Address3: row?.["Shipping - Street 3"] || "",
          StreetNo: row?.["Shipping - Street No"] || "",
          Building: row?.["Shipping - Building/Floor/Room"] || "",
          Block: row?.["Shipping - Block"] || "",
          City: row?.["Shipping - City"] || "",
          ZipCode: row?.["Shipping - Zip Code"] || "",
          County: row?.["Shipping - County"] || "",
          Country: row?.["Shipping - Country"] || "",
          State: row?.["Shipping - State"] || "",
          GlblLocNum: row?.["Shipping - GLN"] || "",
          CreateDate: format(new Date(), "yyyyMMdd") || "",
          createdBy: userId,
          updatedBy: userId,
        }

        //* operations for customer
        if (cardType === "C") {
          const excessManagers: string[] = row?.["Excess Managers"]?.split(",") || []

          //* check required fields
          if (!row?.["Company Name"] || !row?.["Group"] || !row?.["Type"] || !row?.["Status"]) {
            errors.push("Missing required fields")
          }

          //* check if customer code already exists
          if (existingBpMasterCodes.find((bp) => bp.CardCode === row?.["Code"])) {
            errors.push("Customer code already exists")
          }

          //* check if all excess managers exists, if one of them doesn't exist, skip the row
          if (excessManagers.every((id) => existingUsers.find((u) => u.id === id))) {
            errors.push("One or more excess managers not found")
          }

          //* if errors array is not empty, then update/push to stats.error
          if (errors.length > 0) {
            console.log("ERRORS:")
            console.log({ rowNumber: row.rowNumber, entries: errors }, "\n")

            stats.error.push({ rowNumber: row.rowNumber, entries: errors, row })
            continue
          }

          //* Generate new IDs
          const billingId = `A${String(++addressCounter).padStart(6, "0")}`
          const shippingId = `A${String(++addressCounter).padStart(6, "0")}`
          const customerCode = row?.["Code"] || uuidv4()

          billingAddress.id = billingId
          shippingAddress.id = shippingId

          billingAddress.CardCode = customerCode
          shippingAddress.CardCode = customerCode

          //* reshape data
          const bpCustomerData: Prisma.BusinessPartnerCreateManyInput = {
            CardType: "C",
            CardCode: customerCode,
            CardName: row?.["Company Name"] || "",
            GroupCode: group?.Code ?? 0,
            GroupName: group?.Name || "",
            GroupNum: terms?.GroupNum,
            PymntGroup: terms?.PymntGroup,
            CurrName: currency?.CurrName,
            Currency: currency?.CurrCode,
            accountType: row?.["Account Type"],
            industryType: row?.["Industry Type"],
            Phone1: row?.["Phone"],
            assignedSalesEmployee: existingUsers?.find((user) => user.id === row?.["Sales Employee"])?.id,
            assignedBdrInsideSalesRep: existingUsers?.find((user) => user.id === row?.["BDR / Inside Sales Rep"])?.id,
            assignedAccountExecutive: existingUsers?.find((user) => user.id === row?.["Account Executive"])?.id,
            assignedAccountAssociate: existingUsers?.find((user) => user.id === row?.["Account Associate"])?.id,
            isActive: row?.["Active"] === "Yes",
            isCreditHold: row?.["Credit Hold"] === "Yes",
            isWarehousingCustomer: row?.["Warehousing Customer"] === "Yes",
            type: row?.["Type"] || "",
            status: row?.["Status"] || "",
            CreateDate: format(new Date(), "yyyyMMdd"),
            UpdateDate: format(new Date(), "yyyyMMdd"),
            BillToDef: billingId,
            ShipToDef: shippingId,
            createdBy: userId,
            updatedBy: userId,
          }

          //* add to batch
          bpBatch.push(bpCustomerData)
          addressBatch.push(billingAddress, shippingAddress)
          excessManagersBatch.push(...excessManagers.map((id) => ({ bpCode: customerCode, userId: id })))
        }

        //* operations for supplier
        if (cardType === "S") {
          const commodityStrengths: string[] = row?.["Commodity Strengths"]?.split(",")?.filter(Boolean) || []
          const mfrStrengths: string[] = row?.["MFR Strengths"]?.split(",")?.filter(Boolean) || []

          //* check required fields
          if (!row?.["Company Name"] || !row?.["Group"] || !row?.["Status"] || !row?.["Scope"]) {
            errors.push("Missing required fields")
          }

          //* check if customer code already exists
          if (existingBpMasterCodes.find((bp) => bp.CardCode === row?.["Code"])) {
            errors.push("Supplier code already exists")
          }

          //* check if all commodity strengths exists, if one of them doesn't exist, skip the row
          if (!commodityStrengths.every((gid) => itemGroups.find((g: any) => g.Number == gid))) {
            errors.push("One or more commodity strengths not found")
          }

          //* check if all mfr strengths exists, if one of them doesn't exist, skip the row
          if (!mfrStrengths.every((mid) => manufacturers.find((m: any) => m.Code === mid))) {
            errors.push("One or more mfr strengths not found")
          }

          //* if errors array is not empty, then update/push to stats.error
          if (errors.length > 0) {
            console.log("ERRORS:")
            console.log({ rowNumber: row.rowNumber, entries: errors }, "\n")

            stats.error.push({ rowNumber: row.rowNumber, entries: errors, row })
            continue
          }

          //* Generate new IDs
          const billingId = `A${String(++addressCounter).padStart(6, "0")}`
          const shippingId = `A${String(++addressCounter).padStart(6, "0")}`
          const customerCode = row?.["Code"] || uuidv4()

          billingAddress.id = billingId
          shippingAddress.id = shippingId

          billingAddress.CardCode = customerCode
          shippingAddress.CardCode = customerCode

          //* reshape data
          const bpSupplierData: Prisma.BusinessPartnerCreateManyInput = {
            CardType: "S",
            CardCode: customerCode,
            CardName: row?.["Company Name"] || "",
            GroupCode: group?.Code ?? 0,
            GroupName: group?.Name || "",
            accountNo: row?.["Account #"] || "",
            assignedBuyer: existingUsers?.find((user) => user.id === row?.["Assigned Buyer"])?.id,
            Phone1: row?.["Phone"] || "",
            website: row?.["Website"] || "",
            CurrName: currency?.CurrName,
            Currency: currency?.CurrCode,
            commodityStrengths: commodityStrengths.filter((gid) => !isNaN(parseInt(gid))).map((gid) => parseInt(gid)),
            mfrStrengths: mfrStrengths.filter((mid) => !isNaN(parseInt(mid))).map((mid) => parseInt(mid)),
            avlStatus: row?.["AVL Status"] || "",
            status: row?.["Status"] || "",
            scope: row?.["Scope"] || "",
            isCompliantToAs: row?.["Compliant to AS"] === "Yes",
            isCompliantToItar: row?.["Compliant to ITAR"] === "Yes",
            GroupNum: terms?.GroupNum,
            PymntGroup: terms?.PymntGroup,
            warranyPeriod: row?.["Warranty Period"] || "",
            omegaReviews: row?.["Omega Reviews"] || "",
            qualificationNotes: row?.["Qualification Notes"] || "",
            CreateDate: format(new Date(), "yyyyMMdd"),
            UpdateDate: format(new Date(), "yyyyMMdd"),
            BillToDef: billingId,
            ShipToDef: shippingId,
            createdBy: userId,
            updatedBy: userId,
          }

          //* add to batch
          bpBatch.push(bpSupplierData)
          addressBatch.push(billingAddress, shippingAddress)
        }
      }

      //* commit both in a transaction
      await prisma.$transaction([
        prisma.address.createMany({
          data: addressBatch,
          skipDuplicates: true,
        }),
        prisma.businessPartner.createMany({
          data: bpBatch,
          skipDuplicates: true,
        }),
        prisma.businessPartnerExcessManager.createMany({
          data: excessManagersBatch,
          skipDuplicates: true,
        }),
      ])

      revalidateTag(cacheKey)

      const progress = ((stats.completed + bpBatch.length) / total) * 100

      const updatedStats = {
        ...stats,
        completed: stats.completed + bpBatch.length,
        progress,
        status: progress >= 100 || isLastBatch ? "completed" : "processing",
      }

      return {
        status: 200,
        message: `${updatedStats.completed} bp masters created successfully!`,
        action: "BATCH_WRITE_BP_MASTER",
        stats: updatedStats,
      }
    } catch (error) {
      console.error("Batch Write Error - ", error)

      stats.error.push(...data.map((row) => ({ rowNumber: row.rowNumber, entries: ["Unexpected batch write error"], row })))

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Batch write error!",
        action: "BATCH_WRITE_BP_MASTER",
        stats,
      }
    }
  })
