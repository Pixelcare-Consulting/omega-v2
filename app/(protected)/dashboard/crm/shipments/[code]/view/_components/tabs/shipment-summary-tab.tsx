"use client"

import { useEffect } from "react"
import { format, isValid } from "date-fns"
import { useAction } from "next-safe-action/hooks"

import { getShipmentByCode } from "@/actions/shipment"
import { Card } from "@/components/ui/card"
import { SHIPMENT_SHIP_TO_LOCATION_OPTIONS, SHIPMENT_SHIPPING_ORDER_STATUS_OPTIONS } from "@/schema/shipment"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import ReadOnlyField from "@/components/read-only-field"
import { Badge } from "@/components/badge"
import { REQUISITION_PO_STATUS_OPTIONS } from "@/schema/requisition"
import { getItemByItemCodeClient } from "@/actions/master-item"
import { RequestedItemsJSONData } from "@/actions/requisition"
import { formatNumber } from "@/lib/formatter"
import { Separator } from "@/components/ui/separator"
import {
  SUPPLIER_QUOTE_LT_TO_SJC_NUMBER_OPTIONS,
  SUPPLIER_QUOTE_LT_TO_SJC_UOM_OPTIONS,
  SUPPLIER_QUOTE_STATUS_OPTIONS,
} from "@/schema/supplier-quote"

type ShipmentSummaryTabProps = {
  shipment: NonNullable<Awaited<ReturnType<typeof getShipmentByCode>>>
}

export default function ShipmentSummaryTab({ shipment }: ShipmentSummaryTabProps) {
  const {
    execute: getReqItemByItemCodeExec,
    isExecuting: isReqItemLoading,
    result: { data: reqItem },
  } = useAction(getItemByItemCodeClient)

  const shippingOrderStatus = SHIPMENT_SHIPPING_ORDER_STATUS_OPTIONS.find((item) => item.value === shipment?.shippingOderStatus)?.label
  const datePoPlaced = shipment.datePoPlaced ? format(shipment.datePoPlaced, "MM-dd-yyyy") : ""
  const dateShipped = shipment.dateShipped ? format(shipment.dateShipped, "MM-dd-yyyy") : ""
  const qtyToShip = !isNaN(parseFloat(String(shipment?.qtyToShip))) ? formatNumber({ amount: parseFloat(String(shipment?.qtyToShip)), maxDecimal: 2 }) : "" //prettier-ignore
  const shipToLocation = SHIPMENT_SHIP_TO_LOCATION_OPTIONS.find((item) => item.value === shipment?.shipToLocation)?.label
  const purchaser = shipment?.purchaser ? shipment?.purchaser?.name || shipment?.purchaser?.email : ""

  const requisition = shipment.requisition
  const requestedItems = (requisition.requestedItems as RequestedItemsJSONData) || []

  const reqSalesPerson = requisition.salesPersons?.map((person) => person?.user?.name || person?.user?.email).filter(Boolean) || []
  const reqSalesTeam = requisition.salesTeam?.map((person) => person?.user?.name || person?.user?.email).filter(Boolean) || []
  const reqPoStatus = REQUISITION_PO_STATUS_OPTIONS.find((item) => item.value === requisition?.poStatus)?.label
  const reqPoStatusLastUpdated = requisition?.poStatusLastUpdated && isValid(requisition?.poStatusLastUpdated) ? format(requisition.poStatusLastUpdated, "MM-dd-yyyy") : "" //prettier-ignore
  const reqCustPoDockDate = requisition?.custPoDockDate && isValid(requisition?.custPoDockDate) ? format(requisition.custPoDockDate, "MM-dd-yyyy") : "" //prettier-ignore
  const reqMpn = requestedItems?.[0]?.code
  const reqQuantity = !isNaN(parseFloat(String(requisition?.quantity))) ? formatNumber({ amount: parseFloat(String(requisition?.quantity)), maxDecimal: 2 }) : "" //prettier-ignore

  const supplierQuote = shipment.supplierQuote
  const suppQuoteSupplierStatus = SUPPLIER_QUOTE_STATUS_OPTIONS.find((item) => item.value === supplierQuote?.status)?.label
  const suppQuoteLtToSjcNumber = SUPPLIER_QUOTE_LT_TO_SJC_NUMBER_OPTIONS.find((item) => item.value === supplierQuote?.ltToSjcNumber)?.label
  const suppQuoteLtToSjcUom = SUPPLIER_QUOTE_LT_TO_SJC_UOM_OPTIONS.find((item) => item.value === supplierQuote?.ltToSjcUom)?.label

  useEffect(() => {
    if (reqMpn) getReqItemByItemCodeExec({ code: reqMpn })
  }, [reqMpn])

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Summary' description='Shipment summary details' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Requisition' value={requisition.code} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-4'
          title='Requisition - Salesperson'
          value={
            <div className='flex flex-wrap items-center gap-1.5'>
              {reqSalesPerson.map((person, i) => (
                <Badge key={`${i}-${person}-salesperson`} variant='soft-red'>
                  {person}
                </Badge>
              ))}
            </div>
          }
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-4'
          title='Requisition - Sales Team'
          value={
            <div className='flex flex-wrap items-center gap-1.5'>
              {reqSalesTeam.map((person, i) => (
                <Badge key={`${i}-${person}-salesteam`} variant='soft-red'>
                  {person}
                </Badge>
              ))}
            </div>
          }
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Requisition - Customer - Name'
          value={requisition?.customer?.CardName || ""}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Requisition - Cust. PO #'
          value={requisition?.custPoNum || ""}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Requisition - PO Status' value={reqPoStatus || ""} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Requisition - PO Status Last Updated'
          value={reqPoStatusLastUpdated || ""}
        />

        {/* //TODO: Empty for now because it does not exist in QB */}
        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Requisition - Shipment Instructions (Sales)' value='' />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Requisition - Customer PO Dock Date'
          value={reqCustPoDockDate}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Requisition - MPN'
          value={reqItem?.ItemCode || ""}
          isLoading={isReqItemLoading}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Requisition - Quoted MPN'
          value={requisition?.quotedMpn || ""}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Requisition - MFR'
          value={reqItem?.FirmName || ""}
          isLoading={isReqItemLoading}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Requisition - Customer PN'
          value={requisition?.customerPn || ""}
        />

        {/* //TODO: Empty for now because it does not exist in QB */}
        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Requisition - DigiKey Datasheet' value='' />

        {/* //TODO: Empty for now because it does not exist in QB */}
        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Requisition - DigiKey HTS Code' value='' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Requisition - Quantity' value={reqQuantity} />

        <Separator className='col-span-12' />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Date Created'
          value={format(shipment.createdAt, "MM-dd-yyyy")}
        />

        {/*  //TODO: free text field for now - changed to dropdown value once SAP API is updated */}
        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='PO Number' value={shipment?.poNumber || ""} />

        {/* //TODO: free text field for now - changed to dropdown value once SAP API is updated */}
        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='PR Number' value={shipment?.prNumber || ""} />

        {/* //TODO: free text field for now - changed to dropdown value once SAP API is updated */}
        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='SO Number' value={shipment?.soNumber || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Supplier Quote' value={supplierQuote.code} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Supplier Quote - Supplier - Name'
          value={supplierQuote?.supplier?.CardName || ""}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Supplier Quote - Supplier - Terms'
          value={supplierQuote?.supplier?.PymntGroup || ""}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Supplier Quote - Supplier - Status'
          value={suppQuoteSupplierStatus || ""}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Supplier Quote - LT to SJC (Number)'
          value={suppQuoteLtToSjcNumber || ""}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Supplier Quote - LT to SJC (UoM)'
          value={suppQuoteLtToSjcUom || ""}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Supplier Quote - Lead Time to SJC'
          value={supplierQuote?.ltToSjc || ""}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Supplier Quote - Condition'
          value={supplierQuote?.condition || ""}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Supplier Quote - MPN'
          value={supplierQuote?.itemCode || ""}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='QTY to Ship' value={qtyToShip} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Ship to Location' value={shipToLocation} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Purchaser' value={purchaser} />

        <Separator className='col-span-12' />

        <ReadOnlyFieldHeader className='col-span-12' title='Order Updates' description='Order updates related details' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Purchaser' value={shippingOrderStatus || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Date PO Placed' value={datePoPlaced || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Date Shipped' value={dateShipped || ""} />

        <ReadOnlyField className='col-span-12 whitespace-pre-line' title='Order Updates' value={shipment?.orderUpdates || ""} />
      </div>
    </Card>
  )
}
