"use client"

import type { Table, VisibilityState } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icons } from "../icons"
import { memo } from "react"
import { cn } from "@/lib/utils"

type DataTableViewOptionsProps<TData> = {
  table: Table<TData>
  className?: string
  columnVisibility: VisibilityState
}

function DataTableViewOptionsComponent<TData>({ table, className }: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label='Toggle columns' variant='outline' size='sm' className={cn(className)}>
          <Icons.adjustmentHorizontal className='size-4' />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-40'>
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className='capitalize'
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                <span className='truncate'>{column.id}</span>
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const DataTableViewOptions = memo(
  DataTableViewOptionsComponent,
  (prev, next) => JSON.stringify(prev.columnVisibility) === JSON.stringify(next.columnVisibility)
) as typeof DataTableViewOptionsComponent
