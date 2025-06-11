import { z } from "zod"

type ContactTypeOptions = { label: string; value: (typeof CONTACT_TYPES)[number] }[]
type ContactTypeColor = { color: string; value: (typeof CONTACT_TYPES)[number] }[]
type ContactPriorityOptions = { label: string; value: (typeof CONTACT_PRIORITIES)[number] }[]
type ContactPriorityColor = { color: string; value: (typeof CONTACT_PRIORITIES)[number] }[]

export const CONTACT_TYPES = ["lead", "customer"] as const
export const CONTACT_TYPES_OPTIONS: ContactTypeOptions = [
  { label: "Lead", value: "lead" },
  { label: "Customer", value: "customer" },
]
export const CONTACT_TYPES_COLORS: ContactTypeColor = [
  { color: "blue", value: "lead" },
  { color: "yellow", value: "customer" },
]

export const CONTACT_PRIORITIES = ["low", "medium", "high"] as const
export const CONTACT_PRIORITIES_OPTIONS: ContactPriorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
]
export const CONTACT_PRIORITIES_COLORS: ContactPriorityColor = [
  { color: "slate", value: "low" },
  { color: "amber", value: "medium" },
  { color: "red", value: "high" },
]

export const INDUSTRY_OPTIONS = [
  { label: "Technology", value: "technology" },
  { label: "Software", value: "software" },
  { label: "Information Technology (IT)", value: "it" },
  { label: "Healthcare", value: "healthcare" },
  { label: "Medical Devices", value: "medical-devices" },
  { label: "Pharmaceuticals", value: "pharmaceuticals" },
  { label: "Finance", value: "finance" },
  { label: "Banking", value: "banking" },
  { label: "Insurance", value: "insurance" },
  { label: "Accounting", value: "accounting" },
  { label: "Education", value: "education" },
  { label: "E-learning", value: "e-learning" },
  { label: "Manufacturing", value: "manufacturing" },
  { label: "Retail", value: "retail" },
  { label: "E-commerce", value: "e-commerce" },
  { label: "Real Estate", value: "real-estate" },
  { label: "Construction", value: "construction" },
  { label: "Architecture", value: "architecture" },
  { label: "Transportation", value: "transportation" },
  { label: "Logistics", value: "logistics" },
  { label: "Supply Chain", value: "supply-chain" },
  { label: "Energy", value: "energy" },
  { label: "Renewable Energy", value: "renewable-energy" },
  { label: "Oil & Gas", value: "oil-gas" },
  { label: "Hospitality", value: "hospitality" },
  { label: "Food & Beverage", value: "food-beverage" },
  { label: "Travel & Tourism", value: "travel-tourism" },
  { label: "Legal", value: "legal" },
  { label: "Consulting", value: "consulting" },
  { label: "Marketing", value: "marketing" },
  { label: "Advertising", value: "advertising" },
  { label: "Telecommunications", value: "telecommunications" },
  { label: "Media & Entertainment", value: "media-entertainment" },
  { label: "Publishing", value: "publishing" },
  { label: "Gaming", value: "gaming" },
  { label: "Government", value: "government" },
  { label: "Military & Defense", value: "military-defense" },
  { label: "Non-Profit", value: "non-profit" },
  { label: "Agriculture", value: "agriculture" },
  { label: "Forestry", value: "forestry" },
  { label: "Fisheries", value: "fisheries" },
  { label: "Automotive", value: "automotive" },
  { label: "Aerospace", value: "aerospace" },
  { label: "Biotechnology", value: "biotechnology" },
  { label: "Environmental Services", value: "environmental-services" },
  { label: "Sports & Recreation", value: "sports-recreation" },
  { label: "Human Resources", value: "human-resources" },
  { label: "Event Management", value: "event-management" },
  { label: "Security", value: "security" },
  { label: "Cleaning Services", value: "cleaning-services" },
]

//* Zod schema
export const contactFormSchema = z.object({
  id: z.string().min(1, { message: "ID is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().min(1, { message: "Email is required" }).email({ message: "Please enter a valid email address" }),
  phone: z.string().min(1, { message: "Phone is required" }),
  contactId: z.string().min(1, { message: "Contact person is required" }),
  isActive: z.boolean(),
  title: z.string().nullish(),
  company: z.string().nullish(),
  type: z.string().min(1, { message: "Type is required" }),
  priority: z.string().min(1, { message: "Priority is required" }),
  comments: z.string().nullish(),
  industry: z.array(z.string()).min(1, { message: "Please select at least one industry" }),
})

//* types
export type ContactForm = z.infer<typeof contactFormSchema>
