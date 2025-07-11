"use server"

import { prisma } from "@/lib/db"
import { action, authenticationMiddleware } from "@/lib/safe-action"
import { settingsFormSchema, viewSensitiveCredentialsFormSchema } from "@/schema/settings"
import bcrypt from "bcryptjs"

export const getSettingByRoleCode = async (roleCode?: string) => {
  if (!roleCode) return null

  try {
    return await prisma.settings.findFirst({ where: { roleCode } })
  } catch (error) {
    console.error(error)
    return null
  }
}

export const getSapSettings = async () => {
  try {
    //* Get SAP Service Layer settings from environment variables
    return {
      serviceLayerUrl: process.env.SAP_BASE_URL || "",
      companyDB: process.env.SAP_COMPANY_DB || "",
      username: process.env.SAP_USERNAME || "",
      password: process.env.SAP_PASSWORD || "",
      language: "en-US",
      useTLS: true,
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

export const upsertSettings = action
  .use(authenticationMiddleware)
  .schema(settingsFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    try {
      const { roleCode, data } = parsedInput
      const { userId } = ctx

      const settings = await prisma.settings.findFirst({ where: { roleCode } })
      const settingsData = settings?.data as any

      await prisma.settings.upsert({
        where: { roleCode },
        create: { data, roleCode, createdBy: userId },
        update: { data: { ...(settingsData ? { ...settingsData } : {}), ...data }, createdBy: userId, updatedBy: userId },
      })

      return { status: 200, message: "Settings updated successfully!", action: "UPSERT_SETTINGS" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "UPSERT_SETTINGS",
      }
    }
  })

export const viewSensitiveCredentials = action
  .use(authenticationMiddleware)
  .schema(viewSensitiveCredentialsFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    try {
      const { password } = parsedInput
      const { userId } = ctx

      const user = await prisma.user.findUnique({ where: { id: userId } })

      if (!user || !user.password) {
        return { error: true, status: 401, message: "User is unauthorized to view the credentials!", action: "VIEW_SENSITIVE_CREDENTIALS" }
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password)

      console.log({ isPasswordMatch })

      if (!isPasswordMatch) {
        return { error: true, status: 401, message: "User is unauthorized to view the credentials!", action: "VIEW_SENSITIVE_CREDENTIALS" }
      }

      return { status: 200, message: "User is authorized to view the credentials", data: null, action: "VIEW_SENSITIVE_CREDENTIALS" }
    } catch (error) {
      console.error(error)

      return {
        error: true,
        status: 500,
        message: error instanceof Error ? error.message : "Something went wrong!",
        action: "VIEW_SENSITIVE_CREDENTIALS",
      }
    }
  })
