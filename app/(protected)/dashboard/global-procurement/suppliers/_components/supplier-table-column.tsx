import { deleteSupplier, getSuppliers } from "@/actions/supplier"
import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import { toast } from "sonner"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import AlertModal from "@/components/alert-modal"
import { useRouter } from "nextjs-toploader/app"
import { useAction } from "next-safe-action/hooks"

type SupplierData = Awaited<ReturnType<typeof getSuppliers>>[number]

export function getColumns(): ColumnDef<SupplierData>[] {
  return [
    {
      accessorKey: "CardName",
      id: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
      cell: ({ row }) => <div className='font-semibold'>{row.original.CardName || ""}</div>,
    },
    {
      accessorKey: "CardCode",
      id: "code",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Code' />,
      cell: ({ row }) => <div className='text-xs text-muted-foreground'>#{row.original.CardCode}</div>,
    },
    {
      accessorKey: "AccountNumber",
      id: "account number",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Account #' />,
      cell: ({ row }) => row.original?.AccountNumber && <div className='text-xs text-muted-foreground'>#{row.original.AccountNumber}</div>,
    },
    {
      accessorKey: "AssignedBuyer",
      id: "assigned buyer",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Assigned Buyer' />,
      cell: ({ row }) => "N/A",
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
      cell: ({ row }) => (
        <span className='inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-center text-xs font-medium text-green-600 ring-1 ring-green-500/10'>
          Active
        </span>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      size: 80,
      cell: function ActionCell({ row }) {
        const router = useRouter()
        const { executeAsync } = useAction(deleteSupplier)
        const [showConfirmation, setShowConfirmation] = useState(false)

        const { id, CardName } = row.original

        async function handleDelete() {
          setShowConfirmation(false)

          toast.promise(executeAsync({ id }), {
            loading: "Deleting supplier...",
            success: (response) => {
              const result = response?.data

              if (!response || !result) throw { message: "Failed to delete supplier!", unExpectedError: true }

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='size-8 p-0'>
                  <Icons.moreHorizontal className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/global-procurement/suppliers/${id}`)}>
                  <Icons.pencil className='mr-2 size-4' /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem className='text-red-600' onClick={() => setShowConfirmation(true)}>
                  <Icons.trash className='mr-2 size-4' /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertModal
              isOpen={showConfirmation}
              title='Are you sure?'
              description={`Are you sure you want to delete this supplier${CardName ? ` named "${CardName}"` : ""}?`}
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
