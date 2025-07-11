"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "nextjs-toploader/app"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"

import { type CustomerForm, customerFormSchema } from "@/schema/customer"
import { PageLayout } from "@/app/(protected)/_components/page-layout"
import { Form } from "@/components/ui/form"
import InputField from "@/components/form/input-field"
import { ComboboxField } from "@/components/form/combobox-field"
import TextAreaField from "@/components/form/textarea-field"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"
import { getCustomerById, upsertCustomer } from "@/actions/customer"
import { FormDebug } from "@/components/form/form-debug"

type CustomerFormProps = {
  customer?: Awaited<ReturnType<typeof getCustomerById>>
}

export default function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter()
  const { id } = useParams()

  const pageMetadata = useMemo(() => {
    if (!customer || !customer?.id || id === "add")
      return { title: "Add Customer", description: "Fill in the form to create a new customer." }
    return { title: "Edit Customer", description: "Edit the form to update this customer's information." }
  }, [customer])

  const values = useMemo(() => {
    if (customer) return customer

    if (id === "add" && !customer) {
      return {
        id: "add",
        CardCode: "",
        CardName: "",
        CardType: "C",
        GroupCode: "",
        MailAddress: "",
        MailZipCode: "",
        Phone1: "",
        ContactPerson: "",
        PayTermsGrpCode: "",
        Currency: "",
        U_VendorCode: "",
        U_OMEG_QBRelated: "",
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
  }, [JSON.stringify(customer)])

  const form = useForm({
    mode: "onChange",
    values,
    resolver: zodResolver(customerFormSchema),
  })

  const { executeAsync, isExecuting } = useAction(upsertCustomer)

  const onSubmit = async (formData: CustomerForm) => {
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

      if (result?.data && result?.data?.customer && "id" in result?.data?.customer) {
        router.refresh()

        setTimeout(() => {
          router.push(`/dashboard/global-procurement/customers/${result.data.customer.id}`)
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
                name='U_VendorCode'
                label='Vendor Code'
                extendedProps={{ inputProps: { placeholder: "Enter vendor code" } }}
              />
            </div>

            <div className='col-span-12 lg:col-span-4'>
              <ComboboxField data={[]} control={form.control} name='GroupCode' label='Group' />
            </div>

            <div className='col-span-12 lg:col-span-4'>
              <ComboboxField data={[]} control={form.control} name='U_OMEG_QBRelated' label='Omega QB Related' />
            </div>

            <div className='col-span-12 grid grid-cols-12 gap-4'>
              <div className='col-span-4'>
                <TextAreaField
                  control={form.control}
                  name='MailAddress'
                  label='Mail Address'
                  extendedProps={{ textAreaProps: { placeholder: "Enter mail address" } }}
                />
              </div>

              <div className='col-span-12 lg:col-span-4'>
                <InputField
                  control={form.control}
                  name='MailZipCode'
                  label='Mail Zip Code'
                  extendedProps={{ inputProps: { placeholder: "Enter mail zip code" } }}
                />
              </div>

              <div className='col-span-12 lg:col-span-4'>
                <InputField
                  control={form.control}
                  name='Phone1'
                  label='Phone'
                  extendedProps={{ inputProps: { placeholder: "Enter phone" } }}
                />
              </div>

              <div className='col-span-12 lg:col-span-4'>
                <InputField
                  control={form.control}
                  name='ContactPerson'
                  label='Contact Person'
                  extendedProps={{ inputProps: { placeholder: "Enter contact person" } }}
                />
              </div>

              <div className='col-span-12 lg:col-span-4'>
                <ComboboxField data={[]} control={form.control} name='PayTermsGrpCode' label='Payment Terms' />
              </div>

              <div className='col-span-12 lg:col-span-4'>
                <InputField
                  control={form.control}
                  name='Currency'
                  label='Currency'
                  extendedProps={{ inputProps: { placeholder: "Enter currency" } }}
                />
              </div>
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
                onClick={() => router.push(`/dashboard/global-procurement/customers`)}
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
