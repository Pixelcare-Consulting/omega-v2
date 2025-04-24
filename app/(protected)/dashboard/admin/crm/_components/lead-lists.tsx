"use client"

import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns/lead-lists-columns"

export function LeadLists() {
  // This would be replaced with actual data from your API
  const data = [
    {
      id: "255",
      dateAssigned: "09-04-2024",
      listType: "Excess Aquisition",
      contactTierLevel: "Tier 1",
      bdr: "Kaitlyn Nguyen",
      importLeads: "Import",
      percentageOfListCompleted: "0.00%",
      numberOfLeadRecords: "17",
      numberOfLeadRecordsEntered: "17",
      numberOfLeadRecordsCompleted: "0"
    },
    // Add more sample data as needed
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Lead Lists</h2>
        <button className="bg-primary text-white px-4 py-2 rounded-md">
          + New Lead List
        </button>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  )
} 