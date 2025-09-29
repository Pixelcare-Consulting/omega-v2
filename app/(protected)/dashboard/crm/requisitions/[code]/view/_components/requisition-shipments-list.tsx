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
import { SHIPMENT_SHIP_TO_LOCATION_OPTIONS, SHIPMENT_SHIPPING_ORDER_STATUS_OPTIONS } from "@/schema/shipment"
import { useDataTable } from "@/hooks/use-data-table"
import { getRequisitionByCode } from "@/actions/requisition"
import { getColumns } from "./requisition-shipments-table-column"

type ShipmentListProps = {
  shipments: NonNullable<Awaited<ReturnType<typeof getRequisitionByCode>>>["shipments"][number][]
  requisition: NonNullable<Awaited<ReturnType<typeof getRequisitionByCode>>>
}

export default function RequisitionShipmentsList({ requisition, shipments }: ShipmentListProps) {
  const router = useRouter()
  const columns = useMemo(() => getColumns(requisition), [JSON.stringify(requisition)])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "Date Modified", columnId: "date modified", type: "date" },
      { label: "Requisition", columnId: "requisition", type: "text" },
      {
        label: "Shipping Order Status",
        columnId: "shipping order status",
        type: "select",
        options: SHIPMENT_SHIPPING_ORDER_STATUS_OPTIONS,
      },
      { label: " Req - Status Last Updated", columnId: "req po status last updated", type: "date" },
      {
        label: "Ship to Location",
        columnId: "ship to location",
        type: "select",
        options: SHIPMENT_SHIP_TO_LOCATION_OPTIONS,
      },
      { label: "SO # (Formatted)", columnId: "so # (formatted)", type: "text" },
      { label: "Customer Name", columnId: "customer name", type: "text" },
      { label: "Cust. PO #", columnId: "cust. po #", type: "text" },
      { label: "Supplier Name", columnId: "supplier name", type: "text" },
      { label: "Req - Salesperson", columnId: "req - salesperson", type: "text" },
      { label: "MPN", columnId: "mpn", type: "text" },
      { label: "MFR", columnId: "mfr", type: "text" },
      { label: "PO # (Formatted)", columnId: "po # (formatted)", type: "text" },
      { label: "Order Updates", columnId: "order updates", type: "text" },
      { label: "Supplier Quote - DC", columnId: "supplier quote - dc", type: "text" },
      { label: "Supplier Quote - COO", columnId: "supplier quote - coo", type: "text" },
      { label: "Supplier Quote - Condition", columnId: "supplier quote - condition", type: "text" },
      { label: "Purchaser", columnId: "purchaser", type: "text" },
    ]
  }, [])

  const handleImport: (...args: any[]) => void = async (args) => {}

  const handleExport: (...args: any[]) => void = async (args) => {}

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: shipments,
    columns: columns,
    initialState: {
      columnPinning: { right: ["actions"] },
      sorting: [{ id: "date modified", desc: true }],
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
            onExport={(args) => handleExport({ ...args, data: shipments })}
            code={`requisition-${requisition.code}-shipments`}
          />
        </div>
      </div>
    </DataTable>
  )
}
