import { getContactById } from "@/actions/contacts"
import ReadOnlyField from "@/components/read-only-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type ContactSummaryTabProps = {
  contact: NonNullable<Awaited<ReturnType<typeof getContactById>>>
}

export default function ContactSummaryTab({ contact }: ContactSummaryTabProps) {
  const STATUS_CLASSES: Record<string, string> = {
    green: "bg-green-50 text-green-600 ring-green-500/10",
    red: "bg-red-50 text-red-600 ring-red-500/10",
  }

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Summary' description='Contact summary details' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Name' value={contact.name} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Email' value={contact.email} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Phone' value={contact.phone} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Status'
          value={
            <span
              className={cn(
                `inline-flex w-fit items-center rounded-md px-2 py-1 text-center text-xs font-medium ring-1`,
                contact.isActive ? STATUS_CLASSES["green"] : STATUS_CLASSES["red"]
              )}
            >
              {contact.isActive ? "Active" : "Inactive"}
            </span>
          }
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Title' value={contact?.title || ""} />

        <ReadOnlyFieldHeader className='col-span-12' title='Connections' description='Contact connections details' />

        <ReadOnlyField
          className='col-span-12'
          title='Accounts'
          value={
            <div className='flex flex-wrap items-center gap-1.5'>
              {contact.accountContacts.map((c, i) => (
                <span
                  key={i}
                  className='inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-center text-xs font-medium text-red-600 ring-1 ring-red-500/10'
                >
                  {c.account.name}
                </span>
              ))}
            </div>
          }
        />

        <ReadOnlyField
          className='col-span-12'
          title='Leads'
          value={
            <div className='flex flex-wrap items-center gap-1.5'>
              {contact.leadContacts.map((c, i) => (
                <span
                  key={i}
                  className='inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-center text-xs font-medium text-red-600 ring-1 ring-red-500/10'
                >
                  {c.lead.name}
                </span>
              ))}
            </div>
          }
        />

        <ReadOnlyFieldHeader className='col-span-12' title='Address' description='Contact full address details' />

        <ReadOnlyField className='col-span-12' title='Street' value={contact?.street || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Street No.' value={contact?.streetNo || ""} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Building/Floor/Room'
          value={contact?.buildingFloorRoom || ""}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Block' value={contact?.block || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='City' value={contact?.city || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Zip Code' value={contact?.zipCode || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='County' value={contact?.county || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='State' value={contact?.state || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Country' value={contact?.country || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='GLN' value={contact?.gln || ""} />
      </div>
    </Card>
  )
}
