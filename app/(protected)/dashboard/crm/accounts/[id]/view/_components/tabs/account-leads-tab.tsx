"use client"

import { getAccountById, getAccounts } from "@/actions/account"
import { getLeads } from "@/actions/lead"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useDialogStore } from "@/hooks/use-dialog"
import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import AccountLeadList from "../account-leads-list"
import LeadForm from "@/app/(protected)/dashboard/crm/leads/_components/lead-form"

type AccountLeadsTabProps = {
  account: NonNullable<Awaited<ReturnType<typeof getAccountById>>>
  accounts: Awaited<ReturnType<typeof getAccounts>>
  countries?: any
}

export default function AccountLeadsTab({ account, accounts, countries }: AccountLeadsTabProps) {
  const accountLeads = account?.leads || []

  const { isOpen, setIsOpen } = useDialogStore(["isOpen", "setIsOpen"])

  const Actions = () => {
    return (
      <Button variant='outline-primary' onClick={() => setIsOpen(true)}>
        Add Lead
      </Button>
    )
  }

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-x-3 gap-y-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Leads' description="Account's related leads" actions={<Actions />} />

        <div className='col-span-12'>
          <AccountLeadList accountId={account.id} leads={accountLeads} />
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='max-h-[85vh] overflow-auto sm:max-w-5xl'>
          <DialogHeader>
            <DialogTitle>Add lead for {account.name}</DialogTitle>
            <DialogDescription>Fill in the form to create a new lead for this account.</DialogDescription>
          </DialogHeader>

          <Card className='p-3'>
            <LeadForm isModal accountId={account.id} lead={null} accounts={accounts} countries={countries} />
          </Card>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
