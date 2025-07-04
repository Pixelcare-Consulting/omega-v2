"use client"

import { useParams } from "next/navigation"
import { useRouter } from "nextjs-toploader/app"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { useEffect, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  BROKER_BUY_OPTIONS,
  COMMODITY_TYPE_OPTIONS,
  PURCHASING_STATUS_OPTIONS,
  REASON_OPTIONS,
  REQ_REVIEW_RESULT_OPTIONS,
  RequestedItemForm,
  requestedItemFormSchema,
  type RequisitionForm,
  requisitionFormSchema,
  RESULT_OPTIONS,
  URGENCY_OPTIONS,
} from "@/schema/requisition"
import { Form, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card } from "@/components/ui/card"
import DatePickerField from "@/components/form/date-picker-field"
import { ComboboxField } from "@/components/form/combobox-field"
import { getUsers } from "@/actions/user"
import MultiSelectField from "@/components/form/multi-select-field"
import SwitchField from "@/components/form/switch-field"
import { Separator } from "@/components/ui/separator"
import { getCustomers } from "@/actions/customer"
import { Input } from "@/components/ui/input"
import InputField from "@/components/form/input-field"
import { getItems } from "@/actions/item"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import TextAreaField from "@/components/form/textarea-field"
import LoadingButton from "@/components/loading-button"
import { FormDebug } from "@/components/form/form-debug"

type RequisitionFormProps = {
  requisition: any
  users: Awaited<ReturnType<typeof getUsers>>
  customers: Awaited<ReturnType<typeof getCustomers>>
  items: Awaited<ReturnType<typeof getItems>>
}

export default function RequisitionForm({ requisition, users, customers, items }: RequisitionFormProps) {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const isCreate = id === "add" || !requisition

  const values = useMemo(() => {
    if (requisition) return requisition

    if (id === "add" || !requisition) {
      return {
        id: "add",
        customerId: "",
        contactId: null,
        customerPn: "",
        requestedItems: [],
        crossAlternatePn: "",
        commodityType: "",
        franchisePrice: 0,
        sapQuoteNumber: "",
        date: new Date(),
        urgency: "",
        salesPersons: [],
        omegaBuyers: [],
        brokerBuy: "",
        isPurchasingInitiated: false,
        isActiveFollowUp: false,
        purchasingStatus: "new",
        result: "",
        reason: "",
        reqReviewResult: [],
      }
    }

    return undefined
  }, [JSON.stringify(requisition)])

  const form = useForm<RequisitionForm>({
    mode: "onChange",
    values,
    resolver: zodResolver(requisitionFormSchema),
  })

  const requestedItemsForm = useForm({
    mode: "onChange",
    defaultValues: {
      id: "",
      name: "",
      mpn: "",
      mfr: "",
      quantity: 0,
      customerStandardPrice: 0,
      customerStandardOpportunityValue: 0,
    },
    resolver: zodResolver(requestedItemFormSchema),
  })

  const usersOptions = useMemo(() => {
    if (!users) return []
    return users.map((user) => ({ label: user.name || user.email, value: user.id }))
  }, [JSON.stringify(users)])

  const customersOptions = useMemo(() => {
    if (!customers) return []
    return customers.map((customer) => ({ label: customer?.CardName || customer.CardCode, value: customer.id }))
  }, [JSON.stringify(customers)])

  const itemsOptions = useMemo(() => {
    if (!items) return []

    const requestedItems = form.getValues("requestedItems") || []

    //* only show items that are not already in the requested items
    return items
      .filter((item) => !requestedItems.find((requestedItem) => requestedItem.id === item.id))
      .map((item) => ({ label: item?.ItemName || item.ItemCode, value: item.id }))
  }, [JSON.stringify(customers), JSON.stringify(form.watch("requestedItems"))])

  const requestedItems = useWatch({ control: form.control, name: "requestedItems" })

  const columns = useMemo((): ColumnDef<RequestedItemForm>[] => {
    return [
      { accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title='Name' /> },
      {
        accessorKey: "mpn",
        header: ({ column }) => <DataTableColumnHeader column={column} title='MPN' />,
      },
      {
        accessorKey: "mfr",
        header: ({ column }) => <DataTableColumnHeader column={column} title='MFR' />,
      },
      {
        accessorKey: "quantity",
        header: ({ column }) => <DataTableColumnHeader column={column} title='Quantity' />,
      },
      {
        accessorKey: "customerStandardPrice",
        id: "cust. standard price",
        filterFn: "weakEquals",
        header: ({ column }) => <DataTableColumnHeader column={column} title='Cust. Standard Price' />,
      },
      {
        accessorKey: "customerStandardOpportunityValue",
        id: "cust. standard opportunity value",
        filterFn: "weakEquals",
        header: ({ column }) => <DataTableColumnHeader column={column} title='Cust. Standard Opportunity Value' />,
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => {
          const id = row.original.id

          const handleRemoveItem = (id: string) => {
            const currentValues = form.getValues("requestedItems") || []
            form.setValue("requestedItems", [...currentValues.filter((item) => item.id !== id)])
          }

          return <Icons.trash className='size-4 cursor-pointer text-red-600' onClick={() => handleRemoveItem(id)} />
        },
      },
    ]
  }, [JSON.stringify(form.watch("requestedItems"))])

  const { table } = useDataTable({
    data: requestedItems || [],
    columns: columns,
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
  })

  const onSubmit = async (formData: RequisitionForm) => {}

  const handleAddRequestedItem = () => {
    const currentValues = form.getValues("requestedItems") || []

    const requestedItem = requestedItemsForm.getValues()

    form.setValue("requestedItems", [...currentValues, requestedItem])
    requestedItemsForm.reset()
  }

  //* auto populate mpn and mfr if item is selected
  useEffect(() => {
    const itemId = requestedItemsForm.getValues("id")

    if (itemId && items.length > 0) {
      const selectedItem = items.find((item) => item.id === itemId)

      if (selectedItem) {
        requestedItemsForm.setValue("name", selectedItem.ItemName)
        requestedItemsForm.setValue("mpn", selectedItem.ManufacturerPn)
        requestedItemsForm.setValue("mfr", selectedItem.Manufacturer)
      }
    }
  }, [requestedItemsForm.watch("id"), JSON.stringify(items)])

  return (
    <>
      {/* <FormDebug form={form} /> */}

      <Form {...form}>
        <form className='grid grid-cols-12 gap-4' onSubmit={form.handleSubmit(onSubmit)}>
          <Card className='col-span-12 grid grid-cols-12 gap-4 p-6'>
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
              <ComboboxField data={URGENCY_OPTIONS} control={form.control} name='urgency' label='Urgency' />
            </div>

            <div className='col-span-12 md:col-span-6 lg:col-span-3'>
              <MultiSelectField data={usersOptions} control={form.control} name='salesPersons' label='Salesperson' />
            </div>

            <div className='col-span-12 md:col-span-6 lg:col-span-3'>
              <ComboboxField data={BROKER_BUY_OPTIONS} control={form.control} name='brokerBuy' label='Broker Buy' />
            </div>

            <div className='col-span-12 md:col-span-6 lg:col-span-3'>
              <MultiSelectField data={usersOptions} control={form.control} name='omegaBuyers' label='Omega Buyers' />
            </div>

            <div className='col-span-12 md:col-span-6 md:mt-4 lg:col-span-3'>
              <SwitchField
                control={form.control}
                layout='default'
                name='isPurchasingInitiated'
                label='Purchasing Initiated'
                description='Is this requisition purchasing initiated?'
              />
            </div>

            <div className='col-span-12 md:col-span-6 md:mt-4 lg:col-span-3'>
              <SwitchField
                control={form.control}
                layout='default'
                name='isActiveFollowUp'
                label='Active Follow-Up'
                description='Is this requisition has active follow-up?'
              />
            </div>

            <div className='col-span-12 md:col-span-6 lg:col-span-3'>
              <ComboboxField data={PURCHASING_STATUS_OPTIONS} control={form.control} name='purchasingStatus' label='Purchasing Status' />
            </div>

            <div className='col-span-12 md:col-span-6 lg:col-span-3'>
              <ComboboxField data={RESULT_OPTIONS} control={form.control} name='result' label='Result' />
            </div>

            <div className='col-span-12 md:col-span-6 lg:col-span-3'>
              <ComboboxField data={REASON_OPTIONS} control={form.control} name='reason' label='Reason' />
            </div>

            <div className='col-span-12 md:col-span-6 lg:col-span-3'>
              <MultiSelectField data={REQ_REVIEW_RESULT_OPTIONS} control={form.control} name='reqReviewResult' label='REQ Review Result' />
            </div>

            <div className='col-span-12'>
              <Separator className='mt-2' />
            </div>

            <div className='col-span-12 md:col-span-6 lg:col-span-4'>
              <ComboboxField data={customersOptions} control={form.control} name='customerId' label='Company Name' isRequired />
            </div>

            <div className='col-span-12 md:col-span-6 lg:col-span-4'>
              <ComboboxField data={[]} control={form.control} name='contactId' label='Contact - Full Name' />
            </div>

            <div className='col-span-12 md:col-span-6 lg:col-span-4'>
              <FormItem className='space-y-2'>
                <FormLabel className='space-x-1'>Customer - PO Hit Rate</FormLabel>
                <FormControl>
                  <Input disabled value='0.0%' />
                </FormControl>
              </FormItem>
            </div>

            <div className='col-span-12'>
              <InputField
                control={form.control}
                name='customerPn'
                label='Customer PN'
                extendedProps={{ inputProps: { placeholder: "Enter Customer PN" } }}
              />
            </div>

            <div className='col-span-12 mt-2 space-y-4'>
              <Separator />

              <div>
                <h1 className='text-base font-bold'>Requested Items</h1>
                <p className='text-xs text-muted-foreground'>List of requisition's requested items</p>
              </div>

              {form?.formState?.errors?.requestedItems?.message && (
                <FormMessage className='!mt-1'>{form?.formState?.errors?.requestedItems?.message}</FormMessage>
              )}
            </div>

            <Form {...requestedItemsForm}>
              <div className='col-span-12 grid grid-cols-12 gap-4 rounded-lg border p-4'>
                <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                  <ComboboxField data={itemsOptions} control={requestedItemsForm.control} name='id' label='Item' isRequired />
                </div>

                <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                  <FormItem className='space-y-2'>
                    <FormLabel className='space-x-1'>MPN</FormLabel>
                    <FormControl>
                      <Input disabled value={requestedItemsForm.watch("mpn") || ""} />
                    </FormControl>
                  </FormItem>
                </div>

                <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                  <FormItem className='space-y-2'>
                    <FormLabel className='space-x-1'>MFR</FormLabel>
                    <FormControl>
                      <Input disabled value={requestedItemsForm.watch("mfr") || ""} />
                    </FormControl>
                  </FormItem>
                </div>

                <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                  <InputField
                    control={requestedItemsForm.control}
                    name='quantity'
                    label='Requested Quantity'
                    extendedProps={{ inputProps: { placeholder: "Enter Requested Quantity", type: "number" } }}
                  />
                </div>

                <div className='col-span-12 md:col-span-6'>
                  <InputField
                    control={requestedItemsForm.control}
                    name='customerStandardPrice'
                    label='Cust. Standard Price'
                    extendedProps={{ inputProps: { placeholder: "0.000", type: "number", startContent: "$" } }}
                  />
                </div>

                <div className='col-span-12 md:col-span-6'>
                  <InputField
                    control={requestedItemsForm.control}
                    name='customerStandardOpportunityValue'
                    label='Cust. Standard Opportunity Value'
                    extendedProps={{ inputProps: { placeholder: "0.00", type: "number", startContent: "$" } }}
                  />
                </div>

                <div className='col-span-12 flex items-center justify-end gap-2 border-b pb-4'>
                  <Button variant='secondary' type='button' onClick={() => requestedItemsForm.reset()}>
                    Clear Item
                  </Button>
                  <Button variant='outline-primary' type='button' onClick={() => requestedItemsForm.handleSubmit(handleAddRequestedItem)()}>
                    <Icons.plus className='size-4' /> Add Item
                  </Button>
                </div>

                <div className='col-span-12'>
                  <DataTable table={table}>
                    <div className='flex flex-col items-stretch justify-center gap-2 md:flex-row md:items-center md:justify-between'>
                      <DataTableSearch table={table} className='' />
                    </div>
                  </DataTable>
                </div>
              </div>
            </Form>

            <div className='col-span-12'>
              <Separator className='mt-2' />
            </div>

            <div className='col-span-12'>
              <TextAreaField
                control={form.control}
                name='crossAlternatePn'
                label='Cross/Alternate PN'
                extendedProps={{ textAreaProps: { placeholder: "Enter Cross/Alternate PN" } }}
              />
            </div>

            <div className='col-span-12 md:col-span-6'>
              <ComboboxField data={COMMODITY_TYPE_OPTIONS} control={form.control} name='commodityType' label='Commodity Type' />
            </div>

            <div className='col-span-12 md:col-span-6'>
              <InputField
                control={form.control}
                name='franchisePrice'
                label='Franchise Price'
                extendedProps={{ inputProps: { placeholder: "$ 0.00", startContent: "$" } }}
              />
            </div>

            <div className='col-span-12'>
              <InputField
                control={form.control}
                name='sapQuoteNumber'
                label='SAP Quote #'
                extendedProps={{ inputProps: { placeholder: "Enter SAP Quote #" } }}
              />
            </div>

            <div className='col-span-12 md:col-span-6 lg:col-span-3'>
              <InputField
                control={form.control}
                name='quotedMpn'
                label='Quoted MPN'
                extendedProps={{ inputProps: { placeholder: "Enter Quoted MPN" } }}
              />
            </div>

            <div className='col-span-12 md:col-span-6 lg:col-span-3'>
              <InputField
                control={form.control}
                name='quotedQuantity'
                label='Quoted Quantity'
                extendedProps={{ inputProps: { placeholder: "Enter Quoted Quantity" } }}
              />
            </div>

            <div className='col-span-12 md:col-span-6 lg:col-span-3'>
              <InputField
                control={form.control}
                name='priceQuotedToCust'
                label='Price Quoted to Customer'
                extendedProps={{ inputProps: { placeholder: "0.00", type: "number", startContent: "$" } }}
              />
            </div>

            <div className='col-span-12 md:col-span-6 lg:col-span-3'>
              <InputField
                control={form.control}
                name='quotedOpportunityValue'
                label='Quoted Opportunity Value'
                extendedProps={{ inputProps: { placeholder: "0.00", type: "number", startContent: "$" } }}
              />
            </div>

            <div className='col-span-12 mt-2 flex items-center justify-end gap-2'>
              <Button type='button' variant='secondary' disabled={false} onClick={() => router.push(`/dashboard/crm/requisitions`)}>
                Cancel
              </Button>
              <LoadingButton isLoading={false} type='submit'>
                Save
              </LoadingButton>
            </div>
          </Card>
        </form>
      </Form>
    </>
  )
}
