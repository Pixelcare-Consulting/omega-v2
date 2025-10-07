import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { dateFilter, dateSort } from "@/lib/data-table/data-table"
import { format } from "date-fns"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { getSupplierOfferByCode, getSupplierOfferLineItemsByFileName, LineItemsJSONData, updateLineItems } from "@/actions/supplier-offer"
import { Icons } from "@/components/icons"
import { formatCurrency, formatNumber } from "@/lib/formatter"
import { useRouter } from "nextjs-toploader/app"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { useDialogStore } from "@/hooks/use-dialog"
import { toast } from "sonner"
import { LineItemForm } from "@/schema/supplier-offer"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"
import AlertModal from "@/components/alert-modal"

export function getColumns(supplierOfferId: string, lineItems: LineItemForm[]): ColumnDef<LineItemsJSONData[number]>[] {
  return [
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
      id: "qty",
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
      cell: ({ row }) => <div className='min-w-[100px] whitespace-pre-line'>{row.original?.notes || ""}</div>,
    },
    {
      accessorKey: "actions",
      id: "actions",
      header: "Actions",
      cell: function ActionCell({ row, table }) {
        const router = useRouter()
        const { executeAsync } = useAction(updateLineItems)
        const [showConfirmation, setShowConfirmation] = useState(false)

        const { setIsOpen, setData } = useDialogStore(["setIsOpen", "setData"])
        const isAllowedToDelete = !lineItems || lineItems.length > 1

        const index = row.index

        const handleEdit = (index: number) => {
          setData({ ...row.original, index })
          setTimeout(() => setIsOpen(true), 1000)
        }

        const handleRemoveItem = (supplierOfferId: string, index: number, lineItems: LineItemForm[]) => {
          setShowConfirmation(false)

          const filteredLineItems = lineItems.filter((_, i) => i !== index)

          toast.promise(executeAsync({ action: "delete", supplierOfferId, lineItems: filteredLineItems }), {
            loading: "Deleting line item...",
            success: (response) => {
              const result = response?.data

              if (!response || !result) throw { message: "Failed to delete line item!", unExpectedError: true }

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
          <div className='flex w-[100px] gap-2'>
            <ActionTooltipProvider label='Edit Line Item'>
              <Icons.pencil className='size-4 cursor-pointer transition-all hover:scale-125' onClick={() => handleEdit(index)} />
            </ActionTooltipProvider>

            {isAllowedToDelete && (
              <ActionTooltipProvider label='Remove Line Item'>
                <Icons.trash
                  className='size-4 cursor-pointer text-red-600 transition-all hover:scale-125'
                  onClick={() => setShowConfirmation(true)}
                />
              </ActionTooltipProvider>
            )}

            <AlertModal
              isOpen={showConfirmation}
              title='Are you sure?'
              description={`Are you sure you want to delete this line item?`}
              onConfirm={() => handleRemoveItem(supplierOfferId, index, lineItems)}
              onConfirmText='Delete'
              onCancel={() => setShowConfirmation(false)}
            />
          </div>
        )
      },
    },
  ]
}
