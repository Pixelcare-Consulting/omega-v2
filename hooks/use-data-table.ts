import { globalSearchFilter } from "@/lib/data-table/data-table"
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  TableOptions,
  TableState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { useState } from "react"
interface UseDataTableProps<TData> extends Omit<TableOptions<TData>, "getCoreRowModel"> {
  //* Extend to make the sorting id typesafe
  initialState?: Omit<Partial<TableState>, "sorting"> & {
    sorting?: {
      id: Extract<keyof TData, string>
      desc: boolean
    }[]
  }
}

export function useDataTable<TData>(props: UseDataTableProps<TData>) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const table = useReactTable({
    ...props,
    state: {
      rowSelection,
      columnFilters,
      columnVisibility,
      sorting,
      pagination,
    },
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: globalSearchFilter,
  })

  return { table, rowSelection, columnFilters, columnVisibility, sorting, pagination }
}
