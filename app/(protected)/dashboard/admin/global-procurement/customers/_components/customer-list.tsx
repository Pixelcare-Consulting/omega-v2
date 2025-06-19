"use client"

import { useMemo } from "react"
import { useRouter } from "nextjs-toploader/app"

import { getCustomers } from "@/actions/customer"
import { getColumns } from "./customer-table-column"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { useDataTable } from "@/hooks/use-data-table"
import { PageLayout } from "@/app/(protected)/_components/page-layout"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"

type CustomerListProps = {
  customers: Awaited<ReturnType<typeof getCustomers>>
}

export default function CustomerList({ customers }: CustomerListProps) {
  const router = useRouter()

  const columns = useMemo(() => getColumns(), [])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "Code", columnId: "code", type: "text" },
      { label: "Name", columnId: "name", type: "text" },
      { label: "Vendor Code", columnId: "vendor code", type: "text" },
      { label: "Group", columnId: "group", type: "text" },
    ]
  }, [])

  const { table, columnFilters, columnVisibility } = useDataTable({ data: customers, columns })

  return (
    <PageLayout
      title='Customers'
      description='Manage and track your customers effectively'
      addButton={{
        label: "Add Customer",
        onClick: () => router.push("/dashboard/admin/global-procurement/customers/add"),
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
