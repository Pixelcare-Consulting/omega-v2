"use client"

import { getSaleQuotes } from "@/actions/sale-quote"
import { getColumns } from "./sale-quote-table-column"
import { useMemo } from "react"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"

type SalesQuoteListProps = {
  salesQuotes: Awaited<ReturnType<typeof getSaleQuotes>>
}

export default function SaleQuoteList({ salesQuotes }: SalesQuoteListProps) {
  const columns = useMemo(() => getColumns(), [])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "ID #", columnId: "id #", type: "text" },
      { label: "Date", columnId: "date", type: "date" },
      { label: "Customer", columnId: "customer", type: "text" },
      { label: "Sales Rep", columnId: "sales rep", type: "text" },
      { label: "Approval", columnId: "approval", type: "text" },
      { label: "Valid Until", columnId: "valid until", type: "date" },
    ]
  }, [])

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: salesQuotes,
    columns: columns,
    initialState: {
      columnPinning: { right: ["actions"] },
      sorting: [{ id: "date", desc: true }],
    },
  })

  return (
    <DataTable table={table}>
      <div className='flex flex-col items-stretch justify-center gap-2 md:flex-row md:items-center md:justify-between'>
        <DataTableSearch table={table} className='' />

        <div className='flex items-center gap-2'>
          <DataTableFilter className='w-full md:w-fit' table={table} filterFields={filterFields} columnFilters={columnFilters} />
          <DataTableViewOptions className='w-full md:w-fit' table={table} columnVisibility={columnVisibility} />
        </div>
      </div>
    </DataTable>
  )
}
