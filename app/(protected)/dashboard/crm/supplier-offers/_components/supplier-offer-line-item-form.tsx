"use client"

import { useForm, useFormContext, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { SupplierOfferForm, lineItemFormSchema } from "@/schema/supplier-offer"
import { useDialogStore } from "@/hooks/use-dialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback, useMemo } from "react"
import { Form } from "@/components/ui/form"
import InputField from "@/components/form/input-field"
import TextAreaField from "@/components/form/textarea-field"
import { Button } from "@/components/ui/button"
import { FormDebug } from "@/components/form/form-debug"

export default function SupplierOfferLineItemForm() {
  const form = useFormContext<SupplierOfferForm>()

  const { data: lineItem, setIsOpen, setData } = useDialogStore(["setIsOpen", "data", "setData"])

  const values = useMemo(() => {
    if (lineItem) return lineItem

    return {
      mpn: "",
      mfr: "",
      qty: 0,
      unitPrice: 0,
      dateCode: "",
      notes: "",
    }
  }, [JSON.stringify(lineItem)])

  const lineItemForm = useForm({
    mode: "onChange",
    values,
    resolver: zodResolver(lineItemFormSchema),
  })

  const lineItems = useWatch({ control: form.control, name: "lineItems" })

  const handleClose = () => {
    setIsOpen(false)
    setData(null)
  }

  const handleAddLineItem = useCallback(async () => {
    const isValid = await lineItemForm.trigger()

    if (!isValid) {
      toast.error("Failed to add line item!")
      return
    }

    const lineItemFormData = lineItemForm.getValues()
    const newLineItems = lineItems ? [...lineItems] : []

    if (lineItem) {
      newLineItems.splice(lineItem.index, 1, lineItemFormData)
    } else newLineItems.push(lineItemFormData)

    form.setValue("lineItems", newLineItems)
    lineItemForm.reset()
    form.clearErrors("lineItems")
    setIsOpen(false)
  }, [JSON.stringify(lineItems), JSON.stringify(lineItem)])

  return (
    <>
      {/* <FormDebug form={lineItemForm} /> */}

      <Form {...lineItemForm}>
        <div className='grid grid-cols-12 gap-4'>
          <div className='col-span-12 md:col-span-6'>
            <InputField
              control={lineItemForm.control}
              name='mpn'
              label='MPN'
              extendedProps={{ inputProps: { placeholder: "Enter MPN" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6'>
            <InputField
              control={lineItemForm.control}
              name='mfr'
              label='MFR'
              extendedProps={{ inputProps: { placeholder: "Enter MFR" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <InputField
              control={lineItemForm.control}
              name='qty'
              label='Qty'
              extendedProps={{ inputProps: { placeholder: "Enter qty", type: "number" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <InputField
              control={lineItemForm.control}
              name='unitPrice'
              label='Unit Price'
              extendedProps={{ inputProps: { placeholder: "Enter unit price", type: "number" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <InputField
              control={lineItemForm.control}
              name='dateCode'
              label='Date Code'
              extendedProps={{ inputProps: { placeholder: "Enter date code" } }}
            />
          </div>

          <div className='col-span-12'>
            <TextAreaField
              control={lineItemForm.control}
              name='notes'
              label='Notes'
              extendedProps={{ textAreaProps: { placeholder: "Enter notes", rows: 10 } }}
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
        </div>
      </Form>
    </>
  )
}
