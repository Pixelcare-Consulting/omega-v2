import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/badge"
import { deleteRequisition, getRequisitions } from "@/actions/requisition"
import { format } from "date-fns"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"
import { PURCHASING_STATUS_OPTIONS, RESULT_OPTIONS, SALES_CATEGORY_OPTIONS, URGENCY_OPTIONS } from "@/schema/requisition"
import { useRouter } from "nextjs-toploader/app"
import AlertModal from "@/components/alert-modal"
import { useAction } from "next-safe-action/hooks"
import { getItems } from "@/actions/item-master"

type RequisitionListProps = Awaited<ReturnType<typeof getRequisitions>>[number]

export function getColumns(items: Awaited<ReturnType<typeof getItems>>): ColumnDef<RequisitionListProps>[] {
  if (items.length < 1) return []

  return [
    {
      accessorKey: "date",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
      cell: ({ row }) => {
        const date = row.original.date
        return <div className='min-w-[100px]'>{format(date, "MM-dd-yyyy")}</div>
      },
    },
    {
      accessorFn: (row) => row.customer?.CardName || row.customer?.CardCode,
      id: "customer",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Customer' />,
      cell: ({ row }) => {
        const customer = row.original?.customer
        if (!customer) return null
        return <Badge variant='soft-slate'>{customer?.CardName || customer.CardCode}</Badge>
      },
    },
    {
      accessorKey: "customerPoHitRate",
      id: "customer po hit rate",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Customer PO Hit Rate' />,
      cell: ({ row }) => {
        const customerPoHitRate = "0.0%"
        return <Badge variant='soft-slate'>{customerPoHitRate}</Badge>
      },
    },
    {
      accessorFn: (row) => row?.salesPersons?.map((person) => person?.user?.name || person?.user?.email).join(", ") || "",
      id: "salesperson",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Salesperson' />,
      cell: ({ row }) => {
        const salespersons = row.original?.salesPersons || []

        if (!salespersons || salespersons.length < 1) return null

        return (
          <div className='min-w-[150px]'>
            <span className='mr-2 w-fit text-xs text-muted-foreground'>
              {/* //* Show the first 2 salespersons */}
              {salespersons
                .slice(0, 2)
                .map((buyers) => buyers?.user.name || buyers?.user.email)
                .join(", ")}

              {salespersons.length > 2 && (
                <ActionTooltipProvider
                  label={salespersons
                    .slice(2)
                    .map((buyers) => buyers?.user.name || buyers?.user.email)
                    .join(", ")}
                >
                  <div className='inline'>
                    <Badge className='ml-1' variant='slate'>
                      + {salespersons.slice(2).length}
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
      accessorFn: (row) => row?.salesCategory || "",
      id: "sales category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>
          Sales <br /> Category
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => {
        const salesCategory = row.original?.salesCategory
        const option = SALES_CATEGORY_OPTIONS.find((item) => item.value === salesCategory)
        if (!salesCategory || !option) return null
        return <Badge variant='soft-slate'>{option.label}</Badge>
      },
    },
    {
      accessorKey: "urgency",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Urgency' />,
      cell: ({ row }) => {
        const urgency = row.original?.urgency
        const option = URGENCY_OPTIONS.find((item) => item.value === urgency)
        if (!urgency || !option) return null

        return (
          <div className='min-w-[120px]'>
            <Badge variant='soft-amber'>{option.label}</Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "purchasingStatus",
      id: "purchasing status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>
          Purchasing <br /> Status
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => {
        const purchasingStatus = row.original?.purchasingStatus
        const option = PURCHASING_STATUS_OPTIONS.find((item) => item.value === purchasingStatus)
        if (!purchasingStatus || !option) return null
        return <Badge variant='soft-blue'>{option.label}</Badge>
      },
    },
    {
      accessorKey: "result",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Result' />,
      cell: ({ row }) => {
        const result = row.original.result
        const option = RESULT_OPTIONS.find((item) => item.value === result)
        if (!result || !option) return null
        return <Badge variant={result === "won" ? "soft-green" : "soft-red"}>{option.label}</Badge>
      },
    },
    {
      accessorFn: (row) => {
        const requestedItems = row?.requestedItems as string[] | null
        if (!requestedItems || requestedItems.length < 1) return null

        const primaryRequestedItem = requestedItems[0]
        const item = items.find((item) => item.ItemCode === primaryRequestedItem)

        return item?.ItemCode || ""
      },
      id: "mpn",
      header: ({ column }) => <DataTableColumnHeader column={column} title='MPN' />,
      cell: ({ row }) => {
        const requestedItems = row.original?.requestedItems as string[] | null
        if (!requestedItems || requestedItems.length < 1) return null

        const primaryRequestedItem = requestedItems[0]
        const item = items.find((item) => item.ItemCode === primaryRequestedItem)

        return (
          <div className='min-w-[150px]'>
            <Badge variant='soft-slate'>{item?.ItemCode || ""}</Badge>
          </div>
        )
      },
    },
    {
      accessorFn: (row) => {
        const requestedItems = row?.requestedItems as string[] | null
        if (!requestedItems || requestedItems.length < 1) return null

        const primaryRequestedItem = requestedItems[0]
        const item = items.find((item) => item.ItemCode === primaryRequestedItem)

        return item?.FirmName || ""
      },
      id: "mfr",
      header: ({ column }) => <DataTableColumnHeader column={column} title='MFR' />,
      cell: ({ row }) => {
        const requestedItems = row.original?.requestedItems as string[] | null
        if (!requestedItems || requestedItems.length < 1) return null

        const primaryRequestedItem = requestedItems[0]
        const item = items.find((item) => item.ItemCode === primaryRequestedItem)

        return <Badge variant='soft-slate'>{item?.FirmName || ""}</Badge>
      },
    },
    {
      accessorFn: (row) => row.quantity,
      id: "requested quantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>
          Requested <br /> Quantity
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => {
        const quantity = row.original.quantity
        if (!quantity) return null
        return <Badge variant='soft-slate'>{quantity}</Badge>
      },
    },
    {
      accessorFn: (row) => row?.omegaBuyers?.map((person) => person?.user?.name || person?.user?.email).join(", ") || "",
      id: "omega buyer",
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>
          Omega <br /> Buyer
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => {
        const omegaBuyers = row.original?.omegaBuyers || []

        if (!omegaBuyers || omegaBuyers.length < 1) return null

        return (
          <div className='min-w-[150px]'>
            <span className='mr-2 w-fit text-xs text-muted-foreground'>
              {/* //* Show the first 2 omegaBuyers */}
              {omegaBuyers
                .slice(0, 2)
                .map((buyers) => buyers?.user.name || buyers?.user.email)
                .join(", ")}

              {omegaBuyers.length > 2 && (
                <ActionTooltipProvider
                  label={omegaBuyers
                    .slice(2)
                    .map((buyers) => buyers?.user.name || buyers?.user.email)
                    .join(", ")}
                >
                  <div className='inline'>
                    <Badge className='ml-1' variant='slate'>
                      + {omegaBuyers.slice(2).length}
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
      accessorKey: "action",
      id: "action",
      header: "Action",
      cell: function ActionCell({ row }) {
        const router = useRouter()
        const { executeAsync } = useAction(deleteRequisition)
        const [showConfirmation, setShowConfirmation] = useState(false)

        const { id } = row.original

        async function handleDelete() {
          setShowConfirmation(false)

          toast.promise(executeAsync({ id }), {
            loading: "Deleting requisition...",
            success: (response) => {
              const result = response?.data

              if (!response || !result) throw { message: "Failed to delete requisition!", unExpectedError: true }

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='size-8 p-0'>
                  <Icons.moreHorizontal className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/crm/requisitions/${row.original.id}/view`)}>
                  <Icons.eye className='mr-2 size-4' /> View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/crm/requisitions/${row.original.id}`)}>
                  <Icons.pencil className='mr-2 size-4' /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem className='text-red-600' onClick={() => setShowConfirmation(true)}>
                  <Icons.trash className='mr-2 size-4' /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertModal
              isOpen={showConfirmation}
              title='Are you sure?'
              description={`Are you sure you want to delete this requisition?`}
              onConfirm={handleDelete}
              onConfirmText='Delete'
              onCancel={() => setShowConfirmation(false)}
            />
          </>
        )
      },
    },
  ]
}
