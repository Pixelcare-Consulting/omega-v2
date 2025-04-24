"use client"

import { DataTable } from "@/components/ui/data-table"
import { columns, Lead } from "./columns/leads-columns"

export function Leads() {
  // This would be replaced with actual data from your API
  const data: Lead [] = []

  return (
    <div className="space-y-4"> 
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Leads</h2>
        <div className="flex gap-2">
          <button className="bg-primary text-white px-4 py-2 rounded-md">
            + New Lead
          </button>
          <button className="bg-secondary text-white px-4 py-2 rounded-md">
            Import/Export
          </button>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Search records"
          className="border rounded-md px-3 py-2"
        />
        <select className="border rounded-md px-3 py-2">
          <option>Company Division Name</option>
        </select>
        <select className="border rounded-md px-3 py-2">
          <option>Company HQ Phone</option>
        </select>
        <select className="border rounded-md px-3 py-2">
          <option>Department</option>
        </select>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  )
} 