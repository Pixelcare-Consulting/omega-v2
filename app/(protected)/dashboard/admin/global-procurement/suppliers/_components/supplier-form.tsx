"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "nextjs-toploader/app"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { type SupplierForm, supplierFormSchema } from "@/schema/supplier"
import { useAction } from "next-safe-action/hooks"

import { getSupplierById, upsertSupplier } from "@/actions/supplier"
import { PageLayout } from "@/app/(protected)/_components/page-layout"
import { Form } from "@/components/ui/form"
import InputField from "@/components/form/input-field"
import { ComboboxField } from "@/components/form/combobox-field"
import { Separator } from "@/components/ui/separator"
import TextAreaField from "@/components/form/textarea-field"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"

type SupplierFormProps = {
  supplier?: Awaited<ReturnType<typeof getSupplierById>>
}

export default function SupplierForm({ supplier }: SupplierFormProps) {
  const router = useRouter()
  const { id } = useParams()

  const pageMetadata = useMemo(() => {
    if (!supplier || !supplier?.id || id === "add")
      return { title: "Add Supplier", description: "Fill in the form to create a new supplier." }
    return { title: "Edit Supplier", description: "Edit the form to update this supplier's information." }
  }, [supplier])

  const values = useMemo(() => {
    if (supplier) return supplier

    if (id === "add" && !supplier) {
      return {
        id: "add",
        CardCode: "",
        CardName: "",
        AccountNumber: "",
        AssignedBuyer: "",
        Website: "",
        street: "",
        block: "",
        city: "",
        zipCode: "",
        county: "",
        state: "",
        country: "",
        streetNo: "",
        buildingFloorRoom: "",
        gln: "",
      }
    }

    return undefined
  }, [JSON.stringify(supplier)])

  const form = useForm({
    mode: "onChange",
    values,
    resolver: zodResolver(supplierFormSchema),
  })

  const { executeAsync, isExecuting } = useAction(upsertSupplier)

  const onSubmit = async (formData: SupplierForm) => {
    try {
      const response = await executeAsync(formData)
      const result = response?.data

      if (result?.error) {
        if (result.status === 401) {
          form.setError("CardCode", { type: "custom", message: result.message })
        }

        toast.error(result.message)
        return
      }

      toast.success(result?.message)

      if (result?.data && result?.data?.supplier && "id" in result?.data?.supplier) {
        router.refresh()

        setTimeout(() => {
          router.push(`/dashboard/admin/global-procurement/suppliers/${result.data.supplier.id}`)
        }, 1500)
      }
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong! Please try again later.")
    }
  }

  return (
    <>
      {/* <FormDebug form={form} /> */}

      <PageLayout title={pageMetadata.title} description={pageMetadata.description}>
        <Form {...form}>
          <form className='grid grid-cols-12 gap-4' onSubmit={form.handleSubmit(onSubmit)}>
            <div className='col-span-12 lg:col-span-4'>
              <InputField
                control={form.control}
                name='CardName'
                label='Name'
                extendedProps={{ inputProps: { placeholder: "Enter name" } }}
              />
            </div>

            <div className='col-span-12 lg:col-span-4'>
              <InputField
                control={form.control}
                name='CardCode'
                label='Code'
                extendedProps={{ inputProps: { placeholder: "Enter code" } }}
                isRequired
              />
            </div>

            <div className='col-span-12 lg:col-span-4'>
              <InputField
                control={form.control}
                name='AccountNumber'
                label='Account #'
                extendedProps={{ inputProps: { placeholder: "Enter account #" } }}
              />
            </div>

            <div className='col-span-12 lg:col-span-4'>
              <ComboboxField data={[]} control={form.control} name='AssignedBuyer' label='Assigned Buyer' />
            </div>

            <div className='col-span-12 lg:col-span-8'>
              <InputField
                control={form.control}
                name='Website'
                label='Website'
                extendedProps={{ inputProps: { placeholder: "Enter website" } }}
              />
            </div>

            <div className='col-span-12 mt-2 space-y-4 lg:col-span-12'>
              <Separator />

              <div>
                <h1 className='text-base font-bold'>Address Details</h1>
                <p className='text-xs text-muted-foreground'>Customer address details</p>
              </div>
            </div>

            <div className='col-span-12 lg:col-span-4'>
              <TextAreaField
                control={form.control}
                name='street'
                label='Street'
                extendedProps={{ textAreaProps: { placeholder: "Enter street" } }}
              />
            </div>

            <div className='col-span-12 lg:col-span-4'>
              <InputField
                control={form.control}
                name='streetNo'
                label='Street No.'
                extendedProps={{ inputProps: { placeholder: "Enter street no." } }}
              />
            </div>

            <div className='col-span-12 lg:col-span-4'>
              <InputField
                control={form.control}
                name='buildingFloorRoom'
                label='Building/Floor/ Room'
                extendedProps={{ inputProps: { placeholder: "Enter building/floor/room" } }}
              />
            </div>

            <div className='col-span-12 lg:col-span-4'>
              <InputField
                control={form.control}
                name='block'
                label='Block'
                extendedProps={{ inputProps: { placeholder: "Enter block" } }}
              />
            </div>

            <div className='col-span-12 lg:col-span-4'>
              <InputField control={form.control} name='city' label='City' extendedProps={{ inputProps: { placeholder: "Enter city" } }} />
            </div>

            <div className='col-span-12 lg:col-span-4'>
              <InputField
                control={form.control}
                name='zipCode'
                label='Zip Code'
                extendedProps={{ inputProps: { placeholder: "Enter zip code" } }}
              />
            </div>

            <div className='col-span-12 lg:col-span-4'>
              <InputField
                control={form.control}
                name='county'
                label='County'
                extendedProps={{ inputProps: { placeholder: "Enter county" } }}
              />
            </div>

            <div className='col-span-12 lg:col-span-4'>
              <InputField
                control={form.control}
                name='state'
                label='State'
                extendedProps={{ inputProps: { placeholder: "Enter state" } }}
              />
            </div>

            <div className='col-span-12 lg:col-span-4'>
              <InputField
                control={form.control}
                name='country'
                label='Country'
                extendedProps={{ inputProps: { placeholder: "Enter country" } }}
              />
            </div>

            <div className='col-span-12 lg:col-span-4'>
              <InputField control={form.control} name='gln' label='GLN' extendedProps={{ inputProps: { placeholder: "Enter gln" } }} />
            </div>

            <div className='col-span-12 mt-2 flex items-center justify-end gap-2'>
              <Button
                type='button'
                variant='secondary'
                disabled={isExecuting}
                onClick={() => router.push(`/dashboard/admin/global-procurement/suppliers`)}
              >
                Cancel
              </Button>
              <LoadingButton isLoading={isExecuting} type='submit'>
                Save
              </LoadingButton>
            </div>
          </form>
        </Form>
      </PageLayout>
    </>
  )
}
