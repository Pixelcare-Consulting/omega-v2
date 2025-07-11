import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useRouter } from "nextjs-toploader/app"
import { useAction } from "next-safe-action/hooks"
import { deleteContact, getContacts } from "@/actions/contacts"
import AlertModal from "@/components/alert-modal"
import { cn } from "@/lib/utils"

type ContactData = Awaited<ReturnType<typeof getContacts>>[number]

export function getColumns(): ColumnDef<ContactData>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Contact' />,
      size: 150,
      cell: ({ row }) => (
        <div className='flex flex-col'>
          <span className='font-semibold'>{row.original.name}</span>

          <div className='flex items-center'>
            <Icons.mail className='mr-1 size-4 text-muted-foreground/75' />
            <Link href={`mailto:${row.original.email}`} className='text-muted-foreground/75 decoration-1 hover:underline'>
              {row.original.email}
            </Link>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      id: "email",
    },
    {
      accessorKey: "phone",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Phone' />,
      cell: ({ row }) => (
        <Link href={`tel:${row.original.phone}`} className='text-slate-800 decoration-1 hover:underline'>
          {row.original.phone}
        </Link>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Title' />,
      cell: ({ row }) => <div className=''>{row.original?.title || ""}</div>,
    },
    {
      accessorFn: (row) => String(row.isActive),
      id: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
      size: 170,
      filterFn: "weakEquals",
      cell: ({ row }) => {
        const isActive = row.original.isActive

        const STATUS_CLASSES: Record<string, string> = {
          green: "bg-green-50 text-green-600 ring-green-500/10",
          red: "bg-red-50 text-red-600 ring-red-500/10",
        }

        return (
          <div>
            <span
              className={cn(
                `inline-flex items-center rounded-md px-2 py-1 text-center text-xs font-medium ring-1`,
                isActive ? STATUS_CLASSES["green"] : STATUS_CLASSES["red"]
              )}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      size: 80,
      cell: function ActionCell({ row }) {
        const router = useRouter()
        const { executeAsync } = useAction(deleteContact)
        const [showConfirmation, setShowConfirmation] = useState(false)

        const { id, name } = row.original

        async function handleDelete() {
          setShowConfirmation(false)

          toast.promise(executeAsync({ id }), {
            loading: "Deleting contact...",
            success: (response) => {
              const result = response?.data

              if (!response || !result) throw { message: "Failed to delete contact!", unExpectedError: true }

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
                <DropdownMenuItem onClick={() => router.push(`/dashboard/crm/contacts/${id}/view`)}>
                  <Icons.eye className='mr-2 size-4' /> View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/crm/contacts/${id}`)}>
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
              description={`Are you sure you want to delete this contact named "${name}"?`}
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
