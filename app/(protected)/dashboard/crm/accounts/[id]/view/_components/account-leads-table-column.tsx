import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { deleteAccountLead, getAccountById } from "@/actions/account"
import { useRouter } from "nextjs-toploader/app"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import AlertModal from "@/components/alert-modal"
import { LEAD_STATUSES_COLORS, LEAD_STATUSES_OPTIONS } from "@/schema/lead"

type LeadData = NonNullable<Awaited<ReturnType<typeof getAccountById>>>["leads"][number]

export function getColumns(accountId: string): ColumnDef<LeadData>[] {
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
            <Link href={`mailto:${row.original.email}`} className='text-sm text-muted-foreground/75 decoration-1 hover:underline'>
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
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
      cell: ({ row }) => {
        const status = row.original?.status ?? "new-lead"
        const label = LEAD_STATUSES_OPTIONS.find((item) => item.value === status)?.label ?? "New Lead"
        const color = LEAD_STATUSES_COLORS.find((item) => item.value === status)?.color ?? "slate"

        const STATUS_CLASSES: Record<string, string> = {
          slate: "bg-slate-50 text-slate-600 ring-slate-500/10",
          purple: "bg-purple-50 text-purple-600 ring-purple-500/10",
          amber: "bg-amber-50 text-amber-600 ring-amber-500/10",
          sky: "bg-sky-50 text-sky-600 ring-sky-500/10",
          green: "bg-green-50 text-green-600 ring-green-500/10",
          red: "bg-red-50 text-red-600 ring-red-500/10",
        }

        return (
          <div>
            <span
              className={cn(`inline-flex items-center rounded-md px-2 py-1 text-center text-xs font-medium ring-1`, STATUS_CLASSES[color])}
            >
              {label}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Title' />,
    },
    {
      accessorKey: "phone",
      header: ({ column }) => <DataTableColumnHeader column={column} title='phone' />,
      cell: ({ row }) => (
        <Link href={`tel:${row.original.phone}`} className='text-sm text-slate-800 decoration-1 hover:underline'>
          {row.original.phone}
        </Link>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      size: 80,
      cell: function ActionCell({ row }) {
        const router = useRouter()
        const { executeAsync } = useAction(deleteAccountLead)
        const [showConfirmation, setShowConfirmation] = useState(false)

        const { id, name } = row.original

        async function handleDeleteAccountLead({ accountId, leadId }: { accountId: string; leadId: string }) {
          setShowConfirmation(false)

          toast.promise(executeAsync({ accountId, leadId }), {
            loading: "Removing account lead...",
            success: (response) => {
              const result = response?.data

              if (!response || !result) throw { message: "Failed to remove lead!", unExpectedError: true }

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
                <DropdownMenuItem onClick={() => router.push(`/dashboard/crm/leads/${id}/view`)}>
                  <Icons.eye className='mr-2 size-4' /> View
                </DropdownMenuItem>
                <DropdownMenuItem className='text-red-600' onClick={() => setShowConfirmation(true)}>
                  <Icons.trash className='mr-2 size-4' /> Remove Lead
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertModal
              isOpen={showConfirmation}
              title='Are you sure?'
              description={`Are you sure you want to remove this lead named "${name}" from this account?`}
              onConfirm={() => handleDeleteAccountLead({ leadId: id, accountId })}
              onConfirmText='Remove'
              onCancel={() => setShowConfirmation(false)}
            />
          </>
        )
      },
    },
  ]
}
