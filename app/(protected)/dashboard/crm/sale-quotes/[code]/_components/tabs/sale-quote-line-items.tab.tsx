import { getItems } from "@/actions/item-master"
import { getRequisitions, RequestedItemsJSONData } from "@/actions/requisition"
import { getSaleQuoteByCode, LineItemsJSONData } from "@/actions/sale-quote"
import ReadOnlyField from "@/components/read-only-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/formatter"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import SaleQuoteLineItemList from "../sale-quote-line-items-list"
import { add, multiply } from "mathjs"

type SaleQuoteLineItemsTabProps = {
  saleQuote: NonNullable<Awaited<ReturnType<typeof getSaleQuoteByCode>>>
  items: Awaited<ReturnType<typeof getItems>>
  requisitions: NonNullable<Awaited<ReturnType<typeof getRequisitions>>>
}

//TODO: optimize dont fetch all requisitions and items, instead fetch only the record thats needed\
export default function SaleQuoteLineItemsTab({ saleQuote, items, requisitions }: SaleQuoteLineItemsTabProps) {
  const router = useRouter()
  const lineItems = (saleQuote?.lineItems || []) as LineItemsJSONData

  //* get full details of the line items
  const lineItemsFullDetails = useMemo(() => {
    const fullDetailsItems =
      lineItems.map((li) => {
        const selectedItem = items.find((item) => item.ItemCode == li.code)
        const selectedReq = requisitions.find((req) => req.code == li.requisitionCode)

        if (selectedItem && selectedReq) {
          const unitPrice = parseFloat(String(li.unitPrice))
          const quantity = parseFloat(String(li.quantity))

          return {
            ...li,
            mpn: selectedItem.ItemCode,
            mfr: selectedItem.FirmName,
            cpn: selectedReq.customerPn,
            name: selectedItem.ItemName,
            dateCode: selectedReq.dateCode,
            estimatedDeliveryDate: selectedReq.estimatedDeliveryDate,
            unitPrice: isNaN(unitPrice) ? 0 : unitPrice,
            quantity: isNaN(quantity) ? 0 : quantity,
            source: selectedItem.source,
            reqRequestedItems: (selectedReq.requestedItems as RequestedItemsJSONData) || [],
          }
        }

        return null
      }) || []

    return fullDetailsItems.filter((item) => item !== null)
  }, [JSON.stringify(items), JSON.stringify(requisitions)])

  const total = lineItemsFullDetails.reduce((acc, item) => {
    if (!item) return acc
    return add(acc, multiply(item.unitPrice, item.quantity))
  }, 0)

  const Actions = () => {
    return (
      <Button variant='outline-primary' disabled>
        Add Line Item
      </Button>
    )
  }

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-x-3 gap-y-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Line Items' description="Sale Quote's line items list" actions={<Actions />} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Tax' value='' />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-4'
          title='Sub Total'
          value={formatCurrency({ amount: total, maxDecimal: 2 })}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-4'
          title='Total'
          value={formatCurrency({ amount: total, maxDecimal: 2 })}
        />

        <div className='col-span-12'>
          <SaleQuoteLineItemList saleQuoteId={saleQuote.id} lineItems={lineItemsFullDetails} />
        </div>
      </div>
    </Card>
  )
}
