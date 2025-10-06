import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { dateFilter, dateSort } from "@/lib/data-table/data-table"
import { format } from "date-fns"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { getSupplierOfferLineItemsByFileName } from "@/actions/supplier-offer"
import { Icons } from "@/components/icons"
import { formatCurrency, formatNumber } from "@/lib/formatter"

type SupplierOfferData = Awaited<ReturnType<typeof getSupplierOfferLineItemsByFileName>>[number]

export function getColumns(): ColumnDef<SupplierOfferData>[] {
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
        const supplierName = row?.supplier?.CardName
        if (!supplierName) return ""
        return supplierName
      },
      id: "supplier name",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Supplier Name' />,
      cell: ({ row }) => {
        const supplierCode = row.original?.supplier?.CardCode
        const supplierName = row.original?.supplier?.CardName

        if (!supplierName || !supplierCode) return null

        return (
          <Link className='text-blue-500 hover:underline' href={`/dashboard/master-data/suppliers/${supplierCode}/view`}>
            {supplierName}
          </Link>
        )
      },
    },
    {
      accessorKey: "mpn",

      header: ({ column }) => <DataTableColumnHeader column={column} title='MPN' />,
      cell: ({ row }) => <div className='min-w-[150px]'>{row.original?.mpn || ""}</div>,
    },
    {
      accessorKey: "mfr",
      header: ({ column }) => <DataTableColumnHeader column={column} title='MFR' />,
      cell: ({ row }) => <div className='min-w-[150px]'>{row.original?.mfr || ""}</div>,
    },
    {
      accessorKey: "qty",
      id: "Qty",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Qty' />,
      cell: ({ row }) => {
        const qty = parseFloat(String(row.original?.qty))
        if (isNaN(qty)) return ""
        return <div>{formatNumber({ amount: qty })}</div>
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
