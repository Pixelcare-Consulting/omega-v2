import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { dateFilter, dateSort } from "@/lib/data-table/data-table"
import { format } from "date-fns"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { getCustomerExcessLineItemsByFileName } from "@/actions/customer-excess"
import { Icons } from "@/components/icons"
import { formatCurrency, formatNumber } from "@/lib/formatter"

type CustomerExcessData = Awaited<ReturnType<typeof getCustomerExcessLineItemsByFileName>>[number]

export function getColumns(): ColumnDef<CustomerExcessData>[] {
  return [
    {
      accessorKey: "listDate",
      id: "list date",
      header: ({ column }) => <DataTableColumnHeader column={column} title='List Date' />,
      cell: ({ row }) => {
        const date = row.original.listDate
        return <div className='min-w-[100px]'>{format(date, "MM-dd-yyyy")}</div>
      },
      filterFn: (row, columnId, filterValue, addMeta) => {
        const date = row.original.listDate
        const filterDateValue = new Date(filterValue)
        return dateFilter(date, filterDateValue)
      },
      sortingFn: (rowA, rowB, columnId) => {
        const rowADate = rowA.original.listDate
        const rowBDate = rowB.original.listDate
        return dateSort(rowADate, rowBDate)
      },
    },
    {
      accessorFn: (row) => {
        const customerName = row?.customer?.CardName
        if (!customerName) return ""
        return customerName
      },
      id: "customer name",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Customer Name' />,
      cell: ({ row }) => {
        const customerCode = row.original?.customer?.CardCode
        const customerName = row.original?.customer?.CardName

        if (!customerName || !customerCode) return null

        return (
          <Link className='text-blue-500 hover:underline' href={`/dashboard/master-data/customers/${customerCode}/view`}>
            {customerName}
          </Link>
        )
      },
    },

    {
      accessorKey: "cpn",
      header: ({ column }) => <DataTableColumnHeader column={column} title='CPN' />,
      cell: ({ row }) => <div>{row.original?.cpn || ""}</div>,
    },
    {
      accessorKey: "mpn",

      header: ({ column }) => <DataTableColumnHeader column={column} title='MPN' />,
      cell: ({ row }) => <div>{row.original?.mpn || ""}</div>,
    },
    {
      accessorKey: "mfr",
      header: ({ column }) => <DataTableColumnHeader column={column} title='MFR' />,
      cell: ({ row }) => <div>{row.original?.mfr || ""}</div>,
    },
    {
      accessorKey: "qtyOnHand",
      id: "qty on hand",
      header: ({ column }) => <DataTableColumnHeader column={column} title='QTY On Hand' />,
      cell: ({ row }) => {
        const qtyOnHand = parseFloat(String(row.original?.qtyOnHand))
        if (isNaN(qtyOnHand)) return ""
        return <div>{formatNumber({ amount: qtyOnHand })}</div>
      },
    },
    {
      accessorKey: "qtyOrdered",
      id: "qty ordered",
      header: ({ column }) => <DataTableColumnHeader column={column} title='QTY Ordered' />,
      cell: ({ row }) => {
        const qtyOrdered = parseFloat(String(row.original?.qtyOrdered))
        if (isNaN(qtyOrdered)) return ""
        return <div>{formatNumber({ amount: qtyOrdered })}</div>
      },
    },
    {
      accessorKey: "unitPrice",
      id: "unit price",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Unit Price' />,
      cell: ({ row }) => {
        const unitPrice = parseFloat(String(row.original?.unitPrice))
        if (isNaN(unitPrice)) return ""
        return <div>{formatCurrency({ amount: unitPrice, maxDecimal: 2 })}</div>
      },
    },
    {
      accessorKey: "dateCode",
      id: "date code",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date Code' />,
      cell: ({ row }) => <div>{row.original?.dateCode || ""}</div>,
    },
    {
      accessorKey: "notes",
      id: "notes",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Notes' />,
      cell: ({ row }) => <div className='min-w-[200px] whitespace-pre-line'>{row.original?.notes || ""}</div>,
    },
    {
      accessorFn: (row) => {
        const listOwner = row?.listOwner

        let value = ""

        if (!listOwner) return ""

        if (listOwner?.name) value = listOwner.name
        if (listOwner?.email) value = ` ${listOwner.email}`

        return value
      },
      accessorKey: "listOwner",
      id: "list owner",
      header: ({ column }) => <DataTableColumnHeader column={column} title='List Owner' />,
      size: 150,
      cell: ({ row }) => {
        const listOwner = row.original?.listOwner

        if (!listOwner) return null

        return (
          <div className='flex flex-col'>
            <span className='font-semibold'>{listOwner?.name || ""}</span>

            {listOwner?.email && (
              <div className='flex items-center'>
                <Icons.mail className='mr-1 size-4 text-muted-foreground/75' />
                <span className='text-muted-foreground/75 decoration-1 hover:underline'>{listOwner.email}</span>
              </div>
            )}
          </div>
        )
      },
    },
  ]
}
