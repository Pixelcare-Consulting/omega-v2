import Link from "next/link"
import { useRouter } from "nextjs-toploader/app"
import { ColumnDef } from "@tanstack/react-table"

import { Badge, BadgeProps } from "@/components/badge"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { deleteBpMaster, getBpMasters } from "@/actions/master-bp"
import { SYNC_STATUSES_COLORS, SYNC_STATUSES_OPTIONS } from "@/constant/common"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"
import { BP_MASTER_CUSTOMER_STATUS_OPTIONS, BP_MASTER_CUSTOMER_TYPE_OPTIONS } from "@/schema/master-bp"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import AlertModal from "@/components/alert-modal"

type CustomerData = Awaited<ReturnType<typeof getBpMasters>>[number]

export default function getColumns(): ColumnDef<CustomerData>[] {
  return [
    {
      accessorFn: (row) => `${row.CardName} ${row.CardCode}`,
      id: "customer",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Customer' />,
      size: 150,
      cell: ({ row }) => (
        <div className='flex flex-col'>
          <span className='font-semibold'>{row.original.CardName}</span>
          <span className='decoration-1underline text-muted-foreground'>{row.original.CardCode}</span>
        </div>
      ),
    },
    {
      accessorKey: "GroupName",
      id: "group name",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Group' />,
      cell: ({ row }) => <Badge variant='soft-blue'>{row.original.GroupName || ""}</Badge>,
    },
    {
      accessorKey: "isCreditHold",
      id: "credit hold",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Credit Hold' />,
      cell: ({ row }) => (
        <Badge variant={row.original.isCreditHold ? "soft-green" : "soft-red"}>{row.original.isCreditHold ? "Yes" : "No"}</Badge>
      ),
    },
    {
      accessorKey: "type",
      id: "type",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
      cell: ({ row }) => {
        const type = row.original.type
        const option = BP_MASTER_CUSTOMER_TYPE_OPTIONS.find((item) => item.value === type)
        if (!option) return null
        return <Badge variant='soft-slate'>{option.label}</Badge>
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
      cell: ({ row }) => {
        const status = row.original.status
        const option = BP_MASTER_CUSTOMER_STATUS_OPTIONS.find((item) => item.value === status)
        if (!option) return null
        return <Badge variant='soft-amber'>{option.label}</Badge>
      },
    },
    {
      accessorKey: "poHitRate",
      id: "po hit rate",
      header: ({ column }) => <DataTableColumnHeader column={column} title='PO Hit Rate' />,
      cell: ({ row }) => null,
    },
    {
      accessorKey: "requisitionsForLast30Days",
      id: "requisitions for last 30 days",
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>
          Requisitions <br /> for Last 30 Days
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => null,
    },
    {
      accessorKey: "requisitionsForLast90Days",
      id: "requisitions for last 90 days",
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>
          Requisitions <br /> for Last 90 Days
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => null,
    },
    {
      accessorKey: "isActive",
      id: "active",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Active' />,
      cell: ({ row }) => <Badge variant={row.original.isActive ? "soft-green" : "soft-red"}>{row.original.isActive ? "Yes" : "No"}</Badge>,
    },
    {
      accessorFn: (row) => row.salesEmployee?.name || row.salesEmployee?.email || "",
      id: "sales employee",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Sales Employee' />,
      cell: ({ row }) => {
        const salesEmployee = row.original.salesEmployee
        if (!salesEmployee) return null
        return <div>{salesEmployee.name || salesEmployee.email}</div>
      },
    },
    {
      accessorFn: (row) => row.accountExecutive?.name || row.accountExecutive?.email || "",
      id: "account executive",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Account Executive' />,
      cell: ({ row }) => {
        const accountExecutive = row.original.accountExecutive
        if (!accountExecutive) return null
        return <div>{accountExecutive.name || accountExecutive.email}</div>
      },
    },
    {
      accessorFn: (row) => row.accountAssociate?.name || row.accountAssociate?.email || "",
      id: "account associate",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Account Associate' />,
      cell: ({ row }) => {
        const accountAssociate = row.original.accountAssociate
        if (!accountAssociate) return null
        return <div>{accountAssociate.name || accountAssociate.email}</div>
      },
    },
    {
      accessorFn: (row) => row.bdrInsideSalesRep?.name || row.bdrInsideSalesRep?.email || "",
      id: "bdr inside sales rep",
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>
          BDR / <br /> Inside Sales Rep
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => {
        const bdrInsideSalesRep = row.original.bdrInsideSalesRep
        if (!bdrInsideSalesRep) return null
        return <div>{bdrInsideSalesRep.name || bdrInsideSalesRep.email}</div>
      },
    },
    {
      accessorFn: (row) => row?.assignedExcessManagers?.map((person) => person?.user?.name || person?.user?.email).join(", ") || "",
      id: "excess manager",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Excess Manager' />,
      cell: ({ row }) => {
        const excessManager = row.original?.assignedExcessManagers || []

        if (!excessManager || excessManager.length < 1) return null

        return (
          <div className='min-w-[150px]'>
            <span className='mr-2 w-fit text-xs text-muted-foreground'>
              {/* //* Show the first 2 excess managers */}
              {excessManager
                .slice(0, 2)
                .map((em) => em?.user.name || em?.user.email)
                .join(", ")}

              {excessManager.length > 2 && (
                <ActionTooltipProvider
                  label={excessManager
                    .slice(2)
                    .map((em) => em?.user.name || em?.user.email)
                    .join(", ")}
                >
                  <div className='inline'>
                    <Badge className='ml-1' variant='slate'>
                      + {excessManager.slice(2).length}
                    </Badge>
                  </div>
                </ActionTooltipProvider>
              )}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "syncStatus",
      id: "sync status",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Sync Status' />,
      cell: ({ row }) => {
        const syncStatus = row.original?.syncStatus
        const label = SYNC_STATUSES_OPTIONS.find((item) => item.value === syncStatus)?.label
        const color = SYNC_STATUSES_COLORS.find((item) => item.value === syncStatus)?.color

        if (!syncStatus || !label || !color) return null

        return <Badge variant={color as BadgeProps["variant"]}>{label}</Badge>
      },
    },
    {
      accessorFn: (row) => row.source,
      accessorKey: "source",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Source' />,
      cell: ({ row }) => {
        const isSAP = row.original.source === "sap"
        return isSAP ? <Badge variant='soft-green'>SAP</Badge> : <Badge variant='soft-amber'>Portal</Badge>
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      size: 80,
      cell: function ActionCell({ row }) {
        const router = useRouter()
        const { executeAsync } = useAction(deleteBpMaster)
        const [showConfirmation, setShowConfirmation] = useState(false)

        const { CardCode, source } = row.original

        async function handleDelete() {
          setShowConfirmation(false)

          toast.promise(executeAsync({ code: CardCode, type: "C" }), {
            loading: "Deleting customer...",
            success: (response) => {
              const result = response?.data

              if (!response || !result) throw { message: "Failed to delete customer!", unExpectedError: true }

              if (!result.error) {
                setTimeout(() => {
                  router.refresh()
                }, 1500)

                return result.message
              }

              throw { message: result.message, expectedError: true }
            },
            error: (err: Error & { expectedError: boolean }) => {
              return err?.expectedError ? err.message : "Something went wrong! Please try again later."
            },
          })
        }

        return (
          <>
            <div className='flex gap-2'>
              <ActionTooltipProvider label='View Customer'>
                <Icons.eye
                  className='size-4 cursor-pointer transition-all hover:scale-125'
                  onClick={() => router.push(`/dashboard/master-data/customers/${CardCode}/view`)}
                />
              </ActionTooltipProvider>

              {source === "portal" && (
                <>
                  <ActionTooltipProvider label='Edit Customer'>
                    <Icons.pencil
                      className='size-4 cursor-pointer transition-all hover:scale-125'
                      onClick={() => router.push(`/dashboard/master-data/customers/${CardCode}`)}
                    />
                  </ActionTooltipProvider>

                  <ActionTooltipProvider label='Delete Customer'>
                    <Icons.trash
                      className='size-4 cursor-pointer text-red-500 transition-all hover:scale-125'
                      onClick={() => setShowConfirmation(true)}
                    />
                  </ActionTooltipProvider>
                </>
              )}

              <ActionTooltipProvider label='More Options'>
                <Icons.moreHorizontal className='size-4 cursor-pointer transition-all hover:scale-125' />
              </ActionTooltipProvider>

              <AlertModal
                isOpen={showConfirmation}
                title='Are you sure?'
                description={`Are you sure you want to delete this customer (#${CardCode})?`}
                onConfirm={handleDelete}
                onConfirmText='Delete'
                onCancel={() => setShowConfirmation(false)}
              />
            </div>
          </>
        )
      },
    },
  ]
}
