import { format } from "date-fns"

import { getSaleQuoteByCode } from "@/actions/sale-quote"
import { Card } from "@/components/ui/card"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import ReadOnlyField from "@/components/read-only-field"

type SaleQuoteSummaryTabProps = {
  saleQuote: NonNullable<Awaited<ReturnType<typeof getSaleQuoteByCode>>>
  paymentTerms?: any
}

export default function SaleQuoteSummaryTab({ saleQuote, paymentTerms }: SaleQuoteSummaryTabProps) {
  const customer = saleQuote.customer
  const salesRep = saleQuote.salesRep
  const approval = saleQuote.approval

  const paymentTerm = paymentTerms?.find((term: any) => term.GroupNum === saleQuote.paymentTerms)?.PymntGroup

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Summary' description='Sale quote summary details' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Date' value={format(saleQuote.date, "MM-dd-yyyy")} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Company Name' value={customer.CardName} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Contact - Full Name' value='' />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Sales Rep'
          value={salesRep?.name || salesRep?.email || ""}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6' title='Bill To' value={saleQuote.billTo || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6' title='Ship To' value={saleQuote.shipTo || ""} />

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
