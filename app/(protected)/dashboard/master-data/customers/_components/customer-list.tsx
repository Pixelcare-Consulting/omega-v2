"use client"

import { utils, writeFileXLSX } from "xlsx-js-style"
import { useMemo } from "react"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import { format } from "date-fns"
import { useRouter } from "nextjs-toploader/app"

import getColumns from "./customer-table-column"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { getBpMasters } from "@/actions/master-bp"
import { SOURCES_OPTIONS, SYNC_STATUSES_OPTIONS } from "@/constant/common"
import { BP_MASTER_CUSTOMER_STATUS_OPTIONS, BP_MASTER_CUSTOMER_TYPE_OPTIONS } from "@/schema/master-bp"
import { styleWorkSheet } from "@/lib/xlsx"
import { delay } from "@/lib/utils"
import DataImportExport from "@/components/data-table/data-import-export"

type CustomersListsProps = {
  customers: Awaited<ReturnType<typeof getBpMasters>>
}

export default function CustomerLists({ customers }: CustomersListsProps) {
  const columns = useMemo(() => getColumns(), [])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "Customer", columnId: "customer", type: "text" },
      { label: "Group", columnId: "group name", type: "text" },
      {
        label: "Credit Hold",
        columnId: "credit hold",
        type: "select",
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
      },
      { label: "Type", columnId: "type", type: "select", options: BP_MASTER_CUSTOMER_TYPE_OPTIONS },
      { label: "Status", columnId: "status", type: "select", options: BP_MASTER_CUSTOMER_STATUS_OPTIONS },
      {
        label: "Active",
        columnId: "active",
        type: "select",
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
      },
      { label: "Sales Employee", columnId: "sales employee", type: "text" },
      { label: "BDR / Inside Sales Rep", columnId: "bdr inside sales rep", type: "text" },
      { label: "Account Executive", columnId: "account executive", type: "text" },
      { label: "Account Associate", columnId: "account associate", type: "text" },
      { label: "Sync Status", columnId: "sync status", type: "select", options: SYNC_STATUSES_OPTIONS },
      {
        label: "Source",
        columnId: "source",
        type: "select",
        options: SOURCES_OPTIONS,
      },
    ]
  }, [])

  const handleImport: (...args: any[]) => void = async (args) => {}

  const handleExport: (...args: any[]) => void = async (args) => {
    const { start, end, data, setStats } = args
    const tableData = data as typeof customers

    try {
      //* start exporting
      start("exporting")

      //* reshape data - property names will be the header values
      const excelData = tableData.map((customer) => {
        return {
          Code: customer.CardCode,
          Name: customer.CardName,
          Group: customer.GroupName,
          "Credit Hold": customer.isCreditHold ? "Yes" : "No",
          Type: BP_MASTER_CUSTOMER_TYPE_OPTIONS.find((item) => item.value === customer.type)?.label || "",
          Status: BP_MASTER_CUSTOMER_STATUS_OPTIONS.find((item) => item.value === customer.status)?.label || "",
          Active: customer.isActive ? "Yes" : "No",
          "Sales Employee": customer.salesEmployee?.name || customer.salesEmployee?.email || "",
          "Account Executive": customer.accountExecutive?.name || customer.accountExecutive?.email || "",
          "Account Associate": customer.accountAssociate?.name || customer.accountAssociate?.email || "",
          "BDR / Inside Sales Rep": customer.bdrInsideSalesRep?.name || customer.bdrInsideSalesRep?.email || "",
          "Excess Manager": customer?.assignedExcessManagers?.map((person) => person?.user?.name || person?.user?.email).join(", ") || "",
          "Sync Status": SYNC_STATUSES_OPTIONS.find((item) => item.value === customer.syncStatus)?.label || "",
          Source: SOURCES_OPTIONS.find((item) => item.value === customer.source)?.label || "",
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
        { wch: 15 }, //* Credit Hold
        { wch: 20 }, //* Type
        { wch: 20 }, //* Status
        { wch: 20 }, //* Active
        { wch: 50 }, //* Sales Employee
        { wch: 50 }, //* Account Executive
        { wch: 50 }, //* Account Associate
        { wch: 50 }, //* BDR / Inside Sales Rep
        { wch: 100 }, //* Excess Manager
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
      utils.book_append_sheet(wb, ws, "CUSTOMERS")
      writeFileXLSX(wb, `CUSTOMERS-${format(new Date(), "MM-dd-yyyy")}.xlsx`)

      //* end exporting
      end()
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || "Failed to export data")
      end()
    }
  }

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: customers,
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
            onExport={(args) => handleExport({ ...args, data: customers })}
          />
        </div>
      </div>
    </DataTable>
  )
}
