"use client"

import { useMemo } from "react"

import { useDataTable } from "@/hooks/use-data-table"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { getColumns } from "./account-contacts-table-column"
import { getAccountById } from "@/actions/account"

type AccountContactListProps = {
  accountId: string
  contacts: NonNullable<Awaited<ReturnType<typeof getAccountById>>>["contacts"][number]["contact"][]
}

export default function AccountContactList({ accountId, contacts }: AccountContactListProps) {
  const columns = useMemo(() => getColumns(accountId), [accountId])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "Name", columnId: "name", type: "text" },
      { label: "Email", columnId: "email", type: "text" },
      { label: "Phone", columnId: "phone", type: "text" },
      { label: "Title", columnId: "title", type: "text" },
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
    data: contacts,
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
