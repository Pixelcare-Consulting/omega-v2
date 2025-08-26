import { z } from "zod"

//* Zod Schema
export const contactMasterFormSchema = z.object({
  id: z.string().min(1, { message: "ID is required" }),
  CardCode: z.string().min(1, { message: "Card code is required" }),
  FirstName: z.string().min(1, { message: "First name is required" }),
  LastName: z.string().min(1, { message: "Last name is required" }),
  Title: z.string().nullish(),
  Position: z.string().nullish(),
  Cellolar: z.string().nullish(),
  E_MailL: z.string().nullish(),
  CreateDate: z.string().min(1, { message: "Create date is required" }),
  UpdateDate: z.string().min(1, { message: "Update date is required" }),
  source: z.string().min(1, { message: "Source is required" }),
  syncStatus: z.string().min(1, { message: "Sync status is required" }),
})

export const syncContactMasterByBpSchema = z.object({
  cardCode: z.string().min(1, { message: "Card code is required" }),
})

//* Types
export type ContactMasterForm = z.infer<typeof contactMasterFormSchema>
