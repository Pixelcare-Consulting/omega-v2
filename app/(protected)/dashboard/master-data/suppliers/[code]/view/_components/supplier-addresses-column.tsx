import { format } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"
import { Badge, BadgeProps } from "@/components/badge"
import { Icons } from "@/components/icons"
import { useState } from "react"
import { dateFilter, dateSort } from "@/lib/data-table/data-table"
import { getBpMasterByCardCode } from "@/actions/master-bp"
import { SYNC_STATUSES_COLORS, SYNC_STATUSES_OPTIONS } from "@/constant/common"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ADDRESS_TYPE_OPTIONS } from "@/schema/master-address"

type AddressData = NonNullable<Awaited<ReturnType<typeof getBpMasterByCardCode>>>["addresses"][number]

export function getColumns(billToDef?: string | null, shipToDef?: string | null): ColumnDef<AddressData>[] {
  return [
    {
      accessorKey: "id",
      id: "id #",
      header: ({ column }) => <DataTableColumnHeader column={column} title='ID #' />,
      cell: ({ row }) => {
        const { id, AddrType } = row.original

        const defaultAddressId = AddrType === "B" ? billToDef || "" : AddrType === "S" ? shipToDef || "" : null
        const isDefault = id === defaultAddressId

        return (
          <div className='flex items-center gap-2'>
            <span>{id}</span>
            {isDefault && <Badge variant='soft-violet'>Default</Badge>}
          </div>
        )
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
      cell: ({ row }) => {
        const date = row.original.createdAt
        return <div className='min-w-[100px]'>{format(date, "MM-dd-yyyy")}</div>
      },
      filterFn: (row, columnId, filterValue, addMeta) => {
        const date = row.original.createdAt
        const filterDateValue = new Date(filterValue)
        return dateFilter(date, filterDateValue)
      },
      sortingFn: (rowA, rowB, columnId) => {
        const rowADate = rowA.original.createdAt
        const rowBDate = rowB.original.createdAt
        return dateSort(rowADate, rowBDate)
      },
    },
    {
      accessorFn: (row) => {
        const type = row?.AddrType || ""
        const option = ADDRESS_TYPE_OPTIONS.find((item) => item.value === type)
        if (!option) return null
        return option.label
      },
      id: "type",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
      cell: ({ row }) => {
        const type = row.original.AddrType
        const option = ADDRESS_TYPE_OPTIONS.find((item) => item.value === type)
        const color = type === "B" ? "soft-blue" : type === "S" ? "soft-red" : "soft-slate"

        if (!option) return null
        return <Badge variant={color as BadgeProps["variant"]}>{option.label}</Badge>
      },
    },
    {
      accessorFn: (row) => {
        const street1 = row?.Street
        const street2 = row?.Address2
        const street3 = row?.Address3

        let result = ""

        if (street1) result += street1 + ", "
        if (street2) result += street2 + ", "
        if (street3) result += street3
      },
      id: "streets",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Streets' />,
      cell: ({ row }) => {
        const street1 = row.original?.Street || ""
        const street2 = row.original?.Address2 || ""
        const street3 = row.original?.Address3 || ""

        return (
          <div className='flex min-w-[300px] items-center gap-2'>
            <ul className='list-none'>
              <li>
                <span className='mr-1.5'>1.</span>
                <span>{street1}</span>
              </li>
              <li>
                <span className='mr-1.5'>2.</span>
                <span>{street2}</span>
              </li>
              <li>
                <span className='mr-1.5'>3.</span>
                <span>{street3}</span>
              </li>
            </ul>
          </div>
        )
      },
    },
    {
      accessorKey: "city",
      header: ({ column }) => <DataTableColumnHeader column={column} title='City' />,
      cell: ({ row }) => {
        const city = row.original.City
        return <div>{city}</div>
      },
    },
    {
      accessorKey: "stateName",
      id: "state",
      header: ({ column }) => <DataTableColumnHeader column={column} title='State' />,
      cell: ({ row }) => {
        const stateName = row.original.stateName
        return <div>{stateName}</div>
      },
    },
    {
      accessorKey: "countryName",
      id: "country",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Country' />,
      cell: ({ row }) => {
        const countryName = row.original.countryName
        return <div>{countryName}</div>
      },
    },
    {
      accessorKey: "ZipCode",
      id: "zip code",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Zip Code' />,
      cell: ({ row }) => {
        const zipCode = row.original.ZipCode
        return <div>{zipCode}</div>
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
        const [showConfirmation, setShowConfirmation] = useState(false)
        const { id, CardCode, source, AddrType } = row.original

        const defaultAddressId = AddrType === "B" ? billToDef || "" : AddrType === "S" ? shipToDef || "" : null
        const isDefault = id === defaultAddressId

        return (
          <div>
            <ActionTooltipProvider label='View Address'>
              <Icons.eye className='size-4 cursor-pointer transition-all hover:scale-125' />
            </ActionTooltipProvider>

            {source === "portal" && (
              <ActionTooltipProvider label='Edit Address'>
                <Icons.pencil className='size-4 cursor-pointer transition-all hover:scale-125' />
              </ActionTooltipProvider>
            )}

            <ActionTooltipProvider label='Delete Address'>
              <Icons.trash
                className='size-4 cursor-pointer text-red-500 transition-all hover:scale-125'
                onClick={() => setShowConfirmation(true)}
              />
            </ActionTooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <ActionTooltipProvider label='More Options'>
                  <Icons.moreHorizontal className='size-4 cursor-pointer transition-all hover:scale-125' />
                </ActionTooltipProvider>
              </DropdownMenuTrigger>

              {!isDefault && (
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem>
                    <Icons.checkCircleBig className='mr-2 size-4' /> Set as Default
                  </DropdownMenuItem>
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
