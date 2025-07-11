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
import { deleteLead, getLeads } from "@/actions/lead"
import AlertModal from "@/components/alert-modal"
import { LEAD_STATUSES_COLORS, LEAD_STATUSES_OPTIONS } from "@/schema/lead"
import { cn } from "@/lib/utils"

type LeadData = Awaited<ReturnType<typeof getLeads>>[number]

export function getColumns(): ColumnDef<LeadData>[] {
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
      accessorFn: (row) => row.account?.name,
      id: "company",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Company' />,
      cell: ({ row }) => {
        const account = row.original?.account

        if (!account) return null

        return (
          <span className='inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-center text-xs font-medium text-slate-600 ring-1 ring-slate-500/10'>
            {account.name}
          </span>
        )
      },
    },
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Title' />,
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
      accessorKey: "actions",
      header: "Actions",
      size: 80,
      cell: function ActionCell({ row }) {
        const router = useRouter()
        const { executeAsync } = useAction(deleteLead)
        const [showConfirmation, setShowConfirmation] = useState(false)

        const { id, name } = row.original

        async function handleDelete() {
          setShowConfirmation(false)

          toast.promise(executeAsync({ id }), {
            loading: "Deleting lead...",
            success: (response) => {
              const result = response?.data

              if (!response || !result) throw { message: "Failed to delete lead!", unExpectedError: true }

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
                <DropdownMenuItem onClick={() => router.push(`/dashboard/crm/leads/${id}`)}>
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
              description={`Are you sure you want to delete this lead named "${name}"?`}
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
