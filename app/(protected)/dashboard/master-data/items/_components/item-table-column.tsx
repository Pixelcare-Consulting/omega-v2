import Link from "next/link"
import { useRouter } from "nextjs-toploader/app"
import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/badge"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function getColumns(): ColumnDef<any>[] {
  return [
    {
      accessorFn: (row) => `${row.ItemName} ${row.ItemCode}`,
      id: "item",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Item' />,
      size: 150,
      cell: ({ row }) => (
        <div className='flex flex-col'>
          <span className='font-semibold'>{row.original.ItemName}</span>
          <span className='decoration-1underline text-muted-foreground'>{row.original.ItemCode}</span>
        </div>
      ),
    },
    {
      accessorKey: "ItmsGrpNam",
      id: "group",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Group' />,
      cell: ({ row }) => <Badge variant='soft-blue'>{row.original.ItmsGrpNam || "-"}</Badge>,
    },
    {
      accessorKey: "FirmCode",
      id: "mpn",
      header: ({ column }) => <DataTableColumnHeader column={column} title='MPN' />,
      cell: ({ row }) => <div>{row.original.FirmCode || "-"}</div>,
    },
    {
      accessorKey: "FirmName",
      id: "manufacturer",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Manufacturer' />,
      cell: ({ row }) => <div>{row.original.FirmName || "-"}</div>,
    },
    {
      accessorKey: "BuyUnitMsr",
      id: "uom",
      header: ({ column }) => <DataTableColumnHeader column={column} title='UOM' />,
      cell: ({ row }) => <div>{row.original.BuyUnitMsr || "-"}</div>,
    },
    {
      accessorFn: (row) => "sap",
      accessorKey: "source",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Source' />,
      cell: ({ row }) => {
        const isSAP = true
        return isSAP ? <Badge variant='soft-green'>SAP</Badge> : <Badge variant='soft-amber'>Portal</Badge>
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      size: 80,
      cell: function ActionCell({ row }) {
        const router = useRouter()

        const { ItemCode } = row.original

        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='size-8 p-0'>
                  <Icons.moreHorizontal className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/master-data/items/${ItemCode}/view`)}>
                  <Icons.eye className='mr-2 size-4' /> View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/master-data/items/${ItemCode}`)}>
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
