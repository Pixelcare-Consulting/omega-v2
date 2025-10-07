"use client"

import { Card } from "@/components/ui/card"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { getCustomerExcessLineItemsByPartialMpn } from "@/actions/customer-excess"
import RequisitionCustomerExcessLineItemList from "../requisition-customer-excess-list"

type RequisitionCustomerExcessTabProps = {
  customerExcessLineItems: {
    data: Awaited<ReturnType<typeof getCustomerExcessLineItemsByPartialMpn>>
    isLoading: boolean
  }
}

export default function RequisitionCustomerExcessTab({ customerExcessLineItems }: RequisitionCustomerExcessTabProps) {
  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-x-3 gap-y-5'>
        <ReadOnlyFieldHeader
          className='col-span-12'
          title='Product Availabilities'
          description="Requisition's related product availabilities based on the requested item's manufacturer"
        />

        <div className='col-span-12'>
          <RequisitionCustomerExcessLineItemList
            customerExcessLineItems={customerExcessLineItems.data}
            isLoading={customerExcessLineItems.isLoading}
          />
        </div>
      </div>
    </Card>
  )
}
