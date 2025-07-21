"use client"

import { format } from "date-fns"

import { getItems } from "@/actions/item-master"
import { getSupplierQuoteByCode } from "@/actions/supplier-quote"
import ReadOnlyField from "@/components/read-only-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Card } from "@/components/ui/card"
import {
  SUPPLIER_QUOTE_CONTACTED_VIA_OPTIONS,
  SUPPLIER_QUOTE_LT_TO_SJC_NUMBER_OPTIONS,
  SUPPLIER_QUOTE_LT_TO_SJC_UOM_OPTIONS,
  SUPPLIER_QUOTE_RESULT_OPTIONS,
  SUPPLIER_QUOTE_ROHS_OPTIONS,
  SUPPLIER_QUOTE_SOURCING_ROUND_OPTIONS,
  SUPPLIER_QUOTE_STATUS_OPTIONS,
} from "@/schema/supplier-quote"
import { REQUISITION_RESULT_OPTIONS } from "@/schema/requisition"
import { Badge } from "@/components/badge"
import { BP_MASTER_STATUS_OPTIONS } from "@/schema/bp-master"
import { useMemo } from "react"
import { multiply } from "mathjs"
import { formatCurrency, formatNumber } from "@/lib/formatter"

type SupplierQuoteSummaryTabProps = {
  supplierQuote: NonNullable<Awaited<ReturnType<typeof getSupplierQuoteByCode>>>
  items: Awaited<ReturnType<typeof getItems>>
}

export default function SupplierQuoteSummaryTab({ supplierQuote, items }: SupplierQuoteSummaryTabProps) {
  const supplier = supplierQuote.supplier
  const supplierStatus = BP_MASTER_STATUS_OPTIONS.find((item) => item.value === supplier.status)?.label

  const requisition = supplierQuote.requisition
  const requisitionResult = REQUISITION_RESULT_OPTIONS.find((item) => item.value === requisition?.result)?.label

  const status = SUPPLIER_QUOTE_STATUS_OPTIONS.find((item) => item.value === supplierQuote.status)?.label
  const result = SUPPLIER_QUOTE_RESULT_OPTIONS.find((item) => item.value === supplierQuote.result)?.label
  const sourcingRound = SUPPLIER_QUOTE_SOURCING_ROUND_OPTIONS.find((item) => item.value === supplierQuote.sourcingRound)?.label
  const followUpDate = supplierQuote.followUpDate ? format(supplierQuote.followUpDate, "MM-dd-yyyy") : ""
  const contactedVia = SUPPLIER_QUOTE_CONTACTED_VIA_OPTIONS.find((item) => item.value === supplierQuote.contactedVia)?.label
  const ltToSjcNumber = SUPPLIER_QUOTE_LT_TO_SJC_NUMBER_OPTIONS.find((item) => item.value === supplierQuote.ltToSjcNumber)?.label
  const ltToSjcUom = SUPPLIER_QUOTE_LT_TO_SJC_UOM_OPTIONS.find((item) => item.value === supplierQuote.ltToSjcUom)?.label
  const roHs = SUPPLIER_QUOTE_ROHS_OPTIONS.find((item) => item.value === supplierQuote.roHs)?.label

  const buyers = supplierQuote.buyers?.map((person) => person?.user?.name || person?.user?.email).filter(Boolean) || []
  const item = items.find((item) => item.ItemCode === supplierQuote.itemCode)

  const totalCost = useMemo(() => {
    const x = parseFloat(String(supplierQuote.quantityQuoted))
    const y = parseFloat(String(supplierQuote.quantityPriced))

    if (isNaN(x) || isNaN(y)) return ""

    const result = multiply(x, y)

    return formatCurrency({ amount: result, minDecimal: 2 })
  }, [JSON.stringify(supplierQuote)])

  const quantityQuoted = useMemo(() => {
    const x = parseFloat(String(supplierQuote.quantityQuoted))

    if (isNaN(x)) return ""

    return formatNumber({ amount: x, maxDecimal: 2 })
  }, [JSON.stringify(supplierQuote)])

  const quotedPrice = useMemo(() => {
    const x = parseFloat(String(supplierQuote.quantityPriced))

    if (isNaN(x)) return ""

    return formatCurrency({ amount: x, maxDecimal: 2 })
  }, [JSON.stringify(supplierQuote)])

  const reqQuantity = useMemo(() => {
    if (!requisition) return ""

    const x = parseFloat(String(requisition.quantity))

    if (isNaN(x)) return ""

    return formatNumber({ amount: x, maxDecimal: 2 })
  }, [JSON.stringify(requisition)])

  const reqCustomerStandardPrice = useMemo(() => {
    if (!requisition) return ""

    const x = parseFloat(String(requisition.customerStandardPrice))

    if (isNaN(x)) return ""

    return formatCurrency({ amount: x, maxDecimal: 2 })
  }, [JSON.stringify(requisition)])

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Summary' description='Requisition summary details' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Date' value={format(supplierQuote.date, "MM-dd-yyyy")} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Requisition' value={requisition.code} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Requsition - Result' value={requisitionResult || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Status' value={status} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Result' value={result || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Sourcing Round' value={sourcingRound || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Follow Up Date' value={followUpDate} />

        <ReadOnlyField
          className='col-span-12 lg:col-span-6'
          title='Buyers'
          value={
            <div className='flex flex-wrap items-center gap-1.5'>
              {buyers.map((person, i) => (
                <Badge key={i} variant='soft-red'>
                  {person}
                </Badge>
              ))}
            </div>
          }
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Preferred Source'
          value={supplierQuote.isPreferredSource ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Quoted Source'
          value={supplierQuote.isQuotedSource ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyFieldHeader className='col-span-12' title='Supplier' description="Supplier quote's supplier details" />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Company Name' value={supplier.CardName} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Supplier - Terms' value='' />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-4'
          title='Supplier - Assigned Buyer'
          value={supplier?.buyer?.name || supplier?.buyer?.email || ""}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Supplier - Status' value={supplierStatus || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Supplier - Cancellation Rate - Previous QTR' value={""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Supplier - PO Failure Rate' value={""} />

        <ReadOnlyField className='col-span-12' title='Supplier - Reason Denied' value={""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Contact - Full Name' value='' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Contacted Via' value={contactedVia || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Contact - Email Address' value='' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Contact - Direct Phone' value='' />

        <ReadOnlyFieldHeader className='col-span-12' title='Quote' description="Quote's details" />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Show Stocks'
          value={supplierQuote.isShowsStock ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Show Available'
          value={supplierQuote.isShowsAvailable ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Strong w/ MFR'
          value={supplierQuote.isShowsWithMfr ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Strong w/ Commodity'
          value={supplierQuote.isShowsWithCommodity ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Trusted Source'
          value={supplierQuote.isTrustedSource ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Manufacturer'
          value={supplierQuote.isManufacturer ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='FD'
          value={supplierQuote.isFd ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Previous Source / Old Stk Offer'
          value={supplierQuote.isPreviousSourceOldStkOffer ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        {item && (
          <>
            <ReadOnlyField className='col-span-12' title='Item' value={item.ItemName} description='Item/s selected from the requisition' />

            <ReadOnlyField className='col-span-12 md:col-span-6' title='MPN' value={item.ItemCode} />

            <ReadOnlyField className='col-span-12 md:col-span-6' title='MFR' value={item.FirmName} />
          </>
        )}

        <ReadOnlyField className='col-span-12 md:col-span-6' title='LT to SJC (Number)' value={ltToSjcNumber || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6' title='LT to SJC (UOM)' value={ltToSjcUom || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Date Code' value={supplierQuote.dateCode || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Condition' value={supplierQuote.condition || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='COO' value={supplierQuote.coo || ""} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='RoHs'
          value={roHs && <Badge variant='soft-slate'>{roHs}</Badge>}
        />

        <ReadOnlyField className='col-span-12' title='Total Cost' value={totalCost} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Quantity Quoted' value={quantityQuoted} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Requisition - Quantity' value={reqQuantity} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Quoted Price' value={quotedPrice} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Requisition - Customer Target Price'
          value={reqCustomerStandardPrice}
        />

        <ReadOnlyField className='col-span-12' title='Comments' value={supplierQuote.comments || ""} />
      </div>
    </Card>
  )
}
