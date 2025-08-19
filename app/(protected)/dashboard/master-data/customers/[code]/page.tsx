import Link from "next/link"

import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import ContentContainer from "@/app/(protected)/_components/content-container"
import UnderDevelopment from "@/components/under-development"
import { getBpMasterByCardCode, getBpMasterGroups, getCountries, getCurrencies, getPaymentTerms, getStates } from "@/actions/master-bp"
import { getUsers } from "@/actions/user"
import { notFound } from "next/navigation"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import CustomerForm from "../_components/customer-form"
import { getLeadById } from "@/actions/lead"

export default async function CustomerPage({ params, searchParams }: { params: { code: string }; searchParams: { leadId: string } }) {
  const { code } = params
  const { leadId } = searchParams

  const [customer, lead, bpGroups, paymentTerms, currencies, countries, users] = await Promise.all([
    !code ? null : getBpMasterByCardCode(code),
    !leadId ? null : getLeadById(leadId),
    getBpMasterGroups(),
    getPaymentTerms(),
    getCurrencies(),
    getCountries(),
    getUsers(),
  ])

  const getPageMetadata = () => {
    if (!customer || !customer?.id || code === "add")
      return { title: "Add Customer", description: "Fill in the form to create a new customer." }
    return { title: "Edit Customer", description: "Edit the form to update this customer's information." }
  }

  const pageMetadata = getPageMetadata()

  if (code !== "add" && !customer) notFound()

  return (
    <ContentLayout title='Customers'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Master Data" },
          { label: "Customers", href: "/dashboard/master-data/customers" },
          { label: code !== "add" && customer ? customer.CardName : "Add", isPage: true },
        ]}
      />

      <ContentContainer>
        {/* //TODO: temporary condition for block the editing of customer with sourc of SAP */}

        {customer && customer.source === "sap" ? (
          <UnderDevelopment className='col-span-12 h-[80vh]' description='Editing SAP source customer is under development.' />
        ) : (
          <PageWrapper
            title={pageMetadata.title}
            description={pageMetadata.description}
            actions={
              <div className='flex items-center gap-2'>
                <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/master-data/customers`}>
                  Back
                </Link>

                {customer && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='default' size='icon'>
                        <Icons.moreVertical className='size-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/master-data/customers/${customer.CardCode}/view`}>
                          <Icons.eye className='mr-2 size-4' /> View
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            }
          >
            <Card className='rounded-lg p-6 shadow-md'>
              <CustomerForm
                customer={customer}
                lead={lead}
                bpGroups={bpGroups?.value || []}
                paymentTerms={paymentTerms?.value || []}
                currencies={currencies?.value || []}
                countries={countries?.value || []}
                users={users}
              />
            </Card>
          </PageWrapper>
        )}
      </ContentContainer>
    </ContentLayout>
  )
}
