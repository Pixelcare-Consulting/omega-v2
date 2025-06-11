import { deleteContact, getContacts } from "@/actions/contacts"
import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import { toast } from "sonner"
import Link from "next/link"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useRouter } from "nextjs-toploader/app"
import { useAction } from "next-safe-action/hooks"
import { deleteLead, getLeads } from "@/actions/lead"
import AlertModal from "@/components/alert-modal"

import { cn } from "@/lib/utils"
import { CONTACT_PRIORITIES_COLORS, CONTACT_PRIORITIES_OPTIONS, CONTACT_TYPES_COLORS, CONTACT_TYPES_OPTIONS } from "@/schema/contact"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"

type ContactData = Awaited<ReturnType<typeof getContacts>>[number]

export function getColumns(): ColumnDef<ContactData>[] {
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
      accessorKey: "phone",
      header: ({ column }) => <DataTableColumnHeader column={column} title='phone' />,
      cell: ({ row }) => (
        <Link href={`tel:${row.original.phone}`} className='text-sm text-slate-800 decoration-1 hover:underline'>
          {row.original.phone}
        </Link>
      ),
    },
    {
      accessorKey: "email",
      id: "email",
    },
    {
      accessorKey: "company",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Company' />,
    },
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Title' />,
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Active' />,
      cell: ({ row }) => {
        const isActive = row.original?.isActive ?? true
        const label = isActive ? "Active" : "Inactive"
        const color = isActive ? "green" : "red"

        const STATUS_CLASSES: Record<string, string> = {
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
      accessorKey: "type",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
      cell: ({ row }) => {
        const type = row.original?.type ?? "lead"
        const label = CONTACT_TYPES_OPTIONS.find((item) => item.value === type)?.label ?? "Lead"
        const color = CONTACT_TYPES_COLORS.find((item) => item.value === type)?.color ?? "slate"

        const STATUS_CLASSES: Record<string, string> = {
          slate: "bg-slate-50 text-slate-600 ring-slate-500/10",
          blue: "bg-blue-50 text-blue-600 ring-blue-500/10",
          yellow: "bg-yellow-50 text-yellow-600 ring-yellow-500/10",
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
      accessorKey: "priority",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Priority' />,
      cell: ({ row }) => {
        const priority = row.original?.priority ?? "low"
        const label = CONTACT_PRIORITIES_OPTIONS.find((item) => item.value === priority)?.label ?? "low"
        const color = CONTACT_PRIORITIES_COLORS.find((item) => item.value === priority)?.color ?? "slate"

        const STATUS_CLASSES: Record<string, string> = {
          slate: "bg-slate-50 text-slate-600 ring-slate-500/10",
          amber: "bg-amber-50 text-amber-600 ring-amber-500/10",
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
      accessorKey: "comments",
      size: 200,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Comments' />,
      cell: ({ row }) => (
        <ActionTooltipProvider className='w-full max-w-[90vw] md:max-w-[600px]' label={row.original.comments} side='left'>
          <div className='line-clamp-3'>{row.original.comments}</div>
        </ActionTooltipProvider>
      ),
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
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/crm/contacts/${id}`)}>
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
