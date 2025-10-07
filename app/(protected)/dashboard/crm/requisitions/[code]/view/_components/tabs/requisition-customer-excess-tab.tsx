"use client"

import { Card } from "@/components/ui/card"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { getCustomerExcessLineItemsByPartialMpn } from "@/actions/customer-excess"
import RequisitionCustomerExcessLineItemList from "../requisition-customer-excess-list"
import { useMemo } from "react"
import { add } from "mathjs"
import { formatCurrency, formatNumber } from "@/lib/formatter"
import ReadOnlyField from "@/components/read-only-field"

type RequisitionCustomerExcessTabProps = {
  customerExcessLineItems: {
    data: Awaited<ReturnType<typeof getCustomerExcessLineItemsByPartialMpn>>
    isLoading: boolean
  }
}

export default function RequisitionCustomerExcessTab({ customerExcessLineItems }: RequisitionCustomerExcessTabProps) {
  const totalQtyOnHand = useMemo(() => {
    if (customerExcessLineItems.isLoading) return 0

    return customerExcessLineItems.data.reduce((acc, item) => {
      const qtyOnHand = parseFloat(String(item?.qtyOnHand))
      return add(acc, isNaN(qtyOnHand) ? 0 : qtyOnHand)
    }, 0)
  }, [JSON.stringify(customerExcessLineItems)])

  const totalQtyOrdered = useMemo(() => {
    if (customerExcessLineItems.isLoading) return 0

    return customerExcessLineItems.data.reduce((acc, item) => {
      const qtyOrdered = parseFloat(String(item?.qtyOrdered))
      return add(acc, isNaN(qtyOrdered) ? 0 : qtyOrdered)
    }, 0)
  }, [JSON.stringify(customerExcessLineItems)])

  const totalUnitPrice = useMemo(() => {
    if (customerExcessLineItems.isLoading) return 0

    return customerExcessLineItems.data.reduce((acc, item) => {
      const unitPrice = parseFloat(String(item?.unitPrice))
      return add(acc, isNaN(unitPrice) ? 0 : unitPrice)
    }, 0)
  }, [JSON.stringify(customerExcessLineItems)])

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-x-3 gap-y-5'>
        <ReadOnlyFieldHeader
          className='col-span-12'
          title='Product Availabilities'
          description="Requisition's related product availabilities based on the requested item's manufacturer"
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-4'
          title='Total Qty On Hand'
          value={formatNumber({ amount: totalQtyOnHand, maxDecimal: 2 })}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-4'
          title='Total Qty Ordered'
          value={formatNumber({ amount: totalQtyOrdered, maxDecimal: 2 })}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-4'
          title='Total Unit Price'
          value={formatCurrency({ amount: totalUnitPrice, minDecimal: 2 })}
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
