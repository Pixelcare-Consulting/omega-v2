import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { getRequisitionsByPartialMpn, RequestedItemsJSONData } from "@/actions/requisition"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { dateFilter, dateSort } from "@/lib/data-table/data-table"
import { REQUISITION_PURCHASING_STATUS_OPTIONS, REQUISITION_REASON_OPTIONS, REQUISITION_RESULT_OPTIONS } from "@/schema/requisition"
import { Badge } from "@/components/badge"
import Link from "next/link"
import { formatNumber } from "@/lib/formatter"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"
import { Icons } from "@/components/icons"
import { useRouter } from "nextjs-toploader/app"

type RequisitionHistoryData = Awaited<ReturnType<typeof getRequisitionsByPartialMpn>>[number]

export function getColumns(): ColumnDef<RequisitionHistoryData>[] {
  return [
    {
      accessorKey: "date",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
      cell: ({ row }) => {
        const date = row.original.date
        return <div className='min-w-[100px]'>{format(date, "MM-dd-yyyy")}</div>
      },
      filterFn: (row, columnId, filterValue, addMeta) => {
        const date = row.original.date
        const filterDateValue = new Date(filterValue)
        return dateFilter(date, filterDateValue)
      },
      sortingFn: (rowA, rowB, columnId) => {
        const rowADate = rowA.original.date
        const rowBDate = rowB.original.date
        return dateSort(rowADate, rowBDate)
      },
    },
    {
      accessorKey: "code",
      id: "id #",
      header: ({ column }) => <DataTableColumnHeader column={column} title='ID #' />,
    },
    {
      accessorKey: "purchasingStatus",
      id: "purchasing status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>
          Purchasing <br /> Status
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => {
        const purchasingStatus = row.original?.purchasingStatus
        const option = REQUISITION_PURCHASING_STATUS_OPTIONS.find((item) => item.value === purchasingStatus)
        if (!purchasingStatus || !option) return null
        return <Badge variant='soft-blue'>{option.label}</Badge>
      },
    },
    {
      accessorKey: "result",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Result' />,
      cell: ({ row }) => {
        const result = row.original?.result
        const option = REQUISITION_RESULT_OPTIONS.find((item) => item.value === result)
        if (!result || !option) return null
        return <Badge variant={result === "won" ? "soft-green" : "soft-red"}>{option.label}</Badge>
      },
    },
    {
      accessorKey: "reason",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Reason' />,
      cell: ({ row }) => {
        const reason = row.original?.result
        const option = REQUISITION_REASON_OPTIONS.find((item) => item.value === reason)
        if (!reason || !option) return null
        return <Badge variant='soft-slate'>{option.label}</Badge>
      },
    },
    {
      accessorFn: (row) => row.customer?.CardName || row.customer?.CardCode,
      id: "customer",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Customer' />,
      cell: ({ row }) => {
        const customerCode = row.original?.customer?.CardCode

        if (!customerCode) return null

        return (
          <Link className='text-blue-500 hover:underline' href={`/dashboard/master-data/customers/${customerCode}/view`}>
            {customerCode}
          </Link>
        )
      },
    },
    {
      accessorFn: (row) => {
        return row?.customer?.assignedExcessManagers?.map((person) => person?.user?.name || person?.user?.email).join(", ") || ""
      },
      id: "customer account manager",
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>
          Customer <br /> Account Manager
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => {
        const excessManager = row.original?.customer?.assignedExcessManagers || []

        if (!excessManager || excessManager.length < 1) return null

        return (
          <div className='min-w-[150px] text-xs text-muted-foreground'>
            <span className=''>{excessManager.map((em) => em?.user.name || em?.user.email).join(", ")}</span>
          </div>
        )
      },
    },
    {
      accessorFn: (row) => {
        return row?.salesPersons?.map((person) => person?.user?.name || person?.user?.email).join(", ") || ""
      },
      id: "all sales",
      header: ({ column }) => <DataTableColumnHeader column={column} title='All Sales' />,
      cell: ({ row }) => {
        const salesPerson = row.original?.salesPersons || []

        if (!salesPerson || salesPerson.length < 1) return null

        return (
          <div className='min-w-[150px] text-xs text-muted-foreground'>
            {salesPerson.map((sp) => sp?.user.name || sp?.user.email).join(", ")}
          </div>
        )
      },
    },
    {
      accessorFn: (row) => {
        const requestedItems = (row?.requestedItems || []) as RequestedItemsJSONData

        if (!requestedItems || requestedItems.length < 1) return ""

        return requestedItems
          .filter((rqi) => {
            const basedText = rqi.code

            const x = String(basedText).toLowerCase()
            const y = String(row?.partialMpn).toLowerCase()

            return x.startsWith(y)
          })
          .map((rqi) => rqi.code)
          .join(", ")
      },
      id: "mpn / alternative",
      header: ({ column }) => <DataTableColumnHeader column={column} title='MPN / Alternative' />,
      cell: ({ row }) => {
        const requestedItems = (row?.original?.requestedItems || []) as RequestedItemsJSONData

        if (!requestedItems || requestedItems.length < 1) return null

        const matchedMpns = requestedItems
          .filter((rqi) => {
            const basedText = rqi.code

            const x = String(basedText).toLowerCase()
            const y = String(row?.original?.partialMpn).toLowerCase()

            return x.startsWith(y)
          })
          .map((rqi) => rqi.code)

        return (
          <div className='flex min-w-[200px] flex-col justify-center text-xs text-muted-foreground'>
            {matchedMpns.map((mpn, i) => (
              <Badge key={`${mpn}-${i}`} variant={i === 0 ? "soft-sky" : "soft-amber"}>
                {mpn}
              </Badge>
            ))}
          </div>
        )
      },
    },
    {
      accessorFn: (row) => row?.quantity ?? "",
      id: "requested quantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>
          Requested <br /> Quantity
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => {
        const quantity = parseFloat(String(row.original?.quantity))
        if (!quantity || isNaN(quantity)) return null
        return <div>{formatNumber({ amount: quantity, maxDecimal: 2 })}</div>
      },
    },
    {
      accessorFn: (row) => row?.customerStandardPrice ?? "",
      id: "Customer Standard Price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>
          Customer <br /> Standard Price
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => {
        const customerStandardPrice = parseFloat(String(row.original?.customerStandardPrice))
        if (!customerStandardPrice || isNaN(customerStandardPrice)) return null
        return <div>{formatNumber({ amount: customerStandardPrice, maxDecimal: 2 })}</div>
      },
    },
    {
      accessorKey: "actions",
      header: "Action",
      cell: function ActionCell({ row }) {
        const router = useRouter()

        const { code } = row.original

        return (
          <>
            <div className='flex gap-2'>
              <ActionTooltipProvider label='View Requisition'>
                <Icons.eye
                  className='size-4 cursor-pointer transition-all hover:scale-125'
                  onClick={() => router.push(`/dashboard/crm/requisitions/${code}/view`)}
                />
              </ActionTooltipProvider>

              <ActionTooltipProvider label='Edit Requisition'>
                <Icons.pencil
                  className='size-4 cursor-pointer transition-all hover:scale-125'
                  onClick={() => router.push(`/dashboard/crm/requisitions/${code}`)}
                />
              </ActionTooltipProvider>
            </div>
          </>
        )
      },
    },
  ]
}
