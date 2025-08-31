"use client"

import { utils, writeFileXLSX } from "xlsx-js-style"
import { useMemo } from "react"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import { format } from "date-fns"
import { useRouter } from "nextjs-toploader/app"

import getColumns from "./item-table-column"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import LoadingButton from "@/components/loading-button"
import { Icons } from "@/components/icons"
import { getItems } from "@/actions/master-item"
import { SOURCES_OPTIONS, SYNC_STATUSES_OPTIONS } from "@/constant/common"
import DataImportExport from "@/components/data-table/data-import-export"
import { styleWorkSheet } from "@/lib/xlsx"
import { delay } from "@/lib/utils"

type ItemListProps = {
  items: Awaited<ReturnType<typeof getItems>>
}

export default function ItemList({ items }: ItemListProps) {
  const columns = useMemo(() => getColumns(), [])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "Description", columnId: "description", type: "text" },
      { label: "Group", columnId: "group", type: "text" },
      { label: "MPN", columnId: "mpn", type: "text" },
      { label: "Manufacturer", columnId: "manufacturer", type: "text" },
      { label: "UOM", columnId: "uom", type: "text" },
      { label: "Status", columnId: "status", type: "text" },
      { label: "Sync Status", columnId: "sync status", type: "select", options: SYNC_STATUSES_OPTIONS },
      { label: "Source", columnId: "source", type: "select", options: SOURCES_OPTIONS },
    ]
  }, [])

  const handleImport: (...args: any[]) => void = async (args) => {}

  const handleExport: (...args: any[]) => void = async (args) => {
    const { start, end, data, setStats } = args
    const tableData = data as typeof items

    try {
      //* start exporting
      start("exporting")

      //* reshape data - property names will be the header values
      const excelData = tableData.map((masterItem) => {
        return {
          Description: masterItem.ItemName,
          Group: masterItem?.ItmsGrpNam || "",
          MPN: masterItem.ItemCode,
          Manufacturer: masterItem.FirmName || "",
          UOM: masterItem.BuyUnitMsr || "",
          SyncStatus: SYNC_STATUSES_OPTIONS.find((item) => item.value === masterItem.syncStatus)?.label || "",
          Source: SOURCES_OPTIONS.find((item) => item.value === masterItem.source)?.label || "",
        }
      })

      setStats({ total: 1, completed: 0, progress: 75, error: [] })

      //* create workbook & worksheet
      const wb = utils.book_new()
      const ws = utils.json_to_sheet(excelData)

      //* set Column widths
      ws["!cols"] = [
        { wch: 45 }, //* Description
        { wch: 45 }, //* Group
        { wch: 30 }, //* MPN
        { wch: 45 }, //* Manufacturer
        { wch: 20 }, //* UOM
        { wch: 20 }, //* Source
        { wch: 20 }, //* Sync Status
      ]

      //* style worksheet
      styleWorkSheet({
        worksheet: ws,
        cellStyle: { alignment: { horizontal: "left", vertical: "center", wrapText: true } },
        headerStyle: { font: { bold: true } },
      })

      //* delay 1 seeconds
      await delay(500)
      setStats({ total: 0, completed: 1, progress: 100, error: [] })
      await delay(500)

      //* append worksheet to workbook
      utils.book_append_sheet(wb, ws, "ITEMS")
      writeFileXLSX(wb, `ITEMS-${format(new Date(), "MM-dd-yyyy")}.xlsx`)

      //* end exporting
      end()
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || "Failed to export data")
      end()
    }
  }

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: items,
    columns: columns,
    initialState: { columnPinning: { right: ["actions"] } },
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
            onExport={(args) => handleExport({ ...args, data: items })}
          />
        </div>
      </div>
    </DataTable>
  )
}
