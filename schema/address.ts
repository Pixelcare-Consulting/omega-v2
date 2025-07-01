import { z } from "zod"

//* Zod schema
export const addressFormSchema = z.object({
  street: z.string().nullish(),
  streetNo: z.string().nullish(),
  buildingFloorRoom: z.string().nullish(),
  block: z.string().nullish(),
  city: z.string().nullish(),
  zipCode: z.string().nullish(),
  county: z.string().nullish(),
  state: z.string().nullish(),
  country: z.string().nullish(),
  gln: z.string().nullish(),
})

export type AddressForm = z.infer<typeof addressFormSchema>
