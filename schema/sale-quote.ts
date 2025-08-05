import { z } from "zod"

//* Zod schema

const reqRequestedItemFormSchema = z.object({
  code: z.string(),
  isSupplierSuggested: z.boolean(),
})

export const lineItemFormSchema = z.object({
  requisitionCode: z.coerce.number().min(1, { message: "Requisition code is required" }),
  code: z.string().min(1, { message: "Item is required" }),
  mpn: z.string().nullish(),
  mfr: z.string().nullish(),
  cpn: z.string().nullish(),
  name: z.string().nullish(),
  dateCode: z.string().nullish(),
  estimatedDeliveryDate: z.date().nullish(),
  unitPrice: z.coerce.number(),
  quantity: z.coerce.number().min(1, { message: "Quantity is required" }),
  source: z.string().nullish(),
  reqRequestedItems: z.array(reqRequestedItemFormSchema),
})

export const lineItemsFormSchema = z.array(lineItemFormSchema).min(1, { message: "Please select at least one item" })

export const saleQuoteFormSchema = z.object({
  id: z.string().min(1, { message: "ID is required" }),
  date: z.date({ message: "Date is required" }),
  customerCode: z.string().min(1, { message: "Customer is required" }),
  billTo: z.string().nullish(),
  shipTo: z.string().nullish(),
  contactId: z.string().nullish(),
  salesRepId: z.string().min(1, { message: "Sales Rep is required" }),
  paymentTerms: z.string().min(1, { message: "Payment Terms is required" }),
  fobPoint: z.string().nullish(),
  shippingMethod: z.string().nullish(),
  validUntil: z.date({ message: "Valid until is required" }),
  lineItems: lineItemsFormSchema,
  approvalId: z.string().min(1, { message: "Approval is required" }),
  appravalDate: z.date({ message: "Approval date is required" }),
})

//* Types
export type SaleQuoteForm = z.infer<typeof saleQuoteFormSchema>
export type LineItemForm = z.infer<typeof lineItemFormSchema>
