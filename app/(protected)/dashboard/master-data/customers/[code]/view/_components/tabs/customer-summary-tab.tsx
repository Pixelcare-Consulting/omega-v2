import { getBpMasterByCardCode } from "@/actions/sap-bp-master"
import { Badge } from "@/components/badge"
import ReadOnlyField from "@/components/read-only-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Card } from "@/components/ui/card"
import { format, parse } from "date-fns"

type CustomerSummaryTabProps = {
  customer: NonNullable<Awaited<ReturnType<typeof getBpMasterByCardCode>>>
}

export default function CustomerSummaryTab({ customer }: CustomerSummaryTabProps) {
  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Summary' description='Customer summary details' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Name' value={customer.CardName} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Code' value={customer.CardCode} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Group'
          value={customer?.GroupName ? <Badge variant='soft-blue'>{customer.GroupName}</Badge> : null}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Contact Person' value={customer?.CntctPrsn || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Phone' value={customer?.Phone1 || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Currency' value={customer?.Currency || ""} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Source'
          value={customer?.source === "portal" ? <Badge variant='soft-amber'>Portal</Badge> : <Badge variant='soft-green'>SAP</Badge>}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Payment Group' value={customer?.PymntGroup || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='QB Related' value={customer?.U_OMEG_QBRelated || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Vendor Code' value={customer?.U_VendorCode || ""} />

        <ReadOnlyFieldHeader className='col-span-12' title='Address' description='Customer full address details' />

        <ReadOnlyField className='col-span-12 md:col-span-6' title='Address' value={customer?.Address || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6' title='Zip Code' value={customer?.ZipCode || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6' title='Mail Address' value={customer?.MailAddres || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6' title='Mail Zip Code' value={customer?.MailZipCod || ""} />

        <ReadOnlyFieldHeader
          className='col-span-12'
          title='Record Details'
          description='Details of when the record was created and updated.'
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Created'
          value={format(parse(customer.CreateDate, "yyyyMMdd", new Date()), "PP")}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Updated'
          value={format(parse(customer.UpdateDate, "yyyyMMdd", new Date()), "PP")}
        />
      </div>
    </Card>
  )
}
