"use client"

import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useParams } from "next/navigation"
import { useRouter } from "nextjs-toploader/app"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"

import { getAccountById, upsertAccount } from "@/actions/account"
import { type AccountForm, accountFormSchema, ACCOUNT_INDUSTRY_OPTIONS } from "@/schema/account"
import { toast } from "sonner"
import { FormDebug } from "@/components/form/form-debug"
import { Form } from "@/components/ui/form"
import InputField from "@/components/form/input-field"
import { Card } from "@/components/ui/card"
import MultiSelectField from "@/components/form/multi-select-field"
import SwitchField from "@/components/form/switch-field"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"

type AccountFormProps = {
  account?: Awaited<ReturnType<typeof getAccountById>>
}

export default function AccountForm({ account }: AccountFormProps) {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const isCreate = id === "add" || !account

  const values = useMemo(() => {
    if (account) return account

    if (id === "add" || !account) {
      return {
        id: "add",
        name: "",
        email: "",
        phone: "",
        website: "",
        industry: [],
        isActive: true,
        street: "",
        streetNo: "",
        buildingFloorRoom: "",
        block: "",
        city: "",
        zipCode: "",
        county: "",
        state: "",
        country: "",
        gln: "",
      }
    }

    return undefined
  }, [id, JSON.stringify(account)])

  const form = useForm<AccountForm>({
    mode: "onChange",
    values,
    resolver: zodResolver(accountFormSchema),
  })

  const { executeAsync, isExecuting } = useAction(upsertAccount)

  const onSubmit = async (formData: AccountForm) => {
    try {
      const response = await executeAsync(formData)
      const result = response?.data

      if (result?.error) {
        toast.error(result.message)
        return
      }

      toast.success(result?.message)

      if (result?.data && result?.data?.account && "id" in result?.data?.account) {
        router.refresh()

        setTimeout(() => {
          router.push(`/dashboard/crm/accounts/${result.data.account.id}`)
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

      <Form {...form}>
        <form className='grid grid-cols-12 gap-4' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='name'
              label='Name'
              extendedProps={{ inputProps: { placeholder: "Enter name" } }}
              isRequired
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField control={form.control} name='email' label='Email' extendedProps={{ inputProps: { placeholder: "Enter name" } }} />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField control={form.control} name='phone' label='Phone' extendedProps={{ inputProps: { placeholder: "Enter name" } }} />
          </div>

          <div className='col-span-12 md:col-span-4 md:mt-5 lg:col-span-3'>
            <SwitchField
              control={form.control}
              layout='default'
              name='isActive'
              label='Active'
              description='Is this account active?'
              extendedProps={{ switchProps: { disabled: isCreate } }}
            />
          </div>

          <div className='col-span-12 lg:col-span-6'>
            <InputField
              control={form.control}
              name='website'
              label='Website'
              extendedProps={{ inputProps: { placeholder: "Enter name" } }}
            />
          </div>

          <div className='col-span-12 lg:col-span-6'>
            <MultiSelectField data={ACCOUNT_INDUSTRY_OPTIONS} control={form.control} name='industry' label='Industry' isRequired />
          </div>

          <div className='col-span-12 mt-2 space-y-4 lg:col-span-12'>
            <Separator />

            <div>
              <h1 className='text-base font-bold'>Address</h1>
              <p className='text-xs text-muted-foreground'>Account address details</p>
            </div>
          </div>

          <div className='col-span-12 lg:col-span-12'>
            <InputField
              control={form.control}
              name='street'
              label='Street'
              extendedProps={{ inputProps: { placeholder: "Enter street address 3" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='streetNo'
              label='Street No.'
              extendedProps={{ inputProps: { placeholder: "Enter street" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='buildingFloorRoom'
              label='Building/Floor/ Room'
              extendedProps={{ inputProps: { placeholder: "Enter building/floor/room" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField control={form.control} name='block' label='Block' extendedProps={{ inputProps: { placeholder: "Enter block" } }} />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField control={form.control} name='city' label='City' extendedProps={{ inputProps: { placeholder: "Enter city" } }} />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='zipCode'
              label='Zip Code'
              extendedProps={{ inputProps: { placeholder: "Enter zip code" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='county'
              label='County'
              extendedProps={{ inputProps: { placeholder: "Enter county" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField control={form.control} name='state' label='State' extendedProps={{ inputProps: { placeholder: "Enter state" } }} />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='country'
              label='Country'
              extendedProps={{ inputProps: { placeholder: "Enter country" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField control={form.control} name='gln' label='GLN' extendedProps={{ inputProps: { placeholder: "Enter gln" } }} />
          </div>

          <div className='col-span-12 mt-2 flex items-center justify-end gap-2'>
            <Button type='button' variant='secondary' disabled={isExecuting} onClick={() => router.push(`/dashboard/crm/accounts`)}>
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
