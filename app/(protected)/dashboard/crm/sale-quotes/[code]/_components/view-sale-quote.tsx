import { getSaleQuoteByCode } from "@/actions/sale-quote"
import Link from "next/link"
import { format } from "date-fns"

import { getRequisitions } from "@/actions/requisition"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"
import { Card } from "@/components/ui/card"
import { getItems } from "@/actions/item-master"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/badge"
import { getInitials } from "@/lib/utils"
import SaleQuoteSummaryTab from "./tabs/sale-quote-summary-tab"
import SaleQuoteLineItemsTab from "./tabs/sale-quote-line-items.tab"

type ViewSaleQuoteProps = {
  saleQuote: NonNullable<Awaited<ReturnType<typeof getSaleQuoteByCode>>>
  items: NonNullable<Awaited<ReturnType<typeof getItems>>>
  requisitions: NonNullable<Awaited<ReturnType<typeof getRequisitions>>>
  paymentTerms?: any
}

export default function ViewSaleQuote({ saleQuote, items, requisitions, paymentTerms }: ViewSaleQuoteProps) {
  const customer = saleQuote.customer
  const validUntil = format(saleQuote.validUntil, "MM-dd-yyyy")

  return (
    <PageWrapper
      title='Sale Quotes Details'
      description='View the comprehensive details of this sale quote.'
      actions={
        <div className='flex items-center gap-2'>
          <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/crm/sale-quotes`}>
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
                <Link href={`/dashboard/crm/sale-quotes/${saleQuote.code}`}>
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
            {getInitials(customer.CardName)}
          </div>

          <div className='flex flex-col gap-y-2 md:gap-0'>
            <h1 className='mb-0 text-sm font-semibold'>{customer.CardName}</h1>

            <div className='flex flex-wrap items-center gap-2'>
              <p className='text-sm text-muted-foreground'>#{saleQuote.code}</p>

              <Badge variant='soft-amber'>
                <Icons.calendarCheck className='mr-1 size-3.5' /> {validUntil}
              </Badge>
            </div>
          </div>
        </Card>

        <Tabs defaultValue='1' className='w-full'>
          <TabsList className='mb-2 h-fit flex-wrap'>
            <TabsTrigger value='1'>Summary</TabsTrigger>
            <TabsTrigger value='2'>Line Items</TabsTrigger>
          </TabsList>

          <TabsContent value='1'>
            <SaleQuoteSummaryTab saleQuote={saleQuote} paymentTerms={paymentTerms} />
          </TabsContent>

          <TabsContent value='2'>
            <SaleQuoteLineItemsTab saleQuote={saleQuote} items={items} requisitions={requisitions} />
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  )
}
