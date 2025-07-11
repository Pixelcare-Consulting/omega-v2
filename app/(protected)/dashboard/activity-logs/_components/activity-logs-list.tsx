"use client"

import { useMemo } from "react"

import { getActivityLogs } from "@/actions/activity-logs"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { useDataTable } from "@/hooks/use-data-table"
import { Card } from "@/components/ui/card"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { getColumns } from "./activity-logs-table-column"

type ActivityLogListProps = {
  activityLogs: Awaited<ReturnType<typeof getActivityLogs>>
}

export default function ActivityLogList({ activityLogs }: ActivityLogListProps) {
  const columns = useMemo(() => getColumns(), [])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      {
        label: "Timestamp",
        columnId: "timestamp",
        type: "date",
      },
      {
        label: "User",
        columnId: "user",
        type: "text",
      },
      {
        label: "Action",
        columnId: "action",
        type: "text",
      },
      {
        label: "Event Type",
        columnId: "event type",
        type: "select",
        options: [
          { label: "User", value: "user" },
          { label: "System", value: "system" },
          { label: "Security", value: "security" },
          { label: "Data", value: "data" },
        ],
      },
      {
        label: "Severity",
        columnId: "severity",
        type: "select",
        options: [
          { label: "Info", value: "info" },
          { label: "Warning", value: "warning" },
          { label: "Error", value: "error" },
          { label: "Critical", value: "critical" },
        ],
      },
    ]
  }, [])

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: activityLogs,
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
