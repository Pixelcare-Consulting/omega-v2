"use client"

import { useRouter } from "nextjs-toploader/app"
import React, { useMemo, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"

import { getRequisitionByCode } from "@/actions/requisition"
import { Icons } from "@/components/icons"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import RequisitionActivityFormDrawer from "../requisition-activity-form-drawer"
import { useDialogStore } from "@/hooks/use-dialog"
import RequisitionActivityCardList from "../requisition-activity-card-list"
import { useDataTable } from "@/hooks/use-data-table"
import { dateFilter, dateSort } from "@/lib/data-table/data-table"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { REQUISITION_ACTIVITY_STATUSES_OPTIONS, REQUISITION_ACTIVITY_TYPES_OPTIONS } from "@/schema/requisition-activity"

export type Requisition = NonNullable<Awaited<ReturnType<typeof getRequisitionByCode>>>
export type RequisitionActivity = Requisition["activities"][number]

type RequisitionActivitiesTabProps = {
  requisition: NonNullable<Awaited<ReturnType<typeof getRequisitionByCode>>>
}

export default function RequisitionActivitiesTab({ requisition }: RequisitionActivitiesTabProps) {
  const router = useRouter()
  const requisitionActivities = requisition?.activities || []

  const [activity, setActivity] = useState<RequisitionActivity | null>(null)

  const { setIsOpen } = useDialogStore(["setIsOpen"])

  const columns = useMemo((): ColumnDef<RequisitionActivity>[] => {
    return [
      { accessorKey: "title" },
      { accessorKey: "type" },
      { accessorKey: "status" },
      { accessorFn: (row) => row.createdByUser?.name || "", id: "owner" },
      {
        id: "schedule",
        filterFn: (row, columnId, filterValue, addMeta) => {
          if (row.original.type !== "meeting" || !row.original.date) return false
          const date = row.original.date
          const filterDateValue = new Date(filterValue)
          return dateFilter(date, filterDateValue)
        },
        sortingFn: (rowA, rowB, columnId) => {
          if (rowA.original.type !== "meeting" || !rowA.original.date) return 0
          if (rowB.original.type !== "meeting" || !rowB.original.date) return 0

          const d1 = new Date(rowA.original.date)
          const d2 = new Date(rowB.original.date)

          return dateSort(d1, d2)
        },
      },
    ]
  }, [])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "Title", columnId: "title", type: "text" },
      { label: "Type", columnId: "type", type: "select", options: REQUISITION_ACTIVITY_TYPES_OPTIONS },
      { label: "Owner", columnId: "owner", type: "text" },
      { label: "Schedule", columnId: "schedule", type: "date" },
      { label: "Status", columnId: "status", type: "select", options: REQUISITION_ACTIVITY_STATUSES_OPTIONS },
    ]
  }, [])

  const { table, columnFilters } = useDataTable({ data: requisitionActivities, columns: columns })

  const Actions = () => {
    return (
      <div className='flex items-center gap-2'>
        <Button className='space-x-2' type='button' variant='ghost'>
          <Icons.mailPlus className='size-4' />
          <span>New Email</span>

          <span className='inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-center text-xs font-medium text-purple-600 ring-1 ring-purple-500/10'>
            Coming Soon
          </span>
        </Button>

        <div>
          <DataTableFilter table={table} filterFields={filterFields} columnFilters={columnFilters} buttonProps={{ variant: "ghost" }} />
        </div>

        {requisition && <RequisitionActivityFormDrawer activity={activity} setActivity={setActivity} requisitionId={requisition.id} />}
      </div>
    )
  }

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-5'>
        <ReadOnlyFieldHeader
          className='col-span-12'
          title='Activities'
          description='Requisition activities details'
          actions={<Actions />}
        />
      </div>

      <div className='p-4'>
        <RequisitionActivityCardList
          table={table}
          requisition={requisition}
          setActivity={setActivity}
          setIsOpen={setIsOpen}
          columnFilters={columnFilters}
        />
      </div>
    </Card>
  )
}
