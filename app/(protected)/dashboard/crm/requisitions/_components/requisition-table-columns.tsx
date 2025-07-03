import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/badge"

export function getColumns(): ColumnDef<any>[] {
  return [
    {
      accessorKey: "date",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
    },
    {
      accessorKey: "customer",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Customer' />,
    },
    {
      accessorKey: "customerPoHitRate",
      id: "customer po hit rate",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Customer PO Hit Rate' />,
      cell: ({ row }) => {
        const customerPoHitRate = row.original.customerPoHitRate
        return <Badge variant='soft-slate'>{customerPoHitRate}</Badge>
      },
    },
    {
      accessorKey: "salesperson",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Salesperson' />,
    },
    {
      accessorKey: "brokerBuy",
      id: "broker buy",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Broker Buy' />,
      cell: ({ row }) => {
        const brokerBuy = row.original.brokerBuy
        if (!brokerBuy) return null
        return <Badge variant='soft-slate'>{brokerBuy}</Badge>
      },
    },
    {
      accessorKey: "urgency",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Urgency' />,
      cell: ({ row }) => {
        const urgency = row.original.urgency
        return <Badge variant='soft-amber'>{urgency}</Badge>
      },
    },
    {
      accessorKey: "purchasingStatus",
      id: "purchasing status",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Purchasing Status' />,
      cell: ({ row }) => {
        const purchasingStatus = row.original.purchasingStatus
        return <Badge variant='soft-blue'>{purchasingStatus}</Badge>
      },
    },
    {
      accessorKey: "result",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Result' />,
      cell: ({ row }) => {
        const result = row.original.result
        return <Badge variant='soft-green'>{result}</Badge>
      },
    },
    {
      accessorKey: "mpn",
      header: ({ column }) => <DataTableColumnHeader column={column} title='MPN' />,
      cell: ({ row }) => {
        const mpn = row.original.mpn
        return <Badge variant='soft-slate'>{mpn}</Badge>
      },
    },
    {
      accessorKey: "mfr",
      header: ({ column }) => <DataTableColumnHeader column={column} title='MFR' />,
      cell: ({ row }) => {
        const mfr = row.original.mfr
        return <Badge variant='soft-slate'>{mfr}</Badge>
      },
    },
    {
      accessorKey: "requestedQuantity",
      id: "requested quantity",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Requested Quantity' />,
      cell: ({ row }) => {
        const requestedQuantity = row.original.requestedQuantity
        return <Badge variant='soft-slate'>{requestedQuantity}</Badge>
      },
    },
    {
      accessorKey: "omegaBuyer",
      id: "omega buyer",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Omega Buyer' />,
    },
    {
      accessorKey: "action",
      id: "action",
      header: "Action",
      cell: ({ row }) => {
        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='size-8 p-0'>
                  <Icons.moreHorizontal className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => {}}>
                  <Icons.eye className='mr-2 size-4' /> View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>
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
