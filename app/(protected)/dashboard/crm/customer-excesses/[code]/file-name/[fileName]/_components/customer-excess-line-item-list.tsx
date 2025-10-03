"use client"

import { utils, writeFileXLSX } from "xlsx-js-style"
import { useMemo } from "react"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import { format } from "date-fns"
import { useRouter } from "nextjs-toploader/app"

import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { DataTableFilter } from "@/components/data-table/data-table-filter"
import DataImportExport from "@/components/data-table/data-import-export"
import { FilterFields } from "@/components/data-table/data-table-filter"
import { useDataTable } from "@/hooks/use-data-table"
import { getCustomerExcessLineItemsByFileName } from "@/actions/customer-excess"
import { getColumns } from "./customer-excess-line-item-table-column"

type CustomerExcessListProps = {
  fileName: string
  lineItems: NonNullable<Awaited<ReturnType<typeof getCustomerExcessLineItemsByFileName>>>
}

export default function CustomerExcessLineItemList({ fileName, lineItems }: CustomerExcessListProps) {
  const router = useRouter()
  const columns = useMemo(() => getColumns(), [])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "List Date", columnId: "list date", type: "date" },
      { label: "Customer Name", columnId: "customer name", type: "text" },
      { label: "CPN", columnId: "cpn", type: "text" },
      { label: "MPN", columnId: "mpn", type: "text" },
      { label: "MFR", columnId: "mfr", type: "text" },
      { label: "Date Code", columnId: "date code", type: "text" },
      { label: "Notes", columnId: "notes", type: "text" },
      { label: "List Owner", columnId: "list owner", type: "text" },
    ]
  }, [])

  const handleImport: (...args: any[]) => void = async (args) => {}

  const handleExport: (...args: any[]) => void = async (args) => {}

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: lineItems,
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

        <div className='flex items-center gap-2'>
          <DataTableFilter className='w-full md:w-fit' table={table} filterFields={filterFields} columnFilters={columnFilters} />
          <DataTableViewOptions className='w-full md:w-fit' table={table} columnVisibility={columnVisibility} />

          <DataImportExport
            className='w-full md:w-fit'
            onImport={(args) => handleImport(args)}
            onExport={(args) => handleExport({ ...args, data: lineItems })}
            code={`customer-excesses-${fileName}`}
          />
        </div>
      </div>
    </DataTable>
  )
}
