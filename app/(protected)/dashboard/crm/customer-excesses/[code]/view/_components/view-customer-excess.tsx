import Link from "next/link"

import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Icons } from "@/components/icons"
import { Card } from "@/components/ui/card"
import { getInitials } from "@/lib/utils"
import { getCustomerExcessByCode } from "@/actions/customer-excess"
import CustomerExcessSummaryTab from "./tabs/customer-excess-summary-tab"
import CustomerExcessLineItemsTab from "./tabs/customer-excess-line-items.tab"

type ViewCustomerExcessProps = {
  customerExcess: NonNullable<Awaited<ReturnType<typeof getCustomerExcessByCode>>>
}

export default function ViewCustomerExcess({ customerExcess }: ViewCustomerExcessProps) {
  const customerName = customerExcess.customer?.CardName

  return (
    <PageWrapper
      title='Customer Excess Details'
      description='View the comprehensive details of this customer excess.'
      actions={
        <div className='flex items-center gap-2'>
          <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/crm/customer-excesses`}>
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
                <Link href={`/dashboard/crm/customer-excesses/add`}>
                  <Icons.plus className='mr-2 size-4' /> Add
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href={`/dashboard/crm/customer-excesses/${customerExcess.code}`}>
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
            {getInitials(customerName || "")}
          </div>

          <div className='flex flex-col gap-y-2 md:gap-0'>
            <h1 className='mb-0 text-sm font-semibold'>{customerName}</h1>

            <div className='flex flex-wrap items-center gap-2'>
              <p className='text-sm text-muted-foreground'>#{customerExcess.code}</p>
            </div>
          </div>
        </Card>

        <Tabs defaultValue='1' className='w-full'>
          <TabsList className='mb-2 h-fit flex-wrap'>
            <TabsTrigger value='1'>Summary</TabsTrigger>
            <TabsTrigger value='2'>Line Items</TabsTrigger>
          </TabsList>

          <TabsContent value='1'>
            <CustomerExcessSummaryTab customerExcess={customerExcess} />
          </TabsContent>

          <TabsContent value='2'>
            <CustomerExcessLineItemsTab customerExcess={customerExcess} />
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  )
}
