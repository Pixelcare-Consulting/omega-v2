import { format, parse } from "date-fns"

import { getItemsByItemCode } from "@/actions/item-master"
import { Badge } from "@/components/badge"
import ReadOnlyField from "@/components/read-only-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Card } from "@/components/ui/card"

type ItemSummaryTabProps = {
  item: NonNullable<Awaited<ReturnType<typeof getItemsByItemCode>>>
}

export default function ItemSummaryTab({ item }: ItemSummaryTabProps) {
  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Summary' description='Item summary details' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Description' value={item.ItemName} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Internal ID' value={item.ItemCode} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='MPN' value='' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='MHL' value='' />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Group'
          value={item?.ItmsGrpNam ? <Badge variant='soft-blue'>{item.ItmsGrpNam}</Badge> : null}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Manufacturer' value={item?.FirmName || ""} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Manage Batch Number'
          value={item?.ManBtchNum === "Y" ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Source'
          value={item?.source === "portal" ? <Badge variant='soft-amber'>Portal</Badge> : <Badge variant='soft-green'>SAP</Badge>}
        />

        <ReadOnlyFieldHeader
          className='col-span-12'
          title='Record Details'
          description='Details of when the record was created and updated.'
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Created'
          value={format(parse(item.CreateDate, "yyyyMMdd", new Date()), "PP")}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Updated'
          value={format(parse(item.UpdateDate, "yyyyMMdd", new Date()), "PP")}
        />
      </div>
    </Card>
  )
}
