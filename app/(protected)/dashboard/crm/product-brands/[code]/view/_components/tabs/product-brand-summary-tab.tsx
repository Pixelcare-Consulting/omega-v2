"use client"

import { getProductBrandByCode } from "@/actions/product-brand"
import ReadOnlyField from "@/components/read-only-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Card } from "@/components/ui/card"

type ProductBrandSummaryTabProps = {
  productBrand: NonNullable<Awaited<ReturnType<typeof getProductBrandByCode>>>
}

export default function ProductBrandSummaryTab({ productBrand }: ProductBrandSummaryTabProps) {
  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Summary' description='Produdct brand summary details' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Name' value={productBrand.name} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Alias' value={productBrand.alias} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Sourcing Hints' value={productBrand.sourcingHints} />
      </div>
    </Card>
  )
}
