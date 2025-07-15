import { z } from "zod"

export const URGENCY_OPTIONS = [
  { label: "Hot! - Shortage", value: "hot-shortage" },
  { label: "Hot! - Other", value: "hot-other" },
  { label: "Normal - VMI", value: "normal-vmi" },
  { label: "Normal - BOM Scrub", value: "normal-bom-scrub" },
  { label: "Low - Cost Savings", value: "low-cost-savings" },
  { label: "Low - Other", value: "low-other" },
]

export const SALES_CATEGORY_OPTIONS = [
  { label: "Broker Buy", value: "broker-buy" },
  { label: "VMI", value: "vmi" },
  { label: "Pass-Through", value: "pass-through" },
  { label: "Spot Buy", value: "spot-buy" },
  { label: "Not Applicable", value: "not-applicable" },
]

export const PURCHASING_STATUS_OPTIONS = [
  { label: "New", value: "new" },
  { label: "US Sourcing", value: "us-sourcing" },
  { label: "Sourcing", value: "sourcing" },
  { label: "Answers Back", value: "answers-back" },
  { label: "Cont. Sourcing", value: "cont-sourcing" },
  { label: "2nd Round Sourcing", value: "2nd-round-sourcing" },
  { label: "3rd Round Sourcing", value: "3rd-round-sourcing" },
  { label: "Closed", value: "closed" },
  { label: "Master List", value: "master-list" },
]

export const REASON_OPTIONS = [
  { label: "Not Quoted", value: "not-quoted" },
  { label: "Quoted - Waiting", value: "quoted-waiting" },
  { label: "Need to Re-Quote", value: "need-to-re-quote" },
  { label: "PO Won", value: "PO Won" },
  { label: "No Bid - Value", value: "no-bid-value" },
  { label: "No Bid - NAM", value: "no-bid-nam" },
  { label: "No PO - D/C", value: "no-po-d-c" },
  { label: "No PO - Outbid", value: "no-po-outbid" },
  { label: "No PO - Price", value: "no-po-price" },
  { label: "No PO - Response Time", value: "no-po-response-time" },
  { label: "No PO - LT Contraint", value: "no-po-lt-contraint" },
  { label: "No PO - No Feedback", value: "no-po-no-feedback" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Other", value: "other" },
  { label: "BOM No PO", value: "bom-no-po" },
  { label: "BOM No Bid", value: "bom-no-bid" },
  { label: "Master List", value: "master-list" },
  { label: "Purchasing Initiated", value: "purchasing-initiated" },
  { label: "Purchasing Initated - Closed", value: "purchasing-initated-closed" },
  { label: "Purchasing Initiated-PO Won", value: "purchasing-initiated-po-won" },
  { label: "Purchasing Initiated-Quoted Waiting", value: "purchasing-initiated-quoted-waiting" },
]

export const RESULT_OPTIONS = [
  { label: "Won", value: "won" },
  { label: "Lost", value: "lost" },
]

export const REQ_REVIEW_RESULT_OPTIONS = [
  { label: "Need Better Price", value: "need-better-price" },
  { label: "Need Better DC", value: "need-better-dc" },
  { label: "Need Better LT", value: "need-better-lt" },
  { label: "Need more QTY", value: "need-more-qty" },
  { label: "Waiting for Customer Approval", value: "waiting-for-customer-approval" },
  { label: "No Feedback", value: "no-feedback" },
  { label: "To Close", value: "to-close" },
  { label: "Keep Open - Need Quotes", value: "keep-open-need-quotes" },
  { label: "To Re-Quote", value: "to-re-quote" },
]

//* Zod Schema
export const requestedItemFormSchema = z.object({
  code: z.string().min(1, { message: "Item code is required" }),
  name: z.string().nullish(),
  mpn: z.string().nullish(),
  mfr: z.string().nullish(),
  source: z.string().nullish(),
})

export const requestedItemsFormSchema = z.array(requestedItemFormSchema).min(1, { message: "Please select at least one item" })

export const requisitionFormSchema = z.object({
  id: z.string().min(1, { message: "ID is required" }),
  customerCode: z.string().min(1, { message: "Company name is required" }),
  contactId: z.string().nullish(),
  customerPn: z.string().nullish(),
  requestedItems: requestedItemsFormSchema,
  date: z.date({ message: "Date is required" }),
  urgency: z.string().nullish(),
  salesPersons: z.array(z.string()).nullish(),
  salesCategory: z.string().min(1, { message: "Sales category is required" }),
  omegaBuyers: z.array(z.string()).nullish(),
  isPurchasingInitiated: z.boolean(),
  isActiveFollowUp: z.boolean(),
  purchasingStatus: z.string().nullish(),
  result: z.string().nullish(),
  reason: z.string().nullish(),
  reqReviewResult: z.array(z.string()).nullish(),
  quantity: z.coerce.number().min(1, { message: "Quantity is required" }),
  customerStandardPrice: z.coerce.number(),
  customerStandardOpportunityValue: z.coerce.number(),
})

export const updateRequisitionReqItemsSchema = z.object({
  reqId: z.string().min(1, { message: "Requisition ID is required" }),
  requestedItems: requestedItemsFormSchema,
})

//* Type
export type RequisitionForm = z.infer<typeof requisitionFormSchema>
export type RequestedItemForm = z.infer<typeof requestedItemFormSchema>
