import { Table } from "@tanstack/react-table"
import React, { ChangeEvent, memo, useEffect, useRef } from "react"
import { useDebouncedCallback } from "use-debounce"
import { Input } from "../ui/input"
import { cn } from "@/lib/utils"

type DataTableSearchProps<TData> = {
  table: Table<TData>
  isGlobalSearch?: boolean
  columnId?: string
  className?: string
}

function DataTableSearchComponent<TData>({ table, columnId, isGlobalSearch = true, className }: DataTableSearchProps<TData>) {
  const inputRef = useRef<HTMLInputElement>(null)
  const column = columnId ? table.getColumn(columnId) : null
  const columnFilterValue = column?.getFilterValue()

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    if (isGlobalSearch) {
      table.setGlobalFilter(e.target.value)
      return
    }

    if (!columnId || !column) return
    column.setFilterValue(e.target.value)
  }

  //* debounce search
  const debounceHandleSearch = useDebouncedCallback(handleSearch, 300)

  useEffect(() => {
    if (column) {
      //* clear  the input field if the filter value is undefined
      const filterValue = column.getFilterValue()
      if (filterValue === undefined && inputRef?.current) inputRef.current.value = ""
    }
  }, [columnFilterValue, column])

  return (
    <Input
      className={cn("w-full md:max-w-xs", className)}
      type='text'
      ref={inputRef}
      placeholder='Search...'
      onChange={debounceHandleSearch}
    />
  )
}

export const DataTableSearch = memo(DataTableSearchComponent) as typeof DataTableSearchComponent
