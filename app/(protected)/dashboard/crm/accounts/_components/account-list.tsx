"use client"

import { getAccounts } from "@/actions/account"
import { useMemo } from "react"

import { getColumns } from "./account-table-column"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"

type AccountListProps = {
  accounts: Awaited<ReturnType<typeof getAccounts>>
}

export default function AccountList({ accounts }: AccountListProps) {
  const columns = useMemo(() => getColumns(), [])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "Name", columnId: "name", type: "text" },
      { label: "Email", columnId: "email", type: "text" },
      { label: "Phone", columnId: "phone", type: "text" },
      {
        label: "Status",
        columnId: "status",
        type: "select",
        options: [
          { label: "Active", value: "true" },
          { label: "Inactive", value: "false" },
        ],
      },
    ]
  }, [])

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: accounts,
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
