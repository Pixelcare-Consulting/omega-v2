import { format } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { dateFilter, dateSort } from "@/lib/data-table/data-table"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useRouter } from "nextjs-toploader/app"
import { useAction } from "next-safe-action/hooks"
import { deleleteRole, getRoles } from "@/actions/role"
import { toast } from "sonner"
import AlertModal from "@/components/alert-modal"

type RolesData = Awaited<ReturnType<typeof getRoles>>[number]

export function getColumns(): ColumnDef<RolesData>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
      size: 80,
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <div className='flex size-10 items-center justify-center rounded-full bg-muted font-medium'>
            {row.original.name.substring(0, 2).toUpperCase()}
          </div>
          <span>{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
      size: 250,
      cell: ({ row }) => <div>{row.original.description}</div>,
    },
    {
      accessorFn: (row) => format(row.createdAt, "PP"),
      id: "created",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Created' />,
      cell: ({ row }) => <div>{format(row.original.createdAt, "PP")}</div>,
      filterFn: (row, columnId, filterValue, addMeta) => {
        const createdAt = row.original.createdAt
        const filterDateValue = new Date(filterValue)
        return dateFilter(createdAt, filterDateValue)
      },
      sortingFn: (rowA, rowB, columnId) => {
        const rowACreatedAt = rowA.original.createdAt
        const rowBCreatedAt = rowB.original.createdAt
        return dateSort(rowACreatedAt, rowBCreatedAt)
      },
    },
    {
      accessorFn: (row) => format(row.updatedAt, "PP"),
      id: "updated",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Updated' />,
      cell: ({ row }) => <div>{format(row.original.updatedAt, "PP")}</div>,
      filterFn: (row, columnId, filterValue, addMeta) => {
        const updatedAt = row.original.updatedAt
        const filterDateValue = new Date(filterValue)
        return dateFilter(updatedAt, filterDateValue)
      },
      sortingFn: (rowA, rowB, columnId) => {
        const rowAUpdatedAt = rowA.original.updatedAt
        const rowBUpdatedAt = rowB.original.updatedAt
        return dateSort(rowAUpdatedAt, rowBUpdatedAt)
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      size: 80,
      cell: function ActionCell({ row }) {
        const router = useRouter()
        const { executeAsync } = useAction(deleleteRole)
        const [showConfirmation, setShowConfirmation] = useState(false)

        const { id, name } = row.original

        async function handleDelete() {
          setShowConfirmation(false)

          toast.promise(executeAsync({ id }), {
            loading: "Deleting role...",
            success: (response) => {
              const result = response?.data

              if (!response || !result) throw { message: "Failed to delete role!", unExpectedError: true }

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
                <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/roles/${id}`)}>
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
              description={`Are you sure you want to delete this role named "${name}"?`}
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
