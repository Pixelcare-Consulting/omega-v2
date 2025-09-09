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
import { deleteAccount, getAccounts } from "@/actions/account"
import AlertModal from "@/components/alert-modal"
import { cn, copyText } from "@/lib/utils"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"

type AccountData = Awaited<ReturnType<typeof getAccounts>>[number]

export function getColumns(): ColumnDef<AccountData>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
      size: 150,
      cell: ({ row }) => (
        <div className='flex flex-col'>
          <span className='font-semibold'>{row.original.name}</span>

          {row.original.email && (
            <div className='flex items-center'>
              <Icons.mail className='mr-1 size-4 text-muted-foreground/75' />
              <Link href={`mailto:${row.original.email}`} className='text-muted-foreground/75 decoration-1 hover:underline'>
                {row.original.email}
              </Link>
            </div>
          )}
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
      cell: ({ row }) => {
        if (!row.original.phone) return null

        return (
          <Link href={`tel:${row.original.phone}`} className='text-slate-800 decoration-1 hover:underline'>
            {row.original.phone}
          </Link>
        )
      },
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
        const { executeAsync } = useAction(deleteAccount)
        const [showConfirmation, setShowConfirmation] = useState(false)

        const { id, name } = row.original

        async function handleDelete() {
          setShowConfirmation(false)

          toast.promise(executeAsync({ id }), {
            loading: "Deleting account...",
            success: (response) => {
              const result = response?.data

              if (!response || !result) throw { message: "Failed to delete account!", unExpectedError: true }

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
              <ActionTooltipProvider label='View Account'>
                <Icons.eye
                  className='size-4 cursor-pointer transition-all hover:scale-125'
                  onClick={() => router.push(`/dashboard/crm/accounts/${id}/view`)}
                />
              </ActionTooltipProvider>

              <ActionTooltipProvider label='Edit Account'>
                <Icons.pencil
                  className='size-4 cursor-pointer transition-all hover:scale-125'
                  onClick={() => router.push(`/dashboard/crm/accounts/${id}`)}
                />
              </ActionTooltipProvider>

              <ActionTooltipProvider label='Delete Account'>
                <Icons.trash
                  className='size-4 cursor-pointer text-red-500 transition-all hover:scale-125'
                  onClick={() => setShowConfirmation(true)}
                />
              </ActionTooltipProvider>

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <ActionTooltipProvider label='More Options'>
                    <Icons.moreHorizontal className='size-4 cursor-pointer transition-all hover:scale-125' />
                  </ActionTooltipProvider>
                </DropdownMenuTrigger>

                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={() => copyText(id)}>
                    <Icons.copy className='mr-2 size-4' /> Copy ID
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <AlertModal
              isOpen={showConfirmation}
              title='Are you sure?'
              description={`Are you sure you want to delete this account named "${name}"?`}
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
