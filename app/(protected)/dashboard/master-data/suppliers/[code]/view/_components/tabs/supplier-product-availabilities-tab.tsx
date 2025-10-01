"use client"

import { Button } from "@/components/ui/button"
import { useDialogStore } from "@/hooks/use-dialog"
import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { getBpMasterByCardCode } from "@/actions/master-bp"
import ProductAvailabilityForm from "@/app/(protected)/dashboard/crm/product-availabilities/_components/product-availability-form"
import SupplierProductAvailabilityList from "../supplier-product-availabilities-list"

type SupplierProductAvailabilitiesTabProps = {
  supplier: NonNullable<Awaited<ReturnType<typeof getBpMasterByCardCode>>>
}

export default function SupplierProductAvailabilitiesTab({ supplier }: SupplierProductAvailabilitiesTabProps) {
  const { isOpen, setIsOpen, data, setData } = useDialogStore(["isOpen", "setIsOpen", "data", "setData"])

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

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-x-3 gap-y-5'>
        <ReadOnlyFieldHeader
          className='col-span-12'
          title='Product Availabilitys'
          description="Requisition's related product availabilities"
          actions={<Actions />}
        />

        <div className='col-span-12'>
          <SupplierProductAvailabilityList suppCode={supplier.CardCode} />
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
            <ProductAvailabilityForm isModal disableSupplierField productAvailability={data || null} suppCode={supplier.CardCode} />
          </Card>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
