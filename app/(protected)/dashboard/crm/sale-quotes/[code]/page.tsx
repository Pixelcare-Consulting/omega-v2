import Link from "next/link"
import { notFound } from "next/navigation"

import { getBpMasters, getPaymentTerms } from "@/actions/master-bp"
import { getRequisitions } from "@/actions/requisition"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import ContentContainer from "@/app/(protected)/_components/content-container"
import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"
import { getUsers } from "@/actions/user"
import SaleQuoteForm from "../_components/sale-quote-form"
import { getItems } from "@/actions/master-item"

import { getSaleQuoteByCode } from "@/actions/sale-quote"

export default async function SaleQuotePage({ params }: { params: { code: string } }) {
  const { code } = params

  const [saleQuote, requisitions, customers, items, users, paymentTerms] = await Promise.all([
    code === "add" ? null : getSaleQuoteByCode(parseInt(code)),
    getRequisitions(),
    getBpMasters("C"),
    getItems(),
    getUsers(),
    getPaymentTerms(),
  ])

  const getPageMetadata = () => {
    if (!saleQuote || !saleQuote?.code || code === "add")
      return { title: "Add Sale Quote", description: "Fill in the form to create a new sale quote." }
    return { title: "Edit Sale Quote", description: "Edit the form to update this sale quote's information." }
  }

  const pageMetadata = getPageMetadata()

  if (code !== "add" && !saleQuote) notFound()

  return (
    <ContentLayout title='Sale Quotes'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Sale Quotes", href: "/dashboard/crm/sale-quotes" },
          { label: code !== "add" && saleQuote ? String(saleQuote.code) : "Add", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title={pageMetadata.title}
          description={pageMetadata.description}
          actions={
            <div className='flex items-center gap-2'>
              <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/crm/sale-quotes`}>
                Back
              </Link>

              {saleQuote && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='default' size='icon'>
                      <Icons.moreVertical className='size-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/sale-quotes/${saleQuote.code}/view`}>
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
            <SaleQuoteForm
              salesQuote={saleQuote}
              requisitions={requisitions}
              customers={customers}
              items={items}
              users={users}
              paymentTerms={paymentTerms?.value || []}
            />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
