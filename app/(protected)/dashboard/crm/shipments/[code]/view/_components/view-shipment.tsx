import Link from "next/link"

import { getShipmentByCode } from "@/actions/shipment"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/badge"
import { getInitials } from "@/lib/utils"
import { SHIPMENT_SHIPPING_ORDER_STATUS_OPTIONS } from "@/schema/shipment"
import { format } from "date-fns"
import ShipmentSummaryTab from "./tabs/shipment-summary-tab"

type ViewShipmentProps = {
  shipment: NonNullable<Awaited<ReturnType<typeof getShipmentByCode>>>
}

export default function ViewShipment({ shipment }: ViewShipmentProps) {
  const customerName = shipment.requisition.customer?.CardName
  const shippingOrderStatus = SHIPMENT_SHIPPING_ORDER_STATUS_OPTIONS.find((item) => item.value === shipment?.shippingOderStatus)?.label
  const datePoPlaced = shipment.datePoPlaced ? format(shipment.datePoPlaced, "MM-dd-yyyy") : ""
  const dateShipped = shipment.dateShipped ? format(shipment.dateShipped, "MM-dd-yyyy") : ""

  return (
    <PageWrapper
      title='Shipment Details'
      description='View the comprehensive details of this shipment.'
      actions={
        <div className='flex items-center gap-2'>
          <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/crm/shipments`}>
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
                <Link href={`/dashboard/crm/shipments/${shipment.code}`}>
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
              <p className='text-sm text-muted-foreground'>#{shipment.code}</p>
              {shippingOrderStatus ? <Badge variant='soft-blue'>{shippingOrderStatus}</Badge> : null}

              {datePoPlaced ? (
                <Badge variant='soft-amber'>
                  <Icons.calendar className='mr-1 size-3.5' />
                  {datePoPlaced}
                </Badge>
              ) : null}

              {dateShipped ? (
                <Badge variant='soft-green'>
                  <Icons.truck className='mr-1 size-3.5' />
                  {dateShipped}
                </Badge>
              ) : null}
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue='1' className='w-full'>
        <TabsList className='mb-2 h-fit flex-wrap'>
          <TabsTrigger value='1'>Summary</TabsTrigger>
          {/* //TODO: add "Tracking" tab when doing logistics features */}
          {/* <TabsTrigger value='2'>Tracking</TabsTrigger> */}
          {/* //TODO: add "Documents" tab when doing logistics features */}
          {/* <TabsTrigger value='3'>Documents</TabsTrigger> */}
        </TabsList>

        <TabsContent value='1'>
          <ShipmentSummaryTab shipment={shipment} />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  )
}
