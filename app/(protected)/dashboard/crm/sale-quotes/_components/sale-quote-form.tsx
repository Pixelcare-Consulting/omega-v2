"use client"

import { ColumnDef } from "@tanstack/react-table"
import { useSession } from "next-auth/react"
import { useAction } from "next-safe-action/hooks"
import { useParams, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback, useEffect, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"

import { getBpMasters } from "@/actions/bp-master"
import { getItems } from "@/actions/item-master"
import { getRequisitions, RequestedItemsJSONData, upsertRequisition } from "@/actions/requisition"
import { getSaleQuoteByCode, LineItemsJSONData, upsertSaleQuote } from "@/actions/sale-quote"
import { getUsers } from "@/actions/user"
import { Badge } from "@/components/badge"
import { ComboboxField } from "@/components/form/combobox-field"
import DatePickerField from "@/components/form/date-picker-field"
import { FormDebug } from "@/components/form/form-debug"
import InputField from "@/components/form/input-field"
import TextAreaField from "@/components/form/textarea-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Form } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { LineItemForm, lineItemFormSchema, type SaleQuoteForm, saleQuoteFormSchema } from "@/schema/sale-quote"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { format } from "date-fns"
import { formatCurrency } from "@/lib/formatter"
import { Icons } from "@/components/icons"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { multiply } from "mathjs"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"
import { getSupplierQuotes } from "@/actions/supplier-quote"
import { SUPPLIER_QUOTE_LT_TO_SJC_NUMBER_OPTIONS, SUPPLIER_QUOTE_LT_TO_SJC_UOM_OPTIONS } from "@/schema/supplier-quote"

type SaleQuoteFormProps = {
  isModal?: boolean
  salesQuote: Awaited<ReturnType<typeof getSaleQuoteByCode>>
  requisitions: Awaited<ReturnType<typeof getRequisitions>>
  customers: Awaited<ReturnType<typeof getBpMasters>>
  items: Awaited<ReturnType<typeof getItems>>
  users: Awaited<ReturnType<typeof getUsers>>
  paymentTerms?: any
  initialCustomerCode?: string
}

export default function SaleQuoteForm({
  isModal,
  salesQuote,
  requisitions,
  customers,
  items,
  users,
  paymentTerms,
  initialCustomerCode,
}: SaleQuoteFormProps) {
  const router = useRouter()
  const { code } = useParams() as { code: string }
  const { data: session } = useSession()

  const isCreate = code === "add" || !salesQuote

  const values = useMemo(() => {
    if (salesQuote) {
      const { salesRep, approval, ...data } = salesQuote
      return {
        ...data,
        lineItems: [],
      }
    }

    if (code === "add" || !salesQuote) {
      return {
        id: "add",
        date: new Date(),
        customerCode: "",
        billTo: "",
        shipTo: "",
        contactId: null,
        salesRepId: "",
        paymentTerms: 0,
        fobPoint: "",
        shippingMethod: "",
        validUntil: new Date(),
        remarks: "",
        lineItems: [],
        approvalId: "",
        approvalDate: new Date(),
      }
    }
  }, [JSON.stringify(salesQuote)])

  const form = useForm({
    mode: "onChange",
    values,
    resolver: zodResolver(saleQuoteFormSchema),
  })

  const { executeAsync, isExecuting } = useAction(upsertSaleQuote)

  const lineItemsForm = useForm({
    mode: "onChange",
    values: {
      requisitionCode: 0,
      supplierQuoteCode: 0,
      code: "",
      name: "",
      mpn: "",
      mfr: "",
      cpn: "",
      source: "",
      ltToSjcNumber: "",
      ltToSjcUom: "",
      condition: "",
      coo: "",
      dateCode: "",
      estimatedDeliveryDate: null,
      unitPrice: 0,
      quantity: 0,
    },
    resolver: zodResolver(lineItemFormSchema),
  })

  const lineItems = useWatch({ control: form.control, name: "lineItems" })
  const lineItemReqCode = useWatch({ control: lineItemsForm.control, name: "requisitionCode" })
  const customerCode = useWatch({ control: form.control, name: "customerCode" })

  const columns = useMemo((): ColumnDef<LineItemForm>[] => {
    return [
      {
        accessorFn: (row) => {
          const { requisitionCode, supplierQuoteCode, name, mpn, mfr, cpn, source, condition, coo, dateCode, estimatedDeliveryDate } = row

          const ltToSjcNumber = SUPPLIER_QUOTE_LT_TO_SJC_NUMBER_OPTIONS.find((item) => item.value === row.ltToSjcNumber)?.label
          const ltToSjcUom = SUPPLIER_QUOTE_LT_TO_SJC_UOM_OPTIONS.find((item) => item.value === row.ltToSjcUom)?.label

          let value = ""
          if (requisitionCode) value += ` ${requisitionCode}`
          if (supplierQuoteCode) value += ` ${supplierQuoteCode}`
          if (name) value += ` ${name}`
          if (cpn) value += ` ${cpn}`
          if (mpn) value += ` ${mpn}`
          if (mfr) value += ` ${mfr}`
          if (source) value += ` ${source}`
          if (ltToSjcNumber) value += ` ${ltToSjcNumber}`
          if (ltToSjcUom) value += ` ${ltToSjcUom}`
          if (condition) value += ` ${condition}`
          if (coo) value += ` ${coo}`
          if (dateCode) value += ` ${dateCode}`
          if (estimatedDeliveryDate) value += ` ${format(estimatedDeliveryDate, "MM/dd/yyyy")}`

          return value
        },
        id: "reference",
        header: ({ column }) => <DataTableColumnHeader column={column} title='Reference' />,
        enableSorting: false,
        cell: ({ row }) => {
          const { requisitionCode, supplierQuoteCode, mpn, mfr, name, cpn, source, condition, coo, dateCode, estimatedDeliveryDate } =
            row.original

          const ltToSjcNumber = SUPPLIER_QUOTE_LT_TO_SJC_NUMBER_OPTIONS.find((item) => item.value === row.original?.ltToSjcNumber)?.label
          const ltToSjcUom = SUPPLIER_QUOTE_LT_TO_SJC_UOM_OPTIONS.find((item) => item.value === row.original?.ltToSjcUom)?.label

          return (
            <div className='flex min-w-[300px] flex-col justify-center gap-2'>
              <div className='flex gap-1.5'>
                <span className='text-wrap font-semibold'>{mpn}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>MPR:</span>
                <span className='text-wrap text-muted-foreground'>{mfr}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>Requisition:</span>
                <span className='text-muted-foreground'>{requisitionCode || ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>Supplier Quote:</span>
                <span className='text-muted-foreground'>{supplierQuoteCode || ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>CPN:</span>
                <span className='text-muted-foreground'>{cpn || ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>Desc:</span>
                <span className='text-muted-foreground'>{name || ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>LT to SJC:</span>
                <span className='text-muted-foreground'>{`${ltToSjcNumber || ""} ${ltToSjcUom || ""}`}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>Condition:</span>
                <span className='text-muted-foreground'>{condition || ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>Coo:</span>
                <span className='text-muted-foreground'>{coo || ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>DC:</span>
                <span className='text-xs text-muted-foreground'>{dateCode || ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>Est. Del. Date:</span>
                <span className='text-xs text-muted-foreground'>
                  {estimatedDeliveryDate ? format(estimatedDeliveryDate, "MM/dd/yyyy") : ""}
                </span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>Source</span>
                <span className='text-xs text-muted-foreground'>
                  {source === "sap" ? <Badge variant='soft-green'>SAP</Badge> : <Badge variant='soft-amber'>Portal</Badge>}
                </span>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "unitPrice",
        header: ({ column }) => <DataTableColumnHeader column={column} title='Unit Price' />,
        cell: ({ row }) => {
          const index = row.index

          return (
            <InputField
              control={form.control}
              name={`lineItems.${index}.unitPrice`}
              label='Unit Price'
              isHideLabel
              extendedProps={{ inputProps: { placeholder: "Enter unit price", type: "number", startContent: "$" } }}
            />
          )
        },
      },
      {
        accessorKey: "quantity",
        header: ({ column }) => <DataTableColumnHeader column={column} title='Quantity' />,
        cell: ({ row }) => {
          const index = row.index

          return (
            <InputField
              control={form.control}
              name={`lineItems.${index}.quantity`}
              label='Quantity'
              isHideLabel
              extendedProps={{ inputProps: { placeholder: "Enter quantity", type: "number" } }}
            />
          )
        },
      },
      {
        accessorKey: "leadTime",
        header: ({ column }) => <DataTableColumnHeader column={column} title='Lead Time' />,
        cell: ({ row }) => {
          const index = row.index

          return (
            <TextAreaField
              control={form.control}
              name={`lineItems.${index}.leadTime`}
              label='Lead Time'
              isHideLabel
              extendedProps={{ textAreaProps: { placeholder: "Enter lead time" } }}
            />
          )
        },
      },
      {
        accessorFn: (row) => {
          const unitPrice = parseFloat(String(row.unitPrice))
          const quantity = parseFloat(String(row.quantity))

          if (isNaN(unitPrice) || isNaN(quantity)) return ""

          return multiply(unitPrice, quantity)
        },
        id: "total price",
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total Price' />,
        cell: ({ row }) => {
          const unitPrice = parseFloat(String(row.original.unitPrice))
          const quantity = parseFloat(String(row.original.quantity))

          if (isNaN(unitPrice) || isNaN(quantity)) return ""

          const totalPrice = multiply(unitPrice, quantity)

          return <div className='font-bold'>{formatCurrency({ amount: totalPrice, maxDecimal: 2 })}</div>
        },
      },
      {
        accessorKey: "action",
        id: "action",
        header: "Action",
        cell: ({ row, table }) => {
          const { code } = row.original

          const handleRemoveItem = (itemCode: string) => {
            const currentLineItems = table.getRowModel()?.rows?.map((row) => row.original) || []
            const newLineItems = currentLineItems.filter((item) => item.code !== itemCode)

            form.setValue("lineItems", newLineItems)
          }

          return (
            <div className='w-[50px]'>
              <Icons.trash className='size-4 cursor-pointer text-red-600' onClick={() => handleRemoveItem(code)} />
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

  const customersOptions = useMemo(() => {
    if (!customers) return []
    return customers.map((customer) => ({ label: customer?.CardName || customer.CardCode, value: customer.CardCode, customer }))
  }, [JSON.stringify(customers)])

  const requisitionsOptions = useMemo(() => {
    if (!requisitions || !customerCode) return []

    //* only show requisitions that have not been added to the line items
    return requisitions
      .filter((req) => req.customerCode == customerCode)
      .map((req) => ({ label: String(req.code), value: String(req.code), requisition: req }))
  }, [JSON.stringify(requisitions), JSON.stringify(lineItems), customerCode])

  const supplierQuotes = useMemo(() => {
    if (!lineItemReqCode || !requisitions) return []

    const requisition = requisitions.find((req) => req.code == lineItemReqCode)
    return requisition?.supplierQuotes || []
  }, [lineItemReqCode])

  const itemsOptions = useMemo(() => {
    if (!supplierQuotes || !items) return []

    //* filter items that are in supplier quotes and only show item that are not in line items
    return items
      .filter((item) => supplierQuotes.find((quote) => quote.itemCode == item.ItemCode))
      .filter((item) => !lineItems.find((lineItem) => lineItem.code == item.ItemCode))
      .map((item) => ({
        label: item?.ItemName || item.ItemCode,
        value: item.ItemCode,
        item,
        supplierQuote: supplierQuotes.find((quote) => quote.itemCode == item.ItemCode),
      }))
  }, [JSON.stringify(supplierQuotes), JSON.stringify(items), JSON.stringify(lineItems)])

  const usersOptions = useMemo(() => {
    if (!users) return []
    return users.map((user) => ({ label: user.name || user.email, value: user.id, user }))
  }, [JSON.stringify(users)])

  const paymentTermsOptions = useMemo(() => {
    if (!paymentTerms) return []
    return paymentTerms.map((term: any) => ({ label: term.PymntGroup, value: term.GroupNum }))
  }, [JSON.stringify(paymentTerms)])

  const onSubmit = async (formData: SaleQuoteForm) => {
    try {
      const response = await executeAsync(formData)
      const result = response?.data

      if (result?.error) {
        toast.error(result.message)
        return
      }

      toast.success(result?.message)

      if (result?.data && result?.data?.saleQuote && "code" in result?.data?.saleQuote) {
        router.refresh()

        setTimeout(() => {
          router.push(`/dashboard/crm/sale-quotes/${result.data.saleQuote.code}`)
        }, 1500)
      }
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong! Please try again later.")
    }
  }

  const handleAddLineItem = async () => {
    const isValid = await lineItemsForm.trigger()

    if (!isValid) {
      toast.error("Failed to add line item!")
      return
    }

    const currentValues = form.getValues("lineItems") || []
    const newValues = lineItemsForm.getValues()

    form.setValue("lineItems", [...currentValues, newValues])
    lineItemsForm.reset()
    form.clearErrors("lineItems")
  }

  const customerCodeCallback = () => {
    form.setValue("lineItems", [])
  }

  const requisitionCodeCallback = useCallback(
    (code: number) => {
      const selectedRequisition = requisitions?.find((req) => req.code == code)

      if (selectedRequisition) {
        lineItemsForm.setValue("cpn", selectedRequisition.customerPn)
      }
    },
    [JSON.stringify(requisitions)]
  )

  const itemCodeCallback = useCallback(
    (code: string, supplierQuote: Awaited<ReturnType<typeof getRequisitions>>[number]["supplierQuotes"][number]) => {
      if (!code || !items || !supplierQuote) return

      const selectedItem = items.find((item) => code == item.ItemCode)

      if (selectedItem) {
        const unitPrice = parseFloat(String(supplierQuote?.quotedPrice))
        const quantity = parseFloat(String(supplierQuote?.quotedQuantity))

        lineItemsForm.setValue("supplierQuoteCode", supplierQuote.code)
        lineItemsForm.setValue("name", selectedItem.ItemName)
        lineItemsForm.setValue("mpn", selectedItem.ItemCode)
        lineItemsForm.setValue("mfr", selectedItem.FirmName)
        lineItemsForm.setValue("source", selectedItem.source)
        lineItemsForm.setValue("ltToSjcNumber", supplierQuote.ltToSjcNumber)
        lineItemsForm.setValue("ltToSjcUom", supplierQuote.ltToSjcUom)
        lineItemsForm.setValue("condition", supplierQuote.condition)
        lineItemsForm.setValue("coo", supplierQuote.coo)
        lineItemsForm.setValue("dateCode", supplierQuote.dateCode)
        lineItemsForm.setValue("estimatedDeliveryDate", supplierQuote.estimatedDeliveryDate)
        lineItemsForm.setValue("unitPrice", isNaN(unitPrice) ? 0 : unitPrice)
        lineItemsForm.setValue("quantity", isNaN(quantity) ? 0 : quantity)
      }
    },
    [JSON.stringify(items)]
  )

  //* set line items if sales qoute data exists
  useEffect(() => {
    if (salesQuote && requisitions?.length > 0 && items?.length > 0) {
      const selectedLineItems = (salesQuote.lineItems || []) as LineItemsJSONData

      const lineItemsData =
        selectedLineItems?.map((li) => {
          const selectedRequisition = requisitions.find((req) => req.code == li.requisitionCode)
          const supplierQuote = selectedRequisition?.supplierQuotes.find((quote) => quote.code == li.supplierQuoteCode)

          if (selectedRequisition && supplierQuote) {
            const selectedItem = items.find((item) => item.ItemCode == li.code)

            if (selectedItem) {
              const unitPrice = parseFloat(String(li.unitPrice))
              const quantity = parseFloat(String(li.quantity))

              return {
                requisitionCode: selectedRequisition.code,
                supplierQuoteCode: supplierQuote.code,
                code: selectedItem.ItemCode,
                name: selectedItem.ItemName,
                mpn: selectedItem.ItemCode,
                mfr: selectedItem.FirmName,
                cpn: selectedRequisition.customerPn,
                source: selectedItem.source,
                ltToSjcNumber: supplierQuote.ltToSjcNumber,
                ltToSjcUom: supplierQuote.ltToSjcUom,
                condition: supplierQuote.condition,
                coo: supplierQuote.coo,
                dateCode: supplierQuote.dateCode,
                estimatedDeliveryDate: supplierQuote.estimatedDeliveryDate,
                unitPrice: isNaN(unitPrice) ? 0 : unitPrice,
                quantity: isNaN(quantity) ? 0 : quantity,
                leadTime: li.leadTime,
              }
            }
          }

          return null
        }) || []

      form.setValue(
        "lineItems",
        lineItemsData.filter((item) => item !== null)
      )
    }
  }, [JSON.stringify(salesQuote), JSON.stringify(requisitions), JSON.stringify(items)])

  //* set salesRepId based on session user
  useEffect(() => {
    if (session?.user && isCreate) form.setValue("salesRepId", session.user.id)
  }, [JSON.stringify(session)])

  return (
    <>
      {/* <FormDebug form={form} /> */}

      <Form {...form}>
        <form className='grid grid-cols-12 gap-4' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <DatePickerField
              control={form.control}
              name='date'
              label='Date'
              extendedProps={{
                calendarProps: { mode: "single", fromYear: 1800, toYear: new Date().getFullYear(), captionLayout: "dropdown-buttons" },
              }}
              isRequired
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField
              data={customersOptions}
              control={form.control}
              name='customerCode'
              label='Company Name'
              isRequired
              callback={customerCodeCallback}
              renderItem={(item, selected) => (
                <div className={cn("flex w-full items-center justify-between", selected && "bg-accent")}>
                  <div className='flex w-[80%] flex-col justify-center'>
                    <span className={cn("truncate", selected && "text-accent-foreground")}>{item.label}</span>
                    <span className='truncate text-xs text-muted-foreground'>{item.customer.CardCode}</span>
                  </div>

                  {item.customer.source === "portal" ? <Badge variant='soft-amber'>Portal</Badge> : <Badge variant='soft-green'>SAP</Badge>}
                </div>
              )}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField data={[]} control={form.control} name='contactId' label='Contact - Full Name' />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField
              data={usersOptions}
              control={form.control}
              name='salesRepId'
              label='Sales Rep'
              isRequired
              renderItem={(item, selected) => {
                return (
                  <div className='flex flex-col justify-center'>
                    <span>{item.label}</span>
                    {item.user?.email && <span className='text-xs text-muted-foreground'>{item.user?.email}</span>}
                  </div>
                )
              }}
            />
          </div>

          <div className='col-span-12 md:col-span-6'>
            <TextAreaField
              control={form.control}
              name='billTo'
              label='Bill To'
              extendedProps={{ textAreaProps: { placeholder: "Enter bill to" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6'>
            <TextAreaField
              control={form.control}
              name='shipTo'
              label='Ship To'
              extendedProps={{ textAreaProps: { placeholder: "Enter ship to" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField data={paymentTermsOptions} control={form.control} name='paymentTerms' label='Payment Terms' />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='fobPoint'
              label='FOB Point'
              extendedProps={{ inputProps: { placeholder: "Enter FOB point" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='shippingMethod'
              label='Shipping Method'
              extendedProps={{ inputProps: { placeholder: "Enter shipping method" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <DatePickerField
              control={form.control}
              name='validUntil'
              label='Valid Until'
              extendedProps={{
                calendarProps: { mode: "single", fromYear: 1800, toYear: new Date().getFullYear(), captionLayout: "dropdown-buttons" },
              }}
              isRequired
            />
          </div>

          <div className='col-span-12'>
            <TextAreaField
              control={form.control}
              name='remarks'
              label='Remarks'
              extendedProps={{ textAreaProps: { placeholder: "Enter remarks" } }}
            />
          </div>

          <div className='col-span-12 mt-2 space-y-4 lg:col-span-12'>
            <Separator />

            <ReadOnlyFieldHeader title='Line Items' description='List of items sourced from the selected requisition.' />
          </div>

          <div className='col-span-12 md:col-span-6'>
            <ComboboxField
              data={requisitionsOptions}
              control={lineItemsForm.control}
              name='requisitionCode'
              label='Requisition'
              isRequired
              callback={(args) => requisitionCodeCallback(args?.option?.value)}
              extendedProps={{ buttonProps: { disabled: !customerCode } }}
              renderItem={(item, selected) => (
                <div className={cn("flex w-full items-center justify-between", selected && "bg-accent")}>
                  <div className='flex w-[80%] flex-col justify-center'>
                    <span className={cn("truncate", selected && "text-accent-foreground")}>{item?.requisition?.customer?.CardName}</span>
                    {item?.requisition?.requestedItems?.length > 0 && (
                      <span className='text-xs text-muted-foreground'>{item.requisition.requestedItems[0].code}</span>
                    )}
                  </div>

                  <span className={cn("text-xs text-muted-foreground", selected && "text-accent-foreground")}>#{item?.value}</span>
                </div>
              )}
            />
          </div>

          <div className='col-span-12 md:col-span-6'>
            <ComboboxField
              data={itemsOptions}
              control={lineItemsForm.control}
              name='code'
              label='Item'
              description='Item/s from supplier quote related to the selected requisition.'
              isRequired
              extendedProps={{ buttonProps: { disabled: !lineItemReqCode } }}
              callback={(args) => itemCodeCallback(args?.option?.value, args?.option?.supplierQuote)}
              renderItem={(item, selected, index) => {
                return (
                  <div className={cn("flex w-full items-center justify-between", selected && "bg-accent")}>
                    <div className='flex w-[75%] flex-col justify-center'>
                      <span className={cn("truncate", selected && "text-accent-foreground")}>{item.label}</span>
                      <span className='truncate text-xs text-muted-foreground'>{item.item.ItemCode}</span>
                    </div>

                    <div className='flex items-center gap-1'>
                      {item.item?.reqItem?.isSupplierSuggested && <Badge variant='soft-green'>Supplier Suggested</Badge>}
                      {item.item.source === "portal" ? <Badge variant='soft-amber'>Portal</Badge> : <Badge variant='soft-green'>SAP</Badge>}
                    </div>
                  </div>
                )
              }}
            />
          </div>

          <div className='col-span-12 flex items-center justify-end gap-2'>
            <Button variant='secondary' type='button' onClick={() => lineItemsForm.reset()}>
              <Icons.x className='size-4' /> Clear
            </Button>
            <Button variant='outline-primary' type='button' onClick={handleAddLineItem}>
              <Icons.plus className='size-4' /> Add
            </Button>
          </div>

          <div className='col-span-12'>
            <DataTable table={table}>
              <div className='flex flex-col items-stretch justify-center gap-2 md:flex-row md:items-center md:justify-between'>
                <DataTableSearch table={table} />
              </div>
            </DataTable>
          </div>

          <div className='col-span-12 mt-2 space-y-4 lg:col-span-12'>
            <Separator />

            <ReadOnlyFieldHeader title='Approval Details' description='Sale quote approval details' />
          </div>

          <div className='col-span-12 md:col-span-6'>
            <ComboboxField
              data={usersOptions}
              control={form.control}
              name='approvalId'
              label='Approval'
              isRequired
              renderItem={(item, selected) => {
                return (
                  <div className='flex flex-col justify-center'>
                    <span>{item.label}</span>
                    {item.user?.email && <span className='text-xs text-muted-foreground'>{item.user?.email}</span>}
                  </div>
                )
              }}
            />
          </div>

          <div className='col-span-12 md:col-span-6'>
            <DatePickerField
              control={form.control}
              name='approvalDate'
              label='Date'
              isRequired
              extendedProps={{
                calendarProps: { mode: "single", fromYear: 1800, toYear: new Date().getFullYear(), captionLayout: "dropdown-buttons" },
              }}
            />
          </div>

          <div className='col-span-12 mt-2 flex items-center justify-end gap-2'>
            <Button type='button' variant='secondary' disabled={isExecuting} onClick={() => router.push(`/dashboard/crm/sale-quotes`)}>
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
