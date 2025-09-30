"use client"

import { getManufacturerByCodeClient } from "@/actions/manufacturer"
import { getItemGroupByCodeClient } from "@/actions/master-item"
import { getProductAvailabilityByCode } from "@/actions/product-availability"
import { Badge } from "@/components/badge"
import ReadOnlyField from "@/components/read-only-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Card } from "@/components/ui/card"
import { useAction } from "next-safe-action/hooks"
import { useEffect } from "react"

type ProductAvailabilitySummaryTabProps = {
  productAvailability: NonNullable<Awaited<ReturnType<typeof getProductAvailabilityByCode>>>
}

export default function ProductAvailabilitySummaryTab({ productAvailability }: ProductAvailabilitySummaryTabProps) {
  const manufacturerCode = productAvailability.manufacturerCode
  const itemGroupCode = productAvailability?.itemGroupCode

  const {
    execute: getManufacturerByCodeExec,
    isExecuting: isManufacturerLoading,
    result: { data: manufacturer },
  } = useAction(getManufacturerByCodeClient)

  const {
    execute: getItemGroupByCodeExec,
    isExecuting: isItemGroupLoading,
    result: { data: itemGroup },
  } = useAction(getItemGroupByCodeClient)

  //* trigger fetching of manufactuer
  useEffect(() => {
    if (manufacturerCode) getManufacturerByCodeExec({ code: manufacturerCode })
  }, [manufacturerCode])

  //* trigger fetching of item group
  useEffect(() => {
    if (itemGroupCode) getItemGroupByCodeExec({ code: itemGroupCode })
  }, [itemGroupCode])

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Summary' description='Produdct availability summary details' />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-4'
          title='Supplier'
          value={productAvailability?.supplier?.CardName || ""}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-4'
          title='Manufacturer'
          value={manufacturer?.ManufacturerName || ""}
          isLoading={isManufacturerLoading}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-4'
          title='Commodity'
          value={itemGroup?.GroupName || ""}
          isLoading={isItemGroupLoading}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Authorized Disti'
          value={productAvailability.isAuthorizedDisti ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Franchise Disti'
          value={productAvailability.isFranchiseDisti ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='MFR Direct'
          value={productAvailability.isMfrDirect ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Special Pricing'
          value={productAvailability.isSpecialPricing ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Strong Brand'
          value={productAvailability.isStrongBrand ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField className='col-span-12 whitespace-pre-line' title='Notes' value={productAvailability.notes || ""} />
      </div>
    </Card>
  )
}
