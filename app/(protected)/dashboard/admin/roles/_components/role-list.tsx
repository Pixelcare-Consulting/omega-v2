"use client"

import { useMemo } from "react"
import { useRouter } from "nextjs-toploader/app"

import { getRoles } from "@/actions/role"
import { PageLayout } from "@/app/(protected)/_components/page-layout"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { useDataTable } from "@/hooks/use-data-table"
import { getColumns } from "./role-table-columns"

export type RolesClientProps = {
  roles: Awaited<ReturnType<typeof getRoles>>
}

export default function RolesListClient({ roles }: RolesClientProps) {
  const router = useRouter()

  const columns = useMemo(() => getColumns(), [])

  const filterFields: FilterFields[] = useMemo(() => {
    return [
      { label: "Name", columnId: "name", type: "text" },
      { label: "Description", columnId: "description", type: "text" },
      { label: "Created At", columnId: "created", type: "date" },
      { label: "Updated At", columnId: "updated", type: "date" },
    ]
  }, [])

  const { table, columnFilters, columnVisibility } = useDataTable({ data: roles, columns: columns })

  return (
    <PageLayout
      title='Roles & Permissions'
      description='Each role is granted access to predefined menus and features, ensuring users have access to the necessary
              functions based on their assigned role.'
      addButton={{
        label: "Add Roles",
        onClick: () => router.push("/dashboard/admin/roles/add"),
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
