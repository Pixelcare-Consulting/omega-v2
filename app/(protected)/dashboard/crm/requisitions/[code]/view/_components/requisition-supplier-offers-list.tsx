"use client"

import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { useDataTable } from "@/hooks/use-data-table"
import { getSupplierOfferLineItemsByPartialMpn } from "@/actions/supplier-offer"
import { getColumns } from "./requisition-supplier-offers-table-column"

type SupplierOfferListProps = {
  supplierOfferLineItems: NonNullable<Awaited<ReturnType<typeof getSupplierOfferLineItemsByPartialMpn>>>
  isLoading: boolean
}

export default function RequisitionSupplierOfferLineItemList({ supplierOfferLineItems }: SupplierOfferListProps) {
  const columns = useMemo(() => getColumns(), [])

  const { table } = useDataTable({
    data: supplierOfferLineItems,
    columns: columns,
    initialState: {
      columnPinning: { right: ["actions"] },
      sorting: [{ id: "list date", desc: true }],
    },
  })

  return (
    <DataTable table={table}>
      <div className='flex flex-col items-stretch justify-center gap-2 md:flex-row md:items-center md:justify-between'>
        <DataTableSearch table={table} className='' />
      </div>
    </DataTable>
  )
}
