"use client"

import { useMemo } from "react"
import { getColumns } from "./customer-excess-line-item-table-column"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { LineItemsJSONData } from "@/actions/customer-excess"

type CustomerExcessLineItemListProps = {
  customerExcessId: string
  lineItems: LineItemsJSONData
}

export default function CustomerExcessLineItemList({ customerExcessId, lineItems }: CustomerExcessLineItemListProps) {
  const columns = useMemo(() => getColumns(customerExcessId, lineItems), [customerExcessId, JSON.stringify(lineItems)])

  const { table } = useDataTable({
    data: lineItems,
    columns: columns,
    initialState: {
      columnPinning: { right: ["actions"] },
      pagination: { pageIndex: 0, pageSize: 5 },
    },
  })

  return (
    <DataTable table={table}>
      <div className='flex flex-col items-stretch justify-center gap-2 md:flex-row md:items-center md:justify-between'>
        <DataTableSearch table={table} />
      </div>
    </DataTable>
  )
}
