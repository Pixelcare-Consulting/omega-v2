import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback, useMemo, useState } from "react"
import { useForm, useFormContext, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { multiply } from "mathjs"

import { useDialogStore } from "@/hooks/use-dialog"
import { LineItemForm, lineItemFormSchema, SaleQuoteForm } from "@/schema/sale-quote"
import { Form, FormControl, FormItem, FormLabel } from "@/components/ui/form"
import { ComboboxField } from "@/components/form/combobox-field"
import { cn } from "@/lib/utils"
import InputField from "@/components/form/input-field"
import TextAreaField from "@/components/form/textarea-field"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/badge"
import { getRequisitions } from "@/actions/requisition"
import { getItems } from "@/actions/master-item"
import { formatCurrency, formatNumber } from "@/lib/formatter"
import { Input } from "@/components/ui/input"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { format } from "date-fns"
import { SUPPLIER_QUOTE_LT_TO_SJC_NUMBER_OPTIONS, SUPPLIER_QUOTE_LT_TO_SJC_UOM_OPTIONS } from "@/schema/supplier-quote"

type SaleQuoteLineItemFormProps = {
  lineItem?: LineItemForm
  requisitions: Awaited<ReturnType<typeof getRequisitions>>
  items: Awaited<ReturnType<typeof getItems>>
}

export default function SaleQuoteLineItemForm({ lineItem, requisitions, items }: SaleQuoteLineItemFormProps) {
  const form = useFormContext<SaleQuoteForm>()

  const { setIsOpen, setData } = useDialogStore(["setIsOpen", "setData"])
  const [isOpenReference, setIsOpenReference] = useState(false)

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

  const values = useMemo(() => {
    if (lineItem) return lineItem
    return lineItemDefaultValues
  }, [JSON.stringify(lineItem)])

  const lineItemForm = useForm({
    mode: "onChange",
    values,
    resolver: zodResolver(lineItemFormSchema),
  })

  const formValues = useWatch({ control: form.control })
  const lineItems = useWatch({ control: form.control, name: "lineItems" })

  const lineItemFormValues = useWatch({ control: lineItemForm.control })

  const ltToSjcNumber = SUPPLIER_QUOTE_LT_TO_SJC_NUMBER_OPTIONS.find((item) => item.value === lineItemFormValues?.ltToSjcNumber)?.label
  const ltToSjcUom = SUPPLIER_QUOTE_LT_TO_SJC_UOM_OPTIONS.find((item) => item.value === lineItemFormValues?.ltToSjcUom)?.label

  const handleClose = () => {
    setIsOpen(false)
    setData(null)
  }

  const totalPrice = useMemo(() => {
    const x = parseFloat(String(lineItemFormValues.unitPrice))
    const y = parseFloat(String(lineItemFormValues.quantity))

    if (isNaN(x) || isNaN(y)) return ""

    const result = multiply(x, y)

    return formatCurrency({ amount: result, minDecimal: 2 })
  }, [JSON.stringify(lineItemFormValues.unitPrice), JSON.stringify(lineItemFormValues.quantity)])

  const requisitionsOptions = useMemo(() => {
    if (!requisitions || !formValues.customerCode) return []

    //* only show requisition that is related to the customer
    return requisitions
      .filter((req) => req.customerCode == formValues.customerCode)
      .map((req) => ({ label: String(req.code), value: String(req.code), requisition: req }))
  }, [JSON.stringify(requisitions), JSON.stringify(lineItems), formValues.customerCode])

  const supplierQuotes = useMemo(() => {
    if (!lineItemFormValues.requisitionCode || !requisitions) return []

    const requisition = requisitions.find((req) => req.code == lineItemFormValues.requisitionCode)
    return requisition?.supplierQuotes || []
  }, [lineItemFormValues.requisitionCode])

  const itemsOptions = useMemo(() => {
    if (!supplierQuotes || !items) return []

    //* filter items that are in supplier quotes and only show item that are not in line items
    return items
      .filter((item) => supplierQuotes.find((quote) => quote.itemCode == item.ItemCode))
      .filter((item) => {
        //* still show item if its in edit mode or lineItem data exist
        if (lineItem && lineItem.code === item.ItemCode) return true
        return !lineItems.find((lineItem) => lineItem.code == item.ItemCode)
      })
      .map((item) => ({
        label: item?.ItemName || item.ItemCode,
        value: item.ItemCode,
        item,
        supplierQuote: supplierQuotes.find((quote) => quote.itemCode == item.ItemCode),
      }))
  }, [JSON.stringify(supplierQuotes), JSON.stringify(items), JSON.stringify(lineItems), JSON.stringify(lineItem)])

  const handleAddLineItem = useCallback(async () => {
    const isValid = await lineItemForm.trigger()

    if (!isValid) {
      toast.error("Failed to add line item!")
      return
    }

    const lineItemFormData = lineItemForm.getValues()
    const newLineItems = lineItems ? [...lineItems] : []

    if (lineItem) {
      newLineItems.splice(
        newLineItems.findIndex((item) => item.code == lineItem.code),
        1,
        lineItemFormData
      )
    } else newLineItems.push(lineItemFormData)

    form.setValue("lineItems", newLineItems)
    lineItemForm.reset()
    form.clearErrors("lineItems")
    setIsOpen(false)
  }, [JSON.stringify(lineItems), JSON.stringify(lineItem)])

  const requisitionCodeCallback = useCallback(
    (code: number) => {
      const selectedRequisition = requisitions?.find((req) => req.code == code)

      if (selectedRequisition) {
        lineItemForm.setValue("cpn", selectedRequisition.customerPn)

        const excludedFields = ["requisitionCode", "cpn"]

        //* reset fields excluding requisition code & cpn
        Object.entries(lineItemDefaultValues).forEach(([key, value]) => {
          const lineItemKey = key as keyof typeof lineItemDefaultValues
          if (!excludedFields.includes(lineItemKey)) lineItemForm.setValue(lineItemKey, value)
        })
      }
    },
    [JSON.stringify(requisitions)]
  )

  const itemCodeCallback = useCallback(
    (code: string, supplierQuote: Awaited<ReturnType<typeof getRequisitions>>[number]["supplierQuotes"][number]) => {
      if (!code || !items || !supplierQuote) return

      const selectedItem = items.find((item) => code == item.ItemCode)

      if (selectedItem) {
        const quotedPrice = parseFloat(String(supplierQuote?.quotedPrice))
        const quotedQuantity = parseFloat(String(supplierQuote?.quotedQuantity))

        lineItemForm.setValue("supplierQuoteCode", supplierQuote.code)
        lineItemForm.setValue("name", selectedItem.ItemName)
        lineItemForm.setValue("mpn", selectedItem.ItemCode)
        lineItemForm.setValue("mfr", selectedItem.FirmName)
        lineItemForm.setValue("source", selectedItem.source)
        lineItemForm.setValue("ltToSjcNumber", supplierQuote.ltToSjcNumber)
        lineItemForm.setValue("ltToSjcUom", supplierQuote.ltToSjcUom)
        lineItemForm.setValue("condition", supplierQuote.condition)
        lineItemForm.setValue("coo", supplierQuote.coo)
        lineItemForm.setValue("dateCode", supplierQuote.dateCode)
        lineItemForm.setValue("estimatedDeliveryDate", supplierQuote.estimatedDeliveryDate)
        lineItemForm.setValue("quotedPrice", isNaN(quotedPrice) ? "" : formatCurrency({ amount: quotedPrice, maxDecimal: 2 }))
        lineItemForm.setValue("quotedQuantity", isNaN(quotedQuantity) ? "" : formatNumber({ amount: quotedQuantity }))

        lineItemForm.setValue("details.mpn", selectedItem.ItemCode)
        lineItemForm.setValue("details.mfr", selectedItem.FirmName)
        lineItemForm.setValue("details.dateCode", supplierQuote.dateCode)
        lineItemForm.setValue("details.coo", supplierQuote.coo)
        lineItemForm.setValue("details.leadTime", "")
        lineItemForm.setValue("details.notes", "")
      }
    },
    [JSON.stringify(items)]
  )

  return (
    <Form {...lineItemForm}>
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
                <span className='text-wrap font-semibold'>{lineItemFormValues.mpn}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>MPR:</span>
                <span className='text-wrap text-muted-foreground'>{lineItemFormValues.mfr}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>Requisition:</span>
                <span className='text-muted-foreground'>{lineItemFormValues.requisitionCode || ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>Supplier Quote:</span>
                <span className='text-muted-foreground'>{lineItemFormValues.supplierQuoteCode || ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>CPN:</span>
                <span className='text-muted-foreground'>{lineItemFormValues.cpn || ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>Desc:</span>
                <span className='text-muted-foreground'>{lineItemFormValues.name || ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>LT to SJC:</span>
                <span className='text-muted-foreground'>{`${ltToSjcNumber || ""} ${ltToSjcUom || ""}`}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>Quoted Price:</span>
                <span className='text-muted-foreground'>{lineItemFormValues.quotedPrice || ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>Qty Quoted:</span>
                <span className='text-muted-foreground'>{lineItemFormValues.quotedQuantity || ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>Condition:</span>
                <span className='text-muted-foreground'>{lineItemFormValues.condition || ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>Coo:</span>
                <span className='text-muted-foreground'>{lineItemFormValues.coo || ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>DC:</span>
                <span className='text-muted-foreground'>{lineItemFormValues.dateCode || ""}</span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>Est. Del. Date:</span>
                <span className='text-muted-foreground'>
                  {lineItemFormValues.estimatedDeliveryDate ? format(lineItemFormValues.estimatedDeliveryDate, "MM/dd/yyyy") : ""}
                </span>
              </div>

              <div className='flex gap-1.5'>
                <span className='font-semibold'>Source</span>
                <span className='text-muted-foreground'>
                  {lineItemFormValues.source === "sap" ? (
                    <Badge variant='soft-green'>SAP</Badge>
                  ) : (
                    <Badge variant='soft-amber'>Portal</Badge>
                  )}
                </span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className='col-span-12 md:col-span-6'>
        <ComboboxField
          data={requisitionsOptions}
          control={lineItemForm.control}
          name='requisitionCode'
          label='Requisition'
          isRequired
          callback={(args) => requisitionCodeCallback(args?.option?.value)}
          extendedProps={{ buttonProps: { disabled: !formValues.customerCode } }}
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
          control={lineItemForm.control}
          name='code'
          label='Item'
          description='Item/s from supplier quote related to the selected requisition.'
          isRequired
          extendedProps={{ buttonProps: { disabled: !lineItemFormValues.requisitionCode } }}
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
          control={lineItemForm.control}
          name='unitPrice'
          label='Unit Price'
          extendedProps={{ inputProps: { placeholder: "Enter unit price", type: "number", startContent: "$" } }}
        />
      </div>

      <div className='col-span-12 md:col-span-6 lg:col-span-4'>
        <InputField
          control={lineItemForm.control}
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

      <Separator className='col-span-12' />

      <ReadOnlyFieldHeader className='col-span-12' title='Details' description='Line item details' />

      <div className='col-span-12 md:col-span-6 lg:col-span-3'>
        <InputField
          control={lineItemForm.control}
          name='details.mpn'
          label='MPN'
          extendedProps={{ inputProps: { placeholder: "Enter MPN" } }}
        />
      </div>

      <div className='col-span-12 md:col-span-6 lg:col-span-3'>
        <InputField
          control={lineItemForm.control}
          name='details.mfr'
          label='MFR'
          extendedProps={{ inputProps: { placeholder: "Enter MFR" } }}
        />
      </div>

      <div className='col-span-12 md:col-span-6 lg:col-span-3'>
        <InputField
          control={lineItemForm.control}
          name='details.dateCode'
          label='Date Code'
          extendedProps={{ inputProps: { placeholder: "Enter date code" } }}
        />
      </div>

      <div className='col-span-12 md:col-span-6 lg:col-span-3'>
        <InputField
          control={lineItemForm.control}
          name='details.condition'
          label='Condition'
          extendedProps={{ inputProps: { placeholder: "Enter condition" } }}
        />
      </div>

      <div className='col-span-12 md:col-span-6 lg:col-span-2'>
        <InputField
          control={lineItemForm.control}
          name='details.coo'
          label='COO'
          extendedProps={{ inputProps: { placeholder: "Enter COO" } }}
        />
      </div>

      <div className='col-span-12 md:col-span-5'>
        <TextAreaField
          control={lineItemForm.control}
          name='details.leadTime'
          label='Lead Time'
          extendedProps={{ textAreaProps: { placeholder: "Enter lead time" } }}
        />
      </div>

      <div className='col-span-12 md:col-span-5'>
        <TextAreaField
          control={lineItemForm.control}
          name='details.notes'
          label='Notes'
          extendedProps={{ textAreaProps: { placeholder: "Enter notes" } }}
        />
      </div>

      <div className='col-span-12 flex items-center justify-end gap-2'>
        <Button variant='secondary' type='button' onClick={handleClose}>
          Cancel
        </Button>
        <Button type='button' onClick={handleAddLineItem}>
          Submit
        </Button>
      </div>
    </Form>
  )
}
