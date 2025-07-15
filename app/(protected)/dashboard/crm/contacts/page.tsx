import { getContacts } from "@/actions/contacts"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import ContactList from "./_components/contact-list"
import ContentContainer from "@/app/(protected)/_components/content-container"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Icons } from "@/components/icons"
import { Card } from "@/components/ui/card"

export default async function ContactsPage() {
  const contacts = await getContacts()

  return (
    <ContentLayout title='Contacts'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Contacts", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title='Contacts'
          description='Manage and track your contacts effectively'
          defaultAction={{
            label: "Add Contact",
            href: "/dashboard/crm/contacts/add",
            icon: Icons.plus,
          }}
        >
          <Card className='rounded-lg p-6 shadow-md'>
            <ContactList contacts={contacts} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
