"use client"

import { Button } from "@/components/ui/button"
import { useDialogStore } from "@/hooks/use-dialog"
import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { getSupplierOffersBySupplierCode } from "@/actions/supplier-offer"
import { getBpMasterByCardCode } from "@/actions/master-bp"
import SupplierOfferForm from "@/app/(protected)/dashboard/crm/supplier-offers/_components/supplier-offer-form"
import SupplierOffersList from "../supplier-offers-list"

type SupplierOffersTabProps = {
  supplier: NonNullable<Awaited<ReturnType<typeof getBpMasterByCardCode>>>
  offers: {
    data: Awaited<ReturnType<typeof getSupplierOffersBySupplierCode>>
    isLoading: boolean
    callback: () => void
  }
}

export default function SupplierOffersTab({ supplier, offers }: SupplierOffersTabProps) {
  const { isOpen, setIsOpen, data, setData } = useDialogStore(["isOpen", "setIsOpen", "data", "setData"])

  const Actions = () => {
    const handleActionClick = () => {
      setIsOpen(true)
      setData(null)
    }

    return (
      <Button variant='outline-primary' onClick={handleActionClick}>
        Add Supplier Offer
      </Button>
    )
  }

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-x-3 gap-y-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Excess List' description="Supplier's related offers" actions={<Actions />} />

        <div className='col-span-12'>
          <SupplierOffersList
            suppCode={supplier.CardCode}
            supplierOffers={offers.data}
            isLoading={offers.isLoading}
            callback={() => offers.callback()}
          />
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='max-h-[85vh] overflow-auto sm:max-w-5xl'>
          <DialogHeader>
            <DialogTitle>Add supplier offer for supplier #{supplier.CardCode}</DialogTitle>
            <DialogDescription>Fill in the form to {data ? "edit" : "create a new"} supplier offer for this supplier.</DialogDescription>
          </DialogHeader>

          <Card className='p-3'>
            <SupplierOfferForm
              isModal
              disableSupplierField
              supplierOffer={data || null}
              suppCode={supplier.CardCode}
              callback={() => offers.callback()}
            />
          </Card>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
