import { z } from "zod"
import { addressFormSchema } from "./address"

//* Zod schema
export const contactFormSchema = z
  .object({
    id: z.string().min(1, { message: "ID is required" }),
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().min(1, { message: "Email is required" }).email(),
    phone: z.string().min(1, { message: "Phone is required" }),
    title: z.string().nullable(),
    isActive: z.boolean().nullish(),
    relatedAccounts: z.array(z.string()).nullish(),
    relatedLeads: z.array(z.string()).nullish(),
  })
  .merge(addressFormSchema)

export const deleteContactAccountSchema = z.object({
  accountId: z.string().min(1, { message: "Account ID is required" }),
  contactId: z.string().min(1, { message: "Contact ID is required" }),
})

export const deleteContactLeadSchema = z.object({
  leadId: z.string().min(1, { message: "Lead ID is required" }),
  contactId: z.string().min(1, { message: "Contact ID is required" }),
})

//* Types
export type ContactForm = z.infer<typeof contactFormSchema>
