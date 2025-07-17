import { getBpMasterByCardCode } from "@/actions/bp-master"
import { Badge } from "@/components/badge"
import ReadOnlyField from "@/components/read-only-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Card } from "@/components/ui/card"
import { format, parse } from "date-fns"

type SupplierSummaryTabProps = {
  supplier: NonNullable<Awaited<ReturnType<typeof getBpMasterByCardCode>>>
}

export default function SupplierSummaryTab({ supplier }: SupplierSummaryTabProps) {
  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Summary' description='Supplier summary details' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Name' value={supplier.CardName} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Code' value={supplier.CardCode} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Group'
          value={supplier?.GroupName ? <Badge variant='soft-blue'>{supplier.GroupName}</Badge> : null}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Contact Person' value={supplier?.CntctPrsn || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Phone' value={supplier?.Phone1 || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Currency' value={supplier?.Currency || ""} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Source'
          value={supplier?.source === "portal" ? <Badge variant='soft-amber'>Portal</Badge> : <Badge variant='soft-green'>SAP</Badge>}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Payment Group' value={supplier?.PymntGroup || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='QB Related' value={supplier?.U_OMEG_QBRelated || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Vendor Code' value={supplier?.U_VendorCode || ""} />

        <ReadOnlyFieldHeader className='col-span-12' title='Address' description='Supplier full address details' />

        <ReadOnlyField className='col-span-12 md:col-span-6' title='Address' value={supplier?.Address || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6' title='Zip Code' value={supplier?.ZipCode || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6' title='Mail Address' value={supplier?.MailAddres || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6' title='Mail Zip Code' value={supplier?.MailZipCod || ""} />

        <ReadOnlyFieldHeader
          className='col-span-12'
          title='Record Details'
          description='Details of when the record was created and updated.'
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Created'
          value={format(parse(supplier.CreateDate, "yyyyMMdd", new Date()), "PP")}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Updated'
          value={format(parse(supplier.UpdateDate, "yyyyMMdd", new Date()), "PP")}
        />
      </div>
    </Card>
  )
}
