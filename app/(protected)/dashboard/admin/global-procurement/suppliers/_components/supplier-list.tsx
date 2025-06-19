"use client"

import { useMemo } from "react"
import { useRouter } from "nextjs-toploader/app"

import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { useDataTable } from "@/hooks/use-data-table"
import { PageLayout } from "@/app/(protected)/_components/page-layout"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { getSuppliers } from "@/actions/supplier"
import { getColumns } from "./supplier-table-column"

type SupplierListProps = {
  suppliers: Awaited<ReturnType<typeof getSuppliers>>
}

export default function SupplierList({ suppliers }: SupplierListProps) {
  const router = useRouter()

  const columns = useMemo(() => getColumns(), [])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "Name", columnId: "name", type: "text" },
      { label: "Code", columnId: "code", type: "text" },
      { label: "Account #", columnId: "account number", type: "text" },
      { label: "Assigned Buyer", columnId: "assigned buyer", type: "text" },
    ]
  }, [])

  const { table, columnFilters, columnVisibility } = useDataTable({ data: suppliers, columns })

  return (
    <PageLayout
      title='Suppliers'
      description='Manage and track your suppliers effectively'
      addButton={{
        label: "Add Supplier",
        onClick: () => router.push("/dashboard/admin/global-procurement/suppliers/add"),
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
