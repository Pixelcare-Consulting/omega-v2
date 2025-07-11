import { Icon, Icons } from "@/components/icons"
import { z } from "zod"

type RequisitionActivityTypeOptions = { label: string; value: (typeof REQUISITION_ACTIVITY_TYPES)[number] }[]
type RequisitionActivityTypeColor = { color: string; value: (typeof REQUISITION_ACTIVITY_TYPES)[number] }[]
type RequisitionActivityStatusOptions = { label: string; value: (typeof REQUISITION_ACTIVITY_STATUSES)[number] }[]
type RequisitionActivityStatusColor = { color: string; value: (typeof REQUISITION_ACTIVITY_STATUSES)[number] }[]
type RequisitionActivityIcon = { icon: Icon; value: (typeof REQUISITION_ACTIVITY_TYPES)[number] }[]

export const REQUISITION_ACTIVITY_TYPES = ["meeting", "note"] as const
export const REQUISITION_ACTIVITY_TYPES_OPTIONS: RequisitionActivityTypeOptions = [
  { label: "Meeting", value: "meeting" },
  { label: "Note", value: "note" },
]
export const REQUISITION_ACTIVITY_TYPES_COLORS: RequisitionActivityTypeColor = [
  { color: "purple", value: "meeting" },
  { color: "orange", value: "note" },
]

export const REQUISITION_ACTIVITY_ICONS: RequisitionActivityIcon = [
  { icon: Icons.calendar, value: "meeting" },
  { icon: Icons.notebookPen, value: "note" },
]

export const REQUISITION_ACTIVITY_STATUSES = ["pending", "done"] as const
export const REQUISITION_ACTIVITY_STATUSES_OPTIONS: RequisitionActivityStatusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Done", value: "done" },
]
export const REQUISITION_ACTIVITY_STATUSES_COLORS: RequisitionActivityStatusColor = [
  { color: "amber", value: "pending" },
  { color: "lime", value: "done" },
]

//* Zod schema
export const requisitionActivityFormSchema = z
  .object({
    id: z.string().min(1, { message: "ID is required" }),
    requisitionId: z.string().min(1, { message: "Requisition is required" }),
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
export type RequisitionActivityForm = z.infer<typeof requisitionActivityFormSchema>
