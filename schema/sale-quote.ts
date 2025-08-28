import { z } from "zod"

const lineItemsDetailsSchema = z.object({
  mpn: z.string().nullish(),
  mfr: z.string().nullish(),
  dateCode: z.string().nullish(),
  condition: z.string().nullish(),
  coo: z.string().nullish(),
  leadTime: z.string().nullish(),
  notes: z.string().nullish(),
})

//* Zod schema
export const lineItemFormSchema = z.object({
  requisitionCode: z.coerce.number().min(1, { message: "Requisitionis required" }),
  supplierQuoteCode: z.coerce.number().min(1, { message: "Supplier quote is required" }),
  code: z.string().min(1, { message: "Item is required" }),
  name: z.string().nullish(),
  mpn: z.string().nullish(),
  mfr: z.string().nullish(),
  cpn: z.string().nullish(),
  source: z.string().nullish(),
  ltToSjcNumber: z.string().nullish(),
  ltToSjcUom: z.string().nullish(),
  condition: z.string().nullish(),
  coo: z.string().nullish(),
  dateCode: z.string().nullish(),
  estimatedDeliveryDate: z.date().nullish(),
  quotedPrice: z.string().nullish(),
  quotedQuantity: z.string().nullish(),
  unitPrice: z.coerce.number(),
  quantity: z.coerce.number().min(1, { message: "Quantity is required" }),
  leadTime: z.string().nullish(),
  details: lineItemsDetailsSchema,
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
  paymentTerms: z.coerce.number().min(1, { message: "Payment Terms is required" }),
  fobPoint: z.string().nullish(),
  shippingMethod: z.string().nullish(),
  validUntil: z.date({ message: "Valid until is required" }),
  remarks: z.string().nullish(),
  lineItems: lineItemsFormSchema,
  approvalId: z.string().min(1, { message: "Approval is required" }),
  approvalDate: z.date({ message: "Approval date is required" }),
})

export const updateLineItemForm = z.object({
  action: z.enum(["create", "update", "delete"]),
  saleQuoteId: z.string().min(1, { message: "Sale quote ID is required" }),
  lineItems: lineItemsFormSchema,
})

//* Types
export type SaleQuoteForm = z.infer<typeof saleQuoteFormSchema>
export type LineItemForm = z.infer<typeof lineItemFormSchema>
