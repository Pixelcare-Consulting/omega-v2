"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { registerLicense } from "@syncfusion/ej2-base"
import {
  Agenda,
  Day,
  EventSettingsModel,
  Inject,
  Month,
  ScheduleComponent,
  ViewDirective,
  ViewsDirective,
  Week,
} from "@syncfusion/ej2-react-schedule"
import { format } from "date-fns"
import { useTheme } from "next-themes"
import { isEmpty } from "radash"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"
import { Icons } from "@/components/icons"
import { ACTIVITY_STATUSES_COLORS, ACTIVITY_STATUSES_OPTIONS, ACTIVITY_TYPES_COLORS, ACTIVITY_TYPES_OPTIONS } from "@/schema/activity"
import { Badge, BadgeProps } from "@/components/badge"
import Link from "next/link"
import { deleteActivity, getActivitiesByType } from "@/actions/activity"
import { useRouter } from "nextjs-toploader/app"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import AlertModal from "@/components/alert-modal"
import { ACTIVITY_MODULES_OPTIONS } from "@/schema/activity"
import { useMounted } from "@/hooks/use-mounted"

// Register Syncfusion license
registerLicense("Ngo9BigBOggjHTQxAR8/V1NNaF5cXmtCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWXtfd3RRQ2VcVEZ/XURWYUA=")

type ScheduleCalendarProps = {
  activities: Awaited<ReturnType<typeof getActivitiesByType>>
}

export default function ScheduleCalendar({ activities }: ScheduleCalendarProps) {
  const { theme } = useTheme()
  const router = useRouter()
  const mounted = useMounted()

  const calendarRef = useRef<ScheduleComponent>(null)

  const eventSettings: EventSettingsModel = useMemo(() => {
    const events = activities.map((event) => {
      const date = event.date ? format(event.date, "yyyy-MM-dd") : ""

      return {
        Id: event.id,
        Subject: event.title,
        StartTime: event.startTime && date ? new Date(`${date}T${event.startTime}:00`) : "",
        EndTime: event.endTime && date ? new Date(`${date}T${event.endTime}:00`) : "",
        Type: event.type, //* custom field,
        Link: event.link, //* custom field,
        Status: event.status, //* custom field,
        MetaData: event.metadata, //* custom field,
        Module: event.module, //* custom field,
        Location: "",
        Event: event,
      }
    })

    return { dataSource: events }
  }, [JSON.stringify(activities)])

  //* custom component for event
  function eventTemplate(props: any) {
    return (
      <div className='flex h-full w-full items-center rounded-md bg-primary text-center text-white'>
        <ActionTooltipProvider label={props.Subject}>
          <span className='inline-block w-[90%] truncate text-xs font-medium'>{props.Subject}</span>
        </ActionTooltipProvider>
      </div>
    )
  }

  //* triggers before each of the event getting rendered on the scheduler user interface.
  function eventRendered(args: any) {}

  //* close quick info popup
  const handleCloseQuickInfoPopup = useCallback(() => {
    if (!calendarRef || !calendarRef.current) return
    calendarRef.current.closeQuickInfoPopup()
  }, [calendarRef])

  //* custom component for the header of quick info popup
  function QuickInfoHeaderTemplate(props: any) {
    return (
      <div className='flex items-center rounded-t-md bg-primary py-2 text-center text-white'>
        <ActionTooltipProvider label={props.Subject}>
          <span className='inline-block w-[90%] truncate text-sm font-medium'>{props.Subject}</span>
        </ActionTooltipProvider>
      </div>
    )
  }

  //* custom component for the content of quick info popup
  function QuickInfoContentTemplate(props: any) {
    const { Type, Link: ExternalLink, Status, StartTime, EndTime, Module, Event } = props

    const typeLabel = ACTIVITY_TYPES_OPTIONS.find((item) => item.value === Type)?.label ?? "Note"
    const typeColor = ACTIVITY_TYPES_COLORS.find((item) => item.value === Type)?.color ?? "slate"

    const statusLabel = ACTIVITY_STATUSES_OPTIONS.find((item) => item.value === Status)?.label ?? "Pending"
    const statusColor = ACTIVITY_STATUSES_COLORS.find((item) => item.value === Status)?.color ?? "slate"

    const moduleLabel = ACTIVITY_MODULES_OPTIONS.find((item) => item.value === Module)?.label

    const startTime = StartTime ? StartTime : ""
    const endTime = EndTime ? EndTime : ""
    const date = Event?.date ? format(Event.date, "PPP") : ""

    return (
      <div className='flex flex-col justify-center gap-y-2 p-4'>
        {moduleLabel && (
          <div className='flex items-center gap-x-3'>
            <Icons.folderCog className='size-3.5' />
            <Badge variant='soft-slate'>{moduleLabel}</Badge>
          </div>
        )}

        <div className='flex items-center gap-x-3'>
          <Icons.tag className='size-3.5' />
          <Badge variant={`soft-${typeColor}` as BadgeProps["variant"]}>{typeLabel}</Badge>
        </div>

        <div className='flex items-center gap-x-3'>
          <Icons.activity className='size-3.5' />
          <Badge variant={`soft-${statusColor}` as BadgeProps["variant"]}>{statusLabel}</Badge>
        </div>

        <div className='flex items-center gap-x-3'>
          <Icons.calendarClock className='size-3.5' />
          <div className='text-sm text-muted-foreground'>
            {date} {startTime && endTime ? `- ${format(startTime, "HH:mm a")} - ${format(endTime, "HH:mm a")}` : ""}
          </div>
        </div>

        {ExternalLink && (
          <Link
            href={ExternalLink}
            target='_blank'
            referrerPolicy='no-referrer'
            className='item-center mb-1 flex gap-x-3 text-sm hover:underline hover:decoration-blue-500'
          >
            <Icons.externalLink className='text- size-4' />
            <div className='cursor-pointer text-sm text-blue-500'>External Link</div>
          </Link>
        )}

        <div className='flex items-center gap-x-3'>
          <Icons.location className='size-3.5' />
          <div className='text-sm text-muted-foreground'>N/A</div>
        </div>

        <div className='flex items-center gap-x-3'>
          <Icons.user className='size-3.5' />
          <div className='text-sm text-muted-foreground'>{Event?.createdByUser?.name || Event?.createdByUser?.email}</div>
        </div>
      </div>
    )
  }

  //* custom component for the footer of quick info popup
  function QuickInfoFooterTemplate(props: any) {
    const { executeAsync } = useAction(deleteActivity)
    const [showConfirmation, setShowConfirmation] = useState(false)

    console.log("footer template", { props })

    const handleViewActivity = (id: string) => {
      router.push(`/dashboard/crm/activities/${id}/view`)
    }

    const handleEditActivity = (id: string) => {
      router.push(`/dashboard/crm/activities/${id}`)
    }

    const handleDeleteActivity = (id: string) => {
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
      <div className='flex items-center justify-between border-t p-4'>
        <ActionTooltipProvider label='Close Activity'>
          <Icons.x className='size-3.5 cursor-pointer transition-all hover:scale-125' onClick={handleCloseQuickInfoPopup} />
        </ActionTooltipProvider>

        <div className='flex items-center gap-x-2'>
          <ActionTooltipProvider label='View Activity'>
            <Icons.eye className='size-3.5 cursor-pointer transition-all hover:scale-125' onClick={() => handleViewActivity(props.Id)} />
          </ActionTooltipProvider>

          <ActionTooltipProvider label='Edit Activity'>
            <Icons.pencil className='size-3.5 cursor-pointer transition-all hover:scale-125' onClick={() => handleEditActivity(props.Id)} />
          </ActionTooltipProvider>

          <ActionTooltipProvider label='Delete Activity'>
            <Icons.trash
              className='size-3.5 cursor-pointer text-red-500 transition-all hover:scale-125'
              onClick={() => setShowConfirmation(true)}
            />
          </ActionTooltipProvider>

          <AlertModal
            isOpen={showConfirmation}
            title='Are you sure?'
            description={`Are you sure you want to delete this activity titled "${props.Subject}"?`}
            onConfirm={() => handleDeleteActivity(props.Id)}
            onConfirmText='Delete'
            onCancel={() => setShowConfirmation(false)}
          />
        </div>
      </div>
    )
  }

  //* triggers when the events are double clicked or on double tapping the events on the desktop devices.
  const handleEventDoubleClick = (args: any) => {
    args.cancel = true //* prevent the default event editor from opening
  }

  //* triggers before any of the scheduler popups opens on the page.
  const handlePopupOpen = (args: any) => {
    const type = args.type

    if (args?.data && isEmpty(args?.data.Event) && type !== "EventContainer") {
      args.cancel = true //* prevent popup when selecting cell
      return
    }

    args.cancel = false //* show other popups
  }

  //* triggers when multiple cells or events are selected on the Scheduler.
  const handleSelected = (args: any) => {
    console.log("selected", args)
  }

  if (!mounted) return null

  return (
    <>
      <ScheduleComponent
        ref={calendarRef}
        width='100%'
        height='100vh'
        currentView='Month'
        startHour='00:00'
        endHour='24:00'
        selectedDate={new Date()}
        eventRendered={eventRendered}
        eventSettings={eventSettings}
        popupOpen={handlePopupOpen}
        eventDoubleClick={handleEventDoubleClick}
        select={handleSelected}
        quickInfoTemplates={{
          header: (props: any) => <QuickInfoHeaderTemplate {...props} />,
          content: (props: any) => <QuickInfoContentTemplate {...props} />,
          footer: (props: any) => <QuickInfoFooterTemplate {...props} />,
        }}
        allowDragAndDrop={false}
        allowResizing={false}
        allowMultiDrag={false}
        className='rounded-md border'
      >
        <ViewsDirective>
          <ViewDirective option='Month' eventTemplate={eventTemplate} />
          <ViewDirective option='Week' />
          <ViewDirective option='Day' />
          <ViewDirective option='Agenda' />
        </ViewsDirective>

        <Inject services={[Month, Week, Day, Agenda]} />
      </ScheduleComponent>
    </>
  )
}
