import { getLeadById } from "@/actions/lead"
import ReadOnlyField from "@/components/read-only-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LEAD_STATUSES_COLORS, LEAD_STATUSES_OPTIONS } from "@/schema/lead"

type LeadSummaryTabsProps = {
  lead: NonNullable<Awaited<ReturnType<typeof getLeadById>>>
}

export default function LeadSummaryTab({ lead }: LeadSummaryTabsProps) {
  const getStatusBadge = (status: string) => {
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
        <span className={cn(`inline-flex items-center rounded-md px-2 py-1 text-center text-xs font-medium ring-1`, STATUS_CLASSES[color])}>
          {label}
        </span>
      </div>
    )
  }

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Summary' description='Lead summary details' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Name' value={lead.name} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Email' value={lead.email} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Phone' value={lead.phone} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Status' value={getStatusBadge(lead.status)} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Title' value={lead?.title || ""} />

        <ReadOnlyFieldHeader className='col-span-12' title='Address' description='Lead full address details' />

        <ReadOnlyField className='col-span-12' title='Street' value={lead?.street || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Street No.' value={lead?.streetNo || ""} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Building/Floor/Room'
          value={lead?.buildingFloorRoom || ""}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Block' value={lead?.block || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='City' value={lead?.city || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Zip Code' value={lead?.zipCode || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='County' value={lead?.county || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='State' value={lead?.state || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Country' value={lead?.country || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='GLN' value={lead?.gln || ""} />
      </div>
    </Card>
  )
}
