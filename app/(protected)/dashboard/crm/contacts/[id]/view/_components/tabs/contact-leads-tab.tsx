import { Card } from "@/components/ui/card"
import { getContactById } from "@/actions/contacts"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import ContactLeadList from "../contact-leads-list"

type ContactLeadsTabProps = {
  contact: NonNullable<Awaited<ReturnType<typeof getContactById>>>
}

export default function ContactLeadsTab({ contact }: ContactLeadsTabProps) {
  const contactLeads = contact?.leadContacts?.map((l) => l.lead) || []

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-x-3 gap-y-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Leads' description="Contacts's related leads" />

        <div className='col-span-12'>
          <ContactLeadList contactId={contact.id} leads={contactLeads} />
        </div>
      </div>
    </Card>
  )
}
