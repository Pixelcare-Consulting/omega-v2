import { z } from "zod"

//* Zod schema
const addressFormSchema = z.object({
  street: z.string().nullish(),
  block: z.string().nullish(),
  city: z.string().nullish(),
  zipCode: z.string().nullish(),
  county: z.string().nullish(),
  state: z.string().nullish(),
  country: z.string().nullish(),
  streetNo: z.string().nullish(),
  buildingFloorRoom: z.string().nullish(),
  gln: z.string().nullish(),
})

export const supplierFormSchema = z
  .object({
    id: z.string().min(1, { message: "ID is required" }),
    CardCode: z.string().min(1, { message: "Code is required" }),
    CardName: z.string().nullish(),
    AccountNumber: z.string().nullish(),
    AssignedBuyer: z.string().nullish(),
    Website: z.string().url().nullish().or(z.literal("")),
  })
  .merge(addressFormSchema)

//* Types
export type SupplierForm = z.infer<typeof supplierFormSchema>
export type AddressForm = z.infer<typeof addressFormSchema>
