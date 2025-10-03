"use client"

import { getCustomerExcessByCode, LineItemsJSONData } from "@/actions/customer-excess"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useDialogStore } from "@/hooks/use-dialog"
import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import LineItemForm from "../line-item-form"

type CustomerExcessLineItemsTabProps = {
  customerExcess: NonNullable<Awaited<ReturnType<typeof getCustomerExcessByCode>>>
}

export default function CustomerExcessLineItemsTab({ customerExcess }: CustomerExcessLineItemsTabProps) {
  const lineItems = (customerExcess.lineItems || []) as LineItemsJSONData

  const { isOpen, setIsOpen, data, setData } = useDialogStore(["isOpen", "setIsOpen", "data", "setData"])

  const Actions = () => {
    const handleActionClick = () => {
      setIsOpen(true)
      setData(null)
    }

    return (
      <Button variant='outline-primary' onClick={handleActionClick}>
        Add Line Item
      </Button>
    )
  }

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-x-3 gap-y-5'>
        <ReadOnlyFieldHeader
          className='col-span-12'
          title='Line Items'
          description="Customer excess's line items list"
          actions={<Actions />}
        />

        <div className='col-span-12'></div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='max-h-[85vh] overflow-auto sm:max-w-5xl'>
          <DialogHeader>
            <DialogTitle>Add line item for customer excess #{customerExcess.code}</DialogTitle>
            <DialogDescription>Fill in the form to {data ? "edit" : "add a new"} line item for this customer excess.</DialogDescription>
          </DialogHeader>

          <Card className='p-3'>
            <LineItemForm customerExcessId={customerExcess.id} lineItems={lineItems} />
          </Card>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
