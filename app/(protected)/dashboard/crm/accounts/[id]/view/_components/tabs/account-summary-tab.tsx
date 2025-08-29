import { getAccountById } from "@/actions/account"
import ReadOnlyField from "@/components/read-only-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ACCOUNT_INDUSTRY_OPTIONS } from "@/schema/account"

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

        <ReadOnlyField className='col-span-12 lg:col-span-6' title='Industry' value={account?.industry || ""} />

        <ReadOnlyField className='col-span-12' title='Full Address' value={account.fullAddress || ""} />
      </div>
    </Card>
  )
}
