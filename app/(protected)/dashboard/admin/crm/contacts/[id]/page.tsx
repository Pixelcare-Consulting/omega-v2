import { getLeads } from "@/actions/lead"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/Breadcrumbs"
import ContactForm from "../_components/contact-form"
import { getContactById } from "@/actions/contacts"
import { notFound } from "next/navigation"

export default async function ContactPage({ params }: { params: { id: string } }) {
  const { id } = params

  const [contact, leads] = await Promise.all([id === "add" ? null : getContactById(id), getLeads()])

  if (id !== "add" && !contact) notFound()

  return (
    <ContentLayout title='Contacts'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Contacts", href: "/dashboard/admin/crm/contacts" },
          { label: id !== "add" && contact ? contact.name : "Add" },
        ]}
      />

      <div className='min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]'>
        <ContactForm contact={contact} leads={leads} />
      </div>
    </ContentLayout>
  )
}
