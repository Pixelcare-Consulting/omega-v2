import * as React from "react"
import { flexRender, type Table as TanstackTable } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { getCommonPinningStyles } from "@/lib/data-table/data-table"
import { DataTablePagination } from "./data-table-pagination"
import { Icons } from "../icons"
import { Skeleton } from "../ui/skeleton"

type DataTableProps<TData> = React.HTMLAttributes<HTMLDivElement> & {
  table: TanstackTable<TData>
  isLoading?: boolean
}

export function DataTable<TData>({ table, children, isLoading, className, ...props }: DataTableProps<TData>) {
  return (
    <div className={cn("w-full space-y-2.5 overflow-auto p-1", className)} {...props}>
      {children}
      <div className='overflow-hidden rounded-md border'>
        <Table className='text-xs'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{
                        ...getCommonPinningStyles({ column: header.column }),
                      }}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                {Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i} className='hover:bg-transparent'>
                    {Array.from({ length: table.getAllColumns().length }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className='h-6 w-full' />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            ) : (
              <>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{
                            ...getCommonPinningStyles({ column: cell.column }),
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={table.getAllColumns().length} className='h-80 text-center'>
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
      {!isLoading && (
        <div className='flex flex-col gap-2.5'>
          <DataTablePagination table={table} />
        </div>
      )}
    </div>
  )
}
