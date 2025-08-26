import { z } from "zod"

export const ADDRESS_TYPE_OPTIONS = [
  { label: "Billing", value: "B" },
  { label: "Shipping", value: "S" },
]

//* Zod schema
export const addressMasterFormSchema = z.object({
  id: z.string().min(1, { message: "ID is required" }),
  CardCode: z.string().nullish(),
  AddrType: z.string().min(1, { message: "Address type is required" }),
  Street: z.string().nullish(),
  Block: z.string().nullish(),
  City: z.string().nullish(),
  ZipCode: z.string().nullish(),
  County: z.string().nullish(),
  State: z.string().nullish(),
  Country: z.string().nullish(),
  StreetNo: z.string().nullish(),
  Building: z.string().nullish(),
  GlblLocNum: z.string().nullish(),
  Address2: z.string().nullish(),
  Address3: z.string().nullish(),
  CreateDate: z.string().min(1, { message: "Create date is required" }),
  source: z.string().min(1, { message: "Source is required" }),
  syncStatus: z.string().min(1, { message: "Sync status is required" }),
})

export const syncAddressMasterByBpSchema = z.object({
  cardCode: z.string().min(1, { message: "Card code is required" }),
})

//* Types
export type AddressMasterForm = z.infer<typeof addressMasterFormSchema>
