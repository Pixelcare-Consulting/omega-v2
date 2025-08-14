import Link from "next/link"
import { useRouter } from "nextjs-toploader/app"
import { ColumnDef } from "@tanstack/react-table"

import { Badge, BadgeProps } from "@/components/badge"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getBpMasters } from "@/actions/bp-master"
import { SYNC_STATUSES_COLORS, SYNC_STATUSES_OPTIONS } from "@/constant/common"
import { BP_MASTER_SUPPLIER_SCOPE_OPTIONS, BP_MASTER_SUPPLIER_STATUS_OPTIONS } from "@/schema/bp-master"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"
import { format } from "date-fns"
import { dateFilter, dateSort } from "@/lib/data-table/data-table"

type SupplierData = Awaited<ReturnType<typeof getBpMasters>>[number]

export default function getColumns(itemGroups?: any, manufacturers?: any): ColumnDef<SupplierData>[] {
  return [
    {
      accessorFn: (row) => `${row.CardName} ${row.CardCode}`,
      id: "supplier",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Supplier' />,
      size: 150,
      cell: ({ row }) => (
        <div className='flex flex-col'>
          <span className='font-semibold'>{row.original.CardName}</span>
          <span className='decoration-1underline text-muted-foreground'>{row.original.CardCode}</span>
        </div>
      ),
    },
    {
      accessorKey: "GroupName",
      id: "group name",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Group' />,
      cell: ({ row }) => <Badge variant='soft-blue'>{row.original.GroupName || ""}</Badge>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
      cell: ({ row }) => {
        const status = row.original?.status
        const label = BP_MASTER_SUPPLIER_STATUS_OPTIONS.find((item) => item.value === status)?.label
        if (!status || !label) return null
        return <Badge variant='soft-slate'>{label}</Badge>
      },
    },
    {
      accessorKey: "scope",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Scope' />,
      cell: ({ row }) => {
        const scope = row.original.scope
        const option = BP_MASTER_SUPPLIER_SCOPE_OPTIONS.find((item) => item.value === scope)
        if (!option) return null
        return <div>{option.label}</div>
      },
    },
    {
      accessorKey: "availableExcess",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Available Excess' />,
      cell: ({ row }) => null,
    },
    {
      accessorKey: "percentageOfQuotedRfq",
      id: "percentage of quoted Rfq",
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>
          Percentage of <br /> Quoted RFQ's
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => null,
    },
    {
      accessorKey: "createdAt",
      id: "date created",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date Created' />,
      cell: ({ row }) => <div>{format(row.original.createdAt, "MM-dd-yyyy hh:mm a")}</div>,
      filterFn: (row, columnId, filterValue, addMeta) => {
        const createdAt = row.original.createdAt
        const filterDateValue = new Date(filterValue)
        return dateFilter(createdAt, filterDateValue)
      },
      sortingFn: (rowA, rowB, columnId) => {
        const rowACreatedAt = rowA.original.createdAt
        const rowBCreatedAt = rowB.original.createdAt
        return dateSort(rowACreatedAt, rowBCreatedAt)
      },
    },
    {
      accessorKey: "assignedBuyer",
      id: "assigned buyer",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Assigned Buyer' />,
      cell: ({ row }) => {
        const buyer = row.original.buyer
        if (!buyer) return null
        return <div>{buyer.name || buyer.email}</div>
      },
    },
    {
      accessorKey: "cancellationRate",
      id: "cancellation rate",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Cancellation Rate' />,
      cell: ({ row }) => null,
    },
    {
      accessorKey: "poFailureRate",
      id: "po failure rate",
      header: ({ column }) => <DataTableColumnHeader column={column} title='PO Failure Rate' />,
      cell: ({ row }) => null,
    },
    {
      accessorKey: "activities",
      id: "activities",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Activities #' />,
      cell: ({ row }) => null,
    },
    {
      accessorFn: (row) => {
        const values = row?.commodityStrengths || []

        const commodityStrengths = (itemGroups
          ?.filter((item: any) => values?.includes(item?.Number))
          ?.map((item: any) => item?.GroupName || "")
          .filter(Boolean) || []) as string[]

        if (!commodityStrengths || commodityStrengths.length < 1) return ""

        return commodityStrengths.join(", ")
      },
      id: "commodity strengths",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Commodity Strengths' />,
      cell: ({ row }) => {
        const values = row.original?.commodityStrengths || []

        const commodityStrengths = (itemGroups
          ?.filter((item: any) => values?.includes(item?.Number))
          ?.map((item: any) => item?.GroupName || "")
          .filter(Boolean) || []) as string[]

        if (!commodityStrengths || commodityStrengths.length < 1) return null

        return (
          <div className='min-w-[150px]'>
            <span className='mr-2 w-fit text-xs text-muted-foreground'>
              {/* //* Show the first 2 commondity strengths */}
              {commodityStrengths.slice(0, 5).join(", ")}

              {commodityStrengths.length > 5 && (
                <ActionTooltipProvider label={commodityStrengths.slice(5).join(", ")}>
                  <div className='inline'>
                    <Badge className='ml-1' variant='slate'>
                      + {commodityStrengths.slice(5).length}
                    </Badge>
                  </div>
                </ActionTooltipProvider>
              )}
            </span>
          </div>
        )
      },
    },
    {
      accessorFn: (row) => {
        const values = row?.mfrStrengths || []

        const mfrStrengths = (manufacturers
          ?.filter((manufacturer: any) => values?.includes(manufacturer?.Code))
          ?.map((manufacturer: any) => manufacturer?.ManufacturerName || "")
          .filter(Boolean) || []) as string[]

        if (!mfrStrengths || mfrStrengths.length < 1) return ""

        return mfrStrengths.join(", ")
      },
      id: "mfr strengths",
      header: ({ column }) => <DataTableColumnHeader column={column} title='MFR Strengths' />,
      cell: ({ row }) => {
        const values = row.original?.mfrStrengths || []

        const mfrStrengths = (manufacturers
          ?.filter((manufacturer: any) => values?.includes(manufacturer?.Code))
          ?.map((manufacturer: any) => manufacturer?.ManufacturerName || "")
          .filter(Boolean) || []) as string[]

        if (!mfrStrengths || mfrStrengths.length < 1) return null

        return (
          <div className='min-w-[150px]'>
            <span className='mr-2 w-fit text-xs text-muted-foreground'>
              {/* //* Show the first 2 mfr strengths */}
              {mfrStrengths.slice(0, 5).join(", ")}

              {mfrStrengths.length > 5 && (
                <ActionTooltipProvider label={mfrStrengths.slice(5).join(", ")}>
                  <div className='inline'>
                    <Badge className='ml-1' variant='slate'>
                      + {mfrStrengths.slice(5).length}
                    </Badge>
                  </div>
                </ActionTooltipProvider>
              )}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "syncStatus",
      id: "sync status",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Sync Status' />,
      cell: ({ row }) => {
        const syncStatus = row.original?.syncStatus
        const label = SYNC_STATUSES_OPTIONS.find((item) => item.value === syncStatus)?.label
        const color = SYNC_STATUSES_COLORS.find((item) => item.value === syncStatus)?.color

        if (!syncStatus || !label || !color) return null

        return <Badge variant={color as BadgeProps["variant"]}>{label}</Badge>
      },
    },
    {
      accessorFn: (row) => row.source,
      accessorKey: "source",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Source' />,
      cell: ({ row }) => {
        const isSAP = row.original.source === "sap"
        return isSAP ? <Badge variant='soft-green'>SAP</Badge> : <Badge variant='soft-amber'>Portal</Badge>
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      size: 80,
      cell: function ActionCell({ row }) {
        const router = useRouter()

        const { CardCode, source } = row.original

        return (
          <>
            <div className='flex gap-2'>
              <ActionTooltipProvider label='View Supplier'>
                <Icons.eye
                  className='size-4 cursor-pointer transition-all hover:scale-125'
                  onClick={() => router.push(`/dashboard/master-data/suppliers/${CardCode}/view`)}
                />
              </ActionTooltipProvider>

              {source === "portal" && (
                <ActionTooltipProvider label='Edit Supplier'>
                  <Icons.pencil
                    className='size-4 cursor-pointer transition-all hover:scale-125'
                    onClick={() => router.push(`/dashboard/master-data/suppliers/${CardCode}`)}
                  />
                </ActionTooltipProvider>
              )}

              <ActionTooltipProvider label='Delete Supplier'>
                <Icons.trash className='size-4 cursor-pointer text-red-500 transition-all hover:scale-125' onClick={() => {}} />
              </ActionTooltipProvider>

              <ActionTooltipProvider label='More Options'>
                <Icons.moreHorizontal className='size-4 cursor-pointer transition-all hover:scale-125' />
              </ActionTooltipProvider>
            </div>
          </>
        )
      },
    },
  ]
}
