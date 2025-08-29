import { z } from "zod"

export const ACCOUNT_INDUSTRY_OPTIONS = [
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

//* Zod Schema
export const accountFormSchema = z.object({
  id: z.string().min(1, { message: "ID is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  email: z.union([z.string().email().nullish(), z.literal("")]),
  phone: z.string().nullish(),
  website: z.string().nullish(),
  industry: z.string().nullish(),
  isActive: z.boolean().nullish(),
  fullAddress: z.string().nullish(),
})

export const deleteAccountLeadSchema = z.object({
  accountId: z.string().min(1, { message: "Account ID is required" }),
  leadId: z.string().min(1, { message: "Lead ID is required" }),
})

//* Types
export type AccountForm = z.infer<typeof accountFormSchema>
