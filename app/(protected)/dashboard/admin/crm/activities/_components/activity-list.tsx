"use client"

import { useMemo } from "react"
import { useRouter } from "nextjs-toploader/app"

import { PageLayout } from "@/app/(protected)/_components/page-layout"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { useDataTable } from "@/hooks/use-data-table"
import { getColumns } from "./activity-table-colums"
import { getActivities } from "@/actions/activity"
import { ACTIVITY_STATUSES_OPTIONS, ACTIVITY_TYPES_OPTIONS } from "@/schema/activity"

type LeadListProps = {
  activities: Awaited<ReturnType<typeof getActivities>>
}

export default function ActivityList({ activities }: LeadListProps) {
  const router = useRouter()

  const columns = useMemo(() => getColumns(), [])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "Activity", columnId: "activity", type: "text" },
      { label: "Type", columnId: "type", type: "select", options: ACTIVITY_TYPES_OPTIONS },
      { label: "Owner", columnId: "owner", type: "text" },
      { label: "Schedule", columnId: "schedule", type: "date" },
      { label: "Status", columnId: "status", type: "select", options: ACTIVITY_STATUSES_OPTIONS },
      { label: "Lead", columnId: "lead", type: "text" },
    ]
  }, [])

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: activities,
    columns: columns,
    initialState: { sorting: [{ id: "created", desc: true }] },
  })

  return (
    <PageLayout
      title='Activities'
      description="Manage and track your lead's activities"
      addButton={{
        label: "Add Activity",
        onClick: () => router.push("/dashboard/admin/crm/activities/add"),
      }}
    >
      <DataTable table={table}>
        <div className='flex flex-col items-stretch justify-center gap-2 md:flex-row md:items-center md:justify-between'>
          <DataTableSearch table={table} className='' />

          <div className='flex items-center gap-2'>
            <DataTableFilter className='w-full md:w-fit' table={table} filterFields={filterFields} columnFilters={columnFilters} />
            <DataTableViewOptions className='w-full md:w-fit' table={table} columnVisibility={columnVisibility} />
          </div>
        </div>
      </DataTable>
    </PageLayout>
  )
}
