import { z } from "zod"

//* Zod schema
export const lineItemFormSchema = z.object({
  cpn: z.string().nullish(),
  mpn: z.string().nullish(),
  mfr: z.string().nullish(),
  qtyOnHand: z.coerce.number().nullish(),
  qtyOrdered: z.coerce.number().nullish(),
  unitPrice: z.coerce.number().nullish(),
  dateCode: z.string().nullish(),
  notes: z.string().nullish(),
})

export const lineItemsFormSchema = z.array(lineItemFormSchema).min(1, { message: "Please add at least one line item" })

export const supplierOfferFormSchema = z.object({
  id: z.string().min(1, { message: "ID is required" }),
  listDate: z.date({ message: "List date is required" }),
  supplierCode: z.string().min(1, { message: "Supplier is required" }),
  fileName: z.string().min(1, { message: "File name is required" }),
  cpn: z.string().nullish(),
  mpn: z.string().nullish(),
  mfr: z.string().nullish(),
  qtyOnHand: z.coerce.number().nullish(),
  qtyOrdered: z.coerce.number().nullish(),
  unitPrice: z.coerce.number().nullish(),
  dateCode: z.string().nullish(),
  notes: z.string().nullish(),
  listOwnerId: z.string().nullish(),
  lineItems: lineItemsFormSchema,
})

export const updateLineItemFormSchema = z.object({
  action: z.enum(["create", "update", "delete"]),
  supplierOfferId: z.string().min(1, { message: "Supplier offer ID is required" }),
  lineItems: lineItemsFormSchema,
})

//* Type
export type SupplierOfferForm = z.infer<typeof supplierOfferFormSchema>
export type LineItemForm = z.infer<typeof lineItemFormSchema>
