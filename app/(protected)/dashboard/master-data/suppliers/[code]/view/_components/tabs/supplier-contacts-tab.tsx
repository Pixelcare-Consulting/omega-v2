"use client"

import { getBpMasterByCardCode } from "@/actions/master-bp"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useDialogStore } from "@/hooks/use-dialog"
import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import SupplierContactsList from "../supplier-contacts-list"
import ContactForm from "../../../../../_components/contact-form"

type SupplierContactsTabProps = {
  supplier: NonNullable<Awaited<ReturnType<typeof getBpMasterByCardCode>>>
}

export default function SupplierContactsTab({ supplier }: SupplierContactsTabProps) {
  const contacts = supplier.contacts || []
  const contactPerson = supplier.CntctPrsn || ""

  const { isOpen, setIsOpen, data, setData } = useDialogStore(["isOpen", "setIsOpen", "data", "setData"])

  const Actions = () => {
    const handleActionClick = () => {
      setIsOpen(true)
      setData(null)
    }

    return (
      <Button variant='outline-primary' onClick={handleActionClick}>
        Add Contact
      </Button>
    )
  }

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-x-3 gap-y-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Contacts' description="Supplier's related contacts" actions={<Actions />} />

        <div className='col-span-12'>
          <SupplierContactsList contacts={contacts} contactPerson={contactPerson} />
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='max-h-[85vh] overflow-auto sm:max-w-5xl'>
          <DialogHeader>
            <DialogTitle>Add contact for supplier #{supplier.CardCode}</DialogTitle>
            <DialogDescription>Fill in the form to {data ? "edit" : "create a new"} contact for this supplier.</DialogDescription>
          </DialogHeader>

          <Card className='p-3'>
            <ContactForm contact={data || null} />
          </Card>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
