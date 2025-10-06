"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "next/navigation"
import { useRouter } from "nextjs-toploader/app"
import { useForm, useWatch } from "react-hook-form"
import { useEffect, useMemo } from "react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useDataTable } from "@/hooks/use-data-table"
import { ColumnDef } from "@tanstack/react-table"

import { getSupplierOfferByCode, LineItemsJSONData, upsertSupplierOffer } from "@/actions/supplier-offer"
import { useDialogStore } from "@/hooks/use-dialog"
import { type SupplierOfferForm, supplierOfferFormSchema, LineItemForm } from "@/schema/supplier-offer"
import { getBpMastersClient } from "@/actions/master-bp"
import { FormDebug } from "@/components/form/form-debug"
import { Form, FormMessage } from "@/components/ui/form"
import { ComboboxField } from "@/components/form/combobox-field"
import { cn, toKebabCase } from "@/lib/utils"
import { Badge } from "@/components/badge"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"
import { getUsersClient } from "@/actions/user"
import DatePickerField from "@/components/form/date-picker-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { formatCurrency, formatNumber } from "@/lib/formatter"
import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import SupplierOfferLineItemForm from "./supplier-offer-line-item-form"
import InputField from "@/components/form/input-field"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"
import { Icons } from "@/components/icons"

type SupplierOfferFormProps = {
  isModal?: boolean
  disableSupplierField?: boolean
  supplierOffer: Awaited<ReturnType<typeof getSupplierOfferByCode>>
  suppCode?: string
  callback?: () => void
}

export default function SupplierOfferForm({ isModal, disableSupplierField, supplierOffer, suppCode, callback }: SupplierOfferFormProps) {
  const router = useRouter()
  const { code } = useParams() as { code: string }
  const { data: session } = useSession()
  const { isOpen, setIsOpen, data: lineItemData, setData } = useDialogStore(["isOpen", "setIsOpen", "data", "setData"])

  const isCreate = code === "add" || !supplierOffer

  const values = useMemo(() => {
    if (supplierOffer) {
      const { supplier, lineItems, listOwner, ...data } = supplierOffer

      return {
        ...data,
        lineItems: [],
      }
    }

    if (code === "add" || !supplierOffer) {
      return {
        id: "add",
        listDate: new Date(),
        supplierCode: "",
        fileName: "",
        listOwnerId: "",
        lineItems: [],
      }
    }

    return undefined
  }, [JSON.stringify(supplierOffer)])

  const form = useForm<SupplierOfferForm>({
    mode: "onChange",
    values,
    resolver: zodResolver(supplierOfferFormSchema),
  })

  const { executeAsync, isExecuting } = useAction(upsertSupplierOffer)

  const fileName = useWatch({ control: form.control, name: "fileName" })
  const lineItems = useWatch({ control: form.control, name: "lineItems" })

  const {
    execute: getBpMastersExec,
    isExecuting: isBpMastersLoading,
    result: { data: bpMasters },
  } = useAction(getBpMastersClient)

  const {
    execute: getUsersExec,
    isExecuting: isUsersLoading,
    result: { data: users },
  } = useAction(getUsersClient)

  const columns = useMemo((): ColumnDef<LineItemForm>[] => {
    return [
      {
        accessorKey: "cpn",
        header: "CPN",
      },
      {
        accessorKey: "mpn",
        header: "MPN",
      },
      {
        accessorKey: "mfr",
        header: "MFR",
      },
      {
        accessorKey: "qtyOnHand",
        header: "QTY On Hand",
        cell: ({ row }) => {
          const qtyOnHand = parseFloat(String(row.original?.qtyOnHand))
          if (isNaN(qtyOnHand)) return ""
          return <div>{formatNumber({ amount: qtyOnHand })}</div>
        },
      },
      {
        accessorKey: "qtyOrdered",
        header: "QTY Ordered",
        cell: ({ row }) => {
          const qtyOrdered = parseFloat(String(row.original?.qtyOrdered))
          if (isNaN(qtyOrdered)) return ""
          return <div>{formatNumber({ amount: qtyOrdered })}</div>
        },
      },
      {
        accessorKey: "unitPrice",
        header: "Unit Price",
        cell: ({ row }) => {
          const unitPrice = parseFloat(String(row.original?.unitPrice))
          if (isNaN(unitPrice)) return ""
          return <div>{formatCurrency({ amount: unitPrice, maxDecimal: 2 })}</div>
        },
      },
      {
        accessorKey: "dateCode",
        header: "Date Code",
      },
      {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => <div className='min-w-[200px] whitespace-pre-line'>{row.original?.notes || ""}</div>,
      },
      {
        accessorKey: "action",
        id: "action",
        header: "Action",
        cell: ({ row, table }) => {
          const handleRemoveItem = (index: number) => {
            const currentLineItems = table.getRowModel()?.rows?.map((row) => row.original) || []
            const newLineItems = currentLineItems.filter((_, i) => i !== index)

            form.setValue("lineItems", newLineItems)
          }

          const handleEdit = (index: number) => {
            setData({ ...row.original, index })
            setTimeout(() => setIsOpen(true), 500)
          }

          return (
            <div className='flex items-center gap-2'>
              <ActionTooltipProvider label='Edit Line Item'>
                <Icons.pencil className='size-4 cursor-pointer transition-all hover:scale-125' onClick={() => handleEdit(row.index)} />
              </ActionTooltipProvider>

              <ActionTooltipProvider label='Remove Line Item'>
                <Icons.trash className='size-4 cursor-pointer text-red-600' onClick={() => handleRemoveItem(row.index)} />
              </ActionTooltipProvider>
            </div>
          )
        },
      },
    ]
  }, [])

  const { table } = useDataTable({
    data: lineItems || [],
    columns,
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
  })

  const fileNameValue = useMemo(() => {
    const value = form.getValues("fileName")
    form.setValue("fileName", toKebabCase(value))
    return toKebabCase(value)
  }, [fileName])

  const supplierOptions = useMemo(() => {
    if (!bpMasters) return []
    return bpMasters.map((supplier) => ({ label: supplier?.CardName || supplier.CardCode, value: supplier.CardCode, supplier }))
  }, [JSON.stringify(bpMasters), isBpMastersLoading])

  const usersOptions = useMemo(() => {
    if (!users) return []
    return users.map((user) => ({ label: user.name || user.email, value: user.id, user }))
  }, [JSON.stringify(users), isUsersLoading])

  const onSubmit = async (formData: SupplierOfferForm) => {
    try {
      const response = await executeAsync(formData)
      const result = response?.data

      if (result?.error) {
        if (result.status === 401) {
          form.setError("fileName", { type: "custom", message: result.message })
        }

        toast.error(result.message)
        return
      }

      toast.success(result?.message)

      if (result?.data && result?.data?.supplierOffer && "code" in result?.data?.supplierOffer) {
        if (isModal) {
          setIsOpen(false)
          setData(null)

          setTimeout(() => {
            if (callback) callback()
          }, 1500)
          return
        }

        setTimeout(() => {
          router.push(`/dashboard/crm/supplier-offers/${result.data.supplierOffer.code}`)
        }, 1500)
      }
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong! Please try again later.")
    }
  }

  const handleCancel = () => {
    if (isModal) {
      setIsOpen(false)
      return
    }

    router.push(`/dashboard/crm/supplier-offers`)
  }

  const onFirstLoad = () => {
    getBpMastersExec({ cardType: "S" })
    getUsersExec()
  }

  const LineItemAction = () => {
    const handleActionClick = () => {
      setIsOpen(true)
      setData(null)
    }

    return (
      <Button type='button' variant='outline-primary' onClick={handleActionClick}>
        Add Line Item
      </Button>
    )
  }

  //* set line items if supplier offer exist
  useEffect(() => {
    const currentLineItems = (supplierOffer?.lineItems || []) as LineItemsJSONData
    if (supplierOffer && currentLineItems.length > 0) form.setValue("lineItems", currentLineItems)
  }, [JSON.stringify(supplierOffer)])

  //* set listOwnerId based on user session
  useEffect(() => {
    if (session?.user && isCreate) form.setValue("listOwnerId", session.user.id)
  }, [JSON.stringify(session)])

  //* set supplier code if custCode exist
  useEffect(() => {
    if (suppCode && supplierOptions.length > 0) form.setValue("supplierCode", suppCode)
  }, [suppCode, JSON.stringify(supplierOptions)])

  //* trigger fetching once on first load
  useEffect(() => {
    onFirstLoad()
  }, [])

  return (
    <>
      {/* <FormDebug form={form} /> */}

      <Form {...form}>
        <form className='grid grid-cols-12 gap-4' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <DatePickerField
              control={form.control}
              name='listDate'
              label='List Date'
              extendedProps={{
                calendarProps: { mode: "single", fromYear: 1800, toYear: new Date().getFullYear(), captionLayout: "dropdown-buttons" },
              }}
              isRequired
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField
              data={supplierOptions}
              control={form.control}
              name='supplierCode'
              label='Supplier'
              isRequired
              isLoading={isBpMastersLoading}
              extendedProps={{ buttonProps: { disabled: disableSupplierField } }}
              renderItem={(item, selected) => (
                <div className={cn("flex w-full items-center justify-between", selected && "bg-accent")}>
                  <div className='flex w-[80%] flex-col justify-center'>
                    <span className={cn("truncate", selected && "text-accent-foreground")}>{item.label}</span>
                    <span className='truncate text-xs text-muted-foreground'>{item.supplier.CardCode}</span>
                  </div>

                  {item.supplier.source === "portal" ? <Badge variant='soft-amber'>Portal</Badge> : <Badge variant='soft-green'>SAP</Badge>}
                </div>
              )}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField
              data={usersOptions}
              control={form.control}
              name='listOwnerId'
              label='List Owner'
              isLoading={isUsersLoading}
              isRequired
              renderItem={(item, selected) => {
                return (
                  <div className={cn("flex w-full flex-col justify-center p-0.5", selected && "bg-accent")}>
                    <span className={cn(selected && "text-accent-foreground")}>{item.label}</span>
                    {item.user?.email && <span className='text-xs text-muted-foreground'>{item.user?.email}</span>}
                  </div>
                )
              }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='fileName'
              label='File Name'
              extendedProps={{ inputProps: { value: fileNameValue, placeholder: "Enter file name" } }}
              description='Allowed: letters (a-z, A-Z), numbers (0-9), dashes (-).'
              isRequired
            />
          </div>

          <div className='col-span-12'>
            <ReadOnlyFieldHeader
              title='Line Items'
              description='List of items sourced from the selected requisition.'
              actions={<LineItemAction />}
            />

            {form.formState?.errors?.lineItems?.message && (
              <FormMessage className='mt-1'>{form.formState?.errors?.lineItems?.message}</FormMessage>
            )}
          </div>

          <div className='col-span-12'>
            <DataTable table={table}>
              <div className='flex flex-col items-stretch justify-center gap-2 md:flex-row md:items-center md:justify-between'>
                <DataTableSearch table={table} />
              </div>
            </DataTable>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogContent className='max-h-[85vh] overflow-auto sm:max-w-5xl'>
                <DialogHeader>
                  <DialogTitle>Add line item for this sales quotation</DialogTitle>
                  <DialogDescription>
                    Fill in the form to {lineItemData ? "edit" : "add a new"} line item for this sale quote.
                  </DialogDescription>
                </DialogHeader>

                <Card className='p-3'>
                  <SupplierOfferLineItemForm />
                </Card>
              </DialogContent>
            </Dialog>
          </div>

          <div className='col-span-12 mt-2 flex items-center justify-end gap-2'>
            <Button type='button' variant='secondary' disabled={isExecuting} onClick={handleCancel}>
              Cancel
            </Button>
            <LoadingButton isLoading={isExecuting} type='submit'>
              Save
            </LoadingButton>
          </div>
        </form>
      </Form>
    </>
  )
}
