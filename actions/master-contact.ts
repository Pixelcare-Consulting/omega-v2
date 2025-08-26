"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { callSapServiceLayerApi } from "@/lib/sap-service-layer"
import { paramsSchema } from "@/schema/common"
import { contactMasterFormSchema, syncContactMasterByBpSchema } from "@/schema/master-contact"
import { Contact } from "@prisma/client"
import { isAfter, parse } from "date-fns"
import { revalidateTag, unstable_cache } from "next/cache"

const sapCredentials = {
  BaseURL: process.env.SAP_BASE_URL || "",
  CompanyDB: process.env.SAP_COMPANY_DB || "",
  UserName: process.env.SAP_USERNAME || "",
  Password: process.env.SAP_PASSWORD || "",
}

export async function getContacts(cardCode: string) {
  try {
    const cacheKey = `contact-master-${cardCode}`

    return await unstable_cache(
      async () => {
        return prisma.contact.findMany({ where: { CardCode: cardCode, deletedAt: null, deletedBy: null } })
      },
      [cacheKey],
      { tags: [cacheKey] }
    )()
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getContactById(id: string) {
  try {
    return await prisma.contact.findUnique({ where: { id } })
  } catch (error) {
    console.error(error)
  }
}

export const upsertContactMaster = action
  .use(authenticationMiddleware)
  .schema(contactMasterFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id, ...data } = parsedInput
    const { userId } = ctx

    const cardCode = data.CardCode

    if (!cardCode) return { error: true, status: 401, message: "Invalid card code!" }

    const bpMaster = await prisma.businessPartner.findUnique({ where: { CardCode: cardCode } })

    if (!bpMaster) return { error: true, status: 404, message: "Business partner not found!", action: "UPSERT_CONTACT_MASTER" }

    const cacheKey = `contact-master-${cardCode}`

    try {
      if (id && id !== "add") {
        const updatedContact = await prisma.contact.update({ where: { id }, data: { ...data, CardCode: cardCode, updatedBy: userId } })

        revalidateTag(cacheKey)

        return { status: 200, message: "Contact updated successfully!", data: { contact: updatedContact }, action: "UPSERT_CONTACT_MASTER" }
      }

      const contacts = (await prisma.$queryRaw`SELECT * FROM "Contact" WHERE "id" ~ '^CO[0-9]+$'`) as Contact[]
      const contactsIdNumber = contacts
        .map((contact) => contact.id.slice(1))
        .filter((num) => !isNaN(parseInt(num)))
        .map((num) => parseInt(num))
        .sort((a, b) => a - b)

      let lastIdNumber = contactsIdNumber.pop()
      const newIdNumber = lastIdNumber !== 0 && lastIdNumber !== undefined && lastIdNumber !== null ? ++lastIdNumber : 1
      const newContactId = `CO${String(newIdNumber).padStart(6, "0")}`

      const newContact = await prisma.contact.create({
        data: {
          ...data,
          CardCode: cardCode,
          id: newContactId,
          createdBy: userId,
          updatedBy: userId,
        },
      })

      //* if bp master dont have default contact, adding new contact make the new created contact as default
      if (!bpMaster.CntctPrsn) {
        await prisma.businessPartner.update({ where: { CardCode: cardCode }, data: { CntctPrsn: newContactId, updatedBy: userId } })
      }

      revalidateTag(cacheKey)

      return {
        status: 200,
        message: "Contact created successfully!",
        data: { contact: newContact },
        action: "UPSERT_CONTACT_MASTER",
      }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPSERT_CONTACT_MASTER",
      }
    }
  })

export const deleteContactMaster = action
  .use(authenticationMiddleware)
  .schema(paramsSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const cacheKey = "contact-master"

      const contact = await prisma.contact.findUnique({ where: { id: data.id } })

      if (!contact) return { status: 404, message: "Contact not found!", action: "DELETE_CONTACT" }

      await prisma.contact.update({ where: { id: contact.id }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })

      revalidateTag(cacheKey)

      return { status: 200, message: "Contact deleted successfully!", action: "DELETE_CONTACT" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_CONTACT",
      }
    }
  })

export const syncContactMaster = action
  .use(authenticationMiddleware)
  .schema(syncContactMasterByBpSchema)
  .action(async ({ ctx, parsedInput }) => {
    let success = false

    const { userId } = ctx
    const cardCode = parsedInput.cardCode
    const cacheKey = `contact-master-${cardCode}`
    const SYNC_META_CODE = `contact-${cardCode}`

    try {
      //* fetch SAP contact master data, portal contact master data by BP Card Code
      const data = await Promise.allSettled([
        callSapServiceLayerApi(`${sapCredentials.BaseURL}/b1s/v1/SQLQueries('query3')/List`, `CardCode='${cardCode}'`),
        prisma.contact.findMany({ where: { CardCode: cardCode } }),
        prisma.syncMeta.findUnique({ where: { code: SYNC_META_CODE } }),
      ])

      const sapContactMasters = data[0].status === "fulfilled" ? data[0]?.value?.value || [] : []
      const portalContactMasters = data[1].status === "fulfilled" ? data[1]?.value || [] : []
      const lastSyncDate = data[2].status === "fulfilled" ? data[2]?.value?.lastSyncAt || new Date("01/01/2020") : new Date("01/01/2020")

      //* check if portalContactMasters has data or not, if dont have data insert sapContactMasters into portal, otherwise update sapContactMasters based on sapItemMasters
      if (portalContactMasters.length === 0) {
        await prisma.$transaction([
          prisma.contact.createMany({
            data: sapContactMasters?.map((row: any) => ({ ...row, id: row.ContactID, source: "sap", syncStatus: "synced" })),
          }),
          prisma.syncMeta.upsert({
            where: { code: SYNC_META_CODE },
            create: { code: SYNC_META_CODE, description: `Customer - ${cardCode} Contact`, lastSyncAt: new Date(), updatedAt: userId },
            update: { code: SYNC_META_CODE, description: `Customer - ${cardCode} Contact`, lastSyncAt: new Date(), updatedAt: userId },
          }),
        ])

        success = true
      } else {
        //*  filter the records where CreateDate > lastSyncDate or  UpdateDate > lastSyncDate
        const filteredSapContactMasters =
          sapContactMasters?.filter((row: any) => {
            const createDate = parse(row.CreateDate, "yyyyMMdd", new Date())
            const updateDate = parse(row.UpdateDate, "yyyyMMdd", new Date())
            return isAfter(createDate, lastSyncDate) || isAfter(updateDate, lastSyncDate)
          }) || []

        const upsertPromises = filteredSapContactMasters.map((row: any) => {
          return prisma.contact.upsert({
            where: { id: row.ContactID },
            create: { ...row, source: "sap", syncStatus: "synced" },
            update: { ...row, source: "sap", syncStatus: "synced" },
          })
        })

        //* perform upsert and  update the sync meta
        await prisma.$transaction([
          ...upsertPromises,
          prisma.syncMeta.upsert({
            where: { code: SYNC_META_CODE },
            create: { code: SYNC_META_CODE, description: `Customer - ${cardCode} Contact`, lastSyncAt: new Date(), updatedAt: userId },
            update: { code: SYNC_META_CODE, description: `Customer - ${cardCode} Contact`, lastSyncAt: new Date(), updatedAt: userId },
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
      return { status: 200, message: "Sync completed successfully!", action: "CONTACT_MASTER_SYNC" }
    } else return { error: true, status: 500, message: "Failed to sync, please try again later!", action: "CONTACT_MASTER_SYNC" }
  })
