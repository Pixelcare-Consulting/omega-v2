import { format } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { useRouter } from "nextjs-toploader/app"
import { useAction } from "next-safe-action/hooks"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"
import { Badge, BadgeProps } from "@/components/badge"
import { Icons } from "@/components/icons"
import { useState } from "react"
import { dateFilter, dateSort } from "@/lib/data-table/data-table"
import { bpMasterAddressSetAsDefault, getBpMasterByCardCode } from "@/actions/master-bp"
import { SYNC_STATUSES_COLORS, SYNC_STATUSES_OPTIONS } from "@/constant/common"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ADDRESS_TYPE_OPTIONS } from "@/schema/master-address"
import { useDialogStore } from "@/hooks/use-dialog"
import { deleteAddressMaster } from "@/actions/master-address"
import AlertModal from "@/components/alert-modal"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import AddressReadOnlyView from "../../../../_components/address-read-only"

type AddressData = NonNullable<Awaited<ReturnType<typeof getBpMasterByCardCode>>>["addresses"][number]

export function getColumns(billToDef?: string | null, shipToDef?: string | null): ColumnDef<AddressData>[] {
  return [
    {
      accessorKey: "id",
      id: "id #",
      header: ({ column }) => <DataTableColumnHeader column={column} title='ID #' />,
      cell: ({ row }) => {
        const { id, AddrType } = row.original

        const defaultAddressId = AddrType === "B" ? billToDef || "" : AddrType === "S" ? shipToDef || "" : null
        const isDefault = id === defaultAddressId

        return (
          <div className='flex flex-col justify-center gap-2'>
            <span>{id}</span>
            {isDefault && <Badge variant='soft-violet'>Default</Badge>}
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      id: "date",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
      cell: ({ row }) => {
        const date = row.original.createdAt
        return <div>{format(date, "MM-dd-yyyy")}</div>
      },
      filterFn: (row, columnId, filterValue, addMeta) => {
        const date = row.original.createdAt
        const filterDateValue = new Date(filterValue)
        return dateFilter(date, filterDateValue)
      },
      sortingFn: (rowA, rowB, columnId) => {
        const rowADate = rowA.original.createdAt
        const rowBDate = rowB.original.createdAt
        return dateSort(rowADate, rowBDate)
      },
    },
    {
      accessorFn: (row) => {
        const type = row?.AddrType || ""
        const option = ADDRESS_TYPE_OPTIONS.find((item) => item.value === type)
        if (!option) return null
        return option.label
      },
      id: "type",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
      cell: ({ row }) => {
        const type = row.original.AddrType
        const option = ADDRESS_TYPE_OPTIONS.find((item) => item.value === type)
        const color = type === "B" ? "soft-blue" : type === "S" ? "soft-red" : "soft-slate"

        if (!option) return null
        return <Badge variant={color as BadgeProps["variant"]}>{option.label}</Badge>
      },
    },
    {
      accessorFn: (row) => {
        const street1 = row?.Street
        const street2 = row?.Address2
        const street3 = row?.Address3

        let result = ""

        if (street1) result += street1 + ", "
        if (street2) result += street2 + ", "
        if (street3) result += street3
      },
      id: "streets",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Streets' />,
      cell: ({ row }) => {
        const street1 = row.original?.Street || ""
        const street2 = row.original?.Address2 || ""
        const street3 = row.original?.Address3 || ""

        return (
          <div className='flex min-w-[200px] items-center gap-2'>
            <ul className='list-none'>
              <li>
                <span className='mr-1.5'>1.</span>
                <span>{street1}</span>
              </li>
              <li>
                <span className='mr-1.5'>2.</span>
                <span>{street2}</span>
              </li>
              <li>
                <span className='mr-1.5'>3.</span>
                <span>{street3}</span>
              </li>
            </ul>
          </div>
        )
      },
    },
    {
      accessorKey: "city",
      header: ({ column }) => <DataTableColumnHeader column={column} title='City' />,
      cell: ({ row }) => {
        const city = row.original.City
        return <div>{city}</div>
      },
    },
    {
      accessorKey: "stateName",
      id: "state",
      header: ({ column }) => <DataTableColumnHeader column={column} title='State' />,
      cell: ({ row }) => {
        const stateName = row.original.stateName
        return <div>{stateName}</div>
      },
    },
    {
      accessorKey: "countryName",
      id: "country",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Country' />,
      cell: ({ row }) => {
        const countryName = row.original.countryName
        return <div>{countryName}</div>
      },
    },
    {
      accessorKey: "ZipCode",
      id: "zip code",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Zip Code' />,
      cell: ({ row }) => {
        const zipCode = row.original.ZipCode
        return <div>{zipCode}</div>
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
      cell: function ActionCell({ row }) {
        const router = useRouter()

        const { executeAsync: deleteAddressMasterExecuteAsync } = useAction(deleteAddressMaster)
        const { executeAsync: bpMasterAddressSetAsDefaultExecuteAsync } = useAction(bpMasterAddressSetAsDefault)

        const [showConfirmationDelete, setShowConfirmationDelete] = useState(false)
        const [showConfirmationSetAsDefault, setShowConfirmationSetAsDefault] = useState(false)
        const [showReadOnlyView, setShowReadOnlyView] = useState(false)

        const { id, CardCode, source, AddrType } = row.original

        const { setIsOpen, setData } = useDialogStore(["setIsOpen", "setData"])

        const defaultAddressId = AddrType === "B" ? billToDef || "" : AddrType === "S" ? shipToDef || "" : null
        const isDefault = id === defaultAddressId

        const type = ADDRESS_TYPE_OPTIONS.find((item) => item.value === AddrType)?.label

        const handleEdit = () => {
          setData(row.original)
          setTimeout(() => setIsOpen(true), 1000)
        }

        async function handleDelete() {
          setShowConfirmationDelete(false)

          toast.promise(deleteAddressMasterExecuteAsync({ id }), {
            loading: "Deleting address...",
            success: (response) => {
              const result = response?.data

              if (!response || !result) throw { message: "Failed to delete address!", unExpectedError: true }

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

        async function handleSetAsDefault() {
          setShowConfirmationSetAsDefault(false)

          toast.promise(bpMasterAddressSetAsDefaultExecuteAsync({ cardCode: CardCode, addressType: AddrType, addressId: id }), {
            loading: "Setting as default...",
            success: (response) => {
              const result = response?.data

              if (!response || !result) throw { message: "Failed to set as default!", unExpectedError: true }

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
          <div className='flex gap-2'>
            <ActionTooltipProvider label='View Address'>
              <Icons.eye className='size-4 cursor-pointer transition-all hover:scale-125' onClick={() => setShowReadOnlyView(true)} />
            </ActionTooltipProvider>

            {source === "portal" && (
              <ActionTooltipProvider label='Edit Address'>
                <Icons.pencil className='size-4 cursor-pointer transition-all hover:scale-125' onClick={handleEdit} />
              </ActionTooltipProvider>
            )}

            <ActionTooltipProvider label='Delete Address'>
              <Icons.trash
                className='size-4 cursor-pointer text-red-500 transition-all hover:scale-125'
                onClick={() => setShowConfirmationDelete(true)}
              />
            </ActionTooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <ActionTooltipProvider label='More Options'>
                  <Icons.moreHorizontal className='size-4 cursor-pointer transition-all hover:scale-125' />
                </ActionTooltipProvider>
              </DropdownMenuTrigger>

              <DropdownMenuContent align='end'>
                {!isDefault && (
                  <DropdownMenuItem onClick={() => setShowConfirmationSetAsDefault(true)}>
                    <Icons.checkCircleBig className='mr-2 size-4' /> Set as Default
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertModal
              isOpen={showConfirmationDelete}
              title='Are you sure?'
              description={`Are you sure you want to delete this address #${CardCode}?`}
              onConfirm={handleDelete}
              onConfirmText='Delete'
              onCancel={() => setShowConfirmationDelete(false)}
            />

            <AlertModal
              isOpen={showConfirmationSetAsDefault}
              title='Are you sure?'
              description={`Are you sure you want to set this address #${CardCode} as default ${type?.toLowerCase()} address?`}
              onConfirm={handleSetAsDefault}
              onConfirmText='Set as Default'
              onCancel={() => setShowConfirmationDelete(false)}
            />

            <Dialog open={showReadOnlyView} onOpenChange={setShowReadOnlyView}>
              <DialogContent className='max-h-[85vh] overflow-auto sm:max-w-5xl'>
                <Card className='p-3'>
                  <AddressReadOnlyView address={row.original} />
                </Card>
              </DialogContent>
            </Dialog>
          </div>
        )
      },
    },
  ]
}
