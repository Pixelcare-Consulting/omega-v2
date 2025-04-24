"use client"

import { ColumnDef } from "@tanstack/react-table"

export type LeadList = {
  id: string
  dateAssigned: string
  listType: string
  contactTierLevel: string
  bdr: string
  importLeads: string
  percentageOfListCompleted: string
  numberOfLeadRecords: string
  numberOfLeadRecordsEntered: string
  numberOfLeadRecordsCompleted: string
}

export const columns: ColumnDef<LeadList>[] = [
  {
    accessorKey: "id",
    header: "Record ID#"
  },
  {
    accessorKey: "dateAssigned",
    header: "Date Assigned"
  },
  {
    accessorKey: "listType",
    header: "List Type"
  },
  {
    accessorKey: "contactTierLevel",
    header: "Contact Tier Level"
  },
  {
    accessorKey: "bdr",
    header: "BDR"
  },
  {
    accessorKey: "importLeads",
    header: "Import Leads",
    cell: ({ row }) => (
      <button className="bg-primary text-white px-3 py-1 rounded-md text-sm">
        Import
      </button>
    )
  },
  {
    accessorKey: "percentageOfListCompleted",
    header: "Percentage of List Completed"
  },
  {
    accessorKey: "numberOfLeadRecords",
    header: "# of Lead records"
  },
  {
    accessorKey: "numberOfLeadRecordsEntered",
    header: "# of Lead records - Entered"
  },
  {
    accessorKey: "numberOfLeadRecordsCompleted",
    header: "# of Lead records - Completed"
  }
] 