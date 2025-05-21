import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type DataTableSkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  columnCount: number //* the number of columns in the table.
  rowCount?: number //* the number of rows in the table.
  cellWidths?: string[] //*  the width of each cell in the table. default ["auto"], the length of the array should be equal to the columnCount, any valid CSS width value is accepted.
  withPagination?: boolean //* flag to show the pagination bar.
  shrinkZero?: boolean //* flag to prevent the table cells from shrinking.
}

export function DataTableSkeleton(props: DataTableSkeletonProps) {
  const {
    columnCount,
    rowCount = 10,
    cellWidths = ["auto"],
    withPagination = true,
    shrinkZero = false,
    className,
    ...skeletonProps
  } = props

  return (
    <div className={cn("w-full space-y-2.5 overflow-auto", className)} {...skeletonProps}>
      <div className='flex w-full items-center justify-between space-x-2 overflow-auto p-1'>
        <div className='flex flex-1 items-center space-x-2'>
          <Skeleton className='h-7 w-40 lg:w-60' />
          <Skeleton className='h-7 w-[4.5rem] border-dashed' />
          <Skeleton className='h-7 w-[4.5rem] border-dashed' />
        </div>
        <Skeleton className='ml-auto hidden h-7 w-[4.5rem] lg:flex' />
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {Array.from({ length: 1 }).map((_, i) => (
              <TableRow key={i} className='hover:bg-transparent'>
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableHead
                    key={j}
                    style={{
                      width: cellWidths[j],
                      minWidth: shrinkZero ? cellWidths[j] : "auto",
                    }}
                  >
                    <Skeleton className='h-6 w-full' />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i} className='hover:bg-transparent'>
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableCell
                    key={j}
                    style={{
                      width: cellWidths[j],
                      minWidth: shrinkZero ? cellWidths[j] : "auto",
                    }}
                  >
                    <Skeleton className='h-6 w-full' />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {withPagination ? (
        <div className='flex w-full items-center justify-between gap-4 overflow-auto p-1 sm:gap-8'>
          <Skeleton className='h-7 w-40 shrink-0' />
          <div className='flex items-center gap-4 sm:gap-6 lg:gap-8'>
            <div className='flex items-center space-x-2'>
              <Skeleton className='h-7 w-24' />
              <Skeleton className='h-7 w-[4.5rem]' />
            </div>
            <div className='flex items-center justify-center text-sm font-medium'>
              <Skeleton className='h-7 w-20' />
            </div>
            <div className='flex items-center space-x-2'>
              <Skeleton className='hidden size-7 lg:block' />
              <Skeleton className='size-7' />
              <Skeleton className='size-7' />
              <Skeleton className='hidden size-7 lg:block' />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
