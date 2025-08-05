"use client"

import { useMemo } from "react"

import { getItems } from "@/actions/item-master"
import { getSupplierQuotes } from "@/actions/supplier-quote"
import { getColumns } from "./supplier-quote-table-column"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { DataTableFilter } from "@/components/data-table/data-table-filter"
import { FilterFields } from "@/components/data-table/data-table-filter"
import { REQUISITION_PURCHASING_STATUS_OPTIONS, REQUISITION_RESULT_OPTIONS } from "@/schema/requisition"
import { SUPPLIER_QUOTE_STATUS_OPTIONS } from "@/schema/supplier-quote"
import { useDataTable } from "@/hooks/use-data-table"

type SupplierQuoteListProps = {
  supplierQuotes: Awaited<ReturnType<typeof getSupplierQuotes>>
  items: Awaited<ReturnType<typeof getItems>>
}

export default function SupplierQuoteList({ supplierQuotes, items }: SupplierQuoteListProps) {
  const columns = useMemo(() => getColumns(items), [JSON.stringify(items)])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "ID #", columnId: "id #", type: "text" },
      { label: "Date", columnId: "date", type: "date" },
      { label: "Requisition - Code", columnId: "requisition", type: "text" },
      { label: "Requisition - Salesperson", columnId: "requisition salesperson", type: "text" },
      { label: "Requisition - Status", columnId: "requisition status", type: "select", options: REQUISITION_PURCHASING_STATUS_OPTIONS },
      { label: "Requisition - Result", columnId: "requisition result", type: "select", options: REQUISITION_RESULT_OPTIONS },
      { label: "Requisition - MPN", columnId: "requisition mpn", type: "text" },
      { label: "Supplier", columnId: "supplier", type: "text" },
      { label: "Buyer", columnId: "buyers", type: "text" },
      { label: "Status", columnId: "status", type: "select", options: SUPPLIER_QUOTE_STATUS_OPTIONS },
      { label: "MPN", columnId: "mpn", type: "text" },
      { label: "MFR", columnId: "mfr", type: "text" },
      { label: "Date Code", columnId: "date code", type: "text" },
      { label: "Condition", columnId: "condition", type: "text" },
      { label: "Comments", columnId: "comments", type: "text" },
      { label: "Total Cost", columnId: "total cost", type: "text" },
    ]
  }, [])

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: supplierQuotes,
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
