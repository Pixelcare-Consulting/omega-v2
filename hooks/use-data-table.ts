import { globalSearchFilter } from "@/lib/data-table/data-table"
import {
  ColumnFiltersState,
  ColumnPinningState,
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
  initialState?: Partial<TableState>
}

export function useDataTable<TData>(props: UseDataTableProps<TData>) {
  const {
    initialState = {}, // default to empty object
    ...rest
  } = props

  const [rowSelection, setRowSelection] = useState(initialState.rowSelection || {})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialState.columnVisibility || {})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialState.columnFilters || [])
  const [sorting, setSorting] = useState<SortingState>(initialState.sorting || [])
  const [pagination, setPagination] = useState(initialState.pagination || { pageIndex: 0, pageSize: 10 })
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(initialState.columnPinning || {})

  const table = useReactTable({
    ...rest,
    state: {
      rowSelection,
      columnFilters,
      columnVisibility,
      sorting,
      pagination,
      columnPinning,
    },
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
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
