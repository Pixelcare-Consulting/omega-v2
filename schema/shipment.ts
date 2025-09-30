import { z } from "zod"

export const SHIPMENT_SHIP_TO_LOCATION_OPTIONS = [
  { label: "HK", value: "hk" },
  { label: "Philippines", value: "philippines" },
  { label: "San Jose", value: "san-jose" },
]

export const SHIPMENT_SHIPPING_ORDER_STATUS_OPTIONS = [
  { label: "Lead Time Buy", value: "lead-time-buy" },
  { label: "Lead Time Buy - No PO", value: "lead-time-buy-no-po" },
  { label: "Placeholder PO", value: "placeholder-po" },
  { label: "To Secure per Dock Date", value: "to-secure-per-dock-date" },
  { label: "Rehash - must find alt. source", value: "rehash-must-find-alt-source" },
  { label: "Pending internal Approval", value: "pending-internal-approval" },
  { label: "Pending with Vendor", value: "pending-with-vendor" },
  { label: "PO Confirmed", value: "po-confirmed" },
  { label: "Scheduled Order", value: "scheduled-order" },
  { label: "In Process", value: "in-process" },
  { label: "In Transit to Omega", value: "in-transit-to-omega" },
  { label: "In QC/Testing", value: "in-qc-testing" },
  { label: "In Stock", value: "in-stock" },
  { label: "In Stock in PH", value: "in-stock-in-ph" },
  { label: "In Stock - VMI", value: "in-stock-vmi" },
  { label: "Pending NCOR", value: "pending-ncor" },
  { label: "Rejected by QC", value: "rejected-by-qc" },
  { label: "Scrap", value: "scrap" },
  { label: "Split QTY (Stock / Shipped)", value: "split-qty-stock-shipped" },
  { label: "Shipped to Customer", value: "shipped-to-customer" },
  { label: "Shipped to Supplier / Goods Return", value: "shipped-to-supplier-goods-return" },
  { label: "Moved to Broker Resale", value: "moved-to-broker-resale" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Expired", value: "expired" },
]

//* Zod Schema
export const shipmentFormSchema = z.object({
  id: z.string().min(1, { message: "ID is required" }),
  requisitionCode: z.coerce.number().min(1, { message: "Requisition is required" }),
  poNumber: z.string().nullish(),
  prNumber: z.string().nullish(),
  soNumber: z.string().nullish(),
  supplierQuoteCode: z.coerce.number().min(1, { message: "Supplier quote is required" }),
  qtyToShip: z.coerce.number(),
  shipToLocation: z.string().nullish(),
  purchaserId: z.string().nullish(),
  shippingOderStatus: z.string().nullish(),
  datePoPlaced: z.coerce.date().nullish(),
  dateShipped: z.coerce.date().nullish(),
  orderUpdates: z.string().nullish(),
})

//* Type
export type ShipmentForm = z.infer<typeof shipmentFormSchema>
