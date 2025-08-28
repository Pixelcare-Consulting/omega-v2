"use client"

import { format } from "date-fns"

import { getSaleQuoteByCode, LineItemsJSONData } from "@/actions/sale-quote"
import { Card } from "@/components/ui/card"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import ReadOnlyField from "@/components/read-only-field"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { getItems } from "@/actions/master-item"
import { getRequisitions } from "@/actions/requisition"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { usePDF } from "@react-pdf/renderer"
import SalesQuotationPdf from "@/components/pdf/sales-qoute-pdf"
import { Address } from "@prisma/client"

type SaleQuoteSummaryTabProps = {
  saleQuote: NonNullable<Awaited<ReturnType<typeof getSaleQuoteByCode>>>
  items: Awaited<ReturnType<typeof getItems>>
  requisitions: Awaited<ReturnType<typeof getRequisitions>>
  paymentTerms?: any
}

export default function SaleQuoteSummaryTab({ saleQuote, items, requisitions, paymentTerms }: SaleQuoteSummaryTabProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [instance, updateInstance] = usePDF()

  const lineItems = (saleQuote?.lineItems || []) as LineItemsJSONData

  const customer = saleQuote.customer
  const salesRep = saleQuote.salesRep
  const approval = saleQuote.approval
  const contact = saleQuote.contact

  const getAddress = (address?: NonNullable<Awaited<ReturnType<typeof getSaleQuoteByCode>>>["customer"]["addresses"][number]) => {
    let result = ""

    if (!address) return ""

    if (address?.Street) result += address.Street
    else if (!address?.Street && address?.Address2) result += address.Address2
    else if (!address?.Address2 && address?.Address3) result += address.Address3

    if (address.StreetNo) result += `, ${address.StreetNo}`
    if (address.Building) result += `, ${address.Building}`
    if (address.Block) result += `, ${address.Block}`

    if (address.City) result += `, ${address.City}`
    if (address.stateName) result += `, ${address.stateName}`
    if (address.County) result += `, ${address.County}`
    if (address.ZipCode) result += `, ${address.ZipCode}`
    if (address.countryName) result += `, ${address.countryName}`

    return result
  }

  const billToAddress = useMemo(() => {
    const address = customer.addresses.find((address) => customer.BillToDef === address.id)
    return getAddress(address)
  }, [JSON.stringify(customer)])

  const shipToAddress = useMemo(() => {
    const address = customer.addresses.find((address) => customer.ShipToDef === address.id)
    return getAddress(address)
  }, [JSON.stringify(customer)])

  const contactFullName = useMemo(() => {
    if (!contact) return ""

    let fullname = ""

    if (contact.FirstName) fullname += `${contact.FirstName} `
    if (contact.LastName) fullname += contact.LastName

    return fullname
  }, [JSON.stringify(contact)])

  const paymentTerm = paymentTerms?.find((term: any) => term.GroupNum === saleQuote.paymentTerms)?.PymntGroup

  //* get full details of the line items
  const lineItemsFullDetails = useMemo(() => {
    const fullDetailsItems =
      lineItems.map((li) => {
        const selectedRequisition = requisitions.find((req) => req.code == li.requisitionCode)
        const supplierQuote = selectedRequisition?.supplierQuotes.find((quote) => quote.code == li.supplierQuoteCode)

        if (selectedRequisition && supplierQuote) {
          const selectedItem = items.find((item) => item.ItemCode == li.code)

          if (selectedItem) {
            const unitPrice = parseFloat(String(li.unitPrice))
            const quantity = parseFloat(String(li.quantity))

            return {
              requisitionCode: selectedRequisition.code,
              supplierQuoteCode: supplierQuote.code,
              code: selectedItem.ItemCode,
              name: selectedItem.ItemName,
              mpn: selectedItem.ItemCode,
              mfr: selectedItem.FirmName,
              cpn: selectedRequisition.customerPn,
              source: selectedItem.source,
              ltToSjcNumber: supplierQuote.ltToSjcNumber,
              ltToSjcUom: supplierQuote.ltToSjcUom,
              condition: supplierQuote.condition,
              coo: supplierQuote.coo,
              dateCode: supplierQuote.dateCode,
              estimatedDeliveryDate: supplierQuote.estimatedDeliveryDate,
              unitPrice: isNaN(unitPrice) ? 0 : unitPrice,
              quantity: isNaN(quantity) ? 0 : quantity,
              details: li.details,
            }
          }
        }

        return null
      }) || []

    return fullDetailsItems.filter((item) => item !== null)
  }, [JSON.stringify(lineItems), JSON.stringify(items), JSON.stringify(requisitions)])

  const downloadPDF = useCallback(
    (code: number) => {
      if (!instance.url) return

      const link = document.createElement("a") as HTMLAnchorElement
      link.href = instance.url
      link.download = `SALES-QUOTE-${code}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    [instance.url]
  )

  const printPDF = useCallback(() => {
    if (iframeRef.current) {
      if (!instance.url) return

      const iframe = iframeRef.current
      iframe.src = instance.url
      iframe.onload = () => iframe.contentWindow?.print()
    }
  }, [instance.url, iframeRef])

  //* initialize PDF instance
  useEffect(() => {
    if (saleQuote && lineItemsFullDetails.length > 0) {
      updateInstance(
        <SalesQuotationPdf
          salesQuote={saleQuote}
          lineItems={lineItemsFullDetails}
          paymentTerms={paymentTerms}
          billTo={billToAddress}
          shipTo={shipToAddress}
        />
      )
    }
  }, [JSON.stringify(saleQuote), JSON.stringify(lineItemsFullDetails)])

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-5'>
        <ReadOnlyFieldHeader
          className='col-span-12'
          title='Summary'
          description='Sale quote summary details'
          actions={
            <div className='flex items-center gap-2'>
              <Button onClick={() => printPDF()}>
                <Icons.print className='size-4' />
                Print
              </Button>

              <iframe ref={iframeRef} style={{ display: "none" }} />

              {instance.url && (
                <Button variant='outline-primary' onClick={() => downloadPDF(saleQuote.code)}>
                  <Icons.download className='size-4' />
                  Download
                </Button>
              )}
            </div>
          }
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Date' value={format(saleQuote.date, "MM-dd-yyyy")} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Company Name' value={customer.CardName} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Contact - Full Name' value={contactFullName} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Sales Rep'
          value={salesRep?.name || salesRep?.email || ""}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6' title='Bill To' value={billToAddress} />

        <ReadOnlyField className='col-span-12 md:col-span-6' title='Ship To' value={shipToAddress} />

        <ReadOnlyField className='col-span-12 md:col-span-3' title='Payment Terms' value={paymentTerm || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-3' title='FOB Point' value={saleQuote.fobPoint || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-3' title='Shipping Method' value={saleQuote.shippingMethod || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-3' title='Valid Until' value={format(saleQuote.validUntil, "MM-dd-yyyy")} />

        <ReadOnlyFieldHeader className='col-span-12' title='Approval' description='Sale quote approval details' />

        <ReadOnlyField className='col-span-12 md:col-span-6' title='Approval' value={approval?.name || approval?.email || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6' title='Date' value={format(saleQuote?.approvalDate, "MM-dd-yyyy")} />
      </div>
    </Card>
  )
}
