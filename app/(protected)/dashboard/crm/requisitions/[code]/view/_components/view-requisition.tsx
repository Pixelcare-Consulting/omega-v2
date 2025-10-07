"use client"

import Link from "next/link"
import { useAction } from "next-safe-action/hooks"
import { useEffect, useMemo } from "react"

import { getRequisitionByCode, getRequisitions, RequestedItemsJSONData } from "@/actions/requisition"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"
import { Card } from "@/components/ui/card"
import {
  REQUISITION_PURCHASING_STATUS_OPTIONS,
  REQUISITION_RESULT_OPTIONS,
  REQUISITION_SALES_CATEGORY_OPTIONS,
  REQUISITION_URGENCY_OPTIONS,
} from "@/schema/requisition"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/badge"
import { getInitials } from "@/lib/utils"
import RequisitionSummaryTab from "./tabs/requisition-summary-tab"
import RequisitionRequestedItemsTab from "./tabs/requisition-requested-items-tab"
import RequisitionActivitiesTab from "./tabs/requisition-activities-tab"
import { getItems } from "@/actions/master-item"
import { getBpMasters } from "@/actions/master-bp"
import { getUsers } from "@/actions/user"
import RequisitionSupplierQuotesTab from "./tabs/requisition-supplier-quotes-tab"
import RequisitionShipmentsTab from "./tabs/requisition-shipments-tab"
import {
  getProductAvailabilitiesByManufacturerCodes,
  getProductAvailabilitiesByManufacturerCodesClient,
} from "@/actions/product-availability"
import RequisitionProductAvailabilitiesTab from "./tabs/requisition-product-availabilities-tab"
import { getCustomerExcessLineItemsByPartialMpnClient } from "@/actions/customer-excess"
import RequisitionCustomerExcessTab from "./tabs/requisition-customer-excess-tab"

type ViewRequisitionProps = {
  requisition: NonNullable<Awaited<ReturnType<typeof getRequisitionByCode>>>
  requisitions: Awaited<ReturnType<typeof getRequisitions>>
  suppliers: Awaited<ReturnType<typeof getBpMasters>>
  users: Awaited<ReturnType<typeof getUsers>>
  items: Awaited<ReturnType<typeof getItems>>
}

export default function ViewRequisition({ requisition, requisitions, suppliers, users, items }: ViewRequisitionProps) {
  const customer = requisition.customer?.CardName || requisition.customer?.CardCode
  const urgency = REQUISITION_URGENCY_OPTIONS.find((item) => item.value === requisition?.urgency)?.label
  const purchasingStatus = REQUISITION_PURCHASING_STATUS_OPTIONS.find((item) => item.value === requisition?.purchasingStatus)?.label
  const result = REQUISITION_RESULT_OPTIONS.find((item) => item.value === requisition?.result)?.label
  const salesCategory = REQUISITION_SALES_CATEGORY_OPTIONS.find((item) => item.value === requisition?.salesCategory)?.label

  const requestedItems = requisition?.requestedItems as RequestedItemsJSONData

  // TODO: TEMP NEED OPTIMIZE
  //* get full details of the items
  const requestedItemsFullDetails = useMemo(() => {
    const fullDetailsItems =
      requestedItems?.map((reqItem) => {
        const selectedItem = items.find((item) => reqItem.code === item.ItemCode)
        if (selectedItem) {
          return {
            code: selectedItem.ItemCode,
            name: selectedItem.ItemName,
            mpn: selectedItem.ItemCode,
            mfr: selectedItem.FirmName,
            mfrCode: selectedItem.FirmCode,
            source: selectedItem.source,
            isSupplierSuggested: reqItem.isSupplierSuggested,
          }
        }
        return null
      }) || []

    return fullDetailsItems.filter((item) => item !== null)
  }, [JSON.stringify(items), JSON.stringify(requestedItems)])

  const mfrCodes = useMemo(() => {
    return requestedItemsFullDetails.map((item) => item?.mfrCode).filter((code) => code !== null) || []
  }, [JSON.stringify(requestedItemsFullDetails)])

  const {
    execute: getProductAvailabilitiesByManufacturerCodesExec,
    isExecuting: IsProductAvailabilitiesLoading,
    result: { data: productAvailabilities },
  } = useAction(getProductAvailabilitiesByManufacturerCodesClient)

  const {
    execute: getCustomerExcessLineItemsByPartialMpnExec,
    isExecuting: IsCustomerExcessLineItemsLoading,
    result: { data: customerExcessLineItems },
  } = useAction(getCustomerExcessLineItemsByPartialMpnClient)

  //* trigger fetch product availabilities
  useEffect(() => {
    if (mfrCodes.length > 0) getProductAvailabilitiesByManufacturerCodesExec({ manufacturerCodes: mfrCodes })
  }, [JSON.stringify(mfrCodes)])

  //* trigger fetch customer excess line items
  useEffect(() => {
    if (requisition?.partialMpn) getCustomerExcessLineItemsByPartialMpnExec({ partialMpn: requisition.partialMpn })
  }, [JSON.stringify(requisition)])

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
                <Link href={`/dashboard/crm/requisitions/${requisition.code}`}>
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
              <p className='text-sm text-muted-foreground'>#{requisition.code}</p>
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
            <TabsTrigger value='3'>Supplier Quotes</TabsTrigger>
            <TabsTrigger value='4'>Shipments</TabsTrigger>
            <TabsTrigger value='5'>Product Availabilities</TabsTrigger>
            <TabsTrigger value='6'>Customer Excess</TabsTrigger>
            <TabsTrigger value='7'>Activities</TabsTrigger>
          </TabsList>

          <TabsContent value='1'>
            <RequisitionSummaryTab requisition={requisition} />
          </TabsContent>

          <TabsContent value='2'>
            <RequisitionRequestedItemsTab requisition={requisition} items={items} />
          </TabsContent>

          <TabsContent value='3'>
            <RequisitionSupplierQuotesTab
              requisition={requisition}
              requisitions={requisitions}
              suppliers={suppliers}
              users={users}
              items={items}
            />
          </TabsContent>

          <TabsContent value='4'>
            <RequisitionShipmentsTab requisition={requisition} />
          </TabsContent>

          <TabsContent value='5'>
            <RequisitionProductAvailabilitiesTab
              productAvailabilities={{
                data: productAvailabilities || [],
                isLoading: IsProductAvailabilitiesLoading,
              }}
              requisition={requisition}
            />
          </TabsContent>

          <TabsContent value='6'>
            <RequisitionCustomerExcessTab
              customerExcessLineItems={{
                data: customerExcessLineItems || [],
                isLoading: IsCustomerExcessLineItemsLoading,
              }}
            />
          </TabsContent>

          <TabsContent value='7'>
            <RequisitionActivitiesTab requisition={requisition} />
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  )
}
