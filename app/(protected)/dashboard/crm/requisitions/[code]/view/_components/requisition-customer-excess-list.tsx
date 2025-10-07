"use client"

import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { useDataTable } from "@/hooks/use-data-table"
import { getCustomerExcessLineItemsByPartialMpn } from "@/actions/customer-excess"
import { getColumns } from "./requisition-customer-excess-table-column"

type CustomerExcessListProps = {
  customerExcessLineItems: NonNullable<Awaited<ReturnType<typeof getCustomerExcessLineItemsByPartialMpn>>>
  isLoading: boolean
}

export default function RequisitionCustomerExcessLineItemList({ customerExcessLineItems, isLoading }: CustomerExcessListProps) {
  const columns = useMemo(() => getColumns(), [])

  const { table } = useDataTable({
    data: customerExcessLineItems,
    columns: columns,
    initialState: {
      columnPinning: { right: ["actions"] },
      sorting: [{ id: "list date", desc: true }],
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
