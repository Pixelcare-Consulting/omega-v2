"use client"

import { useMemo } from "react"

import { getLeads } from "@/actions/lead"
import { getColumns } from "./lead-table-columns"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { useDataTable } from "@/hooks/use-data-table"
import { LEAD_STATUSES_OPTIONS } from "@/schema/lead"
import { Card } from "@/components/ui/card"

type LeadListProps = {
  leads: Awaited<ReturnType<typeof getLeads>>
}

export default function LeadList({ leads }: LeadListProps) {
  const columns = useMemo(() => getColumns(), [])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "Name", columnId: "name", type: "text" },
      { label: "Status", columnId: "status", type: "select", options: LEAD_STATUSES_OPTIONS },
      { label: "Company", columnId: "company", type: "text" },
      { label: "Title", columnId: "title", type: "text" },
      { label: "Email", columnId: "email", type: "text" },
      { label: "Phone", columnId: "phone", type: "text" },
    ]
  }, [])

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: leads,
    columns: columns,
    initialState: { columnVisibility: { email: false } },
  })

  return (
    <Card className='p-6'>
      <DataTable table={table}>
        <div className='flex flex-col items-stretch justify-center gap-2 md:flex-row md:items-center md:justify-between'>
          <DataTableSearch table={table} className='' />

          <div className='flex items-center gap-2'>
            <DataTableFilter className='w-full md:w-fit' table={table} filterFields={filterFields} columnFilters={columnFilters} />
            <DataTableViewOptions className='w-full md:w-fit' table={table} columnVisibility={columnVisibility} />
          </div>
        </div>
      </DataTable>
    </Card>
  )
}
