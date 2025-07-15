import { z } from "zod"

//* Zod Schema
export const quotationFormSchema = z.object({
  id: z.string().min(1, "ID is required"),
  customerId: z.string().min(1, "Customer ID is required"),
  contactId: z.string().nullish(),
  customerRefNo: z.string().nullish(),
  status: z.string().min(1, "Status is required"),
  postingDate: z.date({ message: "Posting date is required" }),
  validUntil: z.date({ message: "Valid until date is required" }),
  documentDate: z.date({ message: "Document date is required" }),
  items: z.array(z.string()).min(1, "Please aselect at least one item"),
  owner: z.string().min(1, "Owner is required"),
  accExec: z.string().nullish(),
  accManager: z.string().nullish(),
  accAssoc: z.string().nullish(),
  brokerBuy: z.string().nullish(),
  tegPurc: z.string().nullish(),
  bpProject: z.string().nullish(),
  remark: z.string().nullish(),
  freight: z.string().nullish(),
  tax: z.coerce.number().nullish(),
  total: z.coerce.number().nullish(),
})

//* Type
export type QuotationForm = z.infer<typeof quotationFormSchema>
