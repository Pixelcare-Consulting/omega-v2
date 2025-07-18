import Link from "next/link"
import { useRouter } from "nextjs-toploader/app"
import { ColumnDef } from "@tanstack/react-table"

import { Badge, BadgeProps } from "@/components/badge"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getBpMasters } from "@/actions/bp-master"
import { SYNC_STATUSES_COLORS, SYNC_STATUSES_OPTIONS } from "@/constant/common"

type CustomerData = Awaited<ReturnType<typeof getBpMasters>>[number]

export default function getColumns(): ColumnDef<CustomerData>[] {
  return [
    {
      accessorFn: (row) => `${row.CardName} ${row.CardCode}`,
      id: "customer",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Customer' />,
      size: 150,
      cell: ({ row }) => (
        <div className='flex flex-col'>
          <span className='font-semibold'>{row.original.CardName}</span>
          <span className='decoration-1underline text-muted-foreground'>{row.original.CardCode}</span>
        </div>
      ),
    },
    {
      accessorKey: "GroupName",
      id: "group name",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Group' />,
      cell: ({ row }) => <Badge variant='soft-blue'>{row.original.GroupName || ""}</Badge>,
    },
    {
      accessorKey: "CntctPrsn",
      id: "contact person",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Contact Person' />,
      cell: ({ row }) => <div>{row.original.CntctPrsn || ""}</div>,
    },
    {
      accessorKey: "Phone1",
      id: "phone",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Phone' />,
      cell: ({ row }) => {
        if (!row.original.Phone1) return ""

        return (
          <Link href={`tel:${row.original.Phone1}`} className='text-slate-800 decoration-1 hover:underline'>
            {row.original.Phone1}
          </Link>
        )
      },
    },
    {
      accessorKey: "Currency",
      id: "currency",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Currency' />,
      cell: ({ row }) => <div>{row.original.Currency || ""}</div>,
    },
    {
      accessorKey: "syncStatus",
      id: "sync status",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Sync Status' />,
      cell: ({ row }) => {
        const syncStatus = row.original?.syncStatus
        const label = SYNC_STATUSES_OPTIONS.find((item) => item.value === syncStatus)?.label
        const color = SYNC_STATUSES_COLORS.find((item) => item.value === syncStatus)?.color

        if (!syncStatus || !label || !color) return null

        const variant = `soft-${color}` as BadgeProps["variant"]

        return <Badge variant={variant}>{label}</Badge>
      },
    },
    {
      accessorFn: (row) => row.source,
      accessorKey: "source",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Source' />,
      cell: ({ row }) => {
        const isSAP = row.original.source === "sap"
        return isSAP ? <Badge variant='soft-green'>SAP</Badge> : <Badge variant='soft-amber'>Portal</Badge>
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      size: 80,
      cell: function ActionCell({ row }) {
        const router = useRouter()

        const { CardCode } = row.original

        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='size-8 p-0'>
                  <Icons.moreHorizontal className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/master-data/customers/${CardCode}/view`)}>
                  <Icons.eye className='mr-2 size-4' /> View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/master-data/customers/${CardCode}`)}>
                  <Icons.pencil className='mr-2 size-4' /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem className='text-red-600' onClick={() => {}}>
                  <Icons.trash className='mr-2 size-4' /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )
      },
    },
  ]
}
