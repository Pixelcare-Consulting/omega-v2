import { notFound } from "next/navigation"
import Link from "next/link"

import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import ContentContainer from "@/app/(protected)/_components/content-container"
import { getCurrencies, getBpMasterByCardCode, getBpMasterGroups, getPaymentTerms } from "@/actions/bp-master"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"
import { Button, buttonVariants } from "@/components/ui/button"
import SupplierForm from "../_components/supplier-form"
import UnderDevelopment from "@/components/under-development"
import { Card } from "@/components/ui/card"
import { getUsers } from "@/actions/user"
import { getItemMasterGroups } from "@/actions/item-master"
import { getManufacturers } from "@/actions/manufacturer"

export default async function SupplierPage({ params }: { params: { code: string } }) {
  const { code } = params

  const [supplier, bpGroups, paymentTerms, currencies, itemGroups, manufacturers, users] = await Promise.all([
    !code ? null : getBpMasterByCardCode(code),
    getBpMasterGroups(),
    getPaymentTerms(),
    getCurrencies(),
    getItemMasterGroups(),
    getManufacturers(),
    getUsers(),
  ])

  const getPageMetadata = () => {
    if (!supplier || !supplier?.id || code === "add")
      return { title: "Add Supplier", description: "Fill in the form to create a new supplier." }
    return { title: "Edit Supplier", description: "Edit the form to update this supplier's information." }
  }

  const pageMetadata = getPageMetadata()

  if (code !== "add" && !supplier) notFound()

  return (
    <ContentLayout title='Suppliers'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Master Data" },
          { label: "Suppliers", href: "/dashboard/master-data/suppliers" },
          { label: code !== "add" && supplier ? supplier.CardName : "Add", isPage: true },
        ]}
      />
      <ContentContainer>
        {/* //TODO: temporary condition for block the editing of supplier with sourc of SAP */}
        {supplier && supplier.source === "sap" ? (
          <UnderDevelopment className='col-span-12 h-[80vh]' description='Editing SAP source supplier is under development.' />
        ) : (
          <PageWrapper
            title={pageMetadata.title}
            description={pageMetadata.description}
            actions={
              <div className='flex items-center gap-2'>
                <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/master-data/suppliers`}>
                  Back
                </Link>

                {supplier && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='default' size='icon'>
                        <Icons.moreVertical className='size-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/master-data/suppliers/${supplier.CardCode}/view`}>
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
              <SupplierForm
                supplier={supplier}
                bpGroups={bpGroups?.value || []}
                paymentTerms={paymentTerms?.value || []}
                currencies={currencies?.value || []}
                itemGroups={itemGroups?.value || []}
                manufacturers={manufacturers?.value || []}
                users={users}
              />
            </Card>
          </PageWrapper>
        )}
      </ContentContainer>
    </ContentLayout>
  )
}
