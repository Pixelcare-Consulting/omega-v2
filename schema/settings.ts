import { z } from "zod"

export const DEFAULT_LOCALE_OPTIONS = [
  { label: "English (US)", value: "en-US" },
  { label: "English (UK)", value: "en-GB" },
  { label: "French", value: "fr-FR" },
  { label: "German", value: "de-DE" },
  { label: "Spanish", value: "es-ES" },
]

export const DEFAULT_THEME_OPTIONS = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
]

//* Zod Schema
export const systemSettingsSchema = z.object({
  debugMode: z.boolean(),
  activityLogs: z.boolean(),
  systemName: z.string().min(1, { message: "System name is required" }),
  defaultLocale: z.string().min(1, { message: "Default locale is required" }),
  defaultTheme: z.string().min(1, { message: "Default theme is required" }),
})

export const sapB1SettingsSchema = z.object({
  serviceLayerUrl: z.string().nullish(),
  companyDB: z.string().nullish(),
  username: z.string().nullish(),
  password: z.string().nullish(),
  language: z.string().nullish(),
  useTLS: z.boolean().nullish(),
})

export const apiConfigSettingsSchema = z.object({
  enablePublicApi: z.boolean(),
  apiKey: z.string().nullish(),
  allowedOrigins: z.string().nullish(),
  rateLimitPerMin: z.coerce.number().nullish(),
  sapB1: sapB1SettingsSchema,
})

export const viewSensitiveCredentialsFormSchema = z.object({
  password: z.string().min(1, { message: "Password is required" }),
})

export const settingsFormSchema = z.object({
  roleCode: z.string().min(1, { message: "Role code is required" }),
  data: z.record(z.string(), z.any()),
})

//* Type
export type SystemSettings = z.infer<typeof systemSettingsSchema>
export type SapB1Settings = z.infer<typeof sapB1SettingsSchema>
export type ApiConfigSettings = z.infer<typeof apiConfigSettingsSchema>
export type ViewSensitiveCredentialsForm = z.infer<typeof viewSensitiveCredentialsFormSchema>
