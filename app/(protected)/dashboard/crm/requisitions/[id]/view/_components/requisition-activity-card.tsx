"use client"

import { useState } from "react"
import Link from "next/link"

import { Icons } from "@/components/icons"
import HtmlContent from "@/components/minimal-tiptap/html-content"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn, getInitials } from "@/lib/utils"
import {
  REQUISITION_ACTIVITY_ICONS,
  REQUISITION_ACTIVITY_STATUSES_COLORS,
  REQUISITION_ACTIVITY_STATUSES_OPTIONS,
} from "@/schema/requisition-activity"
import { format } from "date-fns"
import AlertModal from "@/components/alert-modal"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import { deleteRequisitionActivity } from "@/actions/requisition-activity"
import { useRouter } from "nextjs-toploader/app"
import { RequisitionActivity } from "./tabs/requisition-activities-tab"

type RequisitionActivityCardProps = {
  activity: RequisitionActivity
  setActivity: (value: RequisitionActivity | null) => void
  setIsOpen: (value: boolean) => void
}

export default function RequisitionActivityCard({ activity, setActivity, setIsOpen }: RequisitionActivityCardProps) {
  const Icon = REQUISITION_ACTIVITY_ICONS.find((item: any) => item.value === activity.type)?.icon ?? Icons.notebookPen

  switch (activity.type) {
    case "meeting":
      return (
        <li className='mb-6 ms-6'>
          <span className='ring-7 absolute -start-3.5 flex size-7 items-center justify-center rounded-full bg-slate-200 ring-background dark:bg-slate-600 dark:ring-background'>
            <Icon className='size-3.5 text-slate-800 dark:text-slate-300' />
          </span>

          <span className='absolute -start-3.5 bottom-0 flex size-7 items-center justify-center rounded-full bg-slate-200 ring-8 ring-background dark:bg-slate-600 dark:ring-background'>
            <Icons.landPlot className='size-4 text-slate-800 dark:text-slate-300' />
          </span>

          <header className='mb-2 flex flex-col items-center lg:flex-row lg:justify-between'>
            <p className='flex items-center gap-2 text-sm font-medium'>
              <span>Meeting:</span>
              <ActionTooltipProvider label={activity.title}>
                <span className='inline-block max-w-[512px] truncate font-extrabold uppercase'>{activity.title}</span>
              </ActionTooltipProvider>
            </p>
            <p className='text-xs text-muted-foreground'>{format(activity.createdAt, "PPpp")}</p>
          </header>

          <div className='flex flex-col'>
            <div className='rounded-lg border p-4'>
              <ActivityHeader activity={activity} setActivity={setActivity} setIsOpen={setIsOpen} />
              <div className='px-4 pt-4'>
                <HtmlContent value={activity.body} />
              </div>
            </div>
          </div>
        </li>
      )

    case "note":
      return (
        <li className='mb-6 ms-6'>
          <span className='ring-7 absolute -start-3.5 flex size-7 items-center justify-center rounded-full bg-slate-200 ring-background dark:bg-slate-600 dark:ring-background'>
            <Icon className='size-3.5 text-slate-800 dark:text-slate-300' />
          </span>

          <span className='absolute -start-3.5 bottom-0 flex size-7 items-center justify-center rounded-full bg-slate-200 ring-8 ring-background dark:bg-slate-600 dark:ring-background'>
            <Icons.landPlot className='size-4 text-slate-800 dark:text-slate-300' />
          </span>

          <header className='mb-2 flex flex-col items-center lg:flex-row lg:justify-between'>
            <p className='flex items-center gap-2 text-sm font-medium'>
              <span>Note:</span>{" "}
              <ActionTooltipProvider label={activity.title}>
                <span className='inline-block max-w-[140px] truncate font-extrabold uppercase md:max-w-[240px] xl:max-w-[512px]'>
                  {activity.title}
                </span>
              </ActionTooltipProvider>
            </p>
            <p className='text-xs text-muted-foreground'>{format(activity.createdAt, "PPpp")}</p>
          </header>

          <div className='flex flex-col'>
            <div className='rounded-lg border p-4'>
              <ActivityHeader activity={activity} setActivity={setActivity} setIsOpen={setIsOpen} />
              <div className='px-4 pt-4'>
                <HtmlContent value={activity.body} />
              </div>
            </div>
          </div>
        </li>
      )

    default:
      break
  }
}

type ActivityHeaderProps = {
  activity: RequisitionActivity
  setActivity: (value: RequisitionActivity | null) => void
  setIsOpen: (value: boolean) => void
}

function ActivityHeader({ activity, setActivity, setIsOpen }: ActivityHeaderProps) {
  const router = useRouter()

  const [showConfirmation, setShowConfirmation] = useState(false)
  const { executeAsync } = useAction(deleteRequisitionActivity)

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

  type StatusBadgeProps = {
    type: string
    status: string
  }

  const StatusBadge = ({ type, status }: StatusBadgeProps) => {
    if (type === "note") return null

    const label = REQUISITION_ACTIVITY_STATUSES_OPTIONS.find((item: any) => item.value === status)?.label ?? "Pending"
    const color = REQUISITION_ACTIVITY_STATUSES_COLORS.find((item: any) => item.value === status)?.color ?? "slate"

    const STATUS_CLASSES: Record<string, string> = {
      slate: "bg-slate-50 text-slate-600 ring-slate-500/10",
      amber: "bg-amber-50 text-amber-600 ring-amber-500/10",
      lime: "bg-lime-50 text-lime-600 ring-lime-500/10",
    }

    return (
      <div>
        <span className={cn(`inline-flex items-center rounded-md px-2 py-1 text-center text-xs font-medium ring-1`, STATUS_CLASSES[color])}>
          {label}
        </span>
      </div>
    )
  }

  async function handleDelete() {
    setShowConfirmation(false)

    toast.promise(executeAsync({ id: activity.id }), {
      loading: "Deleting activity...",
      success: (response) => {
        const result = response?.data

        if (!response || !result) throw { message: "Failed to delete activity!", unExpectedError: true }

        if (!result.error) {
          setActivity(null)
          setIsOpen(false)

          setTimeout(() => {
            router.refresh()
          }, 1000)

          return result.message
        }

        throw { message: result.message, expectedError: true }
      },
      error: (err: Error & { expectedError: boolean }) => {
        return err?.expectedError ? err.message : "Something went wrong! Please try again later."
      },
    })
  }

  const schedule = meetingSchedule(activity.date, activity.startTime, activity.endTime)
  const user = activity.createdByUser

  return (
    <div className='relative flex items-center justify-between rounded'>
      <div className='flex flex-1 flex-col items-center gap-2 md:flex-row'>
        <div className='flex size-10 items-center justify-center rounded-full bg-muted'>
          <span className='text-sm font-medium'>{getInitials(user?.name || "")}</span>
        </div>

        <div className='flex flex-col items-center gap-1 md:items-start'>
          <h1 className='m-0 text-sm font-bold'>{user?.name || ""}</h1>

          {activity.type !== "meeting" && <StatusBadge status={activity.status} type={activity.type} />}

          {activity.type === "meeting" && (
            <div className='flex flex-col items-center gap-1.5 text-xs text-muted-foreground md:flex-row'>
              <StatusBadge status={activity.status} type={activity.type} />

              {schedule && (
                <div className='flex items-center gap-1.5'>
                  <Icons.calendarClock className='mb-1 size-4' />
                  <span className='text-center text-sm'>
                    {schedule.date && schedule.date}
                    {schedule.date && schedule.start && `, ${schedule.start}`}
                    {schedule.date && schedule.start && schedule.end && ` - ${schedule.end}`}
                  </span>
                </div>
              )}

              {activity.link && (
                <Link href={activity.link} target='_blank' referrerPolicy='no-referrer' className='mb-1 text-sm text-blue-500'>
                  <Icons.externalLink className='size-4' />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type='button' className='absolute right-0 top-0 p-0 md:relative md:right-auto md:top-auto' size='icon' variant='ghost'>
            <Icons.moreHorizontal className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem
            onClick={() => {
              setActivity(activity)
              setIsOpen(true)
            }}
          >
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
        description={`Are you sure you want to delete this activity titled "${activity.title}"?`}
        onConfirm={handleDelete}
        onConfirmText='Delete'
        onCancel={() => setShowConfirmation(false)}
      />
    </div>
  )
}
