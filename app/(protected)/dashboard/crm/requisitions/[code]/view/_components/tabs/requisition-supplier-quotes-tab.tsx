"use client"

import { getRequisitionByCode, getRequisitions } from "@/actions/requisition"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useDialogStore } from "@/hooks/use-dialog"
import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import { getBpMasters } from "@/actions/bp-master"
import { getUsers } from "@/actions/user"
import { getItems } from "@/actions/item-master"
import RequisitionSupplierQuoteList from "../requisition-supplier-quotes-list"
import SupplierQuoteForm from "@/app/(protected)/dashboard/crm/supplier-quotes/_components/supplier-quote-form"

type RequisitionSupplierQuotesTabProps = {
  requisition: NonNullable<Awaited<ReturnType<typeof getRequisitionByCode>>>
  requisitions: Awaited<ReturnType<typeof getRequisitions>>
  suppliers: Awaited<ReturnType<typeof getBpMasters>>
  users: Awaited<ReturnType<typeof getUsers>>
  items: Awaited<ReturnType<typeof getItems>>
}

export default function RequisitionSupplierQuotesTab({
  requisition,
  requisitions,
  suppliers,
  users,
  items,
}: RequisitionSupplierQuotesTabProps) {
  const requisitionSupplierQuotes = requisition?.supplierQuotes || []

  const { isOpen, setIsOpen, data, setData } = useDialogStore(["isOpen", "setIsOpen", "data", "setData"])

  const Actions = () => {
    const handleActionClick = () => {
      setIsOpen(true)
      setData(null)
    }

    return (
      <Button variant='outline-primary' onClick={handleActionClick}>
        Add Supplier Quote
      </Button>
    )
  }

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-x-3 gap-y-5'>
        <ReadOnlyFieldHeader
          className='col-span-12'
          title='Supplier Quotes'
          description="Requisition's related supplier quotes"
          actions={<Actions />}
        />

        <div className='col-span-12'>
          <RequisitionSupplierQuoteList supplierQuotes={requisitionSupplierQuotes} items={items} />
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='max-h-[85vh] overflow-auto sm:max-w-5xl'>
          <DialogHeader>
            <DialogTitle>Add supplier quote for requisition #{requisition.code}</DialogTitle>
            <DialogDescription>Fill in the form to create a new supplier quote for this requisition.</DialogDescription>
          </DialogHeader>

          <Card className='p-3'>
            <SupplierQuoteForm
              isModal
              disableRequisitionField
              supplierQuote={data || null}
              reqCode={requisition.code}
              requisitions={requisitions}
              suppliers={suppliers}
              users={users}
              items={items}
            />
          </Card>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
