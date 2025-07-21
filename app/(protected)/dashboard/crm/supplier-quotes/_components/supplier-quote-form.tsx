"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { useRouter } from "nextjs-toploader/app"
import { useForm, useWatch } from "react-hook-form"

import { getBpMasters } from "@/actions/bp-master"
import { getRequisitions } from "@/actions/requisition"
import { getSupplierQuoteByCode, upsertSupplierQuote } from "@/actions/supplier-quote"
import { getUsers } from "@/actions/user"
import { Form, FormControl, FormItem, FormLabel } from "@/components/ui/form"
import {
  SUPPLIER_QUOTE_CONTACTED_VIA_OPTIONS,
  SUPPLIER_QUOTE_LT_TO_SJC_NUMBER_OPTIONS,
  SUPPLIER_QUOTE_LT_TO_SJC_UOM_OPTIONS,
  SUPPLIER_QUOTE_RESULT_OPTIONS,
  SUPPLIER_QUOTE_ROHS_OPTIONS,
  SUPPLIER_QUOTE_SOURCING_ROUND_OPTIONS,
  SUPPLIER_QUOTE_STATUS_OPTIONS,
  type SupplierQuoteForm,
  supplierQuoteFormSchema,
} from "@/schema/supplier-quote"
import { useEffect, useMemo } from "react"
import DatePickerField from "@/components/form/date-picker-field"
import { ComboboxField } from "@/components/form/combobox-field"
import { Input } from "@/components/ui/input"
import MultiSelectField from "@/components/form/multi-select-field"
import SwitchField from "@/components/form/switch-field"
import { Separator } from "@/components/ui/separator"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Badge } from "@/components/badge"
import TextAreaField from "@/components/form/textarea-field"
import { Textarea } from "@/components/ui/textarea"
import InputField from "@/components/form/input-field"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"
import { getItems } from "@/actions/item-master"
import { multiply } from "mathjs"
import { formatCurrency, formatNumber } from "@/lib/formatter"
import { FormDebug } from "@/components/form/form-debug"
import { BP_MASTER_STATUS_OPTIONS } from "@/schema/bp-master"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { REQUISITION_RESULT_OPTIONS } from "@/schema/requisition"

type SupplierQuoteFormProps = {
  supplierQuote: Awaited<ReturnType<typeof getSupplierQuoteByCode>>
  requisitions: Awaited<ReturnType<typeof getRequisitions>>
  suppliers: Awaited<ReturnType<typeof getBpMasters>>
  users: Awaited<ReturnType<typeof getUsers>>
  items: Awaited<ReturnType<typeof getItems>>
}

export default function SupplierQuoteForm({ supplierQuote, requisitions, suppliers, users, items }: SupplierQuoteFormProps) {
  const router = useRouter()
  const { code } = useParams() as { code: string }
  const { data: session } = useSession()

  const isCreate = code === "add" || !supplierQuote

  const values = useMemo(() => {
    if (supplierQuote) {
      const { buyers, supplier, requisition, quantityQuoted, quantityPriced, ...data } = supplierQuote

      return {
        ...data,
        requisitionCode: String(data.requisitionCode),
        buyers: [],
        quantityQuoted: quantityQuoted as any,
        quantityPriced: quantityPriced as any,
      }
    }

    if (code === "add" || !supplierQuote) {
      return {
        id: "add",
        date: new Date() as Date,
        requisitionCode: 0,
        supplierCode: "",
        contactId: "",
        contactedVia: "",
        status: "working",
        result: "",
        sourcingRound: "",
        followUpDate: null,
        isPreferredSource: false,
        isQuotedSource: false,
        isShowsStock: false,
        isShowsAvailable: false,
        isShowsWithMfr: false,
        isShowsWithCommodity: false,
        isTrustedSource: false,
        isManufacturer: false,
        isFd: false,
        isPreviousSourceOldStkOffer: false,
        itemCode: "",
        ltToSjcNumber: "",
        ltToSjcUom: "",
        dateCode: "",
        condition: "",
        coo: "",
        roHs: "",
        quantityQuoted: 0,
        quantityPriced: 0,
        buyers: [],
        comments: "",
      }
    }

    return undefined
  }, [JSON.stringify(supplierQuote)])

  const { executeAsync, isExecuting } = useAction(upsertSupplierQuote)

  const form = useForm<SupplierQuoteForm>({
    mode: "onChange",
    values,
    resolver: zodResolver(supplierQuoteFormSchema),
  })

  const requisitionCode = useWatch({ control: form.control, name: "requisitionCode" })
  const supplierCode = useWatch({ control: form.control, name: "supplierCode" })
  const itemCode = useWatch({ control: form.control, name: "itemCode" })
  const quotedQuantity = useWatch({ control: form.control, name: "quantityQuoted" })
  const quotedPrice = useWatch({ control: form.control, name: "quantityPriced" })

  const totalCost = useMemo(() => {
    const x = parseFloat(String(quotedQuantity))
    const y = parseFloat(String(quotedPrice))

    if (isNaN(x) || isNaN(y)) return ""

    const result = multiply(x, y)

    return formatCurrency({ amount: result, minDecimal: 2 })
  }, [quotedQuantity, quotedPrice])

  const requisition = useMemo(() => {
    return requisitions?.find((requisition) => requisition.code == requisitionCode)
  }, [requisitionCode, JSON.stringify(requisitions)])

  const reqCustomerStandardPrice = useMemo(() => {
    if (!requisition) return ""

    const x = parseFloat(String(requisition.customerStandardPrice))

    if (isNaN(x)) return ""

    return formatCurrency({ amount: x, maxDecimal: 2 })
  }, [JSON.stringify(requisition)])

  const reqQuantity = useMemo(() => {
    if (!requisition) return ""

    const x = parseFloat(String(requisition.quantity))

    if (isNaN(x)) return ""

    return formatNumber({ amount: x, maxDecimal: 2 })
  }, [JSON.stringify(requisition)])

  const requisitionsOptions = useMemo(() => {
    if (!requisitions) return []
    return requisitions.map((req) => ({ label: String(req.code), value: String(req.code), requisition: req }))
  }, [JSON.stringify(requisitions)])

  const supplier = useMemo(() => {
    return suppliers?.find((supplier) => supplier.CardCode == supplierCode)
  }, [supplierCode, JSON.stringify(suppliers)])

  const suppliersOptions = useMemo(() => {
    if (!suppliers) return []
    return suppliers.map((supplier) => ({ label: supplier?.CardName || supplier.CardCode, value: supplier.CardCode, supplier }))
  }, [JSON.stringify(suppliers)])

  const usersOptions = useMemo(() => {
    if (!users) return []
    return users.map((user) => ({ label: user.name || user.email, value: user.id, user }))
  }, [JSON.stringify(users)])

  const item = useMemo(() => {
    return items?.find((item) => item.ItemCode == itemCode)
  }, [itemCode, JSON.stringify(items)])

  const itemsOptions = useMemo(() => {
    if (!items || !requisition) return []
    return items
      .filter((item) => requisition.requestedItems.includes(item.ItemCode))
      .map((item) => ({ label: item?.ItemName || item.ItemCode, value: item.ItemCode, item }))
  }, [JSON.stringify(items), JSON.stringify(requisition)])

  //* set buyers based on user session
  useEffect(() => {
    if (session?.user && isCreate) {
      form.setValue("buyers", [session.user.id])
    }
  }, [JSON.stringify(session)])

  //* set buyers if data supplier quote exists
  useEffect(() => {
    if (supplierQuote && usersOptions.length > 0) {
      const selectedBuyers = supplierQuote.buyers?.map((buyer) => buyer?.userId) || []
      form.setValue("buyers", selectedBuyers)
    }
  }, [JSON.stringify(supplierQuote), JSON.stringify(usersOptions)])

  const onSubmit = async (formData: SupplierQuoteForm) => {
    try {
      const response = await executeAsync(formData)
      const result = response?.data

      if (result?.error) {
        toast.error(result.message)
        return
      }

      toast.success(result?.message)

      if (result?.data && result?.data?.supplierQuote && "code" in result?.data?.supplierQuote) {
        router.refresh()

        setTimeout(() => {
          router.push(`/dashboard/crm/supplier-quotes/${result.data.supplierQuote.code}`)
        }, 1500)
      }
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong! Please try again later.")
    }
  }

  const requisitionCodeCallback = () => {
    form.setValue("itemCode", "")
  }

  return (
    <>
      {/* <FormDebug form={form} /> */}

      <Form {...form}>
        <form className='grid grid-cols-12 gap-4' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
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

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <ComboboxField
              data={requisitionsOptions}
              control={form.control}
              name='requisitionCode'
              label='Requisition'
              isRequired
              callback={requisitionCodeCallback}
              renderItem={(item, selected) => (
                <div className='flex w-full items-center justify-between'>
                  <div className='flex w-[80%] flex-col justify-center'>
                    <span className='truncate'>#{item.label}</span>
                    {item.requisition.requestedItems.length > 0 && (
                      <span className='text-xs text-muted-foreground'>{item.requisition.requestedItems[0]}</span>
                    )}
                  </div>

                  <span className='text-xs text-muted-foreground'>{item?.requisition?.customer?.CardName}</span>
                </div>
              )}
            />
          </div>

          <div className='col-span-12 md:col-span-4'>
            <FormItem className='space-y-2'>
              <FormLabel className='space-x-1'>Requisition - Result</FormLabel>
              <FormControl>
                <Input disabled value={REQUISITION_RESULT_OPTIONS.find((item) => item.value == requisition?.result)?.label || ""} />
              </FormControl>
            </FormItem>
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField data={SUPPLIER_QUOTE_STATUS_OPTIONS} control={form.control} name='status' label='Status' />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField data={SUPPLIER_QUOTE_RESULT_OPTIONS} control={form.control} name='result' label='Result' />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField
              data={SUPPLIER_QUOTE_SOURCING_ROUND_OPTIONS}
              control={form.control}
              name='sourcingRound'
              label='Sourcing Round'
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <DatePickerField
              control={form.control}
              name='followUpDate'
              label='Follow Up Date'
              extendedProps={{
                calendarProps: { mode: "single", fromYear: 1800, toYear: new Date().getFullYear(), captionLayout: "dropdown-buttons" },
              }}
            />
          </div>

          <div className='col-span-12 md:col-span-6'>
            <MultiSelectField
              data={usersOptions}
              control={form.control}
              name='buyers'
              label='Buyers'
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

          <div className='col-span-12 flex items-center md:col-span-6 lg:col-span-3'>
            <SwitchField control={form.control} layout='default' name='isPreferredSource' label='Preferred Source' />
          </div>

          <div className='col-span-12 flex items-center md:col-span-6 lg:col-span-3'>
            <SwitchField control={form.control} layout='default' name='isQuotedSource' label='Quoted Source' />
          </div>

          <div className='col-span-12 mt-2 space-y-4 lg:col-span-12'>
            <Separator />

            <ReadOnlyFieldHeader title='Supplier Details' description='Supplier related details' />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <ComboboxField
              data={suppliersOptions}
              control={form.control}
              name='supplierCode'
              label='Company Name'
              isRequired
              renderItem={(item, selected) => (
                <div className='flex w-full items-center justify-between'>
                  <div className='flex w-[80%] flex-col justify-center'>
                    <span className='truncate'>{item.label}</span>
                    <span className='truncate text-xs text-muted-foreground'>{item.supplier.CardCode}</span>
                  </div>

                  {item.supplier.source === "portal" ? <Badge variant='soft-amber'>Portal</Badge> : <Badge variant='soft-green'>SAP</Badge>}
                </div>
              )}
            />
          </div>

          <div className='col-span-12 md:col-span-4'>
            <FormItem className='space-y-2'>
              <FormLabel className='space-x-1'>Supplier - Terms</FormLabel>
              <FormControl>
                <Input disabled value='' />
              </FormControl>
            </FormItem>
          </div>

          <div className='col-span-12 md:col-span-4'>
            <FormItem className='space-y-2'>
              <FormLabel className='space-x-1'>Supplier - Assigned Buyer</FormLabel>
              <FormControl>
                <Input disabled value={supplier?.buyer?.name || supplier?.buyer?.email || ""} />
              </FormControl>
            </FormItem>
          </div>

          <div className='col-span-12 md:col-span-4'>
            <FormItem className='space-y-2'>
              <FormLabel className='space-x-1'>Supplier - Status</FormLabel>
              <FormControl>
                <Input disabled value={BP_MASTER_STATUS_OPTIONS.find((item) => item.value === supplier?.status)?.label || ""} />
              </FormControl>
            </FormItem>
          </div>

          <div className='col-span-12 md:col-span-4'>
            <FormItem className='space-y-2'>
              <FormLabel className='space-x-1'>Supplier - Cancellation Rate - Previous QTR</FormLabel>
              <FormControl>
                <Input disabled value='' />
              </FormControl>
            </FormItem>
          </div>

          <div className='col-span-12 md:col-span-4'>
            <FormItem className='space-y-2'>
              <FormLabel className='space-x-1'>Supplier - PO Failure Rate</FormLabel>
              <FormControl>
                <Input disabled value='' />
              </FormControl>
            </FormItem>
          </div>

          <div className='col-span-12'>
            <FormItem className='space-y-2'>
              <FormLabel className='space-x-1'>Supplier - Reason Denied</FormLabel>
              <FormControl>
                <Textarea disabled value='' />
              </FormControl>
            </FormItem>
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField data={[]} control={form.control} name='contactId' label='Contact - Full Name' />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField data={SUPPLIER_QUOTE_CONTACTED_VIA_OPTIONS} control={form.control} name='contactedVia' label='Contacted Via' />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <FormItem className='space-y-2'>
              <FormLabel className='space-x-1'>Contact - Email Address</FormLabel>
              <FormControl>
                <Input disabled value='' />
              </FormControl>
            </FormItem>
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <FormItem className='space-y-2'>
              <FormLabel className='space-x-1'>Contact - Direct Phone</FormLabel>
              <FormControl>
                <Input disabled value='' />
              </FormControl>
            </FormItem>
          </div>

          <div className='col-span-12 mt-2 space-y-4 lg:col-span-12'>
            <Separator />

            <ReadOnlyFieldHeader title='Quote Details' description='Quote related details' />
          </div>

          <div className='col-span-12 flex items-center md:col-span-6 lg:col-span-3'>
            <SwitchField control={form.control} layout='default' name='isShowsStock' label='Show Stocks' />
          </div>

          <div className='col-span-12 flex items-center md:col-span-6 lg:col-span-3'>
            <SwitchField control={form.control} layout='default' name='isShowsAvailable' label='Show Available' />
          </div>

          <div className='col-span-12 flex items-center md:col-span-6 lg:col-span-3'>
            <SwitchField control={form.control} layout='default' name='isShowsWithMfr' label='Strong w/ MFR' />
          </div>

          <div className='col-span-12 flex items-center md:col-span-6 lg:col-span-3'>
            <SwitchField control={form.control} layout='default' name='isShowsWithCommodity' label='Strong w/ Commodity' />
          </div>

          <div className='col-span-12 flex items-center md:col-span-6 lg:col-span-3'>
            <SwitchField control={form.control} layout='default' name='isTrustedSource' label='Trusted Source' />
          </div>

          <div className='col-span-12 flex items-center md:col-span-6 lg:col-span-3'>
            <SwitchField control={form.control} layout='default' name='isManufacturer' label='Manufacturer' />
          </div>

          <div className='col-span-12 flex items-center md:col-span-6 lg:col-span-3'>
            <SwitchField control={form.control} layout='default' name='isFd' label='FD' />
          </div>

          <div className='col-span-12 flex items-center md:col-span-6 lg:col-span-3'>
            <SwitchField
              control={form.control}
              layout='default'
              name='isPreviousSourceOldStkOffer'
              label='Previous Source / Old Stk Offer'
            />
          </div>

          <Separator className='col-span-12 mb-3 mt-2' />

          <div className='col-span-12'>
            <ComboboxField
              data={itemsOptions}
              control={form.control}
              name='itemCode'
              label='Item'
              isRequired
              renderItem={(item, selected) => (
                <div className='flex w-full items-center justify-between'>
                  <div className='flex w-[80%] flex-col justify-center'>
                    <span className='truncate'>{item.label}</span>
                    <span className='truncate text-xs text-muted-foreground'>{item.item.ItemCode}</span>
                  </div>

                  {item.item.source === "portal" ? <Badge variant='soft-amber'>Portal</Badge> : <Badge variant='soft-green'>SAP</Badge>}
                </div>
              )}
              description='Item/s selected from the requisition'
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-6'>
            <FormItem className='space-y-2'>
              <FormLabel className='space-x-1'>MPN</FormLabel>
              <FormControl>
                <Input disabled value={item?.ItemCode || ""} />
              </FormControl>
            </FormItem>
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-6'>
            <FormItem className='space-y-2'>
              <FormLabel className='space-x-1'>MFR</FormLabel>
              <FormControl>
                <Input disabled value={item?.FirmName || ""} />
              </FormControl>
            </FormItem>
          </div>

          <div className='col-span-12 md:col-span-6'>
            <ComboboxField
              data={SUPPLIER_QUOTE_LT_TO_SJC_NUMBER_OPTIONS}
              control={form.control}
              name='ltToSjcNumber'
              label='LT to SJC (Number)'
            />
          </div>

          <div className='col-span-12 md:col-span-6'>
            <ComboboxField data={SUPPLIER_QUOTE_LT_TO_SJC_UOM_OPTIONS} control={form.control} name='ltToSjcUom' label='LT to SJC (UOM)' />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='dateCode'
              label='Date Code'
              extendedProps={{ inputProps: { placeholder: "Enter date code" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='condition'
              label='Condition'
              extendedProps={{ inputProps: { placeholder: "Enter condition" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField control={form.control} name='coo' label='COO' extendedProps={{ inputProps: { placeholder: "Enter coo" } }} />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField data={SUPPLIER_QUOTE_ROHS_OPTIONS} control={form.control} name='roHs' label='RoHS?' />
          </div>

          <div className='col-span-12'>
            <FormItem className='space-y-2'>
              <FormLabel className='space-x-1'>Total Cost</FormLabel>
              <FormControl>
                <Input disabled value={totalCost} />
              </FormControl>
            </FormItem>
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='quantityQuoted'
              label='Quantity Quoted'
              extendedProps={{ inputProps: { placeholder: "Enter quantity quoted", type: "number" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <FormItem className='space-y-2'>
              <FormLabel className='space-x-1'>Requisition - Quantity</FormLabel>
              <FormControl>
                <Input disabled value={reqQuantity} />
              </FormControl>
            </FormItem>
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='quantityPriced'
              label='Quoted Price'
              extendedProps={{ inputProps: { placeholder: "Enter quoted price", type: "number", startContent: "$" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <FormItem className='space-y-2'>
              <FormLabel className='space-x-1'>Requisition - Customer Target Price</FormLabel>
              <FormControl>
                <Input disabled value={reqCustomerStandardPrice} />
              </FormControl>
            </FormItem>
          </div>

          <div className='col-span-12'>
            <TextAreaField
              control={form.control}
              name='comments'
              label='Comments'
              extendedProps={{ textAreaProps: { placeholder: "Enter comments" } }}
            />
          </div>

          <div className='col-span-12 mt-2 flex items-center justify-end gap-2'>
            <Button type='button' variant='secondary' disabled={isExecuting} onClick={() => router.push(`/dashboard/crm/requisitions`)}>
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
