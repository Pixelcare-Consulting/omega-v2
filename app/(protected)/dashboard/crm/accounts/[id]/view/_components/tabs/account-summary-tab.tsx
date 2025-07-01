import { getAccountById } from "@/actions/account"
import ReadOnlyField from "@/components/read-only-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { INDUSTRY_OPTIONS } from "@/schema/account"

type AccountSummaryTabProps = {
  account: NonNullable<Awaited<ReturnType<typeof getAccountById>>>
}

export default function AccountSummaryTab({ account }: AccountSummaryTabProps) {
  const STATUS_CLASSES: Record<string, string> = {
    green: "bg-green-50 text-green-600 ring-green-500/10",
    red: "bg-red-50 text-red-600 ring-red-500/10",
  }

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Summary' description='Account summary details' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Name' value={account?.name || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Email' value={account?.email || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Phone' value={account?.phone || ""} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Status'
          value={
            <span
              className={cn(
                `inline-flex w-fit items-center rounded-md px-2 py-1 text-center text-xs font-medium ring-1`,
                account.isActive ? STATUS_CLASSES["green"] : STATUS_CLASSES["red"]
              )}
            >
              {account.isActive ? "Active" : "Inactive"}
            </span>
          }
        />

        <ReadOnlyField className='col-span-12 lg:col-span-6' title='Website' value={account?.website || ""} />

        <ReadOnlyField
          className='col-span-12 lg:col-span-6'
          title='Industry'
          value={
            <div className='flex flex-wrap items-center gap-1.5'>
              {account.industry.map((ind, i) => (
                <span
                  key={i}
                  className='inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-center text-xs font-medium text-red-600 ring-1 ring-red-500/10'
                >
                  {INDUSTRY_OPTIONS.find((item) => item.value === ind)?.label || ""}
                </span>
              ))}
            </div>
          }
        />

        <ReadOnlyFieldHeader className='col-span-12' title='Address' description='Account full address details' />

        <ReadOnlyField className='col-span-12' title='Street' value={account?.street || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Street No.' value={account?.streetNo || ""} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Building/Floor/Room'
          value={account?.buildingFloorRoom || ""}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Block' value={account?.block || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='City' value={account?.city || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Zip Code' value={account?.zipCode || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='County' value={account?.county || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='State' value={account?.state || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Country' value={account?.country || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='GLN' value={account?.gln || ""} />
      </div>
    </Card>
  )
}
