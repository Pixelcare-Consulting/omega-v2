"use client"

import { useMemo } from "react"

import { getColumns } from "./requisition-table-columns"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { DataTableFilter } from "@/components/data-table/data-table-filter"
import { useDataTable } from "@/hooks/use-data-table"
import { getRequisitions } from "@/actions/requisition"
import { getItems } from "@/actions/item"

type RequisitionListProps = {
  requisitions: Awaited<ReturnType<typeof getRequisitions>>
  items: Awaited<ReturnType<typeof getItems>>
}

export default function RequisitionList({ requisitions, items }: RequisitionListProps) {
  const columns = useMemo(() => getColumns(items), [JSON.stringify(items)])

  const filterFields = useMemo((): any[] => {
    return [
      { label: "Date", columnId: "date", type: "text" },
      { label: "Customer", columnId: "customer", type: "text" },
      { label: "Customer PO Hit Rate", columnId: "customer po hit rate", type: "text" },
      { label: "Salesperson", columnId: "salesperson", type: "text" },
      { label: "Sales Category", columnId: "sales category", type: "text" },
      { label: "Urgency", columnId: "urgency", type: "text" },
      { label: "Purchasing Status", columnId: "purchasing status", type: "text" },
      { label: "Result", columnId: "result", type: "text" },
      { label: "MPN", columnId: "mpn", type: "text" },
      { label: "MFR", columnId: "mfr", type: "text" },
      { label: "Requested Quantity", columnId: "requested quantity", type: "text" },
      { label: "Omega Buyer", columnId: "omega buyer", type: "text" },
    ]
  }, [])

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: requisitions,
    columns: columns,
    initialState: { columnPinning: { right: ["action"] } },
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
