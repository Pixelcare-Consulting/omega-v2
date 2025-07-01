"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { paramsSchema } from "@/schema/common"
import { contactFormSchema, deleteContactAccountSchema, deleteContactLeadSchema } from "@/schema/contact2"

export async function getContacts() {
  try {
    return await prisma.contact.findMany({ where: { deletedAt: null, deletedBy: null } })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getContactById(id: string) {
  if (!id) return null

  try {
    return await prisma.contact.findUnique({
      where: { id },
      include: {
        accountContacts: { include: { account: true } },
        leadContacts: { include: { lead: { include: { account: true } } } },
      },
    })
  } catch (error) {
    console.error(error)
    return null
  }
}

export const upsertContact = action
  .use(authenticationMiddleware)
  .schema(contactFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id, relatedAccounts, relatedLeads, ...data } = parsedInput
    const { userId } = ctx

    try {
      if (id && id !== "add") {
        const [updatedContact] = await prisma.$transaction([
          //* update contact
          prisma.contact.update({ where: { id }, data: { ...data, updatedBy: userId } }),

          //* delete the existing contact's account contacts
          prisma.companyAccountContact.deleteMany({ where: { contactId: id } }),

          //* delete the existing contact's lead contacts
          prisma.leadContact.deleteMany({ where: { contactId: id } }),

          //* create new account contacts
          prisma.companyAccountContact.createMany({
            data: relatedAccounts?.map((c) => ({ contactId: id, accountId: c })) || [],
          }),

          //* create new lead contacts
          prisma.leadContact.createMany({
            data: relatedLeads?.map((l) => ({ contactId: id, leadId: l })) || [],
          }),
        ])

        return { status: 200, message: "Contact updated successfully!", data: { contact: updatedContact }, action: "UPSERT_CONTACT" }
      }

      const newContact = await prisma.contact.create({
        data: {
          ...data,
          createdBy: userId,
          updatedBy: userId,
          accountContacts: {
            create: relatedAccounts?.map((c) => ({ accountId: c })) || [],
          },
          leadContacts: {
            create: relatedLeads?.map((l) => ({ leadId: l })) || [],
          },
        },
      })
      return { status: 200, message: "Contact created successfully!", data: { contact: newContact }, action: "UPSERT_CONTACT" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPSERT_CONTACT",
      }
    }
  })

export const deleteContact = action
  .use(authenticationMiddleware)
  .schema(paramsSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const contact = await prisma.contact.findUnique({ where: { id: data.id } })

      if (!contact) return { status: 404, message: "Contact not found!", action: "DELETE_CONTACT" }

      await prisma.contact.update({ where: { id: data.id }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })
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

export const deleteContactAccount = action
  .use(authenticationMiddleware)
  .schema(deleteContactAccountSchema)
  .action(async ({ parsedInput: data }) => {
    try {
      const contactAccount = await prisma.companyAccountContact.findUnique({ where: { accountId_contactId: { ...data } } })

      if (!contactAccount) return { status: 404, message: "Account not found!", action: "DELETE_CONTACT_ACCOUNT" }

      await prisma.companyAccountContact.delete({ where: { accountId_contactId: { ...data } } })
      return { status: 200, message: "Account removed successfully!", action: "DELETE_CONTACT_ACCOUNT" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_CONTACT_ACCOUNT",
      }
    }
  })

export const deleteContactLead = action
  .use(authenticationMiddleware)
  .schema(deleteContactLeadSchema)
  .action(async ({ parsedInput: data }) => {
    try {
      const contactLead = await prisma.leadContact.findUnique({ where: { leadId_contactId: { ...data } } })

      if (!contactLead) return { status: 404, message: "Lead not found!", action: "DELETE_CONTACT_LEAD" }

      await prisma.leadContact.delete({ where: { leadId_contactId: { ...data } } })
      return { status: 200, message: "Lead removed successfully!", action: "DELETE_CONTACT_LEAD" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_CONTACT_LEAD",
      }
    }
  })
