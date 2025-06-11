import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/Breadcrumbs"
import ContactList from "./_components/contact-list"
import { getContacts } from "@/actions/contacts"

export default async function LeadsPage() {
  const contacts = await getContacts()

  return (
    <ContentLayout title='Contacts'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Contacts", href: "/dashboard/admin/crm/contacts" },
        ]}
      />

      <div className='min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]'>
        <ContactList contacts={contacts} />
      </div>
    </ContentLayout>
  )
}
