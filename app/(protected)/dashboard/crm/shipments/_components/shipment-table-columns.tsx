import { ColumnDef } from "@tanstack/react-table"
import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "nextjs-toploader/app"
import AlertModal from "@/components/alert-modal"
import { dateFilter, dateSort } from "@/lib/data-table/data-table"
import { useAction } from "next-safe-action/hooks"
import { format } from "date-fns"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { deleteShipment, getShipments } from "@/actions/shipment"
import { Icons } from "@/components/icons"
import { SHIPMENT_SHIP_TO_LOCATION_OPTIONS, SHIPMENT_SHIPPING_ORDER_STATUS_OPTIONS } from "@/schema/shipment"
import { Badge } from "@/components/badge"
import { RequestedItemsJSONData } from "@/actions/requisition"
import { getItemByItemCodeClient } from "@/actions/master-item"
import { formatCurrency, formatNumber } from "@/lib/formatter"
import { multiply } from "mathjs"

type ShipmentData = Awaited<ReturnType<typeof getShipments>>[number]

export function getColumns(): ColumnDef<ShipmentData>[] {
  return [
    {
      accessorKey: "updatedAt",
      id: "date modified",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date Modified' />,
      cell: ({ row }) => {
        const date = row.original.updatedAt
        return <div className='min-w-[100px]'>{format(date, "MM-dd-yyyy")}</div>
      },
      filterFn: (row, columnId, filterValue, addMeta) => {
        const date = row.original.updatedAt
        const filterDateValue = new Date(filterValue)
        return dateFilter(date, filterDateValue)
      },
      sortingFn: (rowA, rowB, columnId) => {
        const rowADate = rowA.original.updatedAt
        const rowBDate = rowB.original.updatedAt
        return dateSort(rowADate, rowBDate)
      },
    },
    {
      accessorKey: "requisitionCode",
      id: "requisition",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Requisition' />,
      cell: ({ row }) => {
        const requisitionCode = row.original.requisitionCode

        return (
          <Link className='text-blue-500 hover:underline' href={`/dashboard/crm/requisitions/${requisitionCode}/view`}>
            {requisitionCode}
          </Link>
        )
      },
    },
    {
      accessorKey: "shippingOderStatus",
      id: "shipping order status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>
          Shipping <br /> Order Status
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => {
        const shippingOrderStatus = row.original.shippingOderStatus
        const option = SHIPMENT_SHIPPING_ORDER_STATUS_OPTIONS.find((option) => option.value === shippingOrderStatus)
        if (!option) return null
        return <Badge variant='soft-blue'>{option.label}</Badge>
      },
    },
    {
      accessorFn: (row) => {
        const poStatusLastUpdated = row?.requisition?.poStatusLastUpdated
        return poStatusLastUpdated
      },
      id: "req po status last updated",
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>
          Req - PO <br /> Status Last Updated
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => {
        const poStatusLastUpdated = row.original?.requisition?.poStatusLastUpdated

        if (!poStatusLastUpdated) return null

        return <div className='min-w-[100px]'>{format(poStatusLastUpdated, "MM-dd-yyyy")}</div>
      },
      filterFn: (row, columnId, filterValue, addMeta) => {
        const date = row.original?.requisition?.poStatusLastUpdated

        if (!date) return false

        const filterDateValue = new Date(filterValue)
        return dateFilter(date, filterDateValue)
      },
      sortingFn: (rowA, rowB, columnId) => {
        const rowADate = rowA.original?.requisition?.poStatusLastUpdated
        const rowBDate = rowB.original?.requisition?.poStatusLastUpdated

        if (!rowADate || !rowBDate) return 1

        return dateSort(rowADate, rowBDate)
      },
    },
    {
      id: "ship to location",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Ship to Location' />,
      cell: ({ row }) => {
        const shipToLocation = row.original?.shipToLocation
        const option = SHIPMENT_SHIP_TO_LOCATION_OPTIONS.find((option) => option.value === shipToLocation)

        if (!option) return null

        return <Badge variant='soft-slate'>{option.label}</Badge>
      },
    },
    {
      accessorFn: (row) => {
        const soNumber = row?.soNumber
        if (!soNumber) return ""
        return `S${soNumber}`
      },
      id: "so # (formatted)",
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>
          SO # <br /> (Formatted)
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => {
        const soNumber = row.original?.soNumber

        if (!soNumber) return null

        return (
          <div className='min-w-[150px]'>
            <Badge variant='soft-slate'>{`S${soNumber}`}</Badge>
          </div>
        )
      },
    },
    {
      accessorFn: (row) => {
        const customerName = row?.requisition?.customer?.CardName
        if (!customerName) return ""
        return customerName
      },
      id: "customer name",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Customer Name' />,
      cell: ({ row }) => {
        const customerCode = row.original.requisition?.customer?.CardCode
        const customerName = row.original.requisition?.customer?.CardName

        if (!customerName || !customerCode) return null

        return (
          <Link className='text-blue-500 hover:underline' href={`/dashboard/master-data/customers/${customerCode}/view`}>
            {customerName}
          </Link>
        )
      },
    },
    {
      accessorFn: (row) => {
        const custPoNum = row?.requisition?.custPoNum
        if (!custPoNum) return ""
        return custPoNum
      },
      id: "cust. po #",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Cust. PO #' />,
      cell: ({ row }) => <div>{row.original?.requisition?.custPoNum || ""}</div>,
    },
    {
      accessorFn: (row) => {
        const supplierName = row?.supplierQuote?.supplier?.CardName
        if (!supplierName) return ""
        return supplierName
      },
      id: "supplier name",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Customer Name' />,
      cell: ({ row }) => {
        const supplierCode = row.original.supplierQuote?.supplier?.CardCode
        const supplierName = row.original.supplierQuote?.supplier?.CardCode

        if (!supplierName || !supplierCode) return null

        return (
          <Link className='text-blue-500 hover:underline' href={`/dashboard/master-data/suppliers/${supplierCode}/view`}>
            {supplierName}
          </Link>
        )
      },
    },
    {
      accessorFn: (row) => row?.requisition?.salesPersons?.map((person) => person?.user?.name || person?.user?.email).join(", ") || "",
      id: "req - salesperson",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Req - Salesperson' />,
      cell: ({ row }) => {
        const salespersons = row.original?.requisition?.salesPersons || []

        if (!salespersons || salespersons.length < 1) return null

        return (
          <div className='min-w-[150px]'>
            <span className='mr-2 w-fit text-xs text-muted-foreground'>
              {/* //* Show the first 2 salespersons */}
              {salespersons
                .slice(0, 2)
                .map((buyers) => buyers?.user.name || buyers?.user.email)
                .join(", ")}

              {salespersons.length > 2 && (
                <ActionTooltipProvider
                  label={salespersons
                    .slice(2)
                    .map((buyers) => buyers?.user.name || buyers?.user.email)
                    .join(", ")}
                >
                  <div className='inline'>
                    <Badge className='ml-1' variant='slate'>
                      + {salespersons.slice(2).length}
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
      id: "mpn",
      header: ({ column }) => <DataTableColumnHeader column={column} title='MPN' />,
      cell: function ColumnCell({ row }) {
        const mpn = row.original?.mpn

        if (!mpn) return null

        return (
          <div className='min-w-[150px]'>
            <Badge variant='soft-slate'>{mpn}</Badge>
          </div>
        )
      },
    },
    {
      id: "mfr",
      header: ({ column }) => <DataTableColumnHeader column={column} title='MFR' />,
      cell: function ColumnCell({ row }) {
        const mfr = row.original?.mfr

        if (!mfr) return null

        return (
          <div className='min-w-[150px]'>
            <Badge variant='soft-slate'>{mfr}</Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "qtyToShip",
      id: "qty to ship",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Qty to Ship' />,
      cell: ({ row }) => {
        const qtyToShip = parseFloat(String(row.original?.qtyToShip))

        if (isNaN(qtyToShip)) return null

        return <div>{formatNumber({ amount: qtyToShip, maxDecimal: 2 })}</div>
      },
    },
    {
      accessorFn: (row) => {
        const poNumber = row?.poNumber
        if (!poNumber) return ""
        return `P${poNumber}`
      },
      id: "po # (formatted)",
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>
          PO # <br /> (Formatted)
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => {
        const poNumber = row.original?.poNumber

        if (!poNumber) return null

        return (
          <div className='min-w-[150px]'>
            <Badge variant='soft-slate'>{`P${poNumber}`}</Badge>
          </div>
        )
      },
    },
    {
      id: "tracking type",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Tracking Type' />,
      cell: ({ row }) => null,
    },
    {
      id: "incoming tracking (old)",
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>
          Incoming <br /> Tracking (Old)
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => null,
    },
    {
      id: "track it link",
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>
          Track <br /> It Link
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => null,
    },
    {
      id: "supplier commit date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>
          Supplier <br /> Commit Date
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => null,
    },
    {
      id: "sales value of shipment",
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>
          Sales Value <br /> of Shipment
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => null,
    },
    {
      id: "req - oppportunity value",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Req - Opportunity Value' />,
      cell: ({ row }) => {
        const { quantity, customerStandardPrice } = row.original?.requisition

        const x = parseFloat(String(quantity))
        const y = parseFloat(String(customerStandardPrice))

        if (isNaN(x) || isNaN(y)) return null

        return <div className='font-semibold'>{formatCurrency({ amount: multiply(x, y), minDecimal: 2 })}</div>
      },
    },
    {
      id: "order updates",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Order Updates' />,
      cell: ({ row }) => <div className='min-w-[250px] whitespace-pre-line'>{row.original?.orderUpdates || ""}</div>,
    },
    {
      id: "Special instruction (Sales)",
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>
          Special <br /> Instruction (Sales)
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => null,
    },
    {
      id: "delivery method",
      header: ({ column }) => <DataTableColumnHeader column={column}>Delivery Method</DataTableColumnHeader>,
      cell: ({ row }) => null,
    },
    {
      id: "supplier quote - dc",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Supplier Quote - DC' />,
      cell: ({ row }) => {
        const dc = row.original.supplierQuote?.dateCode
        if (!dc) return null
        return <div>{dc}</div>
      },
    },
    {
      id: "supplier quote - coo",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Supplier Quote - COO' />,
      cell: ({ row }) => {
        const coo = row.original.supplierQuote?.coo
        if (!coo) return null
        return <div>{coo}</div>
      },
    },
    {
      id: "supplier quote - condition",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Supplier Quote - Condition' />,
      cell: ({ row }) => {
        const condition = row.original.supplierQuote?.coo
        if (!condition) return null
        return <div>{condition}</div>
      },
    },
    {
      accessorFn: (row) => {
        const purchaser = row?.purchaser
        if (!purchaser) return null
        return purchaser?.name || purchaser?.email
      },
      id: "purchaser",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Purchaser' />,
      cell: ({ row }) => {
        const purchaser = row.original.purchaser
        if (!purchaser) return null
        return <div>{purchaser?.name || purchaser?.email}</div>
      },
    },
    {
      accessorKey: "actions",
      header: "Action",
      cell: function ActionCell({ row }) {
        const router = useRouter()
        const { executeAsync } = useAction(deleteShipment)
        const [showConfirmation, setShowConfirmation] = useState(false)

        const { id, code } = row.original

        async function handleDelete() {
          setShowConfirmation(false)

          toast.promise(executeAsync({ id }), {
            loading: "Deleting shipment...",
            success: (response) => {
              const result = response?.data

              if (!response || !result) throw { message: "Failed to delete shipment!", unExpectedError: true }

              if (!result.error) {
                setTimeout(() => {
                  router.refresh()
                }, 1500)

                return result.message
              }

              throw { message: result.message, expectedError: true }
            },
            error: (err: Error & { expectedError: boolean }) => {
              return err?.expectedError ? err.message : "Something went wrong! Please try again later."
            },
          })
        }

        return (
          <>
            <div className='flex gap-2'>
              <ActionTooltipProvider label='View Shipment'>
                <Icons.eye
                  className='size-4 cursor-pointer transition-all hover:scale-125'
                  onClick={() => router.push(`/dashboard/crm/shipments/${code}/view`)}
                />
              </ActionTooltipProvider>

              <ActionTooltipProvider label='Edit Shipment'>
                <Icons.pencil
                  className='size-4 cursor-pointer transition-all hover:scale-125'
                  onClick={() => router.push(`/dashboard/crm/shipments/${code}`)}
                />
              </ActionTooltipProvider>

              <ActionTooltipProvider label='Delete Shipment'>
                <Icons.trash
                  className='size-4 cursor-pointer text-red-500 transition-all hover:scale-125'
                  onClick={() => setShowConfirmation(true)}
                />
              </ActionTooltipProvider>

              <ActionTooltipProvider label='More Options'>
                <Icons.moreHorizontal className='size-4 cursor-pointer transition-all hover:scale-125' />
              </ActionTooltipProvider>
            </div>

            <AlertModal
              isOpen={showConfirmation}
              title='Are you sure?'
              description={`Are you sure you want to delete this shipment #${code}?`}
              onConfirm={handleDelete}
              onConfirmText='Delete'
              onCancel={() => setShowConfirmation(false)}
            />
          </>
        )
      },
    },
  ]
}
