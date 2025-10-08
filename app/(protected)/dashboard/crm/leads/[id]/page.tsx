import Link from "next/link"

import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { getLeadById } from "@/actions/lead"
import { notFound } from "next/navigation"
import LeadForm from "../_components/lead-form"
import ContentContainer from "@/app/(protected)/_components/content-container"
import { getAccounts } from "@/actions/account"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getCountries } from "@/actions/master-bp"

export default async function LeadPage({ params }: { params: { id: string } }) {
  const { id } = params

  const [lead, accounts, countries] = await Promise.all([id === "add" ? null : getLeadById(id), getAccounts(), getCountries()])

  const getPageMetadata = () => {
    if (!lead || !lead?.id || id === "add") return { title: "Add Lead", description: "Fill in the form to create a new lead." }
    return { title: "Edit Lead", description: "Edit the form to update this lead's information." }
  }

  const pageMetadata = getPageMetadata()

  if (id !== "add" && !lead) notFound()

  return (
    <ContentLayout title='Leads'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Leads", href: "/dashboard/crm/leads" },
          { label: id !== "add" && lead ? lead.name : "Add", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title={pageMetadata.title}
          description={pageMetadata.description}
          actions={
            <div className='flex items-center gap-2'>
              <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/crm/leads`}>
                Back
              </Link>

              {lead && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='default' size='icon'>
                      <Icons.moreVertical className='size-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/leads/add`}>
                        <Icons.plus className='mr-2 size-4' /> Add
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/leads/${lead.id}/view`}>
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
            <LeadForm lead={lead} accounts={accounts} countries={countries?.value || []} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
