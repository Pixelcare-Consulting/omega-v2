"use client"

import { LineItemForm } from "@/schema/sale-quote"
import { useMemo } from "react"
import { getColumns } from "./sale-quote-line-items-column"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"

type SaleQuoteLineItemListProps = {
  saleQuoteId: string
  lineItems: LineItemForm[]
}

export default function SaleQuoteLineItemList({ saleQuoteId, lineItems }: SaleQuoteLineItemListProps) {
  const columns = useMemo(() => getColumns(saleQuoteId, lineItems), [saleQuoteId, JSON.stringify(lineItems)])

  const { table } = useDataTable({
    data: lineItems,
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
