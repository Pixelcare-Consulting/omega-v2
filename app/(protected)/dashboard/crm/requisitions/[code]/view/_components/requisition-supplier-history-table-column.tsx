import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { dateFilter, dateSort } from "@/lib/data-table/data-table"
import { format } from "date-fns"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { getCustomerExcessLineItemsByPartialMpn } from "@/actions/customer-excess"
import { Icons } from "@/components/icons"
import { formatCurrency, formatNumber } from "@/lib/formatter"
import { getSupplierQuotesByPartialMpn } from "@/actions/supplier-quote"
import { Badge } from "@/components/badge"
import { SUPPLIER_QUOTE_RESULT_OPTIONS, SUPPLIER_QUOTE_ROHS_OPTIONS, SUPPLIER_QUOTE_STATUS_OPTIONS } from "@/schema/supplier-quote"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"
import { useRouter } from "next/navigation"

type SupplierQuotesData = Awaited<ReturnType<typeof getSupplierQuotesByPartialMpn>>[number]

export function getColumns(): ColumnDef<SupplierQuotesData>[] {
  return [
    {
      accessorKey: "date",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
      cell: ({ row }) => {
        const date = row.original.date
        return <div className='min-w-[100px]'>{format(date, "MM-dd-yyyy")}</div>
      },
      filterFn: (row, columnId, filterValue, addMeta) => {
        const date = row.original.date
        const filterDateValue = new Date(filterValue)
        return dateFilter(date, filterDateValue)
      },
      sortingFn: (rowA, rowB, columnId) => {
        const rowADate = rowA.original.date
        const rowBDate = rowB.original.date
        return dateSort(rowADate, rowBDate)
      },
    },
    {
      accessorKey: "requisitionCode",
      id: "requisition",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Requisition' />,
      cell: ({ row }) => {
        const requisitionCode = row.original.requisitionCode
        return (
          <Link className='text-blue-500 hover:underline' href={`/dashboard/crm/requisitions/${requisitionCode}/view`}>
            {requisitionCode}
          </Link>
        )
      },
    },
    {
      accessorFn: (row) => `${row?.supplier?.CardName || ""} ${row?.supplier?.CardCode || ""}`,
      id: "supplier",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Supplier' />,
      cell: ({ row }) => {
        const supplier = row.original.supplier

        if (!supplier) return null

        return (
          <div className='flex flex-col gap-2'>
            <Link className='text-blue-500 hover:underline' href={`/dashboard/master-data/suppliers/${supplier.CardCode}/view`}>
              {supplier.CardName}
            </Link>

            <Link className='text-blue-500 hover:underline' href={`/dashboard/master-data/suppliers/${supplier.CardCode}/view`}>
              {supplier.CardCode}
            </Link>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
      cell: ({ row }) => {
        const status = row.original?.status
        const label = SUPPLIER_QUOTE_STATUS_OPTIONS.find((item) => item.value === status)?.label
        if (!status || !label) return null
        return <div>{label}</div>
      },
    },
    {
      accessorKey: "result",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Result' />,
      cell: ({ row }) => {
        const result = row.original?.result
        const label = SUPPLIER_QUOTE_RESULT_OPTIONS.find((item) => item.value === result)?.label
        if (!result || !label) return null
        return <div>{label}</div>
      },
    },
    {
      accessorFn: (row) => row?.item?.ItemCode || "",
      id: "mpn",
      header: ({ column }) => <DataTableColumnHeader column={column} title='MPN' />,
      cell: ({ row }) => {
        const itemCode = row.original?.item?.ItemCode || ""
        return <div>{itemCode}</div>
      },
    },
    {
      accessorFn: (row) => row?.item?.FirmName || "",
      id: "mfr",
      header: ({ column }) => <DataTableColumnHeader column={column} title='MFR' />,
      cell: ({ row }) => {
        const firmName = row.original?.item?.FirmName || ""
        return <div>{firmName}</div>
      },
    },
    {
      accessorKey: "dateCode",
      id: "date code",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date Code' />,
    },
    {
      accessorKey: "condition",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Condition' />,
    },
    {
      accessorKey: "ltToSjc",
      id: "lead time to sjc",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Lead Time To SJC' />,
    },
    {
      accessorKey: "roHs",
      id: "rohs",
      header: ({ column }) => <DataTableColumnHeader column={column} title='RoHs' />,
      cell: ({ row }) => {
        const result = row.original?.roHs
        const label = SUPPLIER_QUOTE_ROHS_OPTIONS.find((item) => item.value === result)?.label
        if (!result || !label) return null
        return <div>{label}</div>
      },
    },
    {
      accessorFn: (row) => row.quotedQuantity ?? "",
      id: "quantity quoted",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Quantity Quoted' />,
      cell: ({ row }) => {
        const quantity = parseFloat(row.original?.quotedQuantity || "")
        if (!quantity || isNaN(quantity)) return null
        return <div>{formatNumber({ amount: quantity, maxDecimal: 2 })}</div>
      },
    },
    {
      accessorFn: (row) => row.quotedPrice ?? "",
      id: "quoted price",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Quoted Price' />,
      cell: ({ row }) => {
        const price = parseFloat(row.original?.quotedPrice || "")
        if (!price || isNaN(price)) return null
        return <div>{formatCurrency({ amount: price, minDecimal: 5, maxDecimal: 5 })}</div>
      },
    },
    {
      accessorKey: "comments",
      id: "Comments",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Comments' />,
    },
    {
      id: "tp profit margin",
      header: ({ column }) => <DataTableColumnHeader column={column} title='TP Profit Margin' />,
      cell: () => null,
    },
    {
      accessorKey: "actions",
      header: "Actions",
      size: 80,
      cell: function ActionCell({ row }) {
        const router = useRouter()

        const { code } = row.original

        return (
          <>
            <div className='flex gap-2'>
              <ActionTooltipProvider label='View Supplier Quote'>
                <Icons.eye
                  className='size-4 cursor-pointer transition-all hover:scale-125'
                  onClick={() => router.push(`/dashboard/crm/supplier-quotes/${code}/view`)}
                />
              </ActionTooltipProvider>

              <ActionTooltipProvider label='Edit Supplier Quote'>
                <Icons.pencil
                  className='size-4 cursor-pointer transition-all hover:scale-125'
                  onClick={() => router.push(`/dashboard/crm/supplier-quotes/${code}`)}
                />
              </ActionTooltipProvider>
            </div>
          </>
        )
      },
    },
  ]
}
