"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { paramsSchema } from "@/schema/common"
import { contactFormSchema } from "@/schema/contact"

export async function getContacts() {
  try {
    return await prisma.contact.findMany({ where: { deletedAt: null, deletedBy: null } })
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
    return null
  }
}

export const upsertContact = action
  .use(authenticationMiddleware)
  .schema(contactFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id, ...data } = parsedInput
    const { userId } = ctx

    try {
      const existingContact = await prisma.contact.findFirst({
        where: { contactId: data.contactId, ...(id && id !== "add" && { id: { not: id } }) },
      })

      if (existingContact) return { error: true, status: 401, message: "Contact person already exists!", action: "UPSERT_CONTACT" }

      if (id && id !== "add") {
        const updatedContact = await prisma.contact.update({ where: { id }, data: { ...data, updatedBy: userId } })
        return { status: 200, message: "Contact updated successfully!", data: { contact: updatedContact }, action: "UPSERT_CONTACT" }
      }

      const newContact = await prisma.contact.create({ data: { ...data, createdBy: userId, updatedBy: userId } })
      return { status: 200, message: "Contact created successfully!", data: { contact: newContact }, action: "UPSERT_CONTACT" }
    } catch (error) {
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
