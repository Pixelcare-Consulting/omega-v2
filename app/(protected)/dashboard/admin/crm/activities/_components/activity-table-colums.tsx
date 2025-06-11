import { ColumnDef } from "@tanstack/react-table"
import { use, useState } from "react"
import { format } from "date-fns"
import { useRouter } from "nextjs-toploader/app"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { cn, getInitials } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { getUserById } from "@/actions/user"
import { deletedActivity, getActivities } from "@/actions/activity"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"
import { ACTIVITY_STATUSES_COLORS, ACTIVITY_STATUSES_OPTIONS, ACTIVITY_TYPES_COLORS, ACTIVITY_TYPES_OPTIONS } from "@/schema/activity"
import { dateFilter, dateSort } from "@/lib/data-table/data-table"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import AlertModal from "@/components/alert-modal"

type ActivityData = Awaited<ReturnType<typeof getActivities>>[number]

export function getColumns(): ColumnDef<ActivityData>[] {
  return [
    {
      accessorKey: "title",
      id: "activity",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Activity' />,
      cell: ({ row }) => (
        <ActionTooltipProvider label={row.original.title}>
          <div className='max-w-60 truncate font-semibold'>{row.original.title}</div>
        </ActionTooltipProvider>
      ),
    },
    {
      accessorKey: "type",
      size: 100,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
      cell: ({ row }) => {
        const status = row.original?.type ?? "note"
        const label = ACTIVITY_TYPES_OPTIONS.find((item: any) => item.value === status)?.label ?? "Note"
        const color = ACTIVITY_TYPES_COLORS.find((item: any) => item.value === status)?.color ?? "slate"

        const STATUS_CLASSES: Record<string, string> = {
          slate: "bg-slate-50 text-slate-600 ring-slate-500/10",
          purple: "bg-purple-50 text-purple-600 ring-purple-500/10",
          orange: "bg-orange-50 text-orange-600 ring-orange-500/10",
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
      accessorFn: (row) => row.createdByUser?.name || "",
      id: "owner",
      size: 80,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Owner' />,
      cell: ({ row }) => {
        const owner = row.original?.createdByUser?.name || ""

        return (
          <ActionTooltipProvider label={owner}>
            <div className='flex size-10 items-center justify-center rounded-full bg-muted font-medium'>{getInitials(owner)}</div>
          </ActionTooltipProvider>
        )
      },
    },
    {
      accessorFn: (row) => {
        const date = row?.date
        const startTime = row?.startTime
        const endTime = row?.endTime

        if (!date || !startTime || !endTime) return ""

        return `${format(date, "PP")} ${format(new Date(`${format(date, "yyyy-MM-dd")}T${startTime}:00`), "h:mm a")} - ${format(new Date(`${format(date, "yyyy-MM-dd")}T${endTime}:00`), "h:mm a")}`
      },
      id: "schedule",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Schedule' />,
      cell: ({ row }) => {
        //TODO: Add date filter & sorting

        const date = row.original.date
        const startTime = row.original?.startTime
        const endTime = row.original?.endTime

        const meetingSchedule = (date: Date | null, startTime: string | null, endTime: string | null) => {
          if (!date || !startTime || !endTime) return ""

          if (date && startTime && endTime) {
            const startDateTime = new Date(`${format(date, "yyyy-MM-dd")}T${startTime}:00`)
            const endDateTime = new Date(`${format(date, "yyyy-MM-dd")}T${endTime}:00`)

            return {
              date: format(date, "PP"),
              start: startDateTime ? format(startDateTime, "h:mm a") : "",
              end: endDateTime ? format(endDateTime, "h:mm a") : "",
            }
          }

          return ""
        }

        const schedule = meetingSchedule(date, startTime, endTime)

        if (!schedule) return <div>-</div>

        return (
          <div className='flex flex-col space-y-1 text-xs'>
            <div>{schedule.date}</div>
            <div>
              {schedule.start} - {schedule.end}
            </div>
          </div>
        )
      },
      filterFn: (row, columnId, filterValue, addMeta) => {
        if (row.original.type !== "meeting" || !row.original.date) return false
        const date = row.original.date
        const filterDateValue = new Date(filterValue)
        return dateFilter(date, filterDateValue)
      },
      sortingFn: (rowA, rowB, columnId) => {
        if (rowA.original.type !== "meeting" || !rowA.original.date) return 0
        if (rowB.original.type !== "meeting" || !rowB.original.date) return 0

        const d1 = new Date(rowA.original.date)
        const d2 = new Date(rowB.original.date)

        return dateSort(d1, d2)
      },
    },
    {
      accessorKey: "status",
      size: 80,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
      cell: ({ row }) => {
        if (row.original.type === "note") return <div>-</div>

        const status = row.original?.status ?? "pending"
        const label = ACTIVITY_STATUSES_OPTIONS.find((item: any) => item.value === status)?.label ?? "Pending"
        const color = ACTIVITY_STATUSES_COLORS.find((item: any) => item.value === status)?.color ?? "slate"

        const STATUS_CLASSES: Record<string, string> = {
          slate: "bg-slate-50 text-slate-600 ring-slate-500/10",
          amber: "bg-amber-50 text-amber-600 ring-amber-500/10",
          lime: "bg-lime-50 text-lime-600 ring-lime-500/10",
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
      accessorFn: (row) => row.lead?.name || "",
      id: "lead",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Lead' />,
      cell: ({ row }) => {
        const lead = row.original.lead

        if (!lead) return <div>-</div>

        return (
          <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
            <Icons.cicleUser className='size-4' /> {lead.name}
          </div>
        )
      },
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
      accessorKey: "actions",
      header: "Actions",
      size: 80,
      cell: function ActionCell({ row }) {
        const router = useRouter()
        const { executeAsync } = useAction(deletedActivity)
        const [showConfirmation, setShowConfirmation] = useState(false)

        const { id, title } = row.original

        async function handleDelete() {
          setShowConfirmation(false)

          toast.promise(executeAsync({ id }), {
            loading: "Deleting activity...",
            success: (response) => {
              const result = response?.data

              if (!response || !result) throw { message: "Failed to delete activity!", unExpectedError: true }

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
                <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/crm/activities/${row.original.id}`)}>
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
              description={`Are you sure you want to delete this activity titled "${title}"?`}
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
