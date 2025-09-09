"use client"

import { ColumnDef } from "@tanstack/react-table"
import { useSession } from "next-auth/react"
import { useAction } from "next-safe-action/hooks"
import { useParams, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"

import { getBpMasters } from "@/actions/master-bp"
import { getItems } from "@/actions/master-item"
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
import { Form, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { LineItemForm, lineItemFormSchema, type SaleQuoteForm, saleQuoteFormSchema } from "@/schema/sale-quote"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { format } from "date-fns"
import { formatCurrency, formatNumber } from "@/lib/formatter"
import { Icons } from "@/components/icons"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { det, multiply } from "mathjs"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"
import { getSupplierQuotes } from "@/actions/supplier-quote"
import { SUPPLIER_QUOTE_LT_TO_SJC_NUMBER_OPTIONS, SUPPLIER_QUOTE_LT_TO_SJC_UOM_OPTIONS } from "@/schema/supplier-quote"
import { getAddressesClient } from "@/actions/master-address"
import { getContactsClient } from "@/actions/master-contact"
import { Separator } from "@/components/ui/separator"
import { useDialogStore } from "@/hooks/use-dialog"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"
import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import SaleQuoteLineItemForm from "./sale-quote-line-item-form"

type SaleQuoteFormProps = {
  salesQuote: Awaited<ReturnType<typeof getSaleQuoteByCode>>
  requisitions: Awaited<ReturnType<typeof getRequisitions>>
  customers: Awaited<ReturnType<typeof getBpMasters>>
  items: Awaited<ReturnType<typeof getItems>>
  users: Awaited<ReturnType<typeof getUsers>>
  paymentTerms?: any
}

export default function SaleQuoteForm({ salesQuote, requisitions, customers, items, users, paymentTerms }: SaleQuoteFormProps) {
  const router = useRouter()
  const { code } = useParams() as { code: string }
  const { data: session } = useSession()

  const isCreate = code === "add" || !salesQuote

  const { isOpen, setIsOpen, data: lineItemData, setData } = useDialogStore(["isOpen", "setIsOpen", "data", "setData"])

  const values = useMemo(() => {
    if (salesQuote) {
      const { salesRep, approval, supplierQuotes, ...data } = salesQuote
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
        billTo: null,
        shipTo: null,
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

  const {
    execute: getAddressesExecute,
    isExecuting: isAddressesLoading,
    result: { data: addresses },
  } = useAction(getAddressesClient)

  const {
    execute: getContactsExecute,
    isExecuting: isContactsLoading,
    result: { data: contacts },
  } = useAction(getContactsClient)

  const lineItemDefaultValues: LineItemForm = {
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
    details: {
      mpn: "",
      mfr: "",
      dateCode: "",
      condition: "",
      coo: "",
      leadTime: "",
      notes: "",
    },
  }

  const lineItems = useWatch({ control: form.control, name: "lineItems" })
  const customerCode = useWatch({ control: form.control, name: "customerCode" })

  const columns = useMemo((): ColumnDef<LineItemForm>[] => {
    return [
      {
        accessorFn: (row) => {
          const {
            requisitionCode,
            supplierQuoteCode,
            name,
            mpn,
            mfr,
            cpn,
            source,
            condition,
            coo,
            dateCode,
            estimatedDeliveryDate,
            quotedPrice,
            quotedQuantity,
          } = row

          const ltToSjcNumber = SUPPLIER_QUOTE_LT_TO_SJC_NUMBER_OPTIONS.find((item) => item.value === row.ltToSjcNumber)?.label
          const ltToSjcUom = SUPPLIER_QUOTE_LT_TO_SJC_UOM_OPTIONS.find((item) => item.value === row.ltToSjcUom)?.label

          let value = ""
          if (requisitionCode) value += `${requisitionCode}`
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
          if (quotedPrice) value += ` ${quotedPrice}`
          if (quotedQuantity) value += ` ${quotedQuantity}`
          if (estimatedDeliveryDate) value += ` ${format(estimatedDeliveryDate, "MM/dd/yyyy")}`

          return value
        },
        id: "reference",
        header: ({ column }) => <DataTableColumnHeader column={column} title='Reference' />,
        enableSorting: false,
        cell: ({ row }) => {
          const {
            requisitionCode,
            supplierQuoteCode,
            mpn,
            mfr,
            name,
            cpn,
            source,
            condition,
            coo,
            dateCode,
            estimatedDeliveryDate,
            quotedPrice,
            quotedQuantity,
          } = row.original

          const ltToSjcNumber = SUPPLIER_QUOTE_LT_TO_SJC_NUMBER_OPTIONS.find((item) => item.value === row.original?.ltToSjcNumber)?.label
          const ltToSjcUom = SUPPLIER_QUOTE_LT_TO_SJC_UOM_OPTIONS.find((item) => item.value === row.original?.ltToSjcUom)?.label

          return (
            <div className='flex min-w-[200px] flex-col justify-center gap-2'>
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
                <span className='font-semibold'>Quoted Price:</span>
                <span className='text-muted-foreground'>{quotedPrice || ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>Qty Quoted:</span>
                <span className='text-muted-foreground'>{quotedQuantity || ""}</span>
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
                <span className='text-muted-foreground'>{dateCode || ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>Est. Del. Date:</span>
                <span className='text-muted-foreground'>{estimatedDeliveryDate ? format(estimatedDeliveryDate, "MM/dd/yyyy") : ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>Source</span>
                <span className='text-muted-foreground'>
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
          const unitPrice = parseFloat(String(row.original.unitPrice))
          if (isNaN(unitPrice)) return ""
          return <div>{formatCurrency({ amount: unitPrice, maxDecimal: 2 })}</div>
        },
      },
      {
        accessorKey: "quantity",
        header: ({ column }) => <DataTableColumnHeader column={column} title='Quantity' />,
        cell: ({ row }) => {
          const quantity = parseFloat(String(row.original.quantity))
          if (isNaN(quantity)) return ""
          return <div>{formatNumber({ amount: quantity as any, maxDecimal: 2 })}</div>
        },
      },
      {
        accessorFn: (row) => {
          const details = row.details
          let value = ""
          if (details.mpn) value += `${details.mpn}`
          if (details.mfr) value += ` ${details.mfr}`
          if (details.dateCode) value += ` ${details.dateCode}`
          if (details.condition) value += ` ${details.condition}`
          if (details.coo) value += ` ${details.coo}`
          if (details.leadTime) value += ` ${details.leadTime}`
          if (details.notes) value += ` ${details.notes}`
          return value
        },
        id: "details",
        header: ({ column }) => <DataTableColumnHeader column={column} title='Details' />,
        cell: ({ row }) => {
          const { mpn, mfr, dateCode, condition, coo, leadTime, notes } = row.original.details

          return (
            <div className='flex min-w-[200px] flex-col justify-center gap-2'>
              <div className='flex gap-1.5'>
                <span className='font-semibold'>MPN:</span>
                <span className='text-muted-foreground'>{mpn || ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>MFR:</span>
                <span className='text-muted-foreground'>{mfr || ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>Date Code:</span>
                <span className='text-muted-foreground'>{dateCode || ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>Condition:</span>
                <span className='text-muted-foreground'>{condition || ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>COO:</span>
                <span className='text-muted-foreground'>{coo || ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>lead Time:</span>
                <span className='whitespace-pre-line text-muted-foreground'>{leadTime || ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>Notes:</span>
                <span className='whitespace-pre-line text-muted-foreground'>{notes || ""}</span>
              </div>
            </div>
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

          const handleEdit = () => {
            setData(row.original)
            setTimeout(() => setIsOpen(true), 1000)
          }

          return (
            <div className='flex items-center gap-2'>
              <ActionTooltipProvider label='Edit Line Item'>
                <Icons.pencil className='size-4 cursor-pointer transition-all hover:scale-125' onClick={handleEdit} />
              </ActionTooltipProvider>

              <ActionTooltipProvider label='Remove Line Item'>
                <Icons.trash className='size-4 cursor-pointer text-red-600' onClick={() => handleRemoveItem(code)} />
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

  const customersOptions = useMemo(() => {
    if (!customers) return []
    return customers.map((customer) => ({ label: customer?.CardName || customer.CardCode, value: customer.CardCode, customer }))
  }, [JSON.stringify(customers)])

  const billingAddressesOptions = useMemo(() => {
    if (!addresses || isAddressesLoading) return []

    const customer = customersOptions.find((customer) => customer.value === customerCode)?.customer
    const billToDef = customer?.BillToDef

    const defaultBillingAddress = addresses.find((address) => address.id === billToDef)

    if (defaultBillingAddress) form.setValue("billTo", defaultBillingAddress.id)

    return addresses.filter((ad) => ad.AddrType === "B").map((ad) => ({ label: ad.Street || "N/A", value: ad.id, address: ad }))
  }, [JSON.stringify(addresses), JSON.stringify(customersOptions), isAddressesLoading, customerCode])

  const shippingAddressesOptions = useMemo(() => {
    if (!addresses || isAddressesLoading) return []

    const customer = customersOptions.find((customer) => customer.value === customerCode)?.customer
    const shipToDef = customer?.ShipToDef

    const defaultShippingAddress = addresses.find((address) => address.id === shipToDef)

    if (defaultShippingAddress) form.setValue("shipTo", defaultShippingAddress.id)

    return addresses.filter((ad) => ad.AddrType === "S").map((ad) => ({ label: ad.Street || "N/A", value: ad.id, address: ad }))
  }, [JSON.stringify(addresses), JSON.stringify(customersOptions), isAddressesLoading, customerCode])

  const contactsOptions = useMemo(() => {
    if (!contacts || isContactsLoading) return []

    const customer = customersOptions.find((customer) => customer.value === customerCode)?.customer
    const contactPerson = customer?.CntctPrsn

    const defaultContact = contacts.find((contact) => contact.id === contactPerson)

    if (defaultContact) form.setValue("contactId", defaultContact.id)

    return contacts.map((contact) => {
      let fullName = ""

      if (contact.FirstName) fullName += `${contact.FirstName} `
      if (contact.LastName) fullName += contact.LastName

      return { label: fullName, value: contact.id, contact }
    })
  }, [JSON.stringify(contacts), JSON.stringify(customersOptions), isContactsLoading, customerCode])

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

  const customerCodeCallback = (value?: number) => {
    form.setValue("lineItems", [])
    form.setValue("paymentTerms", value ?? 0)
    form.setValue("billTo", null)
    form.setValue("shipTo", null)
    form.setValue("contactId", null)
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
              const quotedPrice = parseFloat(String(supplierQuote.quotedPrice))
              const quotedQuantity = parseFloat(String(supplierQuote.quotedQuantity))

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
                quotedPrice: isNaN(quotedPrice) ? "" : formatCurrency({ amount: quotedPrice, maxDecimal: 2 }),
                quotedQuantity: isNaN(quotedQuantity) ? "" : formatNumber({ amount: quotedQuantity }),
                details: li.details,
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

  //* trigger fetching for addresses & contact when sales quote data exists
  useEffect(() => {
    if (salesQuote && salesQuote.customerCode) {
      getAddressesExecute({ cardCode: salesQuote.customerCode })
      getContactsExecute({ cardCode: salesQuote.customerCode })
    }
  }, [salesQuote])

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
              callback={(args) => {
                customerCodeCallback(args?.option?.customer?.GroupNum)
                getAddressesExecute({ cardCode: args?.option?.customer?.CardCode })
                getContactsExecute({ cardCode: args?.option?.customer?.CardCode })
              }}
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
            <ComboboxField
              data={contactsOptions}
              control={form.control}
              name='contactId'
              label='Contact - Full Name'
              renderItem={(item, selected) => (
                <div className={cn("flex w-full items-center justify-between", selected && "bg-accent")}>
                  <div className='flex w-[80%] flex-col justify-center'>
                    <span className={cn("truncate", selected && "text-accent-foreground")}>{item.label}</span>
                    <span className='truncate text-xs text-muted-foreground'>{item.contact.E_MailL}</span>
                    <span className='truncate text-xs text-muted-foreground'>{item.contact.Cellolar}</span>
                  </div>

                  {item.contact.source === "portal" ? <Badge variant='soft-amber'>Portal</Badge> : <Badge variant='soft-green'>SAP</Badge>}
                </div>
              )}
            />
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
                  <div className={cn("flex w-full flex-col justify-center", selected && "bg-accent")}>
                    <span>{item.label}</span>
                    {item.user?.email && <span className='text-xs text-muted-foreground'>{item.user?.email}</span>}
                  </div>
                )
              }}
            />
          </div>

          <div className='col-span-12 md:col-span-6'>
            <ComboboxField
              data={billingAddressesOptions}
              control={form.control}
              name='billTo'
              label='Bill To'
              isLoading={isAddressesLoading}
              renderItem={(item, selected) => {
                const address = item?.address

                let label = ""
                let subLabel = ""

                if (address?.Street) label += address.Street
                else if (!address?.Street && address?.Address2) label += address.Address2
                else if (!address?.Address2 && address?.Address3) label += address.Address3

                if (address.StreetNo) label += `, ${address.StreetNo}`
                if (address.Building) label += `, ${address.Building}`
                if (address.Block) label += `, ${address.Block}`

                if (address.City) subLabel += `${address.City}, `
                if (address.stateName) subLabel += `${address.stateName}, `
                if (address.County) subLabel += `${address.County}, `
                if (address.ZipCode) subLabel += `${address.ZipCode}, `
                if (address.countryName) subLabel += `${address.countryName}`

                return (
                  <div className={cn("flex w-full items-center justify-between", selected && "bg-accent")}>
                    <div className='flex w-[80%] flex-col justify-center'>
                      <span className={cn("truncate", selected && "text-accent-foreground")}>{label}</span>
                      <span className='text-xs text-muted-foreground'>{subLabel}</span>
                    </div>

                    <span className={cn("text-xs text-muted-foreground", selected && "text-accent-foreground")}>#{item?.value}</span>
                  </div>
                )
              }}
            />
          </div>

          <div className='col-span-12 md:col-span-6'>
            <ComboboxField
              data={shippingAddressesOptions}
              control={form.control}
              name='shipTo'
              label='Ship To'
              isLoading={isAddressesLoading}
              renderItem={(item, selected) => {
                const address = item?.address

                let label = ""
                let subLabel = ""

                if (address?.Street) label += address.Street
                else if (!address?.Street && address?.Address2) label += address.Address2
                else if (!address?.Address2 && address?.Address3) label += address.Address3

                if (address.StreetNo) label += `, ${address.StreetNo}`
                if (address.Building) label += `, ${address.Building}`
                if (address.Block) label += `, ${address.Block}`

                if (address.City) subLabel += `${address.City}, `
                if (address.stateName) subLabel += `${address.stateName}, `
                if (address.County) subLabel += `${address.County}, `
                if (address.ZipCode) subLabel += `${address.ZipCode}, `
                if (address.countryName) subLabel += `${address.countryName}`

                return (
                  <div className={cn("flex w-full items-center justify-between", selected && "bg-accent")}>
                    <div className='flex w-[80%] flex-col justify-center'>
                      <span className={cn("truncate", selected && "text-accent-foreground")}>{label}</span>
                      <span className='text-xs text-muted-foreground'>{subLabel}</span>
                    </div>

                    <span className={cn("text-xs text-muted-foreground", selected && "text-accent-foreground")}>#{item?.value}</span>
                  </div>
                )
              }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField data={paymentTermsOptions} control={form.control} name='paymentTerms' label='Payment Terms' isRequired />
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

          <Separator className='col-span-12' />

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
                  <div className='grid grid-cols-12 gap-4'>
                    <SaleQuoteLineItemForm lineItem={lineItemData || null} requisitions={requisitions} items={items} />
                  </div>
                </Card>
              </DialogContent>
            </Dialog>
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
                  <div className={cn("flex w-full flex-col justify-center", selected && "bg-accent")}>
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
