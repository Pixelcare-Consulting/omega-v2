"use client"

import { utils, writeFileXLSX } from "xlsx-js-style"
import { useCallback, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import { format } from "date-fns"
import { useRouter } from "nextjs-toploader/app"

import getColumns from "./supplier-table-column"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { bpMasterCreateMany, getBpMasterGroupsClient, getBpMasters } from "@/actions/master-bp"
import { SOURCES_OPTIONS, SYNC_STATUSES_OPTIONS } from "@/constant/common"
import { BP_MASTER_SUPPLIER_AVL_STATUS_OPTIONS, BP_MASTER_SUPPLIER_SCOPE_OPTIONS } from "@/schema/master-bp"
import { parseExcelFile, styleWorkSheet } from "@/lib/xlsx"
import { delay } from "@/lib/utils"
import DataImportExport from "@/components/data-table/data-import-export"
import { Stats } from "@/types/common"

type SuppliersListsProps = {
  suppliers: Awaited<ReturnType<typeof getBpMasters>>
  itemGroups?: any
  manufacturers?: any
}

export default function SupplierLists({ suppliers, itemGroups, manufacturers }: SuppliersListsProps) {
  const router = useRouter()
  const columns = useMemo(() => getColumns(itemGroups, manufacturers), [JSON.stringify(itemGroups), JSON.stringify(manufacturers)])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "Supplier", columnId: "supplier", type: "text" },
      { label: "Group", columnId: "group name", type: "text" },
      { label: "Status", columnId: "status", type: "text" },
      { label: "scope", columnId: "scope", type: "select", options: BP_MASTER_SUPPLIER_SCOPE_OPTIONS },
      { label: "Date Created", columnId: "date created", type: "date" },
      { label: "Assigned Buyer", columnId: "assigned buyer", type: "text" },
      { label: "Commodity Strengths", columnId: "commodity strengths", type: "text" },
      { label: "MFR Strengths", columnId: "mfr strengths", type: "text" },
      { label: "Sync Status", columnId: "sync status", type: "select", options: SYNC_STATUSES_OPTIONS },
      { label: "Source", columnId: "source", type: "select", options: SOURCES_OPTIONS },
    ]
  }, [])

  const { executeAsync: executeAsyncBpMasterCreateMany } = useAction(bpMasterCreateMany)
  const {
    execute: getBpGroups,
    isPending: bpGroupsIsLoading,
    result: { data: bpGroups },
  } = useAction(getBpMasterGroupsClient)

  const handleImport: (...args: any[]) => void = useCallback(
    async (args) => {
      const { end, file, setStats, setShowErrorDialog } = args

      try {
        //* constant values
        const headers = [
          "Company Name",
          "Code",
          "Group",
          "Status",
          "Scope",
          "Billing - Street",
          "Billing - Street 2",
          "Billing - Street 3",
          "Billing - Street No",
          "Billing - Building/Floor/Room",
          "Billing - Block",
          "Billing - City",
          "Billing - Zip Code",
          "Billing - County",
          "Billing - Country",
          "Billing - State",
          "Billing - GLN",
          "Shipping - Street",
          "Shipping - Street 2",
          "Shipping - Street 3",
          "Shipping - Street No",
          "Shipping - Building/Floor/Room",
          "Shipping - Block",
          "Shipping - City",
          "Shipping - Zip Code",
          "Shipping - County",
          "Shipping - Country",
          "Shipping - State",
          "Shipping - GLN",
        ]
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
            const response = await executeAsyncBpMasterCreateMany({
              data: batch,
              total: parseData.length,
              stats,
              isLastBatch,
              metaData: { cardType: "S", bpGroups: bpGroups?.value || [] },
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
          toast.success("Supplier imported successfully!")
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
    [JSON.stringify(bpGroups), bpGroupsIsLoading]
  )

  const handleExport: (...args: any[]) => void = async (args) => {
    const { start, end, data, setStats } = args
    const tableData = data as typeof suppliers

    try {
      //* start exporting
      start("exporting")

      //* reshape data - property names will be the header values
      const excelData = tableData.map((supplier) => {
        const commodityStrengths = (itemGroups
          ?.filter((item: any) => supplier.commodityStrengths?.includes(item?.Number))
          ?.map((item: any) => item?.GroupName || "")
          .filter(Boolean) || []) as string[]

        const mfrStrengths = (manufacturers
          ?.filter((manufacturer: any) => supplier.mfrStrengths?.includes(manufacturer?.Code))
          ?.map((manufacturer: any) => manufacturer?.ManufacturerName || "")
          .filter(Boolean) || []) as string[]

        return {
          Code: supplier.CardCode,
          Name: supplier.CardName,
          Group: supplier.GroupName,
          Status: BP_MASTER_SUPPLIER_AVL_STATUS_OPTIONS.find((item) => item.value === supplier.status)?.label || "",
          Scope: BP_MASTER_SUPPLIER_SCOPE_OPTIONS.find((item) => item.value === supplier.scope)?.label || "",
          "Date Created": format(new Date(supplier.createdAt), "MM-dd-yyyy hh:mm a"),
          "Assigned Buyer": supplier.buyer?.name || supplier.buyer?.email || "",
          "Commodity Strengths": commodityStrengths.join(", "),
          "MFR Strengths": mfrStrengths.join(", "),
          "Sync Status": SYNC_STATUSES_OPTIONS.find((item) => item.value === supplier.syncStatus)?.label || "",
          Source: SOURCES_OPTIONS.find((item) => item.value === supplier.source)?.label || "",
        }
      })

      setStats({ total: 1, completed: 0, progress: 75, error: [] })

      //* create workbook & worksheet
      const wb = utils.book_new()
      const ws = utils.json_to_sheet(excelData)

      //* set Column widths
      ws["!cols"] = [
        { wch: 30 }, //* Code
        { wch: 45 }, //* Name
        { wch: 45 }, //* Group
        { wch: 20 }, //* Status
        { wch: 20 }, //* Scope
        { wch: 20 }, //* Date Created
        { wch: 50 }, //* Assigned Buyer
        { wch: 100 }, //* Commodity Strengths
        { wch: 100 }, //* MFR Strengths
        { wch: 20 }, //* Sync Status
        { wch: 20 }, //* Source
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
      utils.book_append_sheet(wb, ws, "SUPPLIERS")
      writeFileXLSX(wb, `SUPPLIERS-${format(new Date(), "MM-dd-yyyy")}.xlsx`)

      //* end exporting
      end()
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || "Failed to export data")
      end()
    }
  }

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: suppliers,
    columns: columns,
    initialState: { columnPinning: { right: ["actions"] } },
  })

  useEffect(() => {
    //* trigger fetching onload
    getBpGroups()
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
            isLoadingDependencies={bpGroupsIsLoading}
            onImport={(args) => handleImport(args)}
            onExport={(args) => handleExport({ ...args, data: suppliers })}
            code='supplier'
          />
        </div>
      </div>
    </DataTable>
  )
}
