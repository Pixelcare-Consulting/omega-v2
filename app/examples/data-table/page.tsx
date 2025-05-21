"use client"

import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { useDataTable } from "@/hooks/use-data-table"
import { dateFilter, dateSort } from "@/lib/data-table/data-table"
import { createColumnHelper } from "@tanstack/react-table"
import { format } from "date-fns"
import { useMemo } from "react"

type TableData = {
  id: number
  name: string
  email: string
  age: number
  role: string
  createdAt: Date
  updatedAt: Date
}

const DataTablePage = () => {
  const columnHelper = createColumnHelper<TableData>()

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("id", {
        header: ({ column }) => <DataTableColumnHeader column={column} title='ID' />,
      }),
      columnHelper.accessor("createdAt", {
        header: ({ column }) => <DataTableColumnHeader column={column} title='Created At' />,
        cell: ({ row }) => <div>{format(row.original.createdAt, "PP")}</div>,
        filterFn: (row, columnId, filterValue, addMeta) => {
          const createdAt = row.original.createdAt
          const filterDateValue = new Date(filterValue)
          return dateFilter(createdAt, filterDateValue)
        },
        sortingFn: (rowA, rowB, columnId) => {
          const rowACreatedAt = rowA.original.createdAt
          const rowBCreatedAt = rowB.original.createdAt
          return dateSort(rowACreatedAt, rowBCreatedAt)
        },
      }),
      columnHelper.accessor("name", {
        header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
      }),
      columnHelper.accessor("email", {
        header: ({ column }) => <DataTableColumnHeader column={column} title='Email' />,
      }),
      columnHelper.accessor("age", {
        header: ({ column }) => <DataTableColumnHeader column={column} title='Age' />,
        filterFn: "weakEquals",
      }),
      columnHelper.accessor("role", {
        header: ({ column }) => <DataTableColumnHeader column={column} title='Role' />,
        cell: ({ row }) => {
          const role = row.original.role
          return <div className='capitalize'>{role}</div>
        },
      }),
    ]
  }, [columnHelper])

  const filterFields: FilterFields[] = useMemo(() => {
    return [
      { label: "Name", columnId: "name", type: "text" },
      { label: "Email", columnId: "email", type: "text" },
      { label: "Age", columnId: "age", type: "text" },
      {
        label: "Role",
        columnId: "role",
        type: "select",
        options: [
          { label: "Admin", value: "admin" },
          { label: "Manager", value: "manager" },
          { label: "User", value: "user" },
        ],
      },
      {
        label: "Created At",
        columnId: "createdAt",
        type: "date",
      },
    ]
  }, [])

  const data: TableData[] = useMemo(() => {
    return [
      {
        id: 1,
        name: "Emma Green",
        email: "emma@example.com",
        age: 48,
        role: "admin",
        createdAt: new Date("2023-05-20"),
        updatedAt: new Date("2023-05-21"),
      },
      {
        id: 2,
        name: "Emma Green",
        email: "emma@example.com",
        age: 50,
        role: "user",
        createdAt: new Date("2023-05-24"),
        updatedAt: new Date("2023-05-24"),
      },
      {
        id: 3,
        name: "Tom White",
        email: "tom@example.com",
        age: 50,
        role: "admin",
        createdAt: new Date("2023-05-27"),
        updatedAt: new Date("2023-05-27"),
      },
      {
        id: 4,
        name: "Jane Doe",
        email: "jane@example.com",
        age: 39,
        role: "admin",
        createdAt: new Date("2023-05-12"),
        updatedAt: new Date("2023-05-12"),
      },
      {
        id: 5,
        name: "John Doe",
        email: "john@example.com",
        age: 27,
        role: "user",
        createdAt: new Date("2023-05-21"),
        updatedAt: new Date("2023-05-26"),
      },
      {
        id: 6,
        name: "Alice Johnson",
        email: "alice@example.com",
        age: 35,
        role: "admin",
        createdAt: new Date("2023-05-18"),
        updatedAt: new Date("2023-05-21"),
      },
      {
        id: 7,
        name: "Emma Green",
        email: "emma@example.com",
        age: 35,
        role: "manager",
        createdAt: new Date("2023-05-22"),
        updatedAt: new Date("2023-05-22"),
      },
      {
        id: 8,
        name: "Emma Green",
        email: "emma@example.com",
        age: 35,
        role: "manager",
        createdAt: new Date("2023-05-02"),
        updatedAt: new Date("2023-05-03"),
      },
      {
        id: 9,
        name: "Bob Smith",
        email: "bob@example.com",
        age: 30,
        role: "manager",
        createdAt: new Date("2023-05-14"),
        updatedAt: new Date("2023-05-15"),
      },
      {
        id: 10,
        name: "Emma Green",
        email: "emma@example.com",
        age: 46,
        role: "user",
        createdAt: new Date("2023-05-15"),
        updatedAt: new Date("2023-05-16"),
      },
      {
        id: 11,
        name: "John Doe",
        email: "john@example.com",
        age: 26,
        role: "user",
        createdAt: new Date("2023-05-10"),
        updatedAt: new Date("2023-05-10"),
      },
      {
        id: 12,
        name: "Alice Johnson",
        email: "alice@example.com",
        age: 30,
        role: "user",
        createdAt: new Date("2023-05-11"),
        updatedAt: new Date("2023-05-12"),
      },
      {
        id: 13,
        name: "Alice Johnson",
        email: "alice@example.com",
        age: 22,
        role: "user",
        createdAt: new Date("2023-05-13"),
        updatedAt: new Date("2023-05-17"),
      },
      {
        id: 14,
        name: "Alice Johnson",
        email: "alice@example.com",
        age: 24,
        role: "admin",
        createdAt: new Date("2023-05-21"),
        updatedAt: new Date("2023-05-23"),
      },
      {
        id: 15,
        name: "Emma Green",
        email: "emma@example.com",
        age: 41,
        role: "manager",
        createdAt: new Date("2023-05-15"),
        updatedAt: new Date("2023-05-17"),
      },
      {
        id: 16,
        name: "John Doe",
        email: "john@example.com",
        age: 38,
        role: "manager",
        createdAt: new Date("2023-05-04"),
        updatedAt: new Date("2023-05-04"),
      },
      {
        id: 17,
        name: "Alice Johnson",
        email: "alice@example.com",
        age: 42,
        role: "manager",
        createdAt: new Date("2023-05-30"),
        updatedAt: new Date("2023-06-02"),
      },
      {
        id: 18,
        name: "Alice Johnson",
        email: "alice@example.com",
        age: 50,
        role: "manager",
        createdAt: new Date("2023-05-19"),
        updatedAt: new Date("2023-05-21"),
      },
      {
        id: 19,
        name: "Alice Johnson",
        email: "alice@example.com",
        age: 42,
        role: "manager",
        createdAt: new Date("2023-05-30"),
        updatedAt: new Date("2023-05-31"),
      },
      {
        id: 20,
        name: "Tom White",
        email: "tom@example.com",
        age: 27,
        role: "manager",
        createdAt: new Date("2023-05-15"),
        updatedAt: new Date("2023-05-20"),
      },
      {
        id: 21,
        name: "Alice Johnson",
        email: "alice@example.com",
        age: 34,
        role: "manager",
        createdAt: new Date("2023-05-30"),
        updatedAt: new Date("2023-06-01"),
      },
      {
        id: 22,
        name: "Alice Johnson",
        email: "alice@example.com",
        age: 40,
        role: "user",
        createdAt: new Date("2023-05-16"),
        updatedAt: new Date("2023-05-20"),
      },
      {
        id: 23,
        name: "John Doe",
        email: "john@example.com",
        age: 36,
        role: "admin",
        createdAt: new Date("2023-05-14"),
        updatedAt: new Date("2023-05-14"),
      },
      {
        id: 24,
        name: "Bob Smith",
        email: "bob@example.com",
        age: 45,
        role: "manager",
        createdAt: new Date("2023-05-23"),
        updatedAt: new Date("2023-05-25"),
      },
      {
        id: 25,
        name: "Alice Johnson",
        email: "alice@example.com",
        age: 35,
        role: "user",
        createdAt: new Date("2023-05-17"),
        updatedAt: new Date("2023-05-21"),
      },
      {
        id: 26,
        name: "Alice Johnson",
        email: "alice@example.com",
        age: 44,
        role: "admin",
        createdAt: new Date("2023-05-22"),
        updatedAt: new Date("2023-05-25"),
      },
      {
        id: 27,
        name: "Bob Smith",
        email: "bob@example.com",
        age: 48,
        role: "admin",
        createdAt: new Date("2023-05-18"),
        updatedAt: new Date("2023-05-21"),
      },
      {
        id: 28,
        name: "John Doe",
        email: "john@example.com",
        age: 22,
        role: "manager",
        createdAt: new Date("2023-05-20"),
        updatedAt: new Date("2023-05-25"),
      },
      {
        id: 29,
        name: "Jane Doe",
        email: "jane@example.com",
        age: 38,
        role: "manager",
        createdAt: new Date("2023-05-31"),
        updatedAt: new Date("2023-06-01"),
      },
      {
        id: 30,
        name: "John Doe",
        email: "john@example.com",
        age: 49,
        role: "admin",
        createdAt: new Date("2023-05-26"),
        updatedAt: new Date("2023-05-29"),
      },
    ]
  }, [])

  const { table, columnFilters, columnVisibility } = useDataTable({ data, columns: columns })

  return (
    <div className='mx-auto mb-5 max-w-5xl space-y-2 py-5'>
      <h1 className='text-lg font-bold'>Table</h1>

      <DataTable table={table}>
        <div className='flex flex-col items-stretch justify-center gap-2 md:flex-row md:items-center md:justify-between'>
          <DataTableSearch table={table} className='' />

          <div className='flex items-center gap-2'>
            <DataTableFilter className='w-full md:w-fit' table={table} filterFields={filterFields} columnFilters={columnFilters} />
            <DataTableViewOptions className='w-full md:w-fit' table={table} columnVisibility={columnVisibility} />
          </div>
        </div>
      </DataTable>

      <h1 className='text-lg font-bold'>Table Loading</h1>
      <DataTableSkeleton columnCount={6} />
    </div>
  )
}

export default DataTablePage
