import Link from "next/link"

import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"
import { Card } from "@/components/ui/card"
import { getItems } from "@/actions/master-item"
import { getSupplierQuoteByCode } from "@/actions/supplier-quote"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/badge"
import {
  SUPPLIER_QUOTE_RESULT_OPTIONS,
  SUPPLIER_QUOTE_SOURCING_ROUND_OPTIONS,
  SUPPLIER_QUOTE_STATUS_OPTIONS,
} from "@/schema/supplier-quote"
import { getInitials } from "@/lib/utils"
import { format } from "date-fns"
import UnderDevelopment from "@/components/under-development"
import SupplierQuoteSummaryTab from "./tabs/supplier-quote-summary-tab"

type ViewSupplierQuoteProps = {
  supplierQuote: NonNullable<Awaited<ReturnType<typeof getSupplierQuoteByCode>>>
  items: Awaited<ReturnType<typeof getItems>>
}

export default function ViewSupplierQuote({ supplierQuote, items }: ViewSupplierQuoteProps) {
  const supplier = supplierQuote.supplier

  const status = SUPPLIER_QUOTE_STATUS_OPTIONS.find((item) => item.value === supplierQuote.status)?.label
  const result = SUPPLIER_QUOTE_RESULT_OPTIONS.find((item) => item.value === supplierQuote.result)
  const sourcingRound = SUPPLIER_QUOTE_SOURCING_ROUND_OPTIONS.find((item) => item.value === supplierQuote.sourcingRound)?.label
  const followUpDate = supplierQuote.followUpDate ? format(supplierQuote.followUpDate, "MM-dd-yyyy") : ""

  return (
    <PageWrapper
      title='Supplier Quotes Details'
      description='View the comprehensive details of this supplier quote.'
      actions={
        <div className='flex items-center gap-2'>
          <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/crm/supplier-quotes`}>
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
                <Link href={`/dashboard/crm/supplier-quotes/${supplierQuote.code}`}>
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
            {getInitials(supplier.CardName)}
          </div>

          <div className='flex flex-col gap-y-2 md:gap-0'>
            <h1 className='mb-0 text-sm font-semibold'>{supplier.CardName}</h1>

            <div className='flex flex-wrap items-center gap-2'>
              <p className='text-sm text-muted-foreground'>#{supplierQuote.code}</p>
              <Badge variant='soft-blue'>{status}</Badge>
              {result && result.value === "accepted" ? (
                <Badge variant='soft-green'>Accepted</Badge>
              ) : (
                <Badge variant='soft-red'>Rejected</Badge>
              )}
              {sourcingRound && <Badge variant='soft-purple'>{sourcingRound}</Badge>}

              {followUpDate && (
                <Badge variant='soft-amber'>
                  <Icons.calendar className='mr-1 size-3.5' /> {followUpDate}
                </Badge>
              )}
            </div>

            <div className='flex flex-wrap items-center gap-2'>
              <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                {supplierQuote.isPreferredSource ? (
                  <Icons.check className='size-4 text-green-500' strokeWidth={4} />
                ) : (
                  <Icons.x className='size-4 text-red-500' strokeWidth={4} />
                )}
                Preferred Source
              </div>

              <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                {supplierQuote.isQuotedSource ? (
                  <Icons.check className='size-4 text-green-500' strokeWidth={4} />
                ) : (
                  <Icons.x className='size-4 text-red-500' strokeWidth={4} />
                )}
                Quoted Source
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue='1' className='w-full'>
          <TabsList className='mb-2 h-fit flex-wrap'>
            <TabsTrigger value='1'>Summary</TabsTrigger>
            <TabsTrigger value='2'>Shipments</TabsTrigger>
            <TabsTrigger value='3'>Documents</TabsTrigger>
          </TabsList>

          <TabsContent value='1'>
            <SupplierQuoteSummaryTab supplierQuote={supplierQuote} items={items} />
          </TabsContent>

          <TabsContent value='2'>
            <Card className='rounded-lg p-6 shadow-md'>
              <div className='grid grid-cols-12 gap-5'>
                <UnderDevelopment className='col-span-12 h-[40vh]' />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value='3'>
            <Card className='rounded-lg p-6 shadow-md'>
              <div className='grid grid-cols-12 gap-5'>
                <UnderDevelopment className='col-span-12 h-[40vh]' />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value='4'>
            <Card className='rounded-lg p-6 shadow-md'>
              <div className='grid grid-cols-12 gap-5'>
                <UnderDevelopment className='col-span-12 h-[40vh]' />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  )
}
