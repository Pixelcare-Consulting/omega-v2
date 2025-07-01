import { notFound } from "next/navigation"

import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { getContactById } from "@/actions/contacts"
import ViewContact from "./_components/view-contact"

export default async function ViewContactPage({ params }: { params: { id: string } }) {
  const { id } = params
  const contact = id === "add" ? null : await getContactById(id)

  if (!contact) notFound()

  return (
    <ContentLayout title='Contacts'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Contacts", href: "/dashboard/crm/contacts" },
          { label: contact.name },
          { label: "View", isPage: true },
        ]}
      />
      <ContentContainer>
        <ViewContact contact={contact} />
      </ContentContainer>
    </ContentLayout>
  )
}
