"use client"

import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { useDataTable } from "@/hooks/use-data-table"

import { getColumns } from "./requisition-history-table-column"
import { getRequisitionsByPartialMpn } from "@/actions/requisition"

type RequisitionHistoryListProps = {
  requisitionHistory: Awaited<ReturnType<typeof getRequisitionsByPartialMpn>>
  isLoading: boolean
}

export default function RequisitionHistoryList({ requisitionHistory, isLoading }: RequisitionHistoryListProps) {
  const columns = useMemo(() => getColumns(), [])

  const { table } = useDataTable({
    data: requisitionHistory,
    columns: columns,
    initialState: {
      columnPinning: { right: ["actions"] },
      sorting: [{ id: "date", desc: true }],
    },
  })

  return (
    <DataTable table={table} isLoading={isLoading}>
      <div className='flex flex-col items-stretch justify-center gap-2 md:flex-row md:items-center md:justify-between'>
        <DataTableSearch table={table} className='' />
      </div>
    </DataTable>
  )
}
