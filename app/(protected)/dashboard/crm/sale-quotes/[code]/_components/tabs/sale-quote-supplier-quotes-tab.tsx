import { getSaleQuoteByCode } from "@/actions/sale-quote"
import { getSupplierQuoteByCode } from "@/actions/supplier-quote"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Card } from "@/components/ui/card"
import SaleQuoteSupplierQuotesList from "../sale-quote-supplier-quotes-list"
import { getItems } from "@/actions/master-item"

type SaleQuoteSupplierQuotesTabProps = {
  saleQuote: NonNullable<Awaited<ReturnType<typeof getSaleQuoteByCode>>>
  items: Awaited<ReturnType<typeof getItems>>
}

export default function SaleQuoteSupplierQuotesTab({ saleQuote, items }: SaleQuoteSupplierQuotesTabProps) {
  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-x-3 gap-y-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Supplier Quotes' description="Sale quote's related supplier quotes" />

        <div className='col-span-12'>
          <SaleQuoteSupplierQuotesList supplierQuotes={saleQuote.supplierQuotes} items={items} />
        </div>
      </div>
    </Card>
  )
}
