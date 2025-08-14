import { format, parse } from "date-fns"

import { getBpMasterByCardCode } from "@/actions/bp-master"
import { Badge, BadgeProps } from "@/components/badge"
import ReadOnlyField from "@/components/read-only-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Card } from "@/components/ui/card"
import {
  BP_MASTER_CUSTOMER_ACCOUNT_TYPE_OPTIONS,
  BP_MASTER_CUSTOMER_STATUS_OPTIONS,
  BP_MASTER_CUSTOMER_TYPE_OPTIONS,
} from "@/schema/bp-master"
import { SYNC_STATUSES_COLORS, SYNC_STATUSES_OPTIONS } from "@/constant/common"
import { Separator } from "@/components/ui/separator"

type CustomerSummaryTabProps = {
  customer: NonNullable<Awaited<ReturnType<typeof getBpMasterByCardCode>>>
}

export default function CustomerSummaryTab({ customer }: CustomerSummaryTabProps) {
  const accountType = BP_MASTER_CUSTOMER_ACCOUNT_TYPE_OPTIONS.find((item) => item.value === customer.accountType)?.label
  const type = BP_MASTER_CUSTOMER_TYPE_OPTIONS.find((item) => item.value === customer.type)?.label
  const status = BP_MASTER_CUSTOMER_STATUS_OPTIONS.find((item) => item.value === customer.status)?.label

  const salesEmployee = customer.salesEmployee?.name || customer.salesEmployee?.email || ""
  const bdrInsideSalesRep = customer.bdrInsideSalesRep?.name || customer.bdrInsideSalesRep?.email || ""
  const accountExecutive = customer.accountExecutive?.name || customer.accountExecutive?.email || ""
  const accountAssociate = customer.accountAssociate?.name || customer.accountAssociate?.email || ""

  const excessManager = customer?.assignedExcessManagers?.map((em) => em.user.name || em.user.email) || []

  const SyncStatus = ({ status }: { status: string }) => {
    const label = SYNC_STATUSES_OPTIONS.find((item) => item.value === status)?.label
    const color = SYNC_STATUSES_COLORS.find((item) => item.value === status)?.color

    if (!status || !label || !color) return null

    return <Badge variant={color as BadgeProps["variant"]}>{label}</Badge>
  }

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Summary' description='Customer summary details' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Company Name' value={customer.CardName} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Code' value={customer.CardCode} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Account Type'
          value={accountType ? <Badge variant='soft-slate'>{accountType}</Badge> : null}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Group'
          value={customer?.GroupName ? <Badge variant='soft-blue'>{customer.GroupName}</Badge> : null}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-4'
          title='Type'
          value={type ? <Badge variant='soft-blue'>{type}</Badge> : null}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-4'
          title='Status'
          value={status ? <Badge variant='soft-amber'>{status}</Badge> : null}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Industry Type' value={customer.industryType || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Terms' value={customer?.PymntGroup || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Currency' value={customer?.CurrName || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Phone' value={customer?.Phone1 || ""} />

        <Separator className='col-span-12' />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Sales Employee'
          value={salesEmployee ? <Badge variant='soft-red'>{salesEmployee}</Badge> : null}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='BDR / Inside Sales Rep'
          value={bdrInsideSalesRep ? <Badge variant='soft-red'>{bdrInsideSalesRep}</Badge> : null}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Account Executive'
          value={accountExecutive ? <Badge variant='soft-red'>{accountExecutive}</Badge> : null}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Account Associate'
          value={accountAssociate ? <Badge variant='soft-red'>{accountAssociate}</Badge> : null}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-12'
          title='Excess Manager'
          value={excessManager.map((manager: string, index: number) => (
            <Badge key={index} variant='soft-red'>
              {manager}
            </Badge>
          ))}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-4'
          title='Active'
          value={customer?.isActive ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-4'
          title='Credit Hold'
          value={customer?.isCreditHold ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-4'
          title='Warehousing Customer'
          value={customer?.isWarehousingCustomer ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Source'
          value={customer?.source === "portal" ? <Badge variant='soft-amber'>Portal</Badge> : <Badge variant='soft-green'>SAP</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Sync Status'
          value={<SyncStatus status={customer.syncStatus} />}
        />

        <ReadOnlyFieldHeader className='col-span-12' title='Address' description='Customer full address details' />

        <ReadOnlyField className='col-span-12' title='Street' value={customer?.street || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Street No.' value={customer?.streetNo || ""} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Building/Floor/Room'
          value={customer?.buildingFloorRoom || ""}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Block' value={customer?.block || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='City' value={customer?.city || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Zip Code' value={customer?.zipCode || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='County' value={customer?.county || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='State' value={customer?.state || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Country' value={customer?.country || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='GLN' value={customer?.gln || ""} />
      </div>
    </Card>
  )
}
