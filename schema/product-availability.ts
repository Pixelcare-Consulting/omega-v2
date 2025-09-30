import { z } from "zod"

//* Zod Schema
export const productAvailabilityFormSchema = z.object({
  id: z.string().min(1, { message: "ID is required" }),
  supplierCode: z.string().min(1, { message: "Supplier is required" }),
  manufacturerCode: z.coerce.number().refine((value) => value > 0 || value === -1, { message: "Manufacturer is required" }),
  itemGroupCode: z.coerce.number().nullish(),
  isAuthorizedDisti: z.boolean(),
  isFranchiseDisti: z.boolean(),
  isMfrDirect: z.boolean(),
  isSpecialPricing: z.boolean(),
  isStrongBrand: z.boolean(),
  notes: z.string().nullish(),
})

//* Type
export type ProductAvailabilityForm = z.infer<typeof productAvailabilityFormSchema>
