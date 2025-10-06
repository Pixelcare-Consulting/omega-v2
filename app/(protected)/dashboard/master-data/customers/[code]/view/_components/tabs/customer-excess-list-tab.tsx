"use client"

import { Button } from "@/components/ui/button"
import { useDialogStore } from "@/hooks/use-dialog"
import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { getCustomerExcessesByCustomerCode } from "@/actions/customer-excess"
import { getBpMasterByCardCode } from "@/actions/master-bp"
import CustomerExcessForm from "@/app/(protected)/dashboard/crm/customer-excesses/_components/customer-excess-form"

type CustomerExcessListTabProps = {
  customer: NonNullable<Awaited<ReturnType<typeof getBpMasterByCardCode>>>
  excesses: {
    data: Awaited<ReturnType<typeof getCustomerExcessesByCustomerCode>>
    isLoading: boolean
    callback: () => void
  }
}

export default function CustomerExcessListTab({ customer, excesses }: CustomerExcessListTabProps) {
  const { isOpen, setIsOpen, data, setData } = useDialogStore(["isOpen", "setIsOpen", "data", "setData"])

  const Actions = () => {
    const handleActionClick = () => {
      setIsOpen(true)
      setData(null)
    }

    return (
      <Button variant='outline-primary' onClick={handleActionClick}>
        Add Customer Excess
      </Button>
    )
  }

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-x-3 gap-y-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Excess List' description="Customer's related excess" actions={<Actions />} />

        <div className='col-span-12'></div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='max-h-[85vh] overflow-auto sm:max-w-5xl'>
          <DialogHeader>
            <DialogTitle>Add customer excess for customer #{customer.CardCode}</DialogTitle>
            <DialogDescription>Fill in the form to {data ? "edit" : "create a new"} customer excess for this customer.</DialogDescription>
          </DialogHeader>

          <Card className='p-3'>
            <CustomerExcessForm
              isModal
              disableCustomerField
              customerExcess={data || null}
              custCode={customer.CardCode}
              callback={() => excesses.callback()}
            />
          </Card>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
