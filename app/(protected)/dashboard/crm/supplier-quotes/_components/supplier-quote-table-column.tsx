import Link from "next/link"
import { format } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"

import { deleteSupplierQuote, getSupplierQuotes } from "@/actions/supplier-quote"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"
import { Badge } from "@/components/badge"
import { REQUISITION_PURCHASING_STATUS_OPTIONS, REQUISITION_RESULT_OPTIONS } from "@/schema/requisition"
import { getItems } from "@/actions/master-item"
import { formatCurrency, formatNumber } from "@/lib/formatter"
import {
  SUPPLIER_QUOTE_LT_TO_SJC_NUMBER_OPTIONS,
  SUPPLIER_QUOTE_LT_TO_SJC_UOM_OPTIONS,
  SUPPLIER_QUOTE_STATUS_OPTIONS,
} from "@/schema/supplier-quote"
import { multiply } from "mathjs"
import { Icons } from "@/components/icons"
import { useRouter } from "nextjs-toploader/app"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import AlertModal from "@/components/alert-modal"
import { RequestedItemsJSONData } from "@/actions/requisition"
import { dateFilter, dateSort } from "@/lib/data-table/data-table"
import { BP_MASTER_SUPPLIER_SCOPE_OPTIONS, BP_MASTER_SUPPLIER_STATUS_OPTIONS } from "@/schema/master-bp"

type SupplierQuoteData = Awaited<ReturnType<typeof getSupplierQuotes>>[number]

export function getColumns(items: Awaited<ReturnType<typeof getItems>>): ColumnDef<SupplierQuoteData>[] {
  return [
    {
      accessorKey: "code",
      id: "id #",
      header: ({ column }) => <DataTableColumnHeader column={column} title='ID #' />,
    },
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
      accessorFn: (row) => row?.requisition.salesPersons?.map((person) => person?.user?.name || person?.user?.email).join(", ") || "",
      id: "requisition salesperson",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Requisition - Salesperson' />,
      cell: ({ row }) => {
        const salespersons = row.original?.requisition?.salesPersons || []

        if (!salespersons || salespersons.length < 1) return null

        return (
          <div className='min-w-[150px]'>
            <span className='mr-2 w-fit text-xs text-muted-foreground'>
              {/* //* Show the first 2 salespersons */}
              {salespersons
                .slice(0, 2)
                .map((buyers) => buyers?.user.name || buyers?.user.email)
                .join(", ")}

              {salespersons.length > 2 && (
                <ActionTooltipProvider
                  label={salespersons
                    .slice(2)
                    .map((buyers) => buyers?.user.name || buyers?.user.email)
                    .join(", ")}
                >
                  <div className='inline'>
                    <Badge className='ml-1' variant='slate'>
                      + {salespersons.slice(2).length}
                    </Badge>
                  </div>
                </ActionTooltipProvider>
              )}
            </span>
          </div>
        )
      },
    },
    {
      accessorFn: (row) => row?.requisition?.purchasingStatus || "",
      id: "requisition status",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Requisition - Status' />,
      cell: ({ row }) => {
        const status = row.original?.requisition?.purchasingStatus
        const option = REQUISITION_PURCHASING_STATUS_OPTIONS.find((item) => item.value === status)
        if (!option) return null
        return <Badge variant='soft-amber'>{option.label}</Badge>
      },
    },
    {
      accessorFn: (row) => row.requisition.result || "",
      id: "requisition result",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Requisition - Result' />,
      cell: ({ row }) => {
        const result = row.original.requisition.result
        const option = REQUISITION_RESULT_OPTIONS.find((item) => item.value === result)
        if (!option) return null
        return <Badge variant={result === "won" ? "soft-green" : "soft-red"}>{option.label}</Badge>
      },
    },
    {
      accessorFn: (row) => {
        const requestedItems = row?.requisition?.requestedItems as RequestedItemsJSONData
        if (!requestedItems || requestedItems.length < 1) return null

        const primaryRequestedItem = requestedItems[0]
        const item = items.find((item) => item.ItemCode === primaryRequestedItem?.code)

        return item?.ItemCode || ""
      },
      id: "requisition mpn",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Requisition - MPN' />,
      cell: ({ row }) => {
        const requestedItems = row.original?.requisition?.requestedItems as RequestedItemsJSONData
        if (!requestedItems || requestedItems.length < 1) return null

        const primaryRequestedItem = requestedItems[0]
        const item = items.find((item) => item.ItemCode === primaryRequestedItem?.code)

        if (!item) return null

        return <Badge variant='soft-slate'>{item?.ItemCode}</Badge>
      },
    },
    {
      accessorFn: (row) => row.requisition.quantity ?? "",
      id: "requisition quantity",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Requisition - Quantity' />,
      cell: ({ row }) => {
        const quantity = row.original?.requisition?.quantity
        if (!quantity) return null
        return <div>{formatNumber({ amount: quantity as any, maxDecimal: 2 })}</div>
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
      accessorFn: (row) => row.supplier?.status,
      id: "supplier status",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Supplier - Status' />,
      cell: ({ row }) => {
        const supplier = row.original.supplier
        const status = BP_MASTER_SUPPLIER_STATUS_OPTIONS.find((item) => item.value === supplier?.status)?.label

        if (!supplier || !status) return null

        return <Badge variant='soft-slate'>{status}</Badge>
      },
    },
    {
      accessorFn: (row) => row?.supplier?.scope || "",
      id: "supplier scope",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Supplier - Scope' />,
      cell: ({ row }) => {
        const supplier = row.original.supplier
        const scope = BP_MASTER_SUPPLIER_SCOPE_OPTIONS.find((item) => item.value === supplier?.scope)?.label

        if (!supplier || !scope) return null

        return <Badge variant='soft-slate'>{scope}</Badge>
      },
    },
    {
      accessorFn: (row) => row?.buyers?.map((person) => person?.user?.name || person?.user?.email).join(", ") || "",
      id: "buyers",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Buyer' />,
      cell: ({ row }) => {
        const buyers = row.original?.buyers || []

        if (!buyers || buyers.length < 1) return null

        return (
          <div className='min-w-[150px]'>
            <span className='mr-2 w-fit text-xs text-muted-foreground'>
              {/* //* Show the first 2 buyers */}
              {buyers
                .slice(0, 2)
                .map((buyers) => buyers?.user.name || buyers?.user.email)
                .join(", ")}

              {buyers.length > 2 && (
                <ActionTooltipProvider
                  label={buyers
                    .slice(2)
                    .map((buyers) => buyers?.user.name || buyers?.user.email)
                    .join(", ")}
                >
                  <div className='inline'>
                    <Badge className='ml-1' variant='slate'>
                      + {buyers.slice(2).length}
                    </Badge>
                  </div>
                </ActionTooltipProvider>
              )}
            </span>
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
        return <Badge variant='soft-blue'>{label}</Badge>
      },
    },
    {
      accessorFn: (row) => {
        const itemCode = row.itemCode
        const item = items.find((item) => item.ItemCode === itemCode)
        return item?.ItemCode || ""
      },
      id: "mpn",
      header: ({ column }) => <DataTableColumnHeader column={column} title='MPN' />,
      cell: ({ row }) => {
        const itemCode = row.original.itemCode
        const item = items.find((item) => item.ItemCode === itemCode)
        if (!item) return null
        return <Badge variant='soft-slate'>{item.ItemCode}</Badge>
      },
    },
    {
      accessorFn: (row) => {
        const itemCode = row.itemCode
        const item = items.find((item) => item.ItemCode === itemCode)
        return item?.FirmName || ""
      },
      id: "mfr",
      header: ({ column }) => <DataTableColumnHeader column={column} title='MFR' />,
      cell: ({ row }) => {
        const itemCode = row.original.itemCode
        const item = items.find((item) => item.ItemCode === itemCode)
        if (!item) return null
        return <Badge variant='soft-slate'>{item.FirmName}</Badge>
      },
    },
    {
      accessorFn: (row) => row.dateCode ?? "",
      id: "date code",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date Code' />,
    },
    {
      accessorFn: (row) => {
        const { ltToSjcNumber, ltToSjcUom } = row

        const num = SUPPLIER_QUOTE_LT_TO_SJC_NUMBER_OPTIONS.find((item) => item.value === ltToSjcNumber)?.label
        const uom = SUPPLIER_QUOTE_LT_TO_SJC_UOM_OPTIONS.find((item) => item.value === ltToSjcUom)?.label

        if (!num || !uom) return ""

        return `${num} ${uom}`
      },
      id: "lead time",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Lead Time' />,
      cell: ({ row }) => {
        const { ltToSjcNumber, ltToSjcUom } = row.original

        const num = SUPPLIER_QUOTE_LT_TO_SJC_NUMBER_OPTIONS.find((item) => item.value === ltToSjcNumber)?.label
        const uom = SUPPLIER_QUOTE_LT_TO_SJC_UOM_OPTIONS.find((item) => item.value === ltToSjcUom)?.label

        if (!num || !uom) return null

        return `${num} ${uom}`
      },
    },
    {
      accessorKey: "condition",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Condition' />,
    },
    {
      accessorKey: "coo",
      header: ({ column }) => <DataTableColumnHeader column={column} title='COO' />,
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
      header: ({ column }) => <DataTableColumnHeader column={column} title='Comments' />,
    },
    {
      accessorFn: (row) => {
        const x = parseFloat(String(row.quotedQuantity))
        const y = parseFloat(String(row.quotedPrice))

        if (isNaN(x) || isNaN(y)) return ""

        const result = multiply(x, y)

        return formatCurrency({ amount: result, minDecimal: 2 })
      },
      id: "total cost",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Total Cost' />,
      cell: ({ row }) => {
        const x = parseFloat(String(row.original?.quotedQuantity))
        const y = parseFloat(String(row.original?.quotedPrice))

        if (isNaN(x) || isNaN(y)) return ""

        const result = multiply(x, y)

        return formatCurrency({ amount: result, minDecimal: 2 })
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      size: 80,
      cell: function ActionCell({ row }) {
        const router = useRouter()
        const { executeAsync } = useAction(deleteSupplierQuote)
        const [showConfirmation, setShowConfirmation] = useState(false)

        const { id, code } = row.original

        async function handleDelete() {
          setShowConfirmation(false)

          toast.promise(executeAsync({ id }), {
            loading: "Deleting supplier quote...",
            success: (response) => {
              const result = response?.data

              if (!response || !result) throw { message: "Failed to delete supplier quote!", unExpectedError: true }

              if (!result.error) {
                setTimeout(() => {
                  router.refresh()
                }, 1500)

                return result.message
              }

              throw { message: result.message, expectedError: true }
            },
            error: (err: Error & { expectedError: boolean }) => {
              return err?.expectedError ? err.message : "Something went wrong! Please try again later."
            },
          })
        }

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

              <ActionTooltipProvider label='Delete Supplier Quote'>
                <Icons.trash
                  className='size-4 cursor-pointer text-red-500 transition-all hover:scale-125'
                  onClick={() => setShowConfirmation(true)}
                />
              </ActionTooltipProvider>

              <ActionTooltipProvider label='More Options'>
                <Icons.moreHorizontal className='size-4 cursor-pointer transition-all hover:scale-125' />
              </ActionTooltipProvider>
            </div>

            <AlertModal
              isOpen={showConfirmation}
              title='Are you sure?'
              description={`Are you sure you want to delete this supplier quote #${code}?`}
              onConfirm={handleDelete}
              onConfirmText='Delete'
              onCancel={() => setShowConfirmation(false)}
            />
          </>
        )
      },
    },
  ]
}
