"use client"

import { Card } from "@/components/ui/card"
import AccountContactList from "../account-contacts-list"
import { getAccounts, getAccountById } from "@/actions/account"
import { getLeads } from "@/actions/lead"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Button } from "@/components/ui/button"
import { useDialogStore } from "@/hooks/use-dialog"
import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import ContactForm from "@/app/(protected)/dashboard/crm/contacts/_components/contact-form"

type AccountContactsTabProps = {
  account: NonNullable<Awaited<ReturnType<typeof getAccountById>>>
  accounts: Awaited<ReturnType<typeof getAccounts>>
  leads: Awaited<ReturnType<typeof getLeads>>
}

export default function AccountContactsTab({ account, accounts, leads }: AccountContactsTabProps) {
  const accountContacts = account?.contacts?.map((c) => ({ ...c.contact })) || []

  const { isOpen, setIsOpen } = useDialogStore(["isOpen", "setIsOpen"])

  const Actions = () => {
    return (
      <Button variant='outline-primary' onClick={() => setIsOpen(true)}>
        Add Contact
      </Button>
    )
  }

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-x-3 gap-y-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Contacts' description="Account's related contacts" actions={<Actions />} />

        <div className='col-span-12'>
          <AccountContactList accountId={account.id} contacts={accountContacts} />
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='max-h-[85vh] overflow-auto sm:max-w-5xl'>
          <DialogHeader>
            <DialogTitle>Add contact for {account.name}</DialogTitle>
            <DialogDescription>Fill in the form to create a new contact for this account.</DialogDescription>
          </DialogHeader>

          <Card className='p-3'>
            <ContactForm isModal accountId={account.id} contact={null} accounts={accounts} leads={leads} />
          </Card>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
