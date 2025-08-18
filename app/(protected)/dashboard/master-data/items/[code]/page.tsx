import { notFound } from "next/navigation"
import Link from "next/link"

import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import ContentContainer from "@/app/(protected)/_components/content-container"
import UnderDevelopment from "@/components/under-development"
import { getItemMasterGroups, getItemsByItemCode } from "@/actions/master-item"
import { getManufacturers } from "@/actions/manufacturer"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import ItemForm from "../_components/item-form"

export default async function ItemPage({ params }: { params: { code: string } }) {
  const { code } = params

  const [item, itemGroups, manufacturers] = await Promise.all([
    !code ? null : getItemsByItemCode(code),
    getItemMasterGroups(),
    getManufacturers(),
  ])

  const getPageMetadata = () => {
    if (!item || !item?.id || code === "add") return { title: "Add Item", description: "Fill in the form to create a new item." }
    return { title: "Edit Item", description: "Edit the form to update this item's information." }
  }

  const pageMetadata = getPageMetadata()

  if (code !== "add" && !item) notFound()

  return (
    <ContentLayout title='Items'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Master Data" },
          { label: "Items", href: "/dashboard/master-data/items" },
          { label: code !== "add" && item ? item.ItemCode : "Add", isPage: true },
        ]}
      />

      <ContentContainer>
        {/* //TODO: temporary condition for block the editing of item with source of SAP */}
        {item && item.source === "sap" ? (
          <UnderDevelopment className='col-span-12 h-[80vh]' description='Editing SAP source item is under development.' />
        ) : (
          <PageWrapper
            title={pageMetadata.title}
            description={pageMetadata.description}
            actions={
              <div className='flex items-center gap-2'>
                <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/master-data/items`}>
                  Back
                </Link>

                {item && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='default' size='icon'>
                        <Icons.moreVertical className='size-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/master-data/items/${item.ItemCode}/view`}>
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
              <ItemForm item={item} itemGroups={itemGroups?.value || []} manufacturers={manufacturers?.value || []} />
            </Card>
          </PageWrapper>
        )}
      </ContentContainer>
    </ContentLayout>
  )
}
