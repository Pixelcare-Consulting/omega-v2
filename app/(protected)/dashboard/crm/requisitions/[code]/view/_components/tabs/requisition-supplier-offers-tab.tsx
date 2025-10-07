"use client"

import { Card } from "@/components/ui/card"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { getSupplierOfferLineItemsByPartialMpn } from "@/actions/supplier-offer"
import RequisitionSupplierOffersLineItemList from "../requisition-supplier-offers-list"
import { useMemo } from "react"
import { add } from "mathjs"
import { formatCurrency, formatNumber } from "@/lib/formatter"
import ReadOnlyField from "@/components/read-only-field"

type RequisitionSupplierOffersTabProps = {
  supplierOffersLineItems: {
    data: Awaited<ReturnType<typeof getSupplierOfferLineItemsByPartialMpn>>
    isLoading: boolean
  }
}

export default function RequisitionSupplierOffersTab({ supplierOffersLineItems }: RequisitionSupplierOffersTabProps) {
  const totalQty = useMemo(() => {
    if (supplierOffersLineItems.isLoading) return 0

    return supplierOffersLineItems.data.reduce((acc, item) => {
      const qty = parseFloat(String(item?.qty))
      return add(acc, isNaN(qty) ? 0 : qty)
    }, 0)
  }, [JSON.stringify(supplierOffersLineItems)])

  const totalUnitPrice = useMemo(() => {
    if (supplierOffersLineItems.isLoading) return 0

    return supplierOffersLineItems.data.reduce((acc, item) => {
      const unitPrice = parseFloat(String(item?.unitPrice))
      return add(acc, isNaN(unitPrice) ? 0 : unitPrice)
    }, 0)
  }, [JSON.stringify(supplierOffersLineItems)])

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-x-3 gap-y-5'>
        <ReadOnlyFieldHeader
          className='col-span-12'
          title='Product Availabilities'
          description="Requisition's related product availabilities based on the requested item's manufacturer"
        />

        <ReadOnlyField className='col-span-12 md:col-span-6' title='Total Qty' value={formatNumber({ amount: totalQty, maxDecimal: 2 })} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6'
          title='Total Unit Price'
          value={formatCurrency({ amount: totalUnitPrice, minDecimal: 2 })}
        />

        <div className='col-span-12'>
          <RequisitionSupplierOffersLineItemList
            supplierOfferLineItems={supplierOffersLineItems.data}
            isLoading={supplierOffersLineItems.isLoading}
          />
        </div>
      </div>
    </Card>
  )
}
