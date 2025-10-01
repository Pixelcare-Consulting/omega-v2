"use client"

import { Button } from "@/components/ui/button"
import { useDialogStore } from "@/hooks/use-dialog"
import { Card } from "@/components/ui/card"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import RequisitionProductAvailabilityList from "../requisition-product-availabilities-list"
import { getProductAvailabilitiesBySupplierCode } from "@/actions/product-availability"
import { getRequisitionByCode } from "@/actions/requisition"

type RequisitionProductAvailabilitiesTabProps = {
  requisition: NonNullable<Awaited<ReturnType<typeof getRequisitionByCode>>>
  productAvailabilities: {
    data: Awaited<ReturnType<typeof getProductAvailabilitiesBySupplierCode>>
    isLoading: boolean
  }
}

export default function RequisitionProductAvailabilitiesTab({
  requisition,
  productAvailabilities,
}: RequisitionProductAvailabilitiesTabProps) {
  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-x-3 gap-y-5'>
        <ReadOnlyFieldHeader
          className='col-span-12'
          title='Product Availabilities'
          description="Requisition's related product availabilities based on the requested item's manufacturer"
        />

        <div className='col-span-12'>
          <RequisitionProductAvailabilityList
            reqCode={requisition.code}
            productAvailabilities={productAvailabilities.data}
            isLoading={productAvailabilities.isLoading}
          />
        </div>
      </div>
    </Card>
  )
}
