export const isProd = process.env.NODE_ENV === "production"

export const BASE_URL = isProd ? "http://172.16.5.126:3000" : "http://localhost:3000"

type SyncStatusOptions = { label: string; value: (typeof SYNC_STATUSES)[number] }[]
type SyncStatusColors = { color: string; value: (typeof SYNC_STATUSES)[number] }[]

export const SYNC_STATUSES = ["approved", "pending", "synced", "rejected"]

export const SYNC_STATUSES_OPTIONS: SyncStatusOptions = [
  { label: "Approved", value: "approved" },
  { label: "Pending", value: "pending" },
  { label: "Synced", value: "synced" },
  { label: "Rejected", value: "rejected" },
]

export const SYNC_STATUSES_COLORS: SyncStatusColors = [
  { color: "soft-green", value: "approved" },
  { color: "soft-amber", value: "pending" },
  { color: "soft-sky", value: "synced" },
  { color: "soft-red", value: "rejected" },
]

export const SOURCES = ["sap", "portal"]

export const SOURCES_OPTIONS: SyncStatusOptions = [
  { label: "SAP", value: "sap" },
  { label: "Portal", value: "portal" },
]

export const SOURCES_COLORS: SyncStatusColors = [
  { color: "soft-green", value: "sap" },
  { color: "soft-amber", value: "portal" },
]
