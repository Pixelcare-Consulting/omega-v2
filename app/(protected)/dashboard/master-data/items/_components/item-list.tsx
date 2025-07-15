"use client"

import { useMemo } from "react"

import getColumns from "./item-table-column"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import LoadingButton from "@/components/loading-button"
import { Icons } from "@/components/icons"
import { getItems } from "@/actions/sap-item-master"

type ItemListProps = {
  items: Awaited<ReturnType<typeof getItems>>
}

export default function ItemList({ items }: ItemListProps) {
  const columns = useMemo(() => getColumns(), [])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "Item", columnId: "item", type: "text" },
      { label: "Group", columnId: "group", type: "text" },
      { label: "MPN", columnId: "mpn", type: "text" },
      { label: "Manufacturer", columnId: "manufacturer", type: "text" },
      { label: "UOM", columnId: "uom", type: "text" },
      { label: "Status", columnId: "status", type: "text" },
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
    data: items,
    columns: columns,
    initialState: { columnVisibility: { email: false } },
  })

  return (
    <DataTable table={table}>
      <div className='flex flex-col items-stretch justify-center gap-2 md:flex-row md:items-center md:justify-between'>
        <DataTableSearch table={table} className='' />

        <div className='flex items-center gap-2'>
          <LoadingButton variant='outline'>
            <Icons.refreshCw className='size-4' /> Sync
          </LoadingButton>
          <DataTableFilter className='w-full md:w-fit' table={table} filterFields={filterFields} columnFilters={columnFilters} />
          <DataTableViewOptions className='w-full md:w-fit' table={table} columnVisibility={columnVisibility} />
        </div>
      </div>
    </DataTable>
  )
}
