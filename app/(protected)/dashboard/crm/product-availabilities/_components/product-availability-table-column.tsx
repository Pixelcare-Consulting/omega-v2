import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "nextjs-toploader/app"
import AlertModal from "@/components/alert-modal"
import { useAction } from "next-safe-action/hooks"
import { format } from "date-fns"

import ActionTooltipProvider from "@/components/provider/tooltip-provider"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { deleteProductAvailability, getProductAvailabilities } from "@/actions/product-availability"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/badge"
import { BP_MASTER_SUPPLIER_SCOPE_OPTIONS, BP_MASTER_SUPPLIER_STATUS_OPTIONS } from "@/schema/master-bp"
import { dateFilter, dateSort } from "@/lib/data-table/data-table"
import { formatNumber } from "@/lib/formatter"

type ProductAvailabilityData = Awaited<ReturnType<typeof getProductAvailabilities>>[number]

export function getColumns(): ColumnDef<ProductAvailabilityData>[] {
  return [
    {
      accessorFn: (row) => {
        const supplierName = row?.supplier?.CardName
        if (!supplierName) return ""
        return supplierName
      },
      id: "supplier name",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Supplier - Company Name' />,
      cell: ({ row }) => {
        const supplierCode = row.original.supplier?.CardCode
        const supplierName = row.original.supplier?.CardName

        if (!supplierName || !supplierCode) return null

        return (
          <Link className='text-blue-500 hover:underline' href={`/dashboard/master-data/suppliers/${supplierCode}/view`}>
            {supplierName}
          </Link>
        )
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
      accessorKey: "manufacturer",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Manufacturer' />,
      cell: ({ row }) => {
        const manufacturer = row.original.manufacturer
        if (!manufacturer) return null
        return <Badge variant='soft-amber'>{manufacturer}</Badge>
      },
    },
    {
      accessorKey: "itemGroup",
      id: "commodity",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Commodity' />,
      cell: ({ row }) => {
        const commodity = row.original.itemGroup
        if (!commodity) return null
        return <Badge variant='soft-blue'>{commodity}</Badge>
      },
    },
    {
      accessorFn: (row) => (row?.isFranchiseDisti ? "yes" : "no"),
      accessorKey: "isFranchiseDisti",
      id: "franchise disti",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Franchise Disti' />,
      cell: ({ row }) => {
        const isFranchiseDisti = row.original.isFranchiseDisti
        return isFranchiseDisti ? <Icons.check className='size-4 text-green-500' /> : <Icons.x className='size-4 text-red-500' />
      },
    },
    {
      accessorFn: (row) => (row?.isAuthorizedDisti ? "yes" : "no"),
      accessorKey: "isAuthorizedDisti",
      id: "authorized disti",
      header: ({ column }) => <DataTableColumnHeader column={column} title='authorized disti' />,
      cell: ({ row }) => {
        const isAuthorizedDisti = row.original.isAuthorizedDisti
        return isAuthorizedDisti ? <Icons.check className='size-4 text-green-500' /> : <Icons.x className='size-4 text-red-500' />
      },
    },
    {
      accessorFn: (row) => (row?.isMfrDirect ? "yes" : "no"),
      accessorKey: "isMfrDirect",
      id: "mfr direct",
      header: ({ column }) => <DataTableColumnHeader column={column} title='MFR Direct' />,
      cell: ({ row }) => {
        const isMfrDirect = row.original.isMfrDirect
        return isMfrDirect ? <Icons.check className='size-4 text-green-500' /> : <Icons.x className='size-4 text-red-500' />
      },
    },
    {
      accessorFn: (row) => (row?.isStrongBrand ? "yes" : "no"),
      accessorKey: "isStrongBrand",
      id: "strong brand",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Strong Brand' />,
      cell: ({ row }) => {
        const isStrongBrand = row.original.isStrongBrand
        return isStrongBrand ? <Icons.check className='size-4 text-green-500' /> : <Icons.x className='size-4 text-red-500' />
      },
    },
    {
      accessorFn: (row) => (row?.isSpecialPricing ? "yes" : "no"),
      accessorKey: "isSpecialPricing",
      id: "special pricing",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Special Pricing' />,
      cell: ({ row }) => {
        const isSpecialPricing = row.original?.isSpecialPricing
        return isSpecialPricing ? <Icons.check className='size-4 text-green-500' /> : <Icons.x className='size-4 text-red-500' />
      },
    },
    {
      accessorKey: "notes",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Notes' />,
      cell: ({ row }) => <div className='min-w-[250px] whitespace-pre-line'>{row.original?.notes || ""}</div>,
    },
    {
      accessorKey: "updatedAt",
      id: "date modified",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date Modified' />,
      cell: ({ row }) => {
        const date = row.original.updatedAt
        return <div className='min-w-[100px]'>{format(date, "MM-dd-yyyy")}</div>
      },
      filterFn: (row, columnId, filterValue, addMeta) => {
        const date = row.original.updatedAt
        const filterDateValue = new Date(filterValue)
        return dateFilter(date, filterDateValue)
      },
      sortingFn: (rowA, rowB, columnId) => {
        const rowADate = rowA.original.updatedAt
        const rowBDate = rowB.original.updatedAt
        return dateSort(rowADate, rowBDate)
      },
    },
    {
      id: "supplier percentage of answered back RFQ's",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Supplier - Percentage of Answered Back RFQ's" />,
      cell: ({ row }) => null,
    },
    {
      accessorFn: (row) => null,
      id: "supplier - # of Sales Orders",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Supplier - # of Sales Orders' />,
      cell: ({ row }) => null,
    },
    {
      accessorKey: "actions",
      header: "Action",
      cell: function ActionCell({ row }) {
        const router = useRouter()
        const { executeAsync } = useAction(deleteProductAvailability)
        const [showConfirmation, setShowConfirmation] = useState(false)

        const { id, code } = row.original

        async function handleDelete() {
          setShowConfirmation(false)

          toast.promise(executeAsync({ id }), {
            loading: "Deleting product availability...",
            success: (response) => {
              const result = response?.data

              if (!response || !result) throw { message: "Failed to delete product availability!", unExpectedError: true }

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
              <ActionTooltipProvider label='View Product Availability'>
                <Icons.eye
                  className='size-4 cursor-pointer transition-all hover:scale-125'
                  onClick={() => router.push(`/dashboard/crm/product availabilitys/${code}/view`)}
                />
              </ActionTooltipProvider>

              <ActionTooltipProvider label='Edit Product Availability'>
                <Icons.pencil
                  className='size-4 cursor-pointer transition-all hover:scale-125'
                  onClick={() => router.push(`/dashboard/crm/product availabilitys/${code}`)}
                />
              </ActionTooltipProvider>

              <ActionTooltipProvider label='Delete Product Availability'>
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
              description={`Are you sure you want to delete this product availability #${code}?`}
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
