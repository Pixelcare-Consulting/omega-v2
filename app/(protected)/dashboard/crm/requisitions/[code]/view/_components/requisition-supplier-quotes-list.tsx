"use client"

import { useMemo } from "react"

import { getItems } from "@/actions/master-item"
import { getColumns } from "./requisition-supplier-quotes-table-column"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { DataTableFilter } from "@/components/data-table/data-table-filter"
import { FilterFields } from "@/components/data-table/data-table-filter"
import { SUPPLIER_QUOTE_STATUS_OPTIONS } from "@/schema/supplier-quote"
import { useDataTable } from "@/hooks/use-data-table"
import { getRequisitionByCode } from "@/actions/requisition"
import { BP_MASTER_SUPPLIER_SCOPE_OPTIONS, BP_MASTER_SUPPLIER_STATUS_OPTIONS } from "@/schema/master-bp"

type SupplierQuoteList = {
  supplierQuotes: NonNullable<Awaited<ReturnType<typeof getRequisitionByCode>>>["supplierQuotes"][number][]
  items: Awaited<ReturnType<typeof getItems>>
}

export default function RequisitionSupplierQuoteList({ supplierQuotes, items }: SupplierQuoteList) {
  const columns = useMemo(() => getColumns(items), [JSON.stringify(items)])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "ID #", columnId: "id #", type: "text" },
      { label: "Date", columnId: "date", type: "date" },
      { label: "Supplier", columnId: "supplier", type: "text" },
      { label: "Supplier - Status", columnId: "supplier status", type: "select", options: BP_MASTER_SUPPLIER_STATUS_OPTIONS },
      { label: "Supplier - Scope", columnId: "supplier scope", type: "select", options: BP_MASTER_SUPPLIER_SCOPE_OPTIONS },
      { label: "Buyer", columnId: "buyers", type: "text" },
      { label: "Status", columnId: "status", type: "select", options: SUPPLIER_QUOTE_STATUS_OPTIONS },
      { label: "MPN", columnId: "mpn", type: "text" },
      { label: "MFR", columnId: "mfr", type: "text" },
      { label: "Date Code", columnId: "date code", type: "text" },
      { label: "Lead Time", columnId: "lead time", type: "text" },
      { label: "Condition", columnId: "condition", type: "text" },
      { label: "COO", columnId: "coo", type: "text" },
      { label: "Comments", columnId: "comments", type: "text" },
      { label: "Total Cost", columnId: "total cost", type: "text" },
    ]
  }, [])

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: supplierQuotes,
    columns: columns,
    initialState: { columnPinning: { right: ["actions"] } },
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
