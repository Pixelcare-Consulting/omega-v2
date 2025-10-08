"use client"

import { getProductCommodityByCode } from "@/actions/product-commodity"
import ReadOnlyField from "@/components/read-only-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Card } from "@/components/ui/card"

type ProductCommoditySummaryTabProps = {
  productCommodity: NonNullable<Awaited<ReturnType<typeof getProductCommodityByCode>>>
}

export default function ProductCommoditySummaryTab({ productCommodity }: ProductCommoditySummaryTabProps) {
  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Summary' description='Produdct commodity summary details' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Name' value={productCommodity.name} />
      </div>
    </Card>
  )
}
