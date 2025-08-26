import { getBpMasterByCardCode } from "@/actions/master-bp"
import { Badge, BadgeProps } from "@/components/badge"
import ReadOnlyField from "@/components/read-only-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Separator } from "@/components/ui/separator"
import { SYNC_STATUSES_COLORS, SYNC_STATUSES_OPTIONS } from "@/constant/common"
import { ADDRESS_TYPE_OPTIONS } from "@/schema/master-address"

type AddressReadOnlyViewProps = {
  address: NonNullable<Awaited<ReturnType<typeof getBpMasterByCardCode>>>["addresses"][number]
}

export default function AddressReadOnlyView({ address }: AddressReadOnlyViewProps) {
  const addressType = ADDRESS_TYPE_OPTIONS.find((item) => item.value === address.AddrType)?.label

  const SyncStatus = ({ status }: { status: string }) => {
    const label = SYNC_STATUSES_OPTIONS.find((item) => item.value === status)?.label
    const color = SYNC_STATUSES_COLORS.find((item) => item.value === status)?.color

    if (!status || !label || !color) return null

    return <Badge variant={color as BadgeProps["variant"]}>{label}</Badge>
  }

  return (
    <div className='grid grid-cols-12 gap-5'>
      <ReadOnlyFieldHeader className='col-span-12' title='Address Details' description="Supplier's address details" />

      <ReadOnlyField className='col-span-12 md:col-span-6' title='Code' value={address.CardCode} />

      <ReadOnlyField className='col-span-12 md:col-span-6' title='Type' value={addressType || ""} />

      <Separator className='col-span-12' />

      <ReadOnlyField className='col-span-12' title='Street 1' value={address.Street || ""} />

      <ReadOnlyField className='col-span-12' title='Street 2' value={address.Address2 || ""} />

      <ReadOnlyField className='col-span-12' title='Street 3' value={address.Address3 || ""} />

      <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Street No.' value={address.StreetNo || ""} />

      <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Building/Floor/Room' value={address.Building || ""} />

      <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Block' value={address.Block || ""} />

      <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='City' value={address.City || ""} />

      <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Zip Code' value={address.ZipCode || ""} />

      <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='County' value={address.County || ""} />

      <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Country' value={address.countryName || ""} />

      <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='State' value={address.stateName || ""} />

      <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='GLN' value={address.GlblLocNum || ""} />

      <ReadOnlyField
        className='col-span-12 md:col-span-6 lg:col-span-3'
        title='Source'
        value={address?.source === "portal" ? <Badge variant='soft-amber'>Portal</Badge> : <Badge variant='soft-green'>SAP</Badge>}
      />

      <ReadOnlyField
        className='col-span-12 md:col-span-6 lg:col-span-3'
        title='Sync Status'
        value={<SyncStatus status={address.syncStatus} />}
      />
    </div>
  )
}
