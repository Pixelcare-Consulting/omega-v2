import { getBpMasterByCardCode } from "@/actions/master-bp"
import { Badge, BadgeProps } from "@/components/badge"
import ReadOnlyField from "@/components/read-only-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { SYNC_STATUSES_COLORS, SYNC_STATUSES_OPTIONS } from "@/constant/common"

type ContactReadOnlyViewProps = {
  contact: NonNullable<Awaited<ReturnType<typeof getBpMasterByCardCode>>>["contacts"][number]
}

export default function ContactReadOnlyView({ contact }: ContactReadOnlyViewProps) {
  const SyncStatus = ({ status }: { status: string }) => {
    const label = SYNC_STATUSES_OPTIONS.find((item) => item.value === status)?.label
    const color = SYNC_STATUSES_COLORS.find((item) => item.value === status)?.color

    if (!status || !label || !color) return null

    return <Badge variant={color as BadgeProps["variant"]}>{label}</Badge>
  }

  return (
    <div className='grid grid-cols-12 gap-5'>
      <ReadOnlyFieldHeader className='col-span-12' title='Contact Details' description="Supplier's contact details" />

      <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Code' value={contact.CardCode} />

      <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='First Name' value={contact.FirstName || ""} />

      <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Last Name' value={contact.LastName || ""} />

      <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Title' value={contact.Title || ""} />

      <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Position' value={contact.Position || ""} />

      <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Phone' value={contact.Cellolar || ""} />

      <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Email' value={contact.E_MailL || ""} />

      <ReadOnlyField
        className='col-span-12 md:col-span-6 lg:col-span-3'
        title='Source'
        value={contact?.source === "portal" ? <Badge variant='soft-amber'>Portal</Badge> : <Badge variant='soft-green'>SAP</Badge>}
      />

      <ReadOnlyField
        className='col-span-12 md:col-span-6 lg:col-span-3'
        title='Sync Status'
        value={<SyncStatus status={contact.syncStatus} />}
      />
    </div>
  )
}
