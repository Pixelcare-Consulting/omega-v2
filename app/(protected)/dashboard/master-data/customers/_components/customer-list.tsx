"use client"

import { useMemo } from "react"

import getColumns from "./customer-table-column"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { getBpMasters } from "@/actions/sap-bp-master"

type CustomersListsProps = {
  customers: Awaited<ReturnType<typeof getBpMasters>>
}

export default function CustomerLists({ customers }: CustomersListsProps) {
  const columns = useMemo(() => getColumns(), [])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "Customer", columnId: "customer", type: "text" },
      { label: "Group", columnId: "group name", type: "text" },
      { label: "Contact Person", columnId: "contact person", type: "text" },
      { label: "Phone", columnId: "phone", type: "text" },
      { label: "Currency", columnId: "currency", type: "text" },
      {
        label: "Source",
        columnId: "source",
        type: "select",
        options: [
          { label: "SAP", value: "sap" },
          { label: "Portal", value: "portal" },
        ],
      },
    ]
  }, [])

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: customers,
    columns: columns,
    initialState: { columnVisibility: { email: false } },
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
