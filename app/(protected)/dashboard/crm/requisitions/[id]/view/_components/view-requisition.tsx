import Link from "next/link"

import { getRequisitionById } from "@/actions/requisition"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"
import { Card } from "@/components/ui/card"
import { PURCHASING_STATUS_OPTIONS, RESULT_OPTIONS, SALES_CATEGORY_OPTIONS, URGENCY_OPTIONS } from "@/schema/requisition"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/badge"
import { getInitials } from "@/lib/utils"
import RequisitionSummaryTab from "./tabs/requisition-summary-tab"
import { getItems } from "@/actions/item"
import RequisitionRequestedItemsTab from "./tabs/requisition-requested-items-tab"
import RequisitionActivitiesTab from "./tabs/requisition-activities-tab"

type ViewRequisitionProps = {
  requisition: NonNullable<Awaited<ReturnType<typeof getRequisitionById>>>
  items: Awaited<ReturnType<typeof getItems>>
}

export default function ViewRequisition({ requisition, items }: ViewRequisitionProps) {
  const customer = requisition.customer?.CardName || requisition.customer?.CardCode
  const urgency = URGENCY_OPTIONS.find((item) => item.value === requisition.urgency)?.label
  const purchasingStatus = PURCHASING_STATUS_OPTIONS.find((item) => item.value === requisition.purchasingStatus)?.label
  const result = RESULT_OPTIONS.find((item) => item.value === requisition.result)?.label
  const salesCategory = SALES_CATEGORY_OPTIONS.find((item) => item.value === requisition.salesCategory)?.label

  return (
    <PageWrapper
      title='Requisition Details'
      description='View the comprehensive details of this requisition.'
      actions={
        <div className='flex items-center gap-2'>
          <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/crm/requisitions`}>
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
                <Link href={`/dashboard/crm/requisitions/${requisition.id}`}>
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
            {getInitials(customer || "")}
          </div>

          <div className='flex flex-col gap-y-2 md:gap-0'>
            <h1 className='mb-0 text-sm font-semibold'>{customer}</h1>

            <div className='flex flex-wrap items-center gap-2'>
              <p className='text-sm text-muted-foreground'>{requisition.id}</p>
              <Badge variant='soft-slate'>{salesCategory}</Badge>
              {urgency && <Badge variant='soft-amber'>{urgency}</Badge>}
              {purchasingStatus && <Badge variant='soft-blue'>{purchasingStatus}</Badge>}
              {requisition.result && <Badge variant={requisition.result === "won" ? "soft-green" : "soft-red"}>{result}</Badge>}
            </div>

            <div className='flex flex-wrap items-center gap-2'>
              <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                {requisition.isPurchasingInitiated ? (
                  <Icons.check className='size-4 text-green-500' strokeWidth={4} />
                ) : (
                  <Icons.x className='size-4 text-red-500' strokeWidth={4} />
                )}
                Purchasing Initiated
              </div>

              <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                {requisition.isActiveFollowUp ? (
                  <Icons.check className='size-4 text-green-500' strokeWidth={4} />
                ) : (
                  <Icons.x className='size-4 text-red-500' strokeWidth={4} />
                )}
                For Follow Up
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue='1' className='w-full'>
          <TabsList className='mb-2 h-fit flex-wrap'>
            <TabsTrigger value='1'>Summary</TabsTrigger>
            <TabsTrigger value='2'>Requested Items</TabsTrigger>
            <TabsTrigger value='3'>Activities</TabsTrigger>
          </TabsList>

          <TabsContent value='1'>
            <RequisitionSummaryTab requisition={requisition} />
          </TabsContent>

          <TabsContent value='2'>
            <RequisitionRequestedItemsTab requisition={requisition} items={items} />
          </TabsContent>

          <TabsContent value='3'>
            <RequisitionActivitiesTab requisition={requisition} />
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  )
}
