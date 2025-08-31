"use client"

import { utils, writeFileXLSX } from "xlsx-js-style"
import { useMemo } from "react"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import { format } from "date-fns"
import { useRouter } from "nextjs-toploader/app"

import { getAccounts, accountCreateMany } from "@/actions/account"
import { getColumns } from "./account-table-column"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import DataImportExport from "@/components/data-table/data-import-export"
import { parseExcelFile, styleWorkSheet } from "@/lib/xlsx"
import { delay } from "@/lib/utils"
import { Stats } from "@/types/common"

type AccountListProps = {
  accounts: Awaited<ReturnType<typeof getAccounts>>
}

export default function AccountList({ accounts }: AccountListProps) {
  const router = useRouter()
  const columns = useMemo(() => getColumns(), [])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "Name", columnId: "name", type: "text" },
      { label: "Email", columnId: "email", type: "text" },
      { label: "Phone", columnId: "phone", type: "text" },
      {
        label: "Status",
        columnId: "status",
        type: "select",
        options: [
          { label: "Active", value: "true" },
          { label: "Inactive", value: "false" },
        ],
      },
    ]
  }, [])

  const { executeAsync } = useAction(accountCreateMany)

  const handleImport: (...args: any[]) => void = async (args) => {
    const { end, file, setStats, setShowErrorDialog } = args

    try {
      //* constant values
      const headers = ["Name", "Email", "Phone", "Website", "Industry", "Status", "Full Address"]
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
          const response = await executeAsync({ data: batch, total: parseData.length, stats, isLastBatch })
          const result = response?.data

          if (result?.error) {
            setStats((prev: any) => ({ ...prev, error: [...prev.error, ...batch] }))
            stats.error = [...stats.error, ...batch]
          } else if (result?.stats) {
            setStats(result.stats)
            stats = result.stats
          }

          batch = []
        }
      }

      if (stats.status === "completed") {
        toast.success("Accounts imported successfully!")
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
  }

  const handleExport: (...args: any[]) => void = async (args) => {
    const { start, end, data, setStats } = args
    const tableData = data as typeof accounts

    try {
      //* start exporting
      start("exporting")

      //* reshape data - property names will be the header values
      const excelData = tableData.map((account) => {
        return {
          Name: account.name,
          Email: account.email || "",
          Phone: account.phone || "",
          Website: account.website || "",
          Industry: account.industry || "",
          Status: account.isActive ? "Active" : "Inactive",
          FullAddress: account.fullAddress || "",
        }
      })

      setStats({ total: 1, completed: 0, progress: 75, error: [] })

      //* create workbook & worksheet
      const wb = utils.book_new()
      const ws = utils.json_to_sheet(excelData)

      //* set Column widths
      ws["!cols"] = [
        { wch: 20 }, //* Name
        { wch: 15 }, //* Email
        { wch: 15 }, //* Phone
        { wch: 25 }, //* Website
        { wch: 30 }, //* Industry
        { wch: 10 }, //* Status
        { wch: 35 }, //* Full Address
      ]

      //* tyle worksheet
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
      utils.book_append_sheet(wb, ws, "Accounts")
      writeFileXLSX(wb, `ACCOUNTS-${format(new Date(), "MM-dd-yyyy")}.xlsx`)

      //* end exporting
      end()
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || "Failed to export data")
      end()
    }
  }

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: accounts,
    columns: columns,
    initialState: { columnVisibility: { email: false }, columnPinning: { right: ["actions"] } },
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
            onExport={(args) => handleExport({ ...args, data: accounts })}
          />
        </div>
      </div>
    </DataTable>
  )
}
