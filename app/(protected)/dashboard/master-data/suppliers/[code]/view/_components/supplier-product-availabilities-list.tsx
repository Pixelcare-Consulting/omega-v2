"use client"

import { utils, writeFileXLSX } from "xlsx-js-style"
import { useCallback, useEffect, useMemo } from "react"
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
import { getProductAvailabilities, getProductAvailabilitiesBySupplierCodeClient } from "@/actions/product-availability"
import { getColumns } from "./supplier-product-availabilities-table-colum"

type SupplierProductAvailabilityListProps = {
  suppCode: string
}

export default function SupplierProductAvailabilityList({ suppCode }: SupplierProductAvailabilityListProps) {
  const router = useRouter()

  const {
    execute,
    isExecuting,
    result: { data: productAvailabilities },
  } = useAction(getProductAvailabilitiesBySupplierCodeClient)

  const onSuccessCallback = useCallback(() => {
    if (suppCode) execute({ supplierCode: suppCode })
  }, [suppCode])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "Manufacturer", columnId: "manufacturer", type: "text" },
      { label: "Commodity", columnId: "commodity", type: "text" },
      {
        label: "Franchise Disti",
        columnId: "franchise disti",
        type: "select",
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
      },
      {
        label: "Authorized Disti",
        columnId: "authorized disti",
        type: "select",
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
      },
      {
        label: "MFR Direct",
        columnId: "mfr direct",
        type: "select",
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
      },
      {
        label: "Strong Brand",
        columnId: "strong brand",
        type: "select",
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
      },
      {
        label: "Special Pricing",
        columnId: "special pricing",
        type: "select",
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
      },
      { label: "Notes", columnId: "notes", type: "text" },
      { label: "Date Modified", columnId: "date modified", type: "date" },
    ]
  }, [])

  const columns = useMemo(() => getColumns(onSuccessCallback), [])

  const handleImport: (...args: any[]) => void = async (args) => {}

  const handleExport: (...args: any[]) => void = async (args) => {}

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: productAvailabilities || [],
    columns: columns,
    initialState: {
      columnPinning: { right: ["actions"] },
      sorting: [{ id: "date modified", desc: true }],
    },
  })

  //* fetch product availabilities
  useEffect(() => {
    if (suppCode) execute({ supplierCode: suppCode })
  }, [suppCode])

  return (
    <DataTable table={table} isLoading={isExecuting}>
      <div className='flex flex-col items-stretch justify-center gap-2 md:flex-row md:items-center md:justify-between'>
        <DataTableSearch table={table} className='' />

        <div className='flex items-center gap-2'>
          <DataTableFilter className='w-full md:w-fit' table={table} filterFields={filterFields} columnFilters={columnFilters} />
          <DataTableViewOptions className='w-full md:w-fit' table={table} columnVisibility={columnVisibility} />

          <DataImportExport
            className='w-full md:w-fit'
            onImport={(args) => handleImport(args)}
            onExport={(args) => handleExport({ ...args, data: productAvailabilities })}
            code={`supplier-${suppCode}-product-availabilities`}
          />
        </div>
      </div>
    </DataTable>
  )
}
