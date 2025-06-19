"use client"

import { useMemo } from "react"
import { useRouter } from "nextjs-toploader/app"

import { getItems } from "@/actions/item"
import { PageLayout } from "@/app/(protected)/_components/page-layout"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { useDataTable } from "@/hooks/use-data-table"
import { getColumns } from "./item-table-column"

type ItemListProps = {
  items: Awaited<ReturnType<typeof getItems>>
}

export default function ItemList({ items }: ItemListProps) {
  const router = useRouter()

  const columns = useMemo(() => getColumns(), [])

  const { table, columnFilters, columnVisibility } = useDataTable({ data: items, columns: columns })

  const filterFields = useMemo(
    (): FilterFields[] => [
      { label: "Name", columnId: "name", type: "text" },
      { label: "Code", columnId: "code", type: "text" },
      { label: "Group", columnId: "group", type: "text" },
      { label: "Manufacturer", columnId: "Manufacturer", type: "text" },
      { label: "UOM", columnId: "UOM", type: "text" },
    ],
    []
  )

  return (
    <PageLayout
      title='Items'
      description='Manage and track your items effectively'
      addButton={{
        label: "Add Item",
        onClick: () => router.push("/dashboard/admin/global-procurement/items/add"),
      }}
    >
      <DataTable table={table}>
        <div className='flex flex-col items-stretch justify-center gap-2 md:flex-row md:items-center md:justify-between'>
          <DataTableSearch table={table} className='' />

          <div className='flex items-center gap-2'>
            <DataTableFilter className='w-full md:w-fit' table={table} filterFields={filterFields} columnFilters={columnFilters} />
            <DataTableViewOptions className='w-full md:w-fit' table={table} columnVisibility={columnVisibility} />
          </div>
        </div>
      </DataTable>
    </PageLayout>
  )
}
