"use client"

import { useMemo } from "react"
import { getColumns } from "./supplier-offer-line-item-table-column"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { LineItemsJSONData } from "@/actions/supplier-offer"

type SupplierOfferLineItemListProps = {
  supplierOfferId: string
  lineItems: LineItemsJSONData
}

export default function SupplierOfferLineItemList({ supplierOfferId, lineItems }: SupplierOfferLineItemListProps) {
  const columns = useMemo(() => getColumns(supplierOfferId, lineItems), [supplierOfferId, JSON.stringify(lineItems)])

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
