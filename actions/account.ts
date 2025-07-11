"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { paramsSchema } from "@/schema/common"
import { accountFormSchema, deleteAccountContactSchema, deleteAccountLeadSchema } from "@/schema/account"

export async function getAccounts() {
  try {
    return await prisma.companyAccount.findMany({ where: { deletedAt: null, deletedBy: null } })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getAccountById(id: string) {
  if (!id) return null

  try {
    return await prisma.companyAccount.findUnique({
      where: { id },
      include: {
        contacts: { include: { contact: true } },
        leads: true,
      },
    })
  } catch (error) {
    console.error(error)
    return null
  }
}

export const upsertAccount = action
  .use(authenticationMiddleware)
  .schema(accountFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id, ...data } = parsedInput
    const { userId } = ctx

    try {
      if (id && id !== "add") {
        const updatedAccount = await prisma.companyAccount.update({ where: { id }, data: { ...data, updatedBy: userId } })
        return { status: 200, message: "Account updated successfully!", data: { account: updatedAccount }, action: "UPSERT_ACCOUNT" }
      }

      const newAccount = await prisma.companyAccount.create({ data: { ...data, createdBy: userId, updatedBy: userId } })
      return { status: 200, message: "Account created successfully!", data: { account: newAccount }, action: "UPSERT_ACCOUNT" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPSERT_ACCOUNT",
      }
    }
  })

export const deleteAccount = action
  .use(authenticationMiddleware)
  .schema(paramsSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const account = await prisma.companyAccount.findUnique({ where: { id: data.id } })

      if (!account) return { error: true, status: 404, message: "Account not found!", action: "DELETE_ACCOUNT" }

      await prisma.companyAccount.update({ where: { id: data.id }, data: { deletedAt: new Date(), deletedBy: ctx.userId } })
      return { status: 200, message: "Account deleted successfully!", action: "DELETE_ACCOUNT" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_ACCOUNT",
      }
    }
  })

export const deleteAccountContact = action
  .use(authenticationMiddleware)
  .schema(deleteAccountContactSchema)
  .action(async ({ parsedInput: data }) => {
    try {
      const accountContact = await prisma.companyAccountContact.findUnique({ where: { accountId_contactId: { ...data } } })

      if (!accountContact) return { error: true, status: 404, message: "Account contact not found!", action: "DELETE_ACCOUNT_CONTACT" }

      await prisma.companyAccountContact.delete({ where: { accountId_contactId: { ...data } } })
      return { status: 200, message: "Account contact removed successfully!", action: "DELETE_ACCOUNT_CONTACT" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_ACCOUNT_CONTACT",
      }
    }
  })

export const deleteAccountLead = action
  .use(authenticationMiddleware)
  .schema(deleteAccountLeadSchema)
  .action(async ({ ctx, parsedInput: data }) => {
    try {
      const accountLead = await prisma.lead.findFirst({ where: { id: data.leadId, accountId: data.accountId } })

      if (!accountLead) return { error: true, status: 404, message: "Account lead not found!", action: "DELETE_ACCOUNT_LEAD" }

      await prisma.lead.update({ where: { id: accountLead.id }, data: { accountId: null, updatedBy: ctx.userId } })
      return { status: 200, message: "Account lead removed successfully!", action: "DELETE_ACCOUNT_LEAD" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "DELETE_ACCOUNT_LEAD",
      }
    }
  })
