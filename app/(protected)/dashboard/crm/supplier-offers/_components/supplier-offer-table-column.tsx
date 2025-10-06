import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "nextjs-toploader/app"
import AlertModal from "@/components/alert-modal"
import { dateFilter, dateSort } from "@/lib/data-table/data-table"
import { useAction } from "next-safe-action/hooks"
import { format } from "date-fns"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { deleteSupplierOffer, getSupplierOffers, LineItemsJSONData } from "@/actions/supplier-offer"
import { Icons } from "@/components/icons"

type SupplierOfferData = Awaited<ReturnType<typeof getSupplierOffers>>[number]

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
      accessorKey: "fileName",
      id: "fine name",
      header: ({ column }) => <DataTableColumnHeader column={column} title='File Name' />,
      cell: ({ row }) => {
        const { code, fileName } = row.original

        return (
          <Link className='text-blue-500 hover:underline' href={`/dashboard/crm/supplier-offers/${code}/file-name/${fileName}`}>
            {fileName}
          </Link>
        )
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
    {
      id: "# of Offer items",
      header: ({ column }) => <DataTableColumnHeader column={column} title='# of Offer items' />,
      cell: ({ row }) => {
        const lineItems = (row.original?.lineItems || []) as LineItemsJSONData
        return <div className='min-w-[100px]'>{lineItems.length}</div>
      },
    },
    {
      accessorKey: "actions",
      header: "Action",
      cell: function ActionCell({ row }) {
        const router = useRouter()
        const { executeAsync } = useAction(deleteSupplierOffer)
        const [showConfirmation, setShowConfirmation] = useState(false)

        const { id, code } = row.original

        async function handleDelete() {
          setShowConfirmation(false)

          toast.promise(executeAsync({ id }), {
            loading: "Deleting supplier offers...",
            success: (response) => {
              const result = response?.data

              if (!response || !result) throw { message: "Failed to delete supplier offers!", unExpectedError: true }

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
              <ActionTooltipProvider label='View Supplier Offer'>
                <Icons.eye
                  className='size-4 cursor-pointer transition-all hover:scale-125'
                  onClick={() => router.push(`/dashboard/crm/supplier-offers/${code}/view`)}
                />
              </ActionTooltipProvider>

              <ActionTooltipProvider label='Edit Supplier Offer'>
                <Icons.pencil
                  className='size-4 cursor-pointer transition-all hover:scale-125'
                  onClick={() => router.push(`/dashboard/crm/supplier-offers/${code}`)}
                />
              </ActionTooltipProvider>

              <ActionTooltipProvider label='Delete Supplier Offer'>
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
              description={`Are you sure you want to delete this supplier offer #${code}?`}
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
