"use client"

import { useMemo } from "react"
import { add, multiply } from "mathjs"

import { getItems } from "@/actions/item-master"
import { getRequisitions } from "@/actions/requisition"
import { getSaleQuoteByCode, LineItemsJSONData } from "@/actions/sale-quote"
import ReadOnlyField from "@/components/read-only-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/formatter"
import SaleQuoteLineItemList from "../sale-quote-line-items-list"
import { useDialogStore } from "@/hooks/use-dialog"
import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import LineItemForm from "../line-item-form"

type SaleQuoteLineItemsTabProps = {
  saleQuote: NonNullable<Awaited<ReturnType<typeof getSaleQuoteByCode>>>
  items: Awaited<ReturnType<typeof getItems>>
  requisitions: NonNullable<Awaited<ReturnType<typeof getRequisitions>>>
}

//TODO: optimize dont fetch all requisitions and items, instead fetch only the record thats needed\
export default function SaleQuoteLineItemsTab({ saleQuote, items, requisitions }: SaleQuoteLineItemsTabProps) {
  const lineItems = (saleQuote?.lineItems || []) as LineItemsJSONData

  const { isOpen, setIsOpen, data, setData } = useDialogStore(["isOpen", "setIsOpen", "data", "setData"])

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
              leadTime: li.leadTime,
            }
          }
        }

        return null
      }) || []

    return fullDetailsItems.filter((item) => item !== null)
  }, [JSON.stringify(lineItems), JSON.stringify(items), JSON.stringify(requisitions)])

  const total = lineItemsFullDetails.reduce((acc, item) => {
    if (!item) return acc
    return add(acc, multiply(item.unitPrice, item.quantity))
  }, 0)

  const Actions = () => {
    const handleActionClick = () => {
      setIsOpen(true)
      setData(null)
    }

    return (
      <Button variant='outline-primary' onClick={handleActionClick}>
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='max-h-[85vh] overflow-auto sm:max-w-5xl'>
          <DialogHeader>
            <DialogTitle>Add line item for sale quote #{saleQuote.code}</DialogTitle>
            <DialogDescription>Fill in the form to add a new line item for this sale quote.</DialogDescription>
          </DialogHeader>

          <Card className='p-3'>
            <LineItemForm
              saleQuoteId={saleQuote.id}
              customerCode={saleQuote.customerCode}
              lineItem={data || null}
              lineItems={lineItemsFullDetails}
              items={items}
              requisitions={requisitions}
            />
          </Card>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
