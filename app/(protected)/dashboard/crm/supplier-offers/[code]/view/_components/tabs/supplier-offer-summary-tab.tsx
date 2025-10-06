"use client"

import { getSupplierOfferByCode } from "@/actions/supplier-offer"
import ReadOnlyField from "@/components/read-only-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Card } from "@/components/ui/card"
import { format, isValid } from "date-fns"

type SupplierOfferSummaryTabProps = {
  supplierOffer: NonNullable<Awaited<ReturnType<typeof getSupplierOfferByCode>>>
}

export default function SupplierOfferSummaryTab({ supplierOffer }: SupplierOfferSummaryTabProps) {
  const listDate = isValid(supplierOffer.listDate) ? format(supplierOffer.listDate, "MM-dd-yyyy") : ""

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Summary' description='Supplier offer summary details' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='List Date' value={listDate} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Supplier'
          value={supplierOffer.supplier?.CardName || ""}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='List Owner'
          value={supplierOffer?.listOwner?.name || supplierOffer?.listOwner?.email || ""}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='File Name' value={supplierOffer.fileName || ""} />
      </div>
    </Card>
  )
}
