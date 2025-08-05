import { getItems } from "@/actions/item-master"
import { Badge } from "@/components/badge"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Icons } from "@/components/icons"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"
import { formatCurrency, formatNumber } from "@/lib/formatter"
import { LineItemForm } from "@/schema/sale-quote"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { multiply } from "mathjs"

export function getColumns(): ColumnDef<LineItemForm>[] {
  return [
    {
      accessorFn: (row) => {
        const { mpn, mfr } = row

        let value = ""
        if (mpn) value += ` ${mpn}`
        if (mfr) value += ` ${mfr}`

        return value
      },
      id: "mpn",
      header: ({ column }) => <DataTableColumnHeader column={column} title='MPN' />,
      enableSorting: false,
      cell: ({ row }) => {
        const { mpn, mfr, source, reqRequestedItems } = row.original

        if (!mpn || source === "portal") return null

        return (
          <div className='flex min-w-[240px] flex-col justify-center gap-2'>
            <span className='text-wrap text-xs text-muted-foreground'>{mpn}</span>
            <div className='flex gap-1.5'>
              <span className='font-semibold'>MPR:</span>
              <span className='text-wrap text-xs text-muted-foreground'>{mfr}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorFn: (row) => {
        const { name, cpn, dateCode, estimatedDeliveryDate } = row

        let value = ""
        if (name) value += ` ${name}`
        if (cpn) value += ` ${cpn}`
        if (dateCode) value += ` ${dateCode}`
        if (estimatedDeliveryDate) value += ` ${format(estimatedDeliveryDate, "MM/dd/yyyy")}`

        return value
      },
      id: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
      enableSorting: false,
      cell: ({ row }) => {
        const { requisitionCode, name, cpn, dateCode, estimatedDeliveryDate, source } = row.original

        return (
          <div className='flex min-w-[240px] flex-col justify-center gap-2'>
            <div className='flex gap-1.5'>
              <span className='font-semibold'>Requisition:</span>
              <span className='text-xs text-muted-foreground'>{requisitionCode || ""}</span>
            </div>
            <div className='flex gap-1.5'>
              <span className='font-semibold'>CPN:</span>
              <span className='text-xs text-muted-foreground'>{cpn || ""}</span>
            </div>
            <div className='flex gap-1.5'>
              <span className='font-semibold'>Desc:</span>
              <span className='text-xs text-muted-foreground'>{name || ""}</span>
            </div>
            <div className='flex gap-1.5'>
              <span className='font-semibold'>DC:</span>
              <span className='text-xs text-muted-foreground'>{dateCode || ""}</span>
            </div>
            <div className='flex gap-1.5'>
              <span className='font-semibold'>Est. Del. Date:</span>
              <span className='text-xs text-muted-foreground'>
                {estimatedDeliveryDate ? format(estimatedDeliveryDate, "MM/dd/yyyy") : ""}
              </span>
            </div>

            <div className='flex gap-1.5'>
              <span className='font-semibold'>Source</span>
              <span className='text-xs text-muted-foreground'>
                {source === "sap" ? <Badge variant='soft-green'>SAP</Badge> : <Badge variant='soft-amber'>Portal</Badge>}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "unitPrice",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Unit Price' />,
      cell: ({ row }) => {
        const unitPrice = parseFloat(String(row.original.unitPrice))
        if (isNaN(unitPrice)) return ""
        return <div>{formatCurrency({ amount: unitPrice, maxDecimal: 2 })}</div>
      },
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Quantity' />,
      cell: ({ row }) => {
        const quantity = parseFloat(String(row.original.quantity))
        if (isNaN(quantity)) return ""
        return <div>{formatNumber({ amount: quantity as any, maxDecimal: 2 })}</div>
      },
    },
    {
      accessorFn: (row) => {
        const unitPrice = parseFloat(String(row.unitPrice))
        const quantity = parseFloat(String(row.quantity))

        if (isNaN(unitPrice) || isNaN(quantity)) return ""

        return multiply(unitPrice, quantity)
      },
      id: "total price",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Total Price' />,
      cell: ({ row }) => {
        const unitPrice = parseFloat(String(row.original.unitPrice))
        const quantity = parseFloat(String(row.original.quantity))

        if (isNaN(unitPrice) || isNaN(quantity)) return ""

        const totalPrice = multiply(unitPrice, quantity)

        return <div className='font-bold'>{formatCurrency({ amount: totalPrice, maxDecimal: 2 })}</div>
      },
    },
    {
      accessorKey: "actions",
      id: "actions",
      header: "Actions",
      cell: ({ row, table }) => {
        return (
          <div className='flex w-[100px] gap-2'>
            <ActionTooltipProvider label='Edit Line Item'>
              <Icons.pencil className='size-4 cursor-pointer transition-all hover:scale-125' />
            </ActionTooltipProvider>

            <ActionTooltipProvider label='Remove Line Item'>
              <Icons.trash className='size-4 cursor-pointer text-red-600 transition-all hover:scale-125' />
            </ActionTooltipProvider>
          </div>
        )
      },
    },
  ]
}
