"use client"

import { useDataTable } from "@/hooks/use-data-table"
import { useMemo } from "react"
import { getColumns } from "./requisition-requested-items-column"
import { RequestedItemForm } from "@/schema/requisition"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"

type RequisitionRequestedItemsListProps = {
  reqId: string
  requestedItems: RequestedItemForm[]
}

export default function RequisitionRequestedItemsList({ reqId, requestedItems }: RequisitionRequestedItemsListProps) {
  const columns = useMemo(() => getColumns(reqId, requestedItems), [reqId, JSON.stringify(requestedItems)])

  const { table } = useDataTable({
    data: requestedItems,
    columns: columns,
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
  })

  return (
    <DataTable table={table}>
      <div className='flex flex-col items-stretch justify-center gap-2 md:flex-row md:items-center md:justify-between'>
        <DataTableSearch table={table} />
      </div>
    </DataTable>
  )
}
