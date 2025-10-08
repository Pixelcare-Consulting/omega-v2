import Link from "next/link"

import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Icons } from "@/components/icons"
import { Card } from "@/components/ui/card"
import { getInitials } from "@/lib/utils"
import { getProductCommodityByCode } from "@/actions/product-commodity"
import ProductCommoditySummaryTab from "./tabs/product-commodity-summary-tab"

type ViewProductCommodityProps = {
  productCommodity: NonNullable<Awaited<ReturnType<typeof getProductCommodityByCode>>>
}

export default function ViewProductCommodity({ productCommodity }: ViewProductCommodityProps) {
  const productCommodityName = productCommodity.name

  return (
    <PageWrapper
      title='Product Commodity Details'
      description='View the comprehensive details of this product commodity.'
      actions={
        <div className='flex items-center gap-2'>
          <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/crm/product-commodities`}>
            Back
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='default' size='icon'>
                <Icons.moreVertical className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/crm/product-commodities/add`}>
                  <Icons.plus className='mr-2 size-4' /> Add
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href={`/dashboard/crm/product-commodities/${productCommodity.code}`}>
                  <Icons.pencil className='mr-2 size-4' /> Edit
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <div className='flex flex-col gap-4'>
        <Card className='flex items-center gap-3 rounded-lg p-6 shadow-md'>
          <div className='flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-muted font-bold'>
            {getInitials(productCommodityName || "")}
          </div>

          <div className='flex flex-col gap-y-2 md:gap-0'>
            <h1 className='mb-0 text-sm font-semibold'>{productCommodityName}</h1>

            <div className='flex flex-wrap items-center gap-2'>
              <p className='text-sm text-muted-foreground'>#{productCommodity.code}</p>
            </div>
          </div>
        </Card>

        <Tabs defaultValue='1' className='w-full'>
          <TabsList className='mb-2 h-fit flex-wrap'>
            <TabsTrigger value='1'>Summary</TabsTrigger>
          </TabsList>

          <TabsContent value='1'>
            <ProductCommoditySummaryTab productCommodity={productCommodity} />
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  )
}
