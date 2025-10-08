"use client"

import { getCustomerPOHitRateClient } from "@/actions/master-bp"
import { getRequisitionByCode } from "@/actions/requisition"
import { Badge } from "@/components/badge"
import ReadOnlyField from "@/components/read-only-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Card } from "@/components/ui/card"
import {
  REQUISITION_PO_STATUS_OPTIONS,
  REQUISITION_PURCHASING_STATUS_OPTIONS,
  REQUISITION_REASON_OPTIONS,
  REQUISITION_REQ_REVIEW_RESULT_OPTIONS,
  REQUISITION_RESULT_OPTIONS,
  REQUISITION_SALES_CATEGORY_OPTIONS,
  REQUISITION_URGENCY_OPTIONS,
} from "@/schema/requisition"
import { format } from "date-fns"
import { format as mathFormat } from "mathjs"
import { useAction } from "next-safe-action/hooks"
import { useEffect, useMemo } from "react"

type RequisitionSummaryTabProps = {
  requisition: NonNullable<Awaited<ReturnType<typeof getRequisitionByCode>>>
}

export default function RequisitionSummaryTab({ requisition }: RequisitionSummaryTabProps) {
  const customerName = requisition.customer?.CardName || ""
  const customerCode = requisition.customer?.CardCode || ""

  const contact = requisition.contact ? `${requisition.contact.FirstName} ${requisition.contact.LastName}` : ""

  const urgency = REQUISITION_URGENCY_OPTIONS.find((item) => item.value === requisition.urgency)?.label
  const purchasingStatus = REQUISITION_PURCHASING_STATUS_OPTIONS.find((item) => item.value === requisition.purchasingStatus)?.label
  const result = REQUISITION_RESULT_OPTIONS.find((item) => item.value === requisition.result)?.label
  const salesCategory = REQUISITION_SALES_CATEGORY_OPTIONS.find((item) => item.value === requisition.salesCategory)?.label
  const reason = REQUISITION_REASON_OPTIONS.find((item) => item.value === requisition.reason)?.label
  const reqReviewResult =requisition.reqReviewResult?.map((item) => REQUISITION_REQ_REVIEW_RESULT_OPTIONS.find((option) => option.value === item)?.label) .filter(Boolean) || [] //prettier-ignore
  const poStatus = REQUISITION_PO_STATUS_OPTIONS.find((item) => item.value === requisition.poStatus)?.label

  const salesPersons = requisition.salesPersons?.map((person) => person?.user?.name || person?.user?.email).filter(Boolean) || []
  const salesTeam = requisition.salesTeam?.map((person) => person?.user?.name || person?.user?.email).filter(Boolean) || []
  const omegaBuyers = requisition.omegaBuyers?.map((person) => person?.user?.name || person?.user?.email).filter(Boolean) || []

  const {
    execute: getCustomerPOHitRateExec,
    isExecuting: isCustomerPOHitRateLoading,
    result: { data: customerPOHitRate },
  } = useAction(getCustomerPOHitRateClient)

  const customerPoHitRatePercentage = useMemo((): string => {
    const value = customerPOHitRate ?? 0
    return `${mathFormat(value * 100, { notation: "fixed", precision: 2 })}%`
  }, [customerPOHitRate, isCustomerPOHitRateLoading])

  useEffect(() => {
    if (!requisition) return

    getCustomerPOHitRateExec({ customerCode: requisition.customerCode })
  }, [JSON.stringify(requisition)])

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Summary' description='Requisition summary details' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Date' value={format(requisition.date, "MM-dd-yyyy")} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Urgency'
          value={urgency ? <Badge variant='soft-amber'>{urgency}</Badge> : null}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Sales Category'
          value={<Badge variant='soft-slate'>{salesCategory}</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Purchasing Status'
          value={purchasingStatus ? <Badge variant='soft-blue'>{purchasingStatus}</Badge> : null}
        />

        <ReadOnlyField
          className='col-span-12 lg:col-span-4'
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
          className='col-span-12 md:col-span-6 lg:col-span-4'
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
          className='col-span-12 md:col-span-6 lg:col-span-4'
          title='Sales Team'
          value={
            <div className='flex flex-wrap items-center gap-1.5'>
              {salesTeam.map((person, i) => (
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
          value={requisition.isActiveFollowUp ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Result'
          value={result ? <Badge variant={requisition.result === "won" ? "soft-green" : "soft-red"}>{result}</Badge> : null}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Reason' value={reason ? reason : ""} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6'
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

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Date Code' value={requisition.dateCode || ""} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Estimated Delivery Date'
          value={requisition.estimatedDeliveryDate ? format(requisition.estimatedDeliveryDate, "MM-dd-yyyy") : ""}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Cust. PO #' value={requisition.custPoNum ?? ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='PO Status' value={poStatus} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='PO Status Last Updated'
          value={requisition.poStatusLastUpdated ? format(requisition.poStatusLastUpdated, "MM-dd-yyyy") : ""}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Customer PO Dock Date'
          value={requisition.custPoDockDate ? format(requisition.custPoDockDate, "MM-dd-yyyy") : ""}
        />

        <ReadOnlyFieldHeader className='col-span-12' title='Customer' description='Requisition customer details' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Code' value={customerCode || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Name' value={customerName || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Contact - Full Name' value={contact} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='PO Hit Rate'
          value={customerPoHitRatePercentage}
          isLoading={isCustomerPOHitRateLoading}
        />
      </div>
    </Card>
  )
}
