"use client"

import { Card } from "@/components/ui/card"
import { getSupplierQuotesByPartialMpn } from "@/actions/supplier-quote"
import RequisitionSupplierQuoteHistoryList from "../requisition-supplier-history-list"

type RequisitionSupplierQuoteHistoryTabProps = {
  supplierQuotes: {
    data: Awaited<ReturnType<typeof getSupplierQuotesByPartialMpn>>
    isLoading: boolean
  }
}

export default function RequisitionSupplierQuoteHistoryTab({ supplierQuotes }: RequisitionSupplierQuoteHistoryTabProps) {
  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-x-3 gap-y-5'>
        <div className='col-span-12'>
          <RequisitionSupplierQuoteHistoryList supplierQuotes={supplierQuotes.data} isLoading={supplierQuotes.isLoading} />
        </div>
      </div>
    </Card>
  )
}
