export const isProd = process.env.NODE_ENV === "production"

type SyncStatusOptions = { label: string; value: (typeof SYNC_STATUSES)[number] }[]
type SyncStatusColors = { color: string; value: (typeof SYNC_STATUSES)[number] }[]

export const SYNC_STATUSES = ["approved", "pending", "synced", "rejected"]
export const SYNC_STATUSES_OPTIONS: SyncStatusOptions = [
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "synced", label: "Synced" },
  { value: "rejected", label: "Rejected" },
]

export const SYNC_STATUSES_COLORS: SyncStatusColors = [
  { value: "approved", color: "green" },
  { value: "pending", color: "amber" },
  { value: "synced", color: "sky" },
  { value: "rejected", color: "red" },
]
