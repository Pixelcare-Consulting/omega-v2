import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import { addressFormSchema } from "./address"

export const BP_MASTER_SUPPLIER_AVL_STATUS_OPTIONS = [
  { label: "Approved", value: "approved" },
  { label: "Qualification in progress", value: "qualification-in-progress" },
  { label: "Denied", value: "denied" },
  { label: "Inactive", value: "inactive" },
]

export const BP_MASTER_SUPPLIER_STATUS_OPTIONS = [
  { label: "Approved", value: "approved" },
  { label: "Denied", value: "denied" },
  { label: "Provisional", value: "provisional" },
  { label: "Pre-Qualified", value: "pre-qualified" },
  { label: "Qual. In Process", value: "qual-in-process" },
  { label: "Qual. Not Started", value: "qual-not-started" },
  { label: "Waiting for Approval", value: "waiting-for-approval" },
  { label: "Conditionally Approved", value: "conditionally-approved" },
  { label: "Inactive", value: "inactive" },
]

export const BP_MASTER_SUPPLIER_SCOPE_OPTIONS = [
  { label: "1 - MFR", value: "1-mfr" },
  { label: "1 - DIST", value: "1-dist" },
  { label: "2 - OEM", value: "2-oem" },
  { label: "2 - CM", value: "2-cm" },
  { label: "3 - Open MKT (US)", value: "3-open-mkt-us" },
  { label: "4 - Open MKT (INTL)", value: "4-open-mkt-intl" },
  { label: "Test House", value: "test-house" },
  { label: "Logistics/Freight", value: "logistics-freight" },
]

export const BP_MASTER_SUPPLIER_WARRANY_PERIOD_OPTIONS = [
  { label: "60 Days", value: "60-days" },
  { label: "90 Days", value: "90-days" },
  { label: "6 Months", value: "6-months" },
  { label: "1 Year", value: "1-year" },
  { label: "2 Years", value: "2-years" },
  { label: "30 Days", value: "30-days" },
  { label: "120 Days", value: "120-days" },
  { label: "5 years", value: "5-years" },
  { label: "3 years warranty", value: "3-years-warranty" },
  { label: "Lifetime", value: "lifetime" },
  { label: "180 days", value: "180-days" },
  { label: "360 days", value: "360-days" },
]

export const BP_MASTER_CUSTOMER_ACCOUNT_TYPE_OPTIONS = [
  { label: "House", value: "house" },
  { label: "Owned", value: "owned" },
]

export const BP_MASTER_CUSTOMER_TYPE_OPTIONS = [
  { label: "OEM", value: "oem" },
  { label: "CM", value: "cm" },
  { label: "Broker/Disty", value: "broker-disty" },
]

export const BP_MASTER_CUSTOMER_STATUS_OPTIONS = [
  { label: "Tier 1", value: "tier-1" },
  { label: "Tier 2", value: "tier-2" },
  { label: "Tier 3 (Prospect)", value: "tier-3-prospect" },
  { label: "Prospect - Unassigned", value: "prospect-unassigned" },
  { label: "Do Not Pursue", value: "do-not-pursue" },
  { label: "Past", value: "past" },
  { label: "Broker", value: "broker" },
  { label: "Duplicate", value: "duplicate" },
]

//* SAP form schema contains
export const bpSapFieldsSchema = z.object({
  CardCode: z.string().default(uuidv4()),
  CardName: z.string().min(1, { message: "Company name is required" }),
  CardType: z.string().min(1, { message: "Card type is required" }),
  CntctPrsn: z.string().nullish(),
  CurrName: z.string().nullish(),
  Currency: z.string().nullish(),
  GroupCode: z.coerce.number().min(1, { message: "Group is required" }),
  GroupName: z.string().nullish(),
  Address: z.string().nullish(),
  ZipCode: z.string().nullish(),
  MailAddres: z.string().nullish(),
  MailZipCod: z.string().nullish(),
  Phone1: z.string().nullish(),
  GroupNum: z.coerce.number().nullish(),
  PymntGroup: z.string().nullish(),
  U_OMEG_QBRelated: z.string().nullish(),
  U_VendorCode: z.string().nullish(),
  CreateDate: z.string().min(1, { message: "Create date is required" }),
  UpdateDate: z.string().min(1, { message: "Update date is required" }),
})

export const bpPortalFieldsSchema = z
  .object({
    id: z.string().min(1, { message: "ID is required" }),

    //* customer fields
    accountType: z.string().nullish(),
    type: z.string().min(1, { message: "Type is required" }),
    industryType: z.string().nullish(),
    isCreditHold: z.boolean(),
    isWarehousingCustomer: z.boolean(),
    assignedSalesEmployee: z.string().nullish(),
    assignedBdrInsideSalesRep: z.string().nullish(),
    assignedAccountExecutive: z.string().nullish(),
    assignedAccountAssociate: z.string().nullish(),
    assignedExcessManagers: z.array(z.string()).default([]),

    //* comon fields
    isActive: z.boolean(),
    status: z.string().min(1, { message: "Status is required" }),

    //* supplier fields
    accountNo: z.string().nullish(),
    assignedBuyer: z.string().nullable(),
    website: z.string().nullish(),
    commodityStrengths: z.array(z.coerce.number()).default([]),
    mfrStrengths: z.array(z.coerce.number()).default([]),
    avlStatus: z.string().nullish(),
    scope: z.string().min(1, { message: "Scope is required" }),
    isCompliantToAs: z.boolean(),
    isCompliantToItar: z.boolean(),
    warranyPeriod: z.string().nullish(),
    omegaReviews: z.string().nullish(),
    qualificationNotes: z.string().nullish(),
    source: z.string().min(1, { message: "Source is required" }),
    syncStatus: z.string().min(1, { message: "Sync status is required" }),
  })
  .merge(addressFormSchema)

export const syncBpMasterSchema = z.object({
  type: z.string().min(1, { message: "Card type is required" }),
})

export const deleteBpMasterSchema = z.object({
  code: z.string().min(1, { message: "Code is required" }),
  type: z.string().min(1, { message: "Type is required" }),
})

//* Zod schema
export const bpMasterFormSchema = z.object({}).merge(bpSapFieldsSchema).merge(bpPortalFieldsSchema)

//* Types
export type BpMasterForm = z.infer<typeof bpMasterFormSchema>
export type BpSapFields = z.infer<typeof bpSapFieldsSchema>
export type BpPortalFields = z.infer<typeof bpPortalFieldsSchema>
