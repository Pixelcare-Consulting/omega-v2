"use client"

import { utils, writeFileXLSX } from "xlsx-js-style"
import { useMemo } from "react"
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
import { getBpMasters } from "@/actions/master-bp"
import { SOURCES_OPTIONS, SYNC_STATUSES_OPTIONS } from "@/constant/common"
import { BP_MASTER_SUPPLIER_AVL_STATUS_OPTIONS, BP_MASTER_SUPPLIER_SCOPE_OPTIONS } from "@/schema/master-bp"
import { styleWorkSheet } from "@/lib/xlsx"
import { delay } from "@/lib/utils"
import DataImportExport from "@/components/data-table/data-import-export"

type SuppliersListsProps = {
  suppliers: Awaited<ReturnType<typeof getBpMasters>>
  itemGroups?: any
  manufacturers?: any
}

export default function SupplierLists({ suppliers, itemGroups, manufacturers }: SuppliersListsProps) {
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

  const handleImport: (...args: any[]) => void = async (args) => {}

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
            onExport={(args) => handleExport({ ...args, data: suppliers })}
          />
        </div>
      </div>
    </DataTable>
  )
}
