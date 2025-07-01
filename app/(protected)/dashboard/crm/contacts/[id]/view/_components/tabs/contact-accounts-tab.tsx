import { Card } from "@/components/ui/card"
import { getContactById } from "@/actions/contacts"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import ContactAccountsList from "../contact-accounts-list"

type ContactAccountsTabProps = {
  contact: NonNullable<Awaited<ReturnType<typeof getContactById>>>
}

export default function ContactAccountsTab({ contact }: ContactAccountsTabProps) {
  const contactAccounts = contact?.accountContacts?.map((c) => c.account) || []

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-x-3 gap-y-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Accounts' description="Contacts's related accounts" />

        <div className='col-span-12'>
          <ContactAccountsList contactId={contact.id} accounts={contactAccounts} />
        </div>
      </div>
    </Card>
  )
}
