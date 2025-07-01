import { getLeadById } from "@/actions/lead"
import { Icons } from "@/components/icons"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import ActivityFormDrawer from "./activity-form-drawer"

export type Lead = NonNullable<Awaited<ReturnType<typeof getLeadById>>>
export type Activity = Lead["activities"][number]

type LeadActivitiesTabProps = {
  lead: NonNullable<Awaited<ReturnType<typeof getLeadById>>>
}

export default function LeadActivitiesTab({ lead }: LeadActivitiesTabProps) {
  const [activity, setActivity] = useState<Activity | null>(null)

  const Actions = () => {
    return (
      <div className='flex items-center gap-2'>
        <Button className='space-x-2' type='button' variant='ghost'>
          <Icons.mailPlus className='size-4' />
          <span>New Email</span>

          <span className='inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-center text-xs font-medium text-purple-600 ring-1 ring-purple-500/10'>
            Coming Soon
          </span>
        </Button>

        {lead && <ActivityFormDrawer activity={activity} setActivity={setActivity} leadId={lead.id} />}
      </div>
    )
  }

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Activities' description='Lead activities details' actions={<Actions />} />
      </div>
    </Card>
  )
}
