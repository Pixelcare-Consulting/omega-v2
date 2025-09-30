"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "next/navigation"
import { useRouter } from "nextjs-toploader/app"
import { useForm, useWatch } from "react-hook-form"
import { useEffect, useMemo } from "react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"

import { getProductAvailabilityByCode, upsertProductAvailability } from "@/actions/product-availability"
import { useDialogStore } from "@/hooks/use-dialog"
import { type ProductAvailabilityForm, productAvailabilityFormSchema } from "@/schema/product-availability"
import { getManufacturersClient } from "@/actions/manufacturer"
import { getItemGroupsClient } from "@/actions/master-item"
import { getBpMastersClient } from "@/actions/master-bp"
import { FormDebug } from "@/components/form/form-debug"
import { Form } from "@/components/ui/form"
import { ComboboxField } from "@/components/form/combobox-field"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/badge"
import SwitchField from "@/components/form/switch-field"
import TextAreaField from "@/components/form/textarea-field"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"

type ProductAvailabilityFormProps = {
  isModal?: boolean
  disableSupplierField?: boolean
  productAvailability: Awaited<ReturnType<typeof getProductAvailabilityByCode>>
  suppCode?: string
}

export default function ProductAvailabilityForm({
  isModal,
  disableSupplierField,
  productAvailability,
  suppCode,
}: ProductAvailabilityFormProps) {
  const router = useRouter()
  const { code } = useParams() as { code: string }
  const { setIsOpen, setData } = useDialogStore(["setIsOpen", "setData"])

  const values = useMemo(() => {
    if (productAvailability) {
    }

    if (code === "add" || !productAvailability) {
      return {
        id: "add",
        supplierCode: "",
        manufacturerCode: 0,
        itemGroupCode: null,
        isAuthorizedDisti: false,
        isFranchiseDisti: false,
        isMfrDirect: false,
        isSpecialPricing: false,
        isStrongBrand: false,
        notes: "",
      }
    }

    return undefined
  }, [JSON.stringify(productAvailability)])

  const form = useForm({
    mode: "onChange",
    values,
    resolver: zodResolver(productAvailabilityFormSchema),
  })

  const { executeAsync, isExecuting } = useAction(upsertProductAvailability)

  const {
    execute: getBpMastersExec,
    isExecuting: isBpMastersLoading,
    result: { data: bpMasters },
  } = useAction(getBpMastersClient)

  const {
    execute: getManufacturersExec,
    isExecuting: isManufacturersLoading,
    result: { data: manufacturers },
  } = useAction(getManufacturersClient)

  const {
    execute: getItemGroupsExec,
    isExecuting: isItemGroupsLoading,
    result: { data: itemGroups },
  } = useAction(getItemGroupsClient)

  const suppliersOptions = useMemo(() => {
    if (!bpMasters) return []
    return bpMasters.map((supplier) => ({ label: supplier?.CardName || supplier.CardCode, value: supplier.CardCode, supplier }))
  }, [JSON.stringify(bpMasters), isBpMastersLoading])

  const itemGroupsOptions = useMemo(() => {
    if (!itemGroups) return []
    return itemGroups.map((group: any) => ({ label: group.GroupName, value: group.Number, group }))
  }, [JSON.stringify(itemGroups), isItemGroupsLoading])

  const manufacturersOptions = useMemo(() => {
    if (!manufacturers) return []
    return manufacturers.map((manufacturer: any) => ({ label: manufacturer.ManufacturerName, value: manufacturer.Code, manufacturer }))
  }, [JSON.stringify(manufacturers), isManufacturersLoading])

  const onSubmit = async (formData: ProductAvailabilityForm) => {
    try {
      const response = await executeAsync(formData)
      const result = response?.data

      if (result?.error) {
        toast.error(result.message)
        return
      }

      toast.success(result?.message)

      if (result?.data && result?.data?.productAvailability && "code" in result?.data?.productAvailability) {
        if (isModal) {
          setIsOpen(false)
          setData(null)

          setTimeout(() => {
            router.refresh()
          }, 1500)
          return
        }

        setTimeout(() => {
          router.push(`/dashboard/crm/product-availabilities/${result.data.productAvailability.code}`)
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

    router.push(`/dashboard/crm/product-availabilities`)
  }

  const onFirstLoad = () => {
    getBpMastersExec({ cardType: "S" })
    getManufacturersExec()
    getItemGroupsExec()
  }

  //* set supplier code if suppCode exist
  useEffect(() => {
    if (suppCode && suppliersOptions.length > 0) form.setValue("supplierCode", suppCode)
  }, [suppCode, JSON.stringify(suppliersOptions)])

  //* trigger fetching once on first load
  useEffect(() => {
    onFirstLoad()
  }, [])

  return (
    <>
      {/* <FormDebug form={form} /> */}

      <Form {...form}>
        <form className='grid grid-cols-12 gap-4' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <ComboboxField
              data={suppliersOptions}
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

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <ComboboxField
              data={manufacturersOptions}
              control={form.control}
              name='manufacturerCode'
              label='Manufacturer'
              isRequired
              isLoading={isManufacturersLoading}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <ComboboxField
              data={itemGroupsOptions}
              control={form.control}
              name='itemGroupCode'
              label='Commondity'
              isLoading={isItemGroupsLoading}
            />
          </div>

          <div className='col-span-12 md:col-span-6 md:mt-3 lg:col-span-3'>
            <SwitchField control={form.control} layout='default' name='isAuthorizedDisti' label='Authorized Disti' />
          </div>

          <div className='col-span-12 md:col-span-6 md:mt-3 lg:col-span-3'>
            <SwitchField control={form.control} layout='default' name='isFranchiseDisti' label='Franchise Disti' />
          </div>

          <div className='col-span-12 md:col-span-6 md:mt-3 lg:col-span-3'>
            <SwitchField control={form.control} layout='default' name='isMfrDirect' label='MFR Direct' />
          </div>

          <div className='col-span-12 md:col-span-6 md:mt-3 lg:col-span-3'>
            <SwitchField control={form.control} layout='default' name='isSpecialPricing' label='Special Pricing' />
          </div>

          <div className='col-span-12 md:col-span-6 md:mt-3 lg:col-span-3'>
            <SwitchField control={form.control} layout='default' name='isSpecialPricing' label='Strong Brand' />
          </div>

          <div className='col-span-12'>
            <TextAreaField
              control={form.control}
              name='notes'
              label='Notes'
              extendedProps={{ textAreaProps: { placeholder: "Enter notes", rows: 10 } }}
            />
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
