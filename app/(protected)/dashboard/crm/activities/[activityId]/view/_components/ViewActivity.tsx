import Link from "next/link"

import { getAcvtityById } from "@/actions/activity"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"
import { Card } from "@/components/ui/card"
import { ACTIVITY_MODULES_OPTIONS, ACTIVITY_STATUSES_OPTIONS, ACTIVITY_TYPES_OPTIONS } from "@/schema/activity"
import ReadOnlyField from "@/components/read-only-field"
import { format } from "date-fns"
import HtmlContent from "@/components/minimal-tiptap/html-content"

type ViewActivityProps = {
  activity: NonNullable<Awaited<ReturnType<typeof getAcvtityById>>>
}

export default function ViewActivity({ activity }: ViewActivityProps) {
  const moduleLabel = ACTIVITY_MODULES_OPTIONS.find((item) => item.value === activity.module)?.label
  const type = ACTIVITY_TYPES_OPTIONS.find((item) => item.value === activity.type)?.label

  const status = ACTIVITY_STATUSES_OPTIONS.find((item) => item.value === activity.status)?.label
  const dateFormat1 = activity.date ? format(activity.date, "PPP") : ""
  const dateFormat2 = activity.date ? format(activity.date, "yyyy-MM-dd") : ""

  const startTime = activity?.startTime && dateFormat2 ? format(new Date(`${dateFormat2}T${activity.startTime}:00`), "HH:mm a") : ""
  const endTime = activity?.endTime && dateFormat2 ? format(new Date(`${dateFormat2}T${activity.endTime}:00`), "HH:mm a") : ""

  const getReferenceValue = (module: string, reference: any) => {
    switch (module) {
      case "lead":
        return reference?.name
      case "requisition":
        return reference?.code
      default:
        return ""
    }
  }

  return (
    <PageWrapper
      title='Activity Details'
      description='View the comprehensive details of this activity.'
      actions={
        <div className='flex items-center gap-2'>
          <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/calendar`}>
            Back
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='default' size='icon'>
                <Icons.moreVertical className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/crm/activities/${activity.id}`}>
                  <Icons.pencil className='mr-2 size-4' />
                  Edit
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <Card className='grid grid-cols-12 gap-5 rounded-lg p-6 shadow-md'>
        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Module' value={moduleLabel} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Reference'
          value={getReferenceValue(activity.module, activity.reference)}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Title' value={activity.title} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Type' value={type} />

        {activity.type === "meeting" && (
          <>
            <ReadOnlyField className='col-span-12 lg:col-span-6' title='Status' value={status} />

            <ReadOnlyField className='col-span-12 lg:col-span-6' title='Link' value={activity.link} />

            <ReadOnlyField className='col-span-12 lg:col-span-4' title='Date' value={dateFormat1} />

            <ReadOnlyField className='col-span-12 lg:col-span-4' title='Start Time' value={startTime} />

            <ReadOnlyField className='col-span-12 lg:col-span-4' title='End Time' value={endTime} />
          </>
        )}

        <div className='col-span-12 flex flex-col justify-start'>
          <h2 className='mb-1 text-sm text-muted-foreground'>Body:</h2>
          <span className='inline-block h-full rounded bg-muted/80 p-3'>
            <HtmlContent value={activity.body} />
          </span>
        </div>
      </Card>
    </PageWrapper>
  )
}
