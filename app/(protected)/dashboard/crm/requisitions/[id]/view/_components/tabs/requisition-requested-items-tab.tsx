"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useDialogStore } from "@/hooks/use-dialog"
import { getRequisitionById, updateRequisitionReqItems } from "@/actions/requisition"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RequestedItemForm, requestedItemFormSchema } from "@/schema/requisition"
import RequisitionRequestedItemsList from "../requisition-requested-items-list"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ComboboxField } from "@/components/form/combobox-field"
import { Form, FormControl, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useCallback, useEffect, useMemo } from "react"
import LoadingButton from "@/components/loading-button"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { useRouter } from "nextjs-toploader/app"
import ReadOnlyField from "@/components/read-only-field"
import { Badge } from "@/components/badge"
import { getItems } from "@/actions/item-master"

type RequisitionRequestedItemsTabProps = {
  requisition: NonNullable<Awaited<ReturnType<typeof getRequisitionById>>>
  items: Awaited<ReturnType<typeof getItems>>
}

export default function RequisitionRequestedItemsTab({ requisition, items }: RequisitionRequestedItemsTabProps) {
  const router = useRouter()
  const requestedItemIds = requisition?.requestedItems as string[] | null

  const { isOpen, setIsOpen } = useDialogStore(["isOpen", "setIsOpen"])

  //* get full details of the items
  const requestedItemsFullDetails = useMemo(() => {
    const fullDetailsItems =
      requestedItemIds?.map((itemCode) => {
        const selectedItem = items.find((item) => itemCode === item.ItemCode)
        if (selectedItem) {
          return {
            code: itemCode,
            name: selectedItem.ItemName,
            mpn: selectedItem.ItemCode,
            mfr: selectedItem.FirmName,
            source: selectedItem.source,
          }
        }
        return null
      }) || []

    return fullDetailsItems.filter((item) => item !== null)
  }, [JSON.stringify(items), JSON.stringify(requestedItemIds)])

  const form = useForm({
    mode: "onChange",
    values: {
      code: "",
      name: "",
      mpn: "",
      mfr: "",
    },
    resolver: zodResolver(requestedItemFormSchema),
  })

  const itemsOptions = useMemo(() => {
    if (!items) return []

    const reqItems = requestedItemIds || []

    //* only show items that are not already in the requested items
    return items
      .filter((item) => !reqItems.find((itemId) => itemId === item.id))
      .map((item) => ({ label: item?.ItemName || item.ItemCode, value: item.ItemCode, item }))
  }, [items, JSON.stringify(requestedItemIds)])

  const Actions = () => {
    return (
      <Button variant='outline-primary' onClick={() => setIsOpen(true)}>
        Add Item
      </Button>
    )
  }

  const handleClose = () => {
    setIsOpen(false)
    form.clearErrors()
    form.reset()
  }

  const { executeAsync, isExecuting } = useAction(updateRequisitionReqItems)

  const onSubmit = useCallback(
    async (formData: RequestedItemForm) => {
      try {
        const newReqItems = [...(requestedItemsFullDetails || []), formData]

        const response = await executeAsync({ reqId: requisition.id, requestedItems: newReqItems })
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
    [requisition.id, JSON.stringify(requestedItemsFullDetails)]
  )

  //* auto populate mpn and mfr if item is selected
  useEffect(() => {
    const itemId = form.getValues("code")

    if (itemId && items.length > 0) {
      const selectedItem = items.find((item) => item.id === itemId)

      if (selectedItem) {
        form.setValue("name", selectedItem.ItemName)
        form.setValue("mpn", selectedItem.ItemCode)
        form.setValue("mfr", selectedItem.FirmName)
        form.setValue("mfr", selectedItem.source)
      }
    }
  }, [form.watch("code"), JSON.stringify(items)])

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-x-3 gap-y-5'>
        <ReadOnlyFieldHeader
          className='col-span-12'
          title='Requested Items'
          description="Requisition's requested items list"
          actions={<Actions />}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Quantity' value={(requisition.quantity as any) ?? 0} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-4'
          title='Customer Standard Price'
          value={(requisition.customerStandardPrice as any) ?? 0}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-4'
          title='Customer Standard Opportunity Value'
          value={(requisition.customerStandardOpportunityValue as any) ?? 0}
        />

        <div className='col-span-12'>
          <RequisitionRequestedItemsList reqId={requisition.id} requestedItems={requestedItemsFullDetails} />
        </div>
      </div>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsOpen(open)
            return
          }

          handleClose()
        }}
      >
        <DialogContent className='max-h-[85vh] overflow-auto sm:max-w-5xl'>
          <DialogHeader>
            <DialogTitle>Add Item to Requisition</DialogTitle>
            <DialogDescription>Fill in the form to add an item to this requisition.</DialogDescription>
          </DialogHeader>

          <Card className='p-3'>
            {/* <FormDebug form={form} /> */}

            <Form {...form}>
              <form className='grid grid-cols-12 gap-4' onSubmit={form.handleSubmit(onSubmit)}>
                <div className='col-span-12'>
                  <ComboboxField
                    data={itemsOptions}
                    control={form.control}
                    name='code'
                    label='Item'
                    isRequired
                    renderItem={(item, selected) => (
                      <div className='flex w-full items-center justify-between'>
                        <div className='flex w-[80%] flex-col justify-center'>
                          <span className='truncate'>{item.label}</span>
                          <span className='truncate text-xs text-muted-foreground'>{item.item.ItemCode}</span>
                        </div>

                        {item.item.source === "portal" ? (
                          <Badge variant='soft-amber'>Portal</Badge>
                        ) : (
                          <Badge variant='soft-green'>SAP</Badge>
                        )}
                      </div>
                    )}
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
          </Card>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
