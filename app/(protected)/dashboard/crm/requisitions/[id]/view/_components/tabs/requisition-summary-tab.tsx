import { getRequisitionById } from "@/actions/requisition"
import { Badge } from "@/components/badge"
import ReadOnlyField from "@/components/read-only-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Card } from "@/components/ui/card"
import {
  PURCHASING_STATUS_OPTIONS,
  REASON_OPTIONS,
  REQ_REVIEW_RESULT_OPTIONS,
  RESULT_OPTIONS,
  SALES_CATEGORY_OPTIONS,
  URGENCY_OPTIONS,
} from "@/schema/requisition"
import { format } from "date-fns"

type RequisitionSummaryTabProps = {
  requisition: NonNullable<Awaited<ReturnType<typeof getRequisitionById>>>
}

export default function RequisitionSummaryTab({ requisition }: RequisitionSummaryTabProps) {
  const customer = requisition.customer?.CardName || requisition.customer?.CardCode
  const urgency = URGENCY_OPTIONS.find((item) => item.value === requisition.urgency)?.label
  const purchasingStatus = PURCHASING_STATUS_OPTIONS.find((item) => item.value === requisition.purchasingStatus)?.label
  const result = RESULT_OPTIONS.find((item) => item.value === requisition.result)?.label
  const salesCategory = SALES_CATEGORY_OPTIONS.find((item) => item.value === requisition.salesCategory)?.label
  const reason = REASON_OPTIONS.find((item) => item.value === requisition.reason)?.label
  const reqReviewResult =
    requisition.reqReviewResult?.map((item) => REQ_REVIEW_RESULT_OPTIONS.find((option) => option.value === item)?.label).filter(Boolean) ||
    []

  const salesPersons = requisition.salesPersons?.map((person) => person?.user?.name || person?.user?.email).filter(Boolean) || []
  const omegaBuyers = requisition.omegaBuyers?.map((person) => person?.user?.name || person?.user?.email).filter(Boolean) || []

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Summary' description='Requisition summary details' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Date' value={format(requisition.date, "MM-dd-yyyy")} />

        {urgency && (
          <ReadOnlyField
            className='col-span-12 md:col-span-6 lg:col-span-3'
            title='Urgency'
            value={<Badge variant='soft-amber'>{urgency}</Badge>}
          />
        )}

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Sales Category'
          value={<Badge variant='soft-slate'>{salesCategory}</Badge>}
        />

        {purchasingStatus && (
          <ReadOnlyField
            className='col-span-12 md:col-span-6 lg:col-span-3'
            title='Purchasing Status'
            value={<Badge variant='soft-blue'>{purchasingStatus}</Badge>}
          />
        )}

        <ReadOnlyField
          className='col-span-12 lg:col-span-6'
          title='Sales Person'
          value={
            <div className='flex flex-wrap items-center gap-1.5'>
              {salesPersons.map((person, i) => (
                <Badge key={i} variant='soft-red'>
                  {person}
                </Badge>
              ))}
            </div>
          }
        />

        <ReadOnlyField
          className='col-span-12 lg:col-span-6'
          title='Omega Buyers'
          value={
            <div className='flex flex-wrap items-center gap-1.5'>
              {omegaBuyers.map((person, i) => (
                <Badge key={i} variant='soft-red'>
                  {person}
                </Badge>
              ))}
            </div>
          }
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Purchasing Initiated'
          value={requisition.isPurchasingInitiated ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='For Follow-Up'
          value={<div>{requisition.isActiveFollowUp ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}</div>}
        />

        {result && (
          <ReadOnlyField
            className='col-span-12 md:col-span-6 lg:col-span-3'
            title='Result'
            value={<Badge variant={requisition.result === "won" ? "soft-green" : "soft-red"}>{result}</Badge>}
          />
        )}

        {reason && <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Reason' value={reason} />}

        <ReadOnlyField
          className='col-span-12'
          title='REQ Review Result'
          value={
            <div className='flex flex-wrap items-center gap-1.5'>
              {reqReviewResult.map((reviewResult, i) => (
                <Badge key={i} variant='soft-red'>
                  {reviewResult}
                </Badge>
              ))}
            </div>
          }
        />

        <ReadOnlyFieldHeader className='col-span-12' title='Customer' description='Requisition customer details' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Date' value={customer || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Contact - Full Name' value={""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Customer - PO Hit Rate' value={"0.0%"} />

        <ReadOnlyField className='col-span-12' title='Customer PN' value={requisition.customerPn} />
      </div>
    </Card>
  )
}
