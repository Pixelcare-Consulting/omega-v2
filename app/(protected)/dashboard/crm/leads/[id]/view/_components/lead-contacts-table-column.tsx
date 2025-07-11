import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { deleteLeadContact, getLeadById } from "@/actions/lead"
import { useRouter } from "nextjs-toploader/app"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import AlertModal from "@/components/alert-modal"

type LeadContactData = NonNullable<Awaited<ReturnType<typeof getLeadById>>>["contacts"][number]["contact"]

export function getColumns(leadId: string): ColumnDef<LeadContactData>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Lead' />,
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
      header: ({ column }) => <DataTableColumnHeader column={column} title='phone' />,
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
        const { executeAsync } = useAction(deleteLeadContact)
        const [showConfirmation, setShowConfirmation] = useState(false)

        const { id, name } = row.original

        async function handleDeleteLeadContact({ leadId, contactId }: { leadId: string; contactId: string }) {
          setShowConfirmation(false)

          toast.promise(executeAsync({ leadId, contactId }), {
            loading: "Removing lead contact...",
            success: (response) => {
              const result = response?.data

              if (!response || !result) throw { message: "Failed to remove contact!", unExpectedError: true }

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
                <DropdownMenuItem className='text-red-600' onClick={() => setShowConfirmation(true)}>
                  <Icons.trash className='mr-2 size-4' /> Remove Contact
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertModal
              isOpen={showConfirmation}
              title='Are you sure?'
              description={`Are you sure you want to remove this contact named "${name}" from this lead?`}
              onConfirm={() => handleDeleteLeadContact({ contactId: id, leadId })}
              onConfirmText='Remove'
              onCancel={() => setShowConfirmation(false)}
            />
          </>
        )
      },
    },
  ]
}
