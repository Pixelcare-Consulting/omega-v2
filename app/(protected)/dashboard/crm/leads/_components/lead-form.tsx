"use client"

import { useEffect, useMemo } from "react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "nextjs-toploader/app"
import { useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { getLeadById, upsertLead } from "@/actions/lead"
import { LEAD_STATUSES_OPTIONS, leadFormSchema, type LeadForm } from "@/schema/lead"
import InputField from "@/components/form/input-field"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"
import { cn } from "@/lib/utils"
import { ComboboxField } from "@/components/form/combobox-field"
import { Separator } from "@/components/ui/separator"
import TextAreaField from "@/components/form/textarea-field"
import { getAccounts } from "@/actions/account"
import { getContacts } from "@/actions/contacts"
import MultiSelectField from "@/components/form/multi-select-field"
import { useDialogStore } from "@/hooks/use-dialog"
import { FormDebug } from "@/components/form/form-debug"
import { getStatesClient } from "@/actions/master-bp"

type LeadFormProps = {
  isModal?: boolean
  lead?: Awaited<ReturnType<typeof getLeadById>>
  accounts: Awaited<ReturnType<typeof getAccounts>>
  contacts: Awaited<ReturnType<typeof getContacts>>
  accountId?: string
  countries?: any
}

export default function LeadForm({ isModal, lead, accounts, contacts, accountId, countries }: LeadFormProps) {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const { setIsOpen } = useDialogStore(["setIsOpen"])

  const isCreate = id === "add" || !lead

  const accountsOptions = useMemo(() => {
    if (!accounts) return []
    return accounts.map((account) => ({ label: account.name, value: account.id }))
  }, [JSON.stringify(accounts)])

  const contactsOptions = useMemo(() => {
    if (!contacts) return []
    return contacts.map((contact) => ({ label: contact.name, value: contact.id }))
  }, [JSON.stringify(contacts)])

  const values = useMemo(() => {
    if (lead) return lead

    if (id === "add" || !lead) {
      return {
        id: "add",
        name: "",
        email: "",
        phone: "",
        title: "",
        status: "new-lead",
        accountId: null,
        relatedContacts: [],
        street1: "",
        street2: "",
        street3: "",
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
  }, [JSON.stringify(lead)])

  const form = useForm<LeadForm>({
    mode: "onChange",
    values,
    resolver: zodResolver(leadFormSchema),
  })

  const { executeAsync, isExecuting } = useAction(upsertLead)

  const {
    execute: getStatesExecute,
    isExecuting: isStatesLoading,
    result: { data: states },
  } = useAction(getStatesClient)

  const onSubmit = async (formData: LeadForm) => {
    try {
      const response = await executeAsync(formData)
      const result = response?.data

      if (result?.error) {
        toast.error(result.message)
        return
      }

      toast.success(result?.message)

      if (result?.data && result?.data?.lead && "id" in result?.data?.lead) {
        if (isModal) {
          setIsOpen(false)

          setTimeout(() => {
            router.refresh()
          }, 1500)
          return
        }

        router.refresh()

        setTimeout(() => {
          router.push(`/dashboard/crm/leads/${result.data.lead.id}`)
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

    router.push(`/dashboard/crm/leads`)
  }

  const countriesOptions = useMemo(() => {
    if (!countries) return []
    return countries.map((country: any) => ({ label: country.Name, value: country.Code }))
  }, [JSON.stringify(countries)])

  const statesOptions = useMemo(() => {
    const result = states?.value || []

    if (result.length < 1 || isStatesLoading) return []
    return result.map((state: any) => ({ label: state.Name, value: state.Code }))
  }, [JSON.stringify(states), isStatesLoading])

  //* set relatedContacts if data lead exist
  useEffect(() => {
    if (lead && contactsOptions.length > 0) {
      const relatedContacts = lead?.contacts?.map((c) => c.contactId) || []
      form.setValue("relatedContacts", relatedContacts)
    }
  }, [JSON.stringify(lead), JSON.stringify(contactsOptions)])

  //* set account if accountId exist
  useEffect(() => {
    if (accountId && accountsOptions.length > 0) {
      const currentAccountId = form.getValues("accountId")

      if (currentAccountId && currentAccountId === accountId) return
      form.setValue("accountId", accountId)
    }
  }, [accountId, JSON.stringify(accountsOptions)])

  //* set state if lead data is exist
  useEffect(() => {
    if (lead) {
      if (lead.country) {
        //* trigger fetching state
        getStatesExecute({ countryCode: lead.country })
      }
    }
  }, [JSON.stringify(lead)])

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
              isRequired
              extendedProps={{ inputProps: { placeholder: "Enter name" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='email'
              label='Email'
              isRequired
              extendedProps={{ inputProps: { placeholder: "Enter email" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='phone'
              label='Phone'
              isRequired
              extendedProps={{ inputProps: { placeholder: "Enter phone" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField
              data={LEAD_STATUSES_OPTIONS}
              control={form.control}
              name='status'
              label='Status'
              isRequired
              extendedProps={{ buttonProps: { disabled: isCreate } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField control={form.control} name='title' label='Title' extendedProps={{ inputProps: { placeholder: "Enter title" } }} />
          </div>

          <div className='col-span-12 mt-2 space-y-4 lg:col-span-12'>
            <Separator />

            <div>
              <h1 className='text-base font-bold'>Connections</h1>
              <p className='text-xs text-muted-foreground'>Contact related records</p>
            </div>
          </div>

          <div className='col-span-12 lg:col-span-6'>
            <ComboboxField data={accountsOptions} control={form.control} name='accountId' label='Related Account' />
          </div>

          <div className='col-span-12 lg:col-span-6'>
            <MultiSelectField data={contactsOptions} control={form.control} name='relatedContacts' label='Related Contacts' />
          </div>

          <div className={cn("col-span-12 mt-2 space-y-4", isCreate && "lg:col-span-12")}>
            <Separator />

            <div>
              <h1 className='text-base font-bold'>Address Details</h1>
              <p className='text-xs text-muted-foreground'>Lead address details</p>
            </div>
          </div>

          <div className='col-span-12'>
            <TextAreaField
              control={form.control}
              name='street1'
              label='Street'
              extendedProps={{ textAreaProps: { placeholder: "Enter street 1" } }}
            />
          </div>

          <div className='col-span-12'>
            <TextAreaField
              control={form.control}
              name='street2'
              label='Street'
              extendedProps={{ textAreaProps: { placeholder: "Enter street 2" } }}
            />
          </div>

          <div className='col-span-12'>
            <TextAreaField
              control={form.control}
              name='street3'
              label='Street'
              extendedProps={{ textAreaProps: { placeholder: "Enter street 3" } }}
            />
          </div>

          <div className='col-span-12 lg:col-span-3'>
            <InputField
              control={form.control}
              name='streetNo'
              label='Street No.'
              extendedProps={{ inputProps: { placeholder: "Enter street no." } }}
            />
          </div>

          <div className='col-span-12 lg:col-span-3'>
            <InputField
              control={form.control}
              name='buildingFloorRoom'
              label='Building/Floor/ Room'
              extendedProps={{ inputProps: { placeholder: "Enter building/floor/room" } }}
            />
          </div>

          <div className='col-span-12 lg:col-span-3'>
            <InputField control={form.control} name='block' label='Block' extendedProps={{ inputProps: { placeholder: "Enter block" } }} />
          </div>

          <div className='col-span-12 lg:col-span-3'>
            <InputField control={form.control} name='city' label='City' extendedProps={{ inputProps: { placeholder: "Enter city" } }} />
          </div>

          <div className='col-span-12 lg:col-span-3'>
            <InputField
              control={form.control}
              name='zipCode'
              label='Zip Code'
              extendedProps={{ inputProps: { placeholder: "Enter zip code" } }}
            />
          </div>

          <div className='col-span-12 lg:col-span-3'>
            <InputField
              control={form.control}
              name='county'
              label='County'
              extendedProps={{ inputProps: { placeholder: "Enter county" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField
              data={countriesOptions}
              control={form.control}
              name='country'
              label='Country'
              callback={(args) => getStatesExecute({ countryCode: args.option.value })}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField data={statesOptions} control={form.control} name='state' label='State' />
          </div>

          <div className='col-span-12 lg:col-span-3'>
            <InputField control={form.control} name='gln' label='GLN' extendedProps={{ inputProps: { placeholder: "Enter gln" } }} />
          </div>

          <div className='col-span-12 mt-2 flex items-center justify-end gap-2'>
            <Button type='button' variant='secondary' onClick={handleCancel}>
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
