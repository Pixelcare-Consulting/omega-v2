"use client"

import { utils, writeFileXLSX } from "xlsx-js-style"
import { useCallback, useEffect, useMemo } from "react"
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
import { getItemMasterGroupsClient, getItems, itemMasterCreateMany } from "@/actions/master-item"
import { SOURCES_OPTIONS, SYNC_STATUSES_OPTIONS } from "@/constant/common"
import DataImportExport from "@/components/data-table/data-import-export"
import { parseExcelFile, styleWorkSheet } from "@/lib/xlsx"
import { delay } from "@/lib/utils"
import { Stats } from "@/types/common"
import { getManufacturersClient } from "@/actions/manufacturer"

type ItemListProps = {
  items: Awaited<ReturnType<typeof getItems>>
}

export default function ItemList({ items }: ItemListProps) {
  const router = useRouter()
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

  const { executeAsync: executeAsyncItemMasterCreateMany } = useAction(itemMasterCreateMany)
  const {
    execute: getItemGroups,
    isPending: itemGroupsIsLoading,
    result: { data: itemGroups },
  } = useAction(getItemMasterGroupsClient)

  const {
    execute: getManufacturers,
    isPending: manufacturersIsLoading,
    result: { data: manufacturers },
  } = useAction(getManufacturersClient)

  const handleImport: (...args: any[]) => void = useCallback(
    async (args) => {
      const { end, file, setStats, setShowErrorDialog } = args

      try {
        //* constant values
        const headers = ["Description", "Code", "Group", "Manufacturer"]
        const batchSize = 5

        //* parse excel file
        const parseData = await parseExcelFile({ file, header: headers })

        //* trigger write by batch
        let batch: typeof parseData = []
        let stats: Stats = { total: 0, completed: 0, progress: 0, error: [], status: "processing" }

        for (let i = 0; i < parseData.length; i++) {
          const isLastBatch = i === parseData.length - 1
          const row = parseData[i]

          //* add to batch
          batch.push({ rowNumber: i + 2, ...row })

          //* check if batch size is reached or last batch
          if (batch.length === batchSize || isLastBatch) {
            const response = await executeAsyncItemMasterCreateMany({
              data: batch,
              total: parseData.length,
              stats,
              isLastBatch,
              metaData: { itemGroups: itemGroups?.value || [], manufacturers: manufacturers?.value || [] },
            })
            const result = response?.data

            if (result?.error) {
              setStats((prev: any) => ({ ...prev, error: [...prev.error, ...result.stats.error] }))
              stats.error = [...stats.error, ...result.stats.error]
            } else if (result?.stats) {
              setStats(result.stats)
              stats = result.stats
            }

            batch = []
          }
        }

        if (stats.status === "completed") {
          toast.success("Item imported successfully!")
          setStats((prev: any) => ({ ...prev, total: 0, completed: 0, progress: 0, status: "processing" }))
          router.refresh()
        }

        if (stats.error.length > 0) setShowErrorDialog(true)

        end()
      } catch (error: any) {
        console.error(error)
        toast.error(error?.message || "Failed to import file")
        end()
      }
    },
    [JSON.stringify(itemGroups), itemGroupsIsLoading, manufacturers, manufacturersIsLoading]
  )

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

  useEffect(() => {
    //* trigger fetching onload
    getItemGroups()
    getManufacturers()
  }, [])

  return (
    <DataTable table={table}>
      <div className='flex flex-col items-stretch justify-center gap-2 md:flex-row md:items-center md:justify-between'>
        <DataTableSearch table={table} className='' />

        <div className='flex items-center gap-2'>
          <DataTableFilter className='w-full md:w-fit' table={table} filterFields={filterFields} columnFilters={columnFilters} />
          <DataTableViewOptions className='w-full md:w-fit' table={table} columnVisibility={columnVisibility} />

          <DataImportExport
            className='w-full md:w-fit'
            isLoadingDependencies={itemGroupsIsLoading || manufacturersIsLoading}
            onImport={(args) => handleImport(args)}
            onExport={(args) => handleExport({ ...args, data: items })}
            code='item'
          />
        </div>
      </div>
    </DataTable>
  )
}
