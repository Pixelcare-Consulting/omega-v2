import Link from "next/link"

import { getAccounts } from "@/actions/account"
import { getContactById } from "@/actions/contacts"
import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { notFound } from "next/navigation"
import ContactForm from "../_components/contact-form"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"
import { Button, buttonVariants } from "@/components/ui/button"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"
import { getLeads } from "@/actions/lead"

export default async function ContactPage({ params }: { params: { id: string } }) {
  const { id } = params

  const [contact, accounts, leads] = await Promise.all([id === "add" ? null : getContactById(id), getAccounts(), getLeads()])

  const getPageMetadata = () => {
    if (!contact || !contact?.id || id === "add") return { title: "Add Contact", description: "Fill in the form to create a new contact." }
    return { title: "Edit Contact", description: "Edit the form to update this contact's information." }
  }

  const pageMetadata = getPageMetadata()

  if (id !== "add" && !contact) notFound()

  return (
    <ContentLayout title='Contacts'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Contacts", href: "/dashboard/crm/contacts" },
          { label: id !== "add" && contact ? contact.name : "Add", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title={pageMetadata.title}
          description={pageMetadata.description}
          actions={
            <div className='flex items-center gap-2'>
              <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/crm/contacts`}>
                Back
              </Link>

              {contact && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='default' size='icon'>
                      <Icons.moreVertical className='size-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/contacts/${contact.id}/view`}>
                        <Icons.eye className='mr-2 size-4' /> View
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          }
        >
          <Card className='p-6'>
            <ContactForm contact={contact} accounts={accounts} leads={leads} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
