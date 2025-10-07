"use client"

import { getRequisitionsByPartialMpn } from "@/actions/requisition"
import { Card } from "@/components/ui/card"
import RequisitionHistoryList from "../requisition-history-list"

type RequisitionHistoryTabProps = {
  requisitionsHistory: {
    data: Awaited<ReturnType<typeof getRequisitionsByPartialMpn>>
    isLoading: boolean
  }
}

export default function RequisitionHistoryTab({ requisitionsHistory }: RequisitionHistoryTabProps) {
  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-x-3 gap-y-5'>
        <div className='col-span-12'>
          <RequisitionHistoryList requisitionHistory={requisitionsHistory.data} isLoading={requisitionsHistory.isLoading} />
        </div>
      </div>
    </Card>
  )
}
