import { format, parse } from "date-fns"

import { getItemsByItemCode } from "@/actions/master-item"
import { Badge, BadgeProps } from "@/components/badge"
import ReadOnlyField from "@/components/read-only-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SYNC_STATUSES_COLORS, SYNC_STATUSES_OPTIONS } from "@/constant/common"

type ItemSummaryTabProps = {
  item: NonNullable<Awaited<ReturnType<typeof getItemsByItemCode>>>
}

export default function ItemSummaryTab({ item }: ItemSummaryTabProps) {
  const SyncStatus = ({ status }: { status: string }) => {
    const label = SYNC_STATUSES_OPTIONS.find((item) => item.value === status)?.label
    const color = SYNC_STATUSES_COLORS.find((item) => item.value === status)?.color

    if (!status || !label || !color) return null

    return <Badge variant={color as BadgeProps["variant"]}>{label}</Badge>
  }

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Summary' description='Item summary details' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Description' value={item.ItemName} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Internal ID' value={item.ItemCode} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='MPN' value='' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='MSL' value='' />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Group'
          value={item?.ItmsGrpNam ? <Badge variant='soft-blue'>{item.ItmsGrpNam}</Badge> : null}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Manufacturer' value={item?.FirmName || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Unit of Measure' value={item?.BuyUnitMsr || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Revenue Account' value={item?.IncomeAcct || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Default Warehouse' value={item?.DfltWH || ""} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Country of Origin'
          value={item?.CountryOrg || ""}
          description='Coutry code of origin'
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Customs Group' value={""} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Source'
          value={item?.source === "portal" ? <Badge variant='soft-amber'>Portal</Badge> : <Badge variant='soft-green'>SAP</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Sync Status'
          value={<SyncStatus status={item.syncStatus} />}
        />

        <Separator className='col-span-12' />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='VAT Liable'
          value={item?.VATLiable === "Y" ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Sales Item'
          value={item?.SellItem === "Y" ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Purchase Item'
          value={item?.PrchseItem === "Y" ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Inventory Item'
          value={item?.InvntItem === "Y" ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Manage Batch Number'
          value={item?.ManBtchNum === "Y" ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />
      </div>
    </Card>
  )
}
