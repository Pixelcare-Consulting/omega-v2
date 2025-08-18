import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { multiply } from "mathjs"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { getItems } from "@/actions/master-item"
import { updateLineItems } from "@/actions/sale-quote"
import { Badge } from "@/components/badge"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Icons } from "@/components/icons"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"
import { useDialogStore } from "@/hooks/use-dialog"
import { formatCurrency, formatNumber } from "@/lib/formatter"
import { LineItemForm } from "@/schema/sale-quote"
import { SUPPLIER_QUOTE_LT_TO_SJC_NUMBER_OPTIONS, SUPPLIER_QUOTE_LT_TO_SJC_UOM_OPTIONS } from "@/schema/supplier-quote"
import { toast } from "sonner"
import AlertModal from "@/components/alert-modal"

export function getColumns(saleQuoteId: string, lineItems: LineItemForm[]): ColumnDef<LineItemForm>[] {
  return [
    {
      accessorFn: (row) => {
        const { requisitionCode, supplierQuoteCode, name, mpn, mfr, cpn, source, condition, coo, dateCode, estimatedDeliveryDate } = row

        const ltToSjcNumber = SUPPLIER_QUOTE_LT_TO_SJC_NUMBER_OPTIONS.find((item) => item.value === row.ltToSjcNumber)?.label
        const ltToSjcUom = SUPPLIER_QUOTE_LT_TO_SJC_UOM_OPTIONS.find((item) => item.value === row.ltToSjcUom)?.label

        let value = ""
        if (requisitionCode) value += ` ${requisitionCode}`
        if (supplierQuoteCode) value += ` ${supplierQuoteCode}`
        if (name) value += ` ${name}`
        if (cpn) value += ` ${cpn}`
        if (mpn) value += ` ${mpn}`
        if (mfr) value += ` ${mfr}`
        if (source) value += ` ${source}`
        if (ltToSjcNumber) value += ` ${ltToSjcNumber}`
        if (ltToSjcUom) value += ` ${ltToSjcUom}`
        if (condition) value += ` ${condition}`
        if (coo) value += ` ${coo}`
        if (dateCode) value += ` ${dateCode}`
        if (estimatedDeliveryDate) value += ` ${format(estimatedDeliveryDate, "MM/dd/yyyy")}`

        return value
      },
      id: "reference",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Reference' />,
      enableSorting: false,
      cell: ({ row }) => {
        const { requisitionCode, supplierQuoteCode, mpn, mfr, name, cpn, source, condition, coo, dateCode, estimatedDeliveryDate } =
          row.original

        const ltToSjcNumber = SUPPLIER_QUOTE_LT_TO_SJC_NUMBER_OPTIONS.find((item) => item.value === row.original?.ltToSjcNumber)?.label
        const ltToSjcUom = SUPPLIER_QUOTE_LT_TO_SJC_UOM_OPTIONS.find((item) => item.value === row.original?.ltToSjcUom)?.label

        return (
          <div className='flex min-w-[200px] flex-col justify-center gap-2'>
            <div className='flex gap-1.5'>
              <span className='text-wrap font-semibold'>{mpn}</span>
            </div>

            <div className='flex gap-1.5'>
              <span className='font-semibold'>MPR:</span>
              <span className='text-wrap text-muted-foreground'>{mfr}</span>
            </div>

            <div className='flex gap-1.5'>
              <span className='font-semibold'>Requisition:</span>
              <span className='text-muted-foreground'>{requisitionCode || ""}</span>
            </div>

            <div className='flex gap-1.5'>
              <span className='font-semibold'>Supplier Quote:</span>
              <span className='text-muted-foreground'>{supplierQuoteCode || ""}</span>
            </div>

            <div className='flex gap-1.5'>
              <span className='font-semibold'>CPN:</span>
              <span className='text-muted-foreground'>{cpn || ""}</span>
            </div>

            <div className='flex gap-1.5'>
              <span className='font-semibold'>Desc:</span>
              <span className='text-muted-foreground'>{name || ""}</span>
            </div>

            <div className='flex gap-1.5'>
              <span className='font-semibold'>LT to SJC:</span>
              <span className='text-muted-foreground'>{`${ltToSjcNumber || ""} ${ltToSjcUom || ""}`}</span>
            </div>

            <div className='flex gap-1.5'>
              <span className='font-semibold'>Condition:</span>
              <span className='text-muted-foreground'>{condition || ""}</span>
            </div>

            <div className='flex gap-1.5'>
              <span className='font-semibold'>Coo:</span>
              <span className='text-muted-foreground'>{coo || ""}</span>
            </div>

            <div className='flex gap-1.5'>
              <span className='font-semibold'>DC:</span>
              <span className='text-muted-foreground'>{dateCode || ""}</span>
            </div>

            <div className='flex gap-1.5'>
              <span className='font-semibold'>Est. Del. Date:</span>
              <span className='text-muted-foreground'>{estimatedDeliveryDate ? format(estimatedDeliveryDate, "MM/dd/yyyy") : ""}</span>
            </div>

            <div className='flex gap-1.5'>
              <span className='font-semibold'>Source</span>
              <span className='text-muted-foreground'>
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
      accessorKey: "leadTime",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Lead Time' />,
      cell: ({ row }) => {
        const leadTime = row.original.leadTime
        if (!leadTime) return null
        return <div className='whitespace-pre-line text-muted-foreground'>{leadTime}</div>
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
      cell: function ActionCell({ row }) {
        const router = useRouter()
        const { executeAsync } = useAction(updateLineItems)
        const [showConfirmation, setShowConfirmation] = useState(false)

        const { setIsOpen, setData } = useDialogStore(["setIsOpen", "setData"])
        const isAllowedToDelete = !lineItems || lineItems.length > 1

        const { code } = row.original

        const handleEdit = () => {
          setData(row.original)
          setTimeout(() => setIsOpen(true), 1000)
        }

        const handleRemoveItem = (saleQuoteId: string, itemCode: string, lineItems: LineItemForm[]) => {
          setShowConfirmation(false)

          const filteredLineItems = lineItems.filter((item) => item.code !== itemCode)

          toast.promise(executeAsync({ action: "delete", saleQuoteId, lineItems: filteredLineItems }), {
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
              <Icons.pencil className='size-4 cursor-pointer transition-all hover:scale-125' onClick={handleEdit} />
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
              description={`Are you sure you want to delete this line item #${code}?`}
              onConfirm={() => handleRemoveItem(saleQuoteId, code, lineItems)}
              onConfirmText='Delete'
              onCancel={() => setShowConfirmation(false)}
            />
          </div>
        )
      },
    },
  ]
}
