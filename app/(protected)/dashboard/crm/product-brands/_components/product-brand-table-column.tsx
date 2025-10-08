import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "nextjs-toploader/app"
import AlertModal from "@/components/alert-modal"
import { useAction } from "next-safe-action/hooks"

import ActionTooltipProvider from "@/components/provider/tooltip-provider"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { deleteProductBrand, getProductBrands } from "@/actions/product-brand"
import { Icons } from "@/components/icons"

type ProductBrandData = Awaited<ReturnType<typeof getProductBrands>>[number]

export function getColumns(): ColumnDef<ProductBrandData>[] {
  return [
    {
      accessorKey: "code",
      id: "id #",
      header: ({ column }) => <DataTableColumnHeader column={column} title='ID #' />,
    },

    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
      cell: ({ row }) => <div className='font-bold'>{row.original.name}</div>,
    },
    {
      accessorKey: "alias",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Alias' />,
    },
    {
      accessorKey: "sourcingHints",
      id: "sourcing hints",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Sourcing Hints' />,
    },
    {
      accessorKey: "actions",
      header: "Action",
      cell: function ActionCell({ row }) {
        const router = useRouter()
        const { executeAsync } = useAction(deleteProductBrand)
        const [showConfirmation, setShowConfirmation] = useState(false)

        const { id, code } = row.original

        async function handleDelete() {
          setShowConfirmation(false)

          toast.promise(executeAsync({ id }), {
            loading: "Deleting product brand...",
            success: (response) => {
              const result = response?.data

              if (!response || !result) throw { message: "Failed to delete product brand!", unExpectedError: true }

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
              <ActionTooltipProvider label='View Product Brand'>
                <Icons.eye
                  className='size-4 cursor-pointer transition-all hover:scale-125'
                  onClick={() => router.push(`/dashboard/crm/product-brands/${code}/view`)}
                />
              </ActionTooltipProvider>

              <ActionTooltipProvider label='Edit Product Brand'>
                <Icons.pencil
                  className='size-4 cursor-pointer transition-all hover:scale-125'
                  onClick={() => router.push(`/dashboard/crm/product-brands/${code}`)}
                />
              </ActionTooltipProvider>

              <ActionTooltipProvider label='Delete Product Brand'>
                <Icons.trash
                  className='size-4 cursor-pointer text-red-500 transition-all hover:scale-125'
                  onClick={() => setShowConfirmation(true)}
                />
              </ActionTooltipProvider>
            </div>

            <AlertModal
              isOpen={showConfirmation}
              title='Are you sure?'
              description={`Are you sure you want to delete this product brand #${code}?`}
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
