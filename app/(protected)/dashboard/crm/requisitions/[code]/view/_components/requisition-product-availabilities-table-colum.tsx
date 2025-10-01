import { ColumnDef } from "@tanstack/react-table"
import { useRouter } from "nextjs-toploader/app"
import { format } from "date-fns"

import ActionTooltipProvider from "@/components/provider/tooltip-provider"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { getProductAvailabilitiesBySupplierCode } from "@/actions/product-availability"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/badge"
import { dateFilter, dateSort } from "@/lib/data-table/data-table"
import Link from "next/link"
import { BP_MASTER_SUPPLIER_SCOPE_OPTIONS, BP_MASTER_SUPPLIER_STATUS_OPTIONS } from "@/schema/master-bp"

type ProductAvailabilityData = Awaited<ReturnType<typeof getProductAvailabilitiesBySupplierCode>>[number]

export function getColumns(): ColumnDef<ProductAvailabilityData>[] {
  return [
    {
      accessorFn: (row) => {
        const supplierName = row?.supplier?.CardName
        if (!supplierName) return ""
        return supplierName
      },
      id: "supplier name",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Supplier - Company Name' />,
      cell: ({ row }) => {
        const supplierCode = row.original.supplier?.CardCode
        const supplierName = row.original.supplier?.CardName

        if (!supplierName || !supplierCode) return null

        return (
          <Link className='text-blue-500 hover:underline' href={`/dashboard/master-data/suppliers/${supplierCode}/view`}>
            {supplierName}
          </Link>
        )
      },
    },
    {
      accessorFn: (row) => row?.supplier?.scope || "",
      id: "supplier scope",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Supplier - Scope' />,
      cell: ({ row }) => {
        const supplier = row.original.supplier
        const scope = BP_MASTER_SUPPLIER_SCOPE_OPTIONS.find((item) => item.value === supplier?.scope)?.label

        if (!supplier || !scope) return null

        return <Badge variant='soft-slate'>{scope}</Badge>
      },
    },
    {
      accessorFn: (row) => row.supplier?.status,
      id: "supplier status",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Supplier - Status' />,
      cell: ({ row }) => {
        const supplier = row.original.supplier
        const status = BP_MASTER_SUPPLIER_STATUS_OPTIONS.find((item) => item.value === supplier?.status)?.label

        if (!supplier || !status) return null

        return <Badge variant='soft-slate'>{status}</Badge>
      },
    },
    {
      accessorKey: "manufacturer",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Manufacturer' />,
      cell: ({ row }) => {
        const manufacturer = row.original.manufacturer
        if (!manufacturer) return null
        return <Badge variant='soft-amber'>{manufacturer}</Badge>
      },
    },
    {
      accessorKey: "itemGroup",
      id: "commodity",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Commodity' />,
      cell: ({ row }) => {
        const commodity = row.original.itemGroup
        if (!commodity) return null
        return <Badge variant='soft-blue'>{commodity}</Badge>
      },
    },
    {
      accessorFn: (row) => (row?.isFranchiseDisti ? "yes" : "no"),
      accessorKey: "isFranchiseDisti",
      id: "franchise disti",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Franchise Disti' />,
      cell: ({ row }) => {
        const isFranchiseDisti = row.original.isFranchiseDisti
        return isFranchiseDisti ? <Icons.check className='size-4 text-green-500' /> : <Icons.x className='size-4 text-red-500' />
      },
    },
    {
      accessorFn: (row) => (row?.isAuthorizedDisti ? "yes" : "no"),
      accessorKey: "isAuthorizedDisti",
      id: "authorized disti",
      header: ({ column }) => <DataTableColumnHeader column={column} title='authorized disti' />,
      cell: ({ row }) => {
        const isAuthorizedDisti = row.original.isAuthorizedDisti
        return isAuthorizedDisti ? <Icons.check className='size-4 text-green-500' /> : <Icons.x className='size-4 text-red-500' />
      },
    },
    {
      accessorFn: (row) => (row?.isMfrDirect ? "yes" : "no"),
      accessorKey: "isMfrDirect",
      id: "mfr direct",
      header: ({ column }) => <DataTableColumnHeader column={column} title='MFR Direct' />,
      cell: ({ row }) => {
        const isMfrDirect = row.original.isMfrDirect
        return isMfrDirect ? <Icons.check className='size-4 text-green-500' /> : <Icons.x className='size-4 text-red-500' />
      },
    },
    {
      accessorFn: (row) => (row?.isStrongBrand ? "yes" : "no"),
      accessorKey: "isStrongBrand",
      id: "strong brand",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Strong Brand' />,
      cell: ({ row }) => {
        const isStrongBrand = row.original.isStrongBrand
        return isStrongBrand ? <Icons.check className='size-4 text-green-500' /> : <Icons.x className='size-4 text-red-500' />
      },
    },
    {
      accessorFn: (row) => (row?.isSpecialPricing ? "yes" : "no"),
      accessorKey: "isSpecialPricing",
      id: "special pricing",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Special Pricing' />,
      cell: ({ row }) => {
        const isSpecialPricing = row.original?.isSpecialPricing
        return isSpecialPricing ? <Icons.check className='size-4 text-green-500' /> : <Icons.x className='size-4 text-red-500' />
      },
    },
    {
      accessorKey: "notes",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Notes' />,
      cell: ({ row }) => <div className='min-w-[250px] whitespace-pre-line'>{row.original?.notes || ""}</div>,
    },
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
      id: "supplier percentage of answered back RFQ's",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Supplier - Percentage of Answered Back RFQ's" />,
      cell: ({ row }) => null,
    },
    {
      accessorFn: (row) => null,
      id: "supplier - # of Sales Orders",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Supplier - # of Sales Orders' />,
      cell: ({ row }) => null,
    },
    {
      accessorKey: "actions",
      header: "Action",
      cell: function ActionCell({ row }) {
        const router = useRouter()

        const { code } = row.original

        return (
          <div className='flex gap-2'>
            <ActionTooltipProvider label='View Product Availability'>
              <Icons.eye
                className='size-4 cursor-pointer transition-all hover:scale-125'
                onClick={() => router.push(`/dashboard/crm/product-availabilities/${code}/view`)}
              />
            </ActionTooltipProvider>
          </div>
        )
      },
    },
  ]
}
