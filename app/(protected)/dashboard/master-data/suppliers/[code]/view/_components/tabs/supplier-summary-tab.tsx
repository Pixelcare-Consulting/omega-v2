import { getBpMasterByCardCode } from "@/actions/master-bp"
import { Badge, BadgeProps } from "@/components/badge"
import ReadOnlyField from "@/components/read-only-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Card } from "@/components/ui/card"
import { SYNC_STATUSES_COLORS, SYNC_STATUSES_OPTIONS } from "@/constant/common"
import {
  BP_MASTER_SUPPLIER_AVL_STATUS_OPTIONS,
  BP_MASTER_SUPPLIER_SCOPE_OPTIONS,
  BP_MASTER_SUPPLIER_STATUS_OPTIONS,
  BP_MASTER_SUPPLIER_WARRANY_PERIOD_OPTIONS,
} from "@/schema/master-bp"

type SupplierSummaryTabProps = {
  supplier: NonNullable<Awaited<ReturnType<typeof getBpMasterByCardCode>>>
  itemGroups?: any
  manufacturers?: any
}

export default function SupplierSummaryTab({ supplier, itemGroups, manufacturers }: SupplierSummaryTabProps) {
  const commodityStrengths =
    itemGroups
      ?.filter((item: any) => supplier?.commodityStrengths?.includes(item?.Number))
      ?.map((item: any) => item?.GroupName || "")
      .filter(Boolean) || []

  const mfrStrengths =
    manufacturers
      ?.filter((manufacturer: any) => supplier?.mfrStrengths?.includes(manufacturer?.Code))
      ?.map((manufacturer: any) => manufacturer?.ManufacturerName || "")
      .filter(Boolean) || []

  const buyer = supplier.buyer?.name || supplier.buyer?.email || ""

  const avlStatus = BP_MASTER_SUPPLIER_AVL_STATUS_OPTIONS.find((item) => item.value === supplier?.avlStatus)?.label
  const status = BP_MASTER_SUPPLIER_STATUS_OPTIONS.find((item) => item.value === supplier?.status)?.label
  const scope = BP_MASTER_SUPPLIER_SCOPE_OPTIONS.find((item) => item.value === supplier?.scope)?.label
  const warrantyPeriod = BP_MASTER_SUPPLIER_WARRANY_PERIOD_OPTIONS.find((item) => item.value === supplier?.warranyPeriod)?.label

  const SyncStatus = ({ status }: { status: string }) => {
    const label = SYNC_STATUSES_OPTIONS.find((item) => item.value === status)?.label
    const color = SYNC_STATUSES_COLORS.find((item) => item.value === status)?.color

    if (!status || !label || !color) return null

    return <Badge variant={color as BadgeProps["variant"]}>{label}</Badge>
  }

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-5'>
        <ReadOnlyFieldHeader className='col-span-12' title='Summary' description='Supplier summary details' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Company Name' value={supplier.CardName} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Code' value={supplier.CardCode} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Supplier Account #' value={supplier?.accountNo || ""} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Group'
          value={supplier?.GroupName ? <Badge variant='soft-blue'>{supplier.GroupName}</Badge> : null}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Assigned Buyer'
          value={buyer ? <Badge variant='soft-red'>{buyer}</Badge> : null}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Phone' value={supplier?.Phone1 || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Website' value={supplier?.website || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Currency' value={supplier?.CurrName || ""} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6'
          title='Commodity Strengths'
          value={commodityStrengths.map((strength: string, index: number) => (
            <Badge key={index} variant='soft-red'>
              {strength}
            </Badge>
          ))}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6'
          title='MFR Strengths'
          value={mfrStrengths.map((strength: string, index: number) => (
            <Badge key={index} variant='soft-red'>
              {strength}
            </Badge>
          ))}
        />

        <ReadOnlyFieldHeader className='col-span-12' title='Qualification Data' description='Supplier qualification data details' />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='AVL Status' value={avlStatus || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Status' value={status || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Scope' value={scope || ""} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Compliant to As'
          value={supplier?.isCompliantToAs ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Compliant to Itar'
          value={supplier?.isCompliantToItar ? <Badge variant='soft-green'>Yes</Badge> : <Badge variant='soft-red'>No</Badge>}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Terms' value={supplier?.PymntGroup || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Warranty Period' value={warrantyPeriod || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6' title='Omera Reviews' value={supplier?.omegaReviews || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6' title='Qualification Notes' value={supplier?.qualificationNotes || ""} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Source'
          value={supplier?.source === "portal" ? <Badge variant='soft-amber'>Portal</Badge> : <Badge variant='soft-green'>SAP</Badge>}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Sync Status'
          value={<SyncStatus status={supplier.syncStatus} />}
        />

        <ReadOnlyFieldHeader className='col-span-12' title='Address' description='Supplier full address details' />

        <ReadOnlyField className='col-span-12' title='Street' value={supplier?.street || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Street No.' value={supplier?.streetNo || ""} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Building/Floor/Room'
          value={supplier?.buildingFloorRoom || ""}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Block' value={supplier?.block || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='City' value={supplier?.city || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Zip Code' value={supplier?.zipCode || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='County' value={supplier?.county || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='State' value={supplier?.state || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Country' value={supplier?.country || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='GLN' value={supplier?.gln || ""} />
      </div>
    </Card>
  )
}
