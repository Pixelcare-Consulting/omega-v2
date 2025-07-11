import { format } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"

import { getActivityLogs } from "@/actions/activity-logs"
import { Badge } from "@/components/badge"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { dateFilter, dateSort } from "@/lib/data-table/data-table"

type ActivityLogData = Awaited<ReturnType<typeof getActivityLogs>>[number]

export function getColumns(): ColumnDef<ActivityLogData>[] {
  return [
    {
      accessorKey: "timestamp",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Timestamp' />,
      cell: ({ row }) => <div>{format(row.original.timestamp, "MM-dd-yyyy hh:mm:ss a")}</div>,
      filterFn: (row, columnId, filterValue, addMeta) => {
        const timestamp = row.original.timestamp
        const filterDateValue = new Date(filterValue)
        return dateFilter(timestamp, filterDateValue)
      },
      sortingFn: (rowA, rowB, columnId) => {
        const rowATimestamp = rowA.original.timestamp
        const rowBTimestamp = rowB.original.timestamp
        return dateSort(rowATimestamp, rowBTimestamp)
      },
    },
    {
      accessorKey: "user",
      header: ({ column }) => <DataTableColumnHeader column={column} title='User' />,
      cell: ({ row }) => <div>{row.original.user}</div>,
    },
    {
      accessorKey: "action",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Action' />,
      cell: ({ row }) => <div>{row.original.action}</div>,
    },
    {
      accessorKey: "eventType",
      id: "event type",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Event Type' />,
      cell: ({ row }) => (
        <Badge variant='soft-slate' className='capitalize'>
          {row.original.eventType}
        </Badge>
      ),
    },
    {
      accessorKey: "severity",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Severity' />,
      cell: ({ row }) => (
        <Badge variant='red' className='capitalize'>
          {row.original.severity}
        </Badge>
      ),
    },
    {
      accessorKey: "details",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Details' />,
      cell: ({ row }) => <div>{row.original.details}</div>,
    },
  ]
}
