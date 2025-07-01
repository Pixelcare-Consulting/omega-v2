import { z } from "zod"

type LeadStatusOptions = { label: string; value: (typeof LEAD_STATUSES)[number] }[]
type LeadStatusColor = { color: string; value: (typeof LEAD_STATUSES)[number] }[]

export const LEAD_STATUSES = ["new-lead", "attempted-to-contact", "contacted", "qualified", "unqualified"] as const
export const LEAD_STATUSES_OPTIONS: LeadStatusOptions = [
  { label: "New Lead", value: "new-lead" },
  { label: "Attempted to Contact", value: "attempted-to-contact" },
  { label: "Contacted", value: "contacted" },
  { label: "Qualified", value: "qualified" },
  { label: "Unqualified", value: "unqualified" },
]
export const LEAD_STATUSES_COLORS: LeadStatusColor = [
  { color: "amber", value: "new-lead" },
  { color: "purple", value: "attempted-to-contact" },
  { color: "sky", value: "contacted" },
  { color: "green", value: "qualified" },
  { color: "red", value: "unqualified" },
]

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

export const leadFormSchema = z
  .object({
    id: z.string().min(1, { message: "ID is required" }),
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().min(1, { message: "Email is required" }).email({ message: "Please enter a valid email address" }),
    phone: z.string().min(1, { message: "Phone is required" }),
    title: z.string().nullish(),
    accountId: z.string().nullish(),
    status: z.string().min(1, { message: "Status is required" }),
    relatedContacts: z.array(z.string()).nullish(),
  })
  .merge(addressFormSchema)

export const updateStatusSchema = z.object({
  id: z.string().min(1, { message: "ID is required" }),
  status: z.string().min(1, { message: "Status is required" }),
})

export const deleteLeadContactSchema = z.object({
  leadId: z.string().min(1, { message: "Lead ID is required" }),
  contactId: z.string().min(1, { message: "Contact ID is required" }),
})

export const deleteLeadAccountSchema = z.object({
  leadId: z.string().min(1, { message: "Lead ID is required" }),
  accountId: z.string().min(1, { message: "Account ID is required" }),
})

//* Types
export type LeadForm = z.infer<typeof leadFormSchema>
export type AddressForm = z.infer<typeof addressFormSchema>
