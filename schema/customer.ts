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

export const customerFormSchema = z
  .object({
    id: z.string().min(1, { message: "ID is required" }),
    CardCode: z.string().min(1, { message: "Code is required" }),
    CardName: z.string().nullish(),
    CardType: z.string().nullish(),
    GroupCode: z.string().nullish(),
    MailAddress: z.string().nullish(),
    MailZipCode: z.string().nullish(),
    Phone1: z.string().nullish(),
    ContactPerson: z.string().nullish(),
    PayTermsGrpCode: z.string().nullish(),
    Currency: z.string().nullish(),
    U_VendorCode: z.string().nullish(),
    U_OMEG_QBRelated: z.string().nullish(),
  })
  .merge(addressFormSchema)

//* Types
export type CustomerForm = z.infer<typeof customerFormSchema>
export type AddressForm = z.infer<typeof addressFormSchema>

//* - CardCode
//* - CardName
//* - CardType
//* - GroupCode
//* - Address
//* - ZipCode
//* - MailAddress
//* - MailZipCode
//* - Phone1
//* - ContactPerson
//* - PayTermsGrpCode
//* - VatLiable
//* - Currency
//* - U_VendorCode
//* - U_OMEG_QBRelated
