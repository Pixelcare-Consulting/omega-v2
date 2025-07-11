import { Icon, Icons } from "@/components/icons"
import { z } from "zod"

type LeadActivityTypeOptions = { label: string; value: (typeof LEAD_ACTIVITY_TYPES)[number] }[]
type LeadActivityTypeColor = { color: string; value: (typeof LEAD_ACTIVITY_TYPES)[number] }[]
type LeadActivityStatusOptions = { label: string; value: (typeof LEAD_ACTIVITY_STATUSES)[number] }[]
type LeadActivityStatusColor = { color: string; value: (typeof LEAD_ACTIVITY_STATUSES)[number] }[]
type LeadActivityIcon = { icon: Icon; value: (typeof LEAD_ACTIVITY_TYPES)[number] }[]

export const LEAD_ACTIVITY_TYPES = ["meeting", "note"] as const
export const LEAD_ACTIVITY_TYPES_OPTIONS: LeadActivityTypeOptions = [
  { label: "Meeting", value: "meeting" },
  { label: "Note", value: "note" },
]
export const LEAD_ACTIVITY_TYPES_COLORS: LeadActivityTypeColor = [
  { color: "purple", value: "meeting" },
  { color: "orange", value: "note" },
]

export const LEAD_ACTIVITY_ICONS: LeadActivityIcon = [
  { icon: Icons.calendar, value: "meeting" },
  { icon: Icons.notebookPen, value: "note" },
]

export const LEAD_ACTIVITY_STATUSES = ["pending", "done"] as const
export const LEAD_ACTIVITY_STATUSES_OPTIONS: LeadActivityStatusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Done", value: "done" },
]
export const LEAD_ACTIVITY_STATUSES_COLORS: LeadActivityStatusColor = [
  { color: "amber", value: "pending" },
  { color: "lime", value: "done" },
]

//* Zod schema
export const leadActivityFormSchema = z
  .object({
    id: z.string().min(1, { message: "ID is required" }),
    leadId: z.string().min(1, { message: "Lead is required" }),
    title: z.string().min(1, { message: "Title is required" }),
    type: z.string().min(1, { message: "Type is required" }),
    link: z.string().url().nullish().or(z.literal("")),
    body: z.string().nullish(),
    date: z.date().nullish(),
    startTime: z.string().nullish(),
    endTime: z.string().nullish(),
    status: z.string(),
    metadata: z.any(),
  })
  .refine(
    (formObj) => {
      if (formObj.type === "meeting") return formObj.date ? true : false
      return true
    },
    { message: "Date is required", path: ["date"] }
  )
  .refine(
    (formObj) => {
      if (formObj.type === "meeting") return formObj.startTime ? true : false
      return true
    },
    { message: "Start time is required", path: ["startTime"] }
  )
  .refine(
    (formObj) => {
      if (formObj.type === "meeting") return formObj.endTime ? true : false
      return true
    },
    { message: "End time is required", path: ["endTime"] }
  )
  .refine(
    (formObj) => {
      if (formObj.type !== "meeting") return true
      if (formObj.type === "meeting") {
        if (formObj.date && formObj.startTime && formObj.endTime) return formObj.startTime < formObj.endTime
        return true
      }
    },
    { message: "End time must be after start time", path: ["endTime"] }
  )

//* Types
export type LeadActivityForm = z.infer<typeof leadActivityFormSchema>
