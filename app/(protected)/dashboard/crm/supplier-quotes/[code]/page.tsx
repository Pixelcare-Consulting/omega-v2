import Link from "next/link"
import { notFound } from "next/navigation"

import { getBpMasterByCardCode, getBpMasters } from "@/actions/master-bp"
import { getRequisitions } from "@/actions/requisition"
import { getSupplierQuoteByCode } from "@/actions/supplier-quote"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import ContentContainer from "@/app/(protected)/_components/content-container"
import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"
import { getUsers } from "@/actions/user"
import SupplierQuoteForm from "../_components/supplier-quote-form"
import { getItems } from "@/actions/master-item"

export default async function SupplierQuotePage({ params }: { params: { code: string } }) {
  const { code } = params

  const [supplierQuote, requisitions, suppliers, users, items] = await Promise.all([
    code === "add" ? null : getSupplierQuoteByCode(parseInt(code)),
    getRequisitions(),
    getBpMasters("S"),
    getUsers(),
    getItems(),
  ])

  const getPageMetadata = () => {
    if (!supplierQuote || !supplierQuote?.code || code === "add")
      return { title: "Add Supplier Quote", description: "Fill in the form to create a new supplier quote." }
    return { title: "Edit Supplier Quote", description: "Edit the form to update this supplier quote's information." }
  }

  const pageMetadata = getPageMetadata()

  if (code !== "add" && !supplierQuote) notFound()

  return (
    <ContentLayout title='Supplier Quotes'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Supplier Quotes", href: "/dashboard/crm/supplier-quotes" },
          { label: code !== "add" && supplierQuote ? String(supplierQuote.code) : "Add", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title={pageMetadata.title}
          description={pageMetadata.description}
          actions={
            <div className='flex items-center gap-2'>
              <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/crm/supplier-quotes`}>
                Back
              </Link>

              {supplierQuote && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='default' size='icon'>
                      <Icons.moreVertical className='size-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/supplier-quotes/add`}>
                        <Icons.plus className='mr-2 size-4' /> Add
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/supplier-quotes/${supplierQuote.code}/view`}>
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
            <SupplierQuoteForm
              supplierQuote={supplierQuote}
              requisitions={requisitions}
              suppliers={suppliers}
              users={users}
              items={items}
            />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
