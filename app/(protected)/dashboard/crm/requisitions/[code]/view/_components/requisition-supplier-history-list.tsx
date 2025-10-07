"use client"

import { useMemo } from "react"
import { useRouter } from "nextjs-toploader/app"

import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { useDataTable } from "@/hooks/use-data-table"

import { getSupplierQuotesByPartialMpn } from "@/actions/supplier-quote"
import { getColumns } from "./requisition-supplier-history-table-column"

type RequisitionSupplierQuoteHistoryListProps = {
  supplierQuotes: Awaited<ReturnType<typeof getSupplierQuotesByPartialMpn>>
  isLoading: boolean
}

export default function RequisitionSupplierQuoteHistoryList({ supplierQuotes, isLoading }: RequisitionSupplierQuoteHistoryListProps) {
  const columns = useMemo(() => getColumns(), [])

  const { table } = useDataTable({
    data: supplierQuotes,
    columns: columns,
    initialState: {
      columnPinning: { right: ["actions"] },
      sorting: [{ id: "date", desc: true }],
    },
  })

  return (
    <DataTable table={table} isLoading={isLoading}>
      <div className='flex flex-col items-stretch justify-center gap-2 md:flex-row md:items-center md:justify-between'>
        <DataTableSearch table={table} className='' />
      </div>
    </DataTable>
  )
}
