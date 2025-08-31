import Link from "next/link"
import { format } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"
import { Icons } from "@/components/icons"
import { useRouter } from "nextjs-toploader/app"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import AlertModal from "@/components/alert-modal"
import { deleteSaleQuote, getSaleQuotes } from "@/actions/sale-quote"
import { dateFilter, dateSort } from "@/lib/data-table/data-table"

type SalesQuoteData = Awaited<ReturnType<typeof getSaleQuotes>>[number]

export function getColumns(): ColumnDef<SalesQuoteData>[] {
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
      accessorFn: (row) => row?.customer?.CardName || "",
      id: "customer",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Customer' />,
      cell: ({ row }) => {
        const customer = row.original?.customer
        if (!customer) return null
        return (
          <Link className='text-blue-500 hover:underline' href={`/dashboard/master-data/customers/${customer.CardCode}/view`}>
            {customer.CardName}
          </Link>
        )
      },
    },
    {
      accessorFn: (row) => row.salesRep?.name || row.salesRep.email || "",
      id: "sales rep",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Sales Rep' />,
      cell: ({ row }) => {
        const salesRep = row.original?.salesRep
        return <div className='text-muted-foreground'>{salesRep?.name || salesRep?.email}</div>
      },
    },
    {
      accessorFn: (row) => row.approval?.name || row.approval.email || "",
      id: "approval",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Approval' />,
      cell: ({ row }) => {
        const approval = row.original?.approval
        return <div className='text-muted-foreground'>{approval?.name || approval?.email}</div>
      },
    },
    {
      accessorKey: "validUntil",
      id: "valid until",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Valid Until' />,
      cell: ({ row }) => {
        const validUntil = row.original.validUntil
        return <div className='min-w-[100px]'>{format(validUntil, "MM-dd-yyyy")}</div>
      },
      filterFn: (row, columnId, filterValue, addMeta) => {
        const validUntil = row.original.validUntil
        const filterDateValue = new Date(filterValue)
        return dateFilter(validUntil, filterDateValue)
      },
      sortingFn: (rowA, rowB, columnId) => {
        const rowAValidUntil = rowA.original.validUntil
        const rowBValidUntil = rowB.original.validUntil
        return dateSort(rowAValidUntil, rowBValidUntil)
      },
    },
    {
      accessorKey: "actions",
      header: "Action",
      cell: function ActionCell({ row }) {
        const router = useRouter()
        const { executeAsync } = useAction(deleteSaleQuote)
        const [showConfirmation, setShowConfirmation] = useState(false)

        const { id, code } = row.original

        async function handleDelete() {
          setShowConfirmation(false)

          toast.promise(executeAsync({ id }), {
            loading: "Deleting sale quote...",
            success: (response) => {
              const result = response?.data

              if (!response || !result) throw { message: "Failed to delete sale quote!", unExpectedError: true }

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
              <ActionTooltipProvider label='View Sale Quote'>
                <Icons.eye
                  className='size-4 cursor-pointer transition-all hover:scale-125'
                  onClick={() => router.push(`/dashboard/crm/sale-quotes/${code}/view`)}
                />
              </ActionTooltipProvider>

              <ActionTooltipProvider label='Edit Sale Quote'>
                <Icons.pencil
                  className='size-4 cursor-pointer transition-all hover:scale-125'
                  onClick={() => router.push(`/dashboard/crm/sale-quotes/${code}`)}
                />
              </ActionTooltipProvider>

              <ActionTooltipProvider label='Delete Sale Quote'>
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
              description={`Are you sure you want to delete this sale quote #${code}?`}
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
