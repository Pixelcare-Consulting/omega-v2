import { Icon, Icons } from "@/components/icons"
import { Prisma } from "@prisma/client"
import { z } from "zod"

type ActivityTypeOptions = { label: string; value: (typeof ACTIVITY_TYPES)[number] }[]
type ActivityTypeColor = { color: string; value: (typeof ACTIVITY_TYPES)[number] }[]

type ActivityStatusOptions = { label: string; value: (typeof ACTIVITY_STATUSES)[number] }[]
type ActivityStatusColor = { color: string; value: (typeof ACTIVITY_STATUSES)[number] }[]

type ActivityModuleOptions = { label: string; value: (typeof ACTIVITY_MODULES)[number] }[]

type ActivityIcon = { icon: Icon; value: (typeof ACTIVITY_TYPES)[number] }[]

export const ACTIVITY_MODULES = ["lead", "requisition"] as const
export const ACTIVITY_MODULES_OPTIONS: ActivityModuleOptions = [
  { label: "Lead", value: "lead" },
  { label: "Requisition", value: "requisition" },
]

export const ACTIVITY_TYPES = ["meeting", "note"] as const
export const ACTIVITY_TYPES_OPTIONS: ActivityTypeOptions = [
  { label: "Meeting", value: "meeting" },
  { label: "Note", value: "note" },
]
export const ACTIVITY_TYPES_COLORS: ActivityTypeColor = [
  { color: "purple", value: "meeting" },
  { color: "orange", value: "note" },
]

export const ACTIVITY_ICONS: ActivityIcon = [
  { icon: Icons.calendar, value: "meeting" },
  { icon: Icons.notebookPen, value: "note" },
]

export const ACTIVITY_STATUSES = ["pending", "done"] as const
export const ACTIVITY_STATUSES_OPTIONS: ActivityStatusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Done", value: "done" },
]
export const ACTIVITY_STATUSES_COLORS: ActivityStatusColor = [
  { color: "amber", value: "pending" },
  { color: "lime", value: "done" },
]

//* Zod schema
export const activityFormSchema = z
  .object({
    id: z.string().min(1, { message: "ID is required" }),
    referenceId: z.string().min(1, { message: "Reference is required" }),
    title: z.string().min(1, { message: "Title is required" }),
    type: z.string().min(1, { message: "Type is required" }),
    module: z.string().min(1, { message: "Module is required" }),
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
export type ActivityForm = z.infer<typeof activityFormSchema>
