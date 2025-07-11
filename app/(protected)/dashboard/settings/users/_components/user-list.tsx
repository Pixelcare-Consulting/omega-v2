"use client"

import { useMemo } from "react"
import { getColumns } from "./user-table-column"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { getUsers } from "@/actions/user"
import { useDataTable } from "@/hooks/use-data-table"
import { Card } from "@/components/ui/card"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { getRoles } from "@/actions/role"

type UserListProps = {
  users: Awaited<ReturnType<typeof getUsers>>
  roles: Awaited<ReturnType<typeof getRoles>>
}

export default function UserList({ users, roles }: UserListProps) {
  const columns = useMemo(() => getColumns(), [])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "User", columnId: "user", type: "text" },
      { label: "Email", columnId: "email", type: "text" },
      { label: "Role", columnId: "role", type: "select", options: roles.map((role) => ({ label: role.name, value: role.name })) },
      {
        label: "Status",
        columnId: "status",
        type: "select",
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ],
      },
    ]
  }, [])

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: users,
    columns: columns,
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
