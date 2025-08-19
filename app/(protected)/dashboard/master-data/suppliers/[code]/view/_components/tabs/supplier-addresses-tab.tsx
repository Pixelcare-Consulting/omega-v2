"use client"

import { getBpMasterByCardCode } from "@/actions/master-bp"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useDialogStore } from "@/hooks/use-dialog"
import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import SupplierAddressesList from "../supplier-addresses-list"

type SupplierAddressesTabProps = {
  supplier: NonNullable<Awaited<ReturnType<typeof getBpMasterByCardCode>>>
}

export default function SupplierAddressesTab({ supplier }: SupplierAddressesTabProps) {
  const addresses = supplier.addresses || []
  const billToDef = supplier.BillToDef
  const shipToDef = supplier.ShipToDef

  const { isOpen, setIsOpen, data, setData } = useDialogStore(["isOpen", "setIsOpen", "data", "setData"])

  const Actions = () => {
    const handleActionClick = () => {
      setIsOpen(true)
      setData(null)
    }

    return (
      <Button variant='outline-primary' onClick={handleActionClick}>
        Add Address
      </Button>
    )
  }

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-x-3 gap-y-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Addresses' description="Supplier's related addresses" actions={<Actions />} />

        <div className='col-span-12'>
          <SupplierAddressesList addresses={addresses} billToDef={billToDef} shipToDef={shipToDef} />
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='max-h-[85vh] overflow-auto sm:max-w-5xl'>
          <DialogHeader>
            <DialogTitle>Add address for supplier #{supplier.CardCode}</DialogTitle>
            <DialogDescription>Fill in the form to create a new address for this supplier.</DialogDescription>
          </DialogHeader>

          <Card className='p-3'></Card>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
