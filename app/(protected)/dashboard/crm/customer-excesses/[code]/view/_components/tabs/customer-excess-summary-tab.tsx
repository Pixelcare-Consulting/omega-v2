"use client"

import { getCustomerExcessByCode } from "@/actions/customer-excess"
import ReadOnlyField from "@/components/read-only-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Card } from "@/components/ui/card"
import { format, isValid } from "date-fns"

type CustomerExcessSummaryTabProps = {
  customerExcess: NonNullable<Awaited<ReturnType<typeof getCustomerExcessByCode>>>
}

export default function CustomerExcessSummaryTab({ customerExcess }: CustomerExcessSummaryTabProps) {
  const listDate = isValid(customerExcess.listDate) ? format(customerExcess.listDate, "MM-dd-yyyy") : ""

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Summary' description='Customer excess summary details' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='List Date' value={listDate} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-4'
          title='Customer'
          value={customerExcess.customer?.CardName || ""}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-4'
          title='List Owner'
          value={customerExcess?.listOwner?.name || customerExcess?.listOwner?.email || ""}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='File Name' value={customerExcess.fileName || ""} />
      </div>
    </Card>
  )
}
