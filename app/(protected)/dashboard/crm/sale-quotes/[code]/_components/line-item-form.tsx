"use client"

import { useCallback, useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useAction } from "next-safe-action/hooks"

import { getItems } from "@/actions/item-master"
import { getRequisitions } from "@/actions/requisition"
import { updateLineItems } from "@/actions/sale-quote"
import { type LineItemForm, lineItemFormSchema } from "@/schema/sale-quote"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card } from "@/components/ui/card"
import { Form, FormControl, FormItem, FormLabel } from "@/components/ui/form"
import { ComboboxField } from "@/components/form/combobox-field"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/badge"
import InputField from "@/components/form/input-field"
import TextAreaField from "@/components/form/textarea-field"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"
import { useDialogStore } from "@/hooks/use-dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { multiply } from "mathjs"
import { formatCurrency } from "@/lib/formatter"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Icons } from "@/components/icons"
import { format } from "date-fns"
import { SUPPLIER_QUOTE_LT_TO_SJC_NUMBER_OPTIONS, SUPPLIER_QUOTE_LT_TO_SJC_UOM_OPTIONS } from "@/schema/supplier-quote"

type LineItemFormProps = {
  saleQuoteId: string
  customerCode: string
  lineItem?: LineItemForm
  lineItems: LineItemForm[]
  items: Awaited<ReturnType<typeof getItems>>
  requisitions: NonNullable<Awaited<ReturnType<typeof getRequisitions>>>
}

export default function LineItemForm({ saleQuoteId, customerCode, items, requisitions, lineItem, lineItems }: LineItemFormProps) {
  const router = useRouter()
  const { setIsOpen, setData } = useDialogStore(["setIsOpen", "setData"])
  const [isOpenReference, setIsOpenReference] = useState(false)

  const values = useMemo(() => {
    if (lineItem) return lineItem

    return {
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
    }
  }, [JSON.stringify(lineItem)])

  const form = useForm({
    mode: "onChange",
    values,
    resolver: zodResolver(lineItemFormSchema),
  })

  const { executeAsync, isExecuting } = useAction(updateLineItems)

  const lineItemReqCode = useWatch({ control: form.control, name: "requisitionCode" })
  const itemCode = useWatch({ control: form.control, name: "code" })
  const unitPrice = useWatch({ control: form.control, name: "unitPrice" })
  const quantity = useWatch({ control: form.control, name: "quantity" })
  const formValues = useWatch({ control: form.control })

  const ltToSjcNumber = SUPPLIER_QUOTE_LT_TO_SJC_NUMBER_OPTIONS.find((item) => item.value === formValues?.ltToSjcNumber)?.label
  const ltToSjcUom = SUPPLIER_QUOTE_LT_TO_SJC_UOM_OPTIONS.find((item) => item.value === formValues?.ltToSjcUom)?.label

  const totalPrice = useMemo(() => {
    const x = parseFloat(String(unitPrice))
    const y = parseFloat(String(quantity))

    if (isNaN(x) || isNaN(y)) return ""

    const result = multiply(x, y)

    return formatCurrency({ amount: result, minDecimal: 2 })
  }, [JSON.stringify(unitPrice), JSON.stringify(quantity)])

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
      .filter((item) => !lineItems.find((lineItem) => lineItem.code == item.ItemCode) || item.ItemCode == itemCode)
      .map((item) => ({
        label: item?.ItemName || item.ItemCode,
        value: item.ItemCode,
        item,
        supplierQuote: supplierQuotes.find((quote) => quote.itemCode == item.ItemCode),
      }))
  }, [JSON.stringify(supplierQuotes), JSON.stringify(items), JSON.stringify(lineItems)])

  const requisitionCodeCallback = useCallback(
    (code: number) => {
      const selectedRequisition = requisitions?.find((req) => req.code == code)

      if (selectedRequisition) {
        form.setValue("cpn", selectedRequisition.customerPn)

        const excludedFields = ["requisitionCode", "cpn"]

        //* reset fields excluding requisition code & cpn
        Object.entries(formValues).forEach(([key, value]) => {
          const lineItemKey = key as keyof typeof formValues
          if (!excludedFields.includes(lineItemKey)) form.resetField(lineItemKey)
        })
      }
    },
    [JSON.stringify(requisitions), JSON.stringify(formValues)]
  )

  const itemCodeCallback = useCallback(
    (code: string, supplierQuote: Awaited<ReturnType<typeof getRequisitions>>[number]["supplierQuotes"][number]) => {
      if (!code || !items || !supplierQuote) return

      const selectedItem = items.find((item) => code == item.ItemCode)

      if (selectedItem) {
        const unitPrice = parseFloat(String(supplierQuote?.quotedPrice))
        const quantity = parseFloat(String(supplierQuote?.quotedQuantity))

        form.setValue("supplierQuoteCode", supplierQuote.code)
        form.setValue("name", selectedItem.ItemName)
        form.setValue("mpn", selectedItem.ItemCode)
        form.setValue("mfr", selectedItem.FirmName)
        form.setValue("source", selectedItem.source)
        form.setValue("ltToSjcNumber", supplierQuote.ltToSjcNumber)
        form.setValue("ltToSjcUom", supplierQuote.ltToSjcUom)
        form.setValue("condition", supplierQuote.condition)
        form.setValue("coo", supplierQuote.coo)
        form.setValue("dateCode", supplierQuote.dateCode)
        form.setValue("estimatedDeliveryDate", supplierQuote.estimatedDeliveryDate)
        form.setValue("unitPrice", isNaN(unitPrice) ? 0 : unitPrice)
        form.setValue("quantity", isNaN(quantity) ? 0 : quantity)
      }
    },
    [JSON.stringify(items)]
  )

  const handleClose = () => {
    setIsOpen(false)
    setData(null)
    form.reset()
  }

  const onSubmit = useCallback(
    async (formData: LineItemForm) => {
      try {
        let action: "create" | "update" = "create"
        const isExist = lineItems.find((item) => item.code == formData.code)
        const newLineItems = [...lineItems]

        if (isExist) {
          action = "update"

          newLineItems.splice(
            newLineItems.findIndex((item) => item.code == formData.code),
            1,
            formData
          )
        } else newLineItems.push(formData)

        const response = await executeAsync({ action, saleQuoteId, lineItems: newLineItems })
        const result = response?.data

        if (result?.error) {
          toast.error(result.message)
          return
        }

        toast.success(result?.message)
        handleClose()

        setTimeout(() => {
          router.refresh()
        }, 1500)
      } catch (error) {
        console.error(error)
        toast.error("Something went wrong! Please try again later.")
      }
    },
    [saleQuoteId, JSON.stringify(lineItems)]
  )

  return (
    <Form {...form}>
      <form className='grid grid-cols-12 gap-4' onSubmit={form.handleSubmit(onSubmit)}>
        <div className='col-span-12'>
          <Collapsible open={isOpenReference} onOpenChange={setIsOpenReference}>
            <CollapsibleTrigger asChild>
              <Button className='w-full justify-between px-0 hover:bg-transparent' type='button' variant='ghost'>
                Reference
                {isOpenReference ? <Icons.chevUp className='size-4' /> : <Icons.chevDown className='size-4' />}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className='flex flex-col justify-center gap-2 p-4 text-sm'>
                <div className='flex gap-1.5'>
                  <span className='text-wrap font-semibold'>{formValues.mpn}</span>
                </div>

                <div className='flex gap-1.5'>
                  <span className='font-semibold'>MPR:</span>
                  <span className='text-wrap text-muted-foreground'>{formValues.mfr}</span>
                </div>

                <div className='flex gap-1.5'>
                  <span className='font-semibold'>Requisition:</span>
                  <span className='text-muted-foreground'>{formValues.requisitionCode || ""}</span>
                </div>

                <div className='flex gap-1.5'>
                  <span className='font-semibold'>Supplier Quote:</span>
                  <span className='text-muted-foreground'>{formValues.supplierQuoteCode || ""}</span>
                </div>

                <div className='flex gap-1.5'>
                  <span className='font-semibold'>CPN:</span>
                  <span className='text-muted-foreground'>{formValues.cpn || ""}</span>
                </div>

                <div className='flex gap-1.5'>
                  <span className='font-semibold'>Desc:</span>
                  <span className='text-muted-foreground'>{formValues.name || ""}</span>
                </div>

                <div className='flex gap-1.5'>
                  <span className='font-semibold'>LT to SJC:</span>
                  <span className='text-muted-foreground'>{`${ltToSjcNumber || ""} ${ltToSjcUom || ""}`}</span>
                </div>

                <div className='flex gap-1.5'>
                  <span className='font-semibold'>Condition:</span>
                  <span className='text-muted-foreground'>{formValues.condition || ""}</span>
                </div>

                <div className='flex gap-1.5'>
                  <span className='font-semibold'>Coo:</span>
                  <span className='text-muted-foreground'>{formValues.coo || ""}</span>
                </div>

                <div className='flex gap-1.5'>
                  <span className='font-semibold'>DC:</span>
                  <span className='text-muted-foreground'>{formValues.dateCode || ""}</span>
                </div>

                <div className='flex gap-1.5'>
                  <span className='font-semibold'>Est. Del. Date:</span>
                  <span className='text-muted-foreground'>
                    {formValues.estimatedDeliveryDate ? format(formValues.estimatedDeliveryDate, "MM/dd/yyyy") : ""}
                  </span>
                </div>

                <div className='flex gap-1.5'>
                  <span className='font-semibold'>Source</span>
                  <span className='text-muted-foreground'>
                    {formValues.source === "sap" ? <Badge variant='soft-green'>SAP</Badge> : <Badge variant='soft-amber'>Portal</Badge>}
                  </span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className='col-span-12 md:col-span-6'>
          <ComboboxField
            data={requisitionsOptions}
            control={form.control}
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
            control={form.control}
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

                  {item.item.source === "portal" ? <Badge variant='soft-amber'>Portal</Badge> : <Badge variant='soft-green'>SAP</Badge>}
                </div>
              )
            }}
          />
        </div>

        <div className='col-span-12 md:col-span-6 lg:col-span-4'>
          <InputField
            control={form.control}
            name='unitPrice'
            label='Unit Price'
            extendedProps={{ inputProps: { placeholder: "Enter unit price", type: "number", startContent: "$" } }}
          />
        </div>

        <div className='col-span-12 md:col-span-6 lg:col-span-4'>
          <InputField
            control={form.control}
            name='quantity'
            label='Quantity'
            extendedProps={{ inputProps: { placeholder: "Enter quantity", type: "number" } }}
          />
        </div>

        <div className='col-span-12 md:col-span-6 lg:col-span-4'>
          <FormItem className='space-y-2'>
            <FormLabel className='space-x-1'>Total Price</FormLabel>
            <FormControl>
              <Input disabled value={totalPrice} />
            </FormControl>
          </FormItem>
        </div>

        <div className='col-span-12'>
          <TextAreaField
            control={form.control}
            name='leadTime'
            label='Lead Time'
            isHideLabel
            extendedProps={{ textAreaProps: { placeholder: "Enter lead time" } }}
          />
        </div>

        <div className='col-span-12 mt-2 flex items-center justify-end gap-2'>
          <Button type='button' variant='secondary' disabled={isExecuting} onClick={handleClose}>
            Cancel
          </Button>
          <LoadingButton isLoading={isExecuting} type='submit'>
            Save
          </LoadingButton>
        </div>
      </form>
    </Form>
  )
}
