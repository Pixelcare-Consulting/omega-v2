"use client"

import { Button } from "@/components/ui/button"
import { useDialogStore } from "@/hooks/use-dialog"
import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { getBpMasterByCardCode } from "@/actions/master-bp"
import ProductAvailabilityForm from "@/app/(protected)/dashboard/crm/product-availabilities/_components/product-availability-form"
import SupplierProductAvailabilityList from "../supplier-product-availabilities-list"
import { useAction } from "next-safe-action/hooks"
import { getProductAvailabilitiesBySupplierCodeClient } from "@/actions/product-availability"
import { useCallback, useEffect } from "react"

type SupplierProductAvailabilitiesTabProps = {
  supplier: NonNullable<Awaited<ReturnType<typeof getBpMasterByCardCode>>>
}

export default function SupplierProductAvailabilitiesTab({ supplier }: SupplierProductAvailabilitiesTabProps) {
  const suppCode = supplier.CardCode

  const { isOpen, setIsOpen, data, setData } = useDialogStore(["isOpen", "setIsOpen", "data", "setData"])

  const {
    execute,
    isExecuting,
    result: { data: productAvailabilities },
  } = useAction(getProductAvailabilitiesBySupplierCodeClient)

  const callback = useCallback(() => {
    execute({ supplierCode: suppCode })
  }, [suppCode])

  const Actions = () => {
    const handleActionClick = () => {
      setIsOpen(true)
      setData(null)
    }

    return (
      <Button variant='outline-primary' onClick={handleActionClick}>
        Add Product Availability
      </Button>
    )
  }

  //* trigger fetch product availabilities
  useEffect(() => {
    if (suppCode) execute({ supplierCode: suppCode })
  }, [suppCode])

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-x-3 gap-y-5'>
        <ReadOnlyFieldHeader
          className='col-span-12'
          title='Product Availabilities'
          description="Requisition's related product availabilities"
          actions={<Actions />}
        />

        <div className='col-span-12'>
          <SupplierProductAvailabilityList
            suppCode={supplier.CardCode}
            productAvailabilities={productAvailabilities || []}
            isLoading={isExecuting}
            callback={callback}
          />
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='max-h-[85vh] overflow-auto sm:max-w-5xl'>
          <DialogHeader>
            <DialogTitle>Add product availability for supplier #{supplier.CardCode}</DialogTitle>
            <DialogDescription>
              Fill in the form to {data ? "edit" : "create a new"} product availability for this supplier.
            </DialogDescription>
          </DialogHeader>

          <Card className='p-3'>
            <ProductAvailabilityForm
              isModal
              disableSupplierField
              productAvailability={data || null}
              suppCode={supplier.CardCode}
              callback={callback}
            />
          </Card>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
