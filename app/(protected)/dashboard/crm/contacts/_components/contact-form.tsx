"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { useParams } from "next/navigation"
import { useRouter } from "nextjs-toploader/app"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { getContactById, upsertContact } from "@/actions/contacts"
import { type ContactForm, contactFormSchema } from "@/schema/contact"
import { Form } from "@/components/ui/form"
import InputField from "@/components/form/input-field"
import SwitchField from "@/components/form/switch-field"
import { Separator } from "@/components/ui/separator"
import { getAccounts } from "@/actions/account"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"
import MultiSelectField from "@/components/form/multi-select-field"
import { useDialogStore } from "@/hooks/use-dialog"
import { getLeads } from "@/actions/lead"

type ContactFormProps = {
  isModal?: boolean
  contact?: Awaited<ReturnType<typeof getContactById>>
  accountId?: string
  accounts: Awaited<ReturnType<typeof getAccounts>>
  leadId?: string
  leads: Awaited<ReturnType<typeof getLeads>>
}

export default function ContactForm({ isModal, contact, accountId, accounts, leadId, leads }: ContactFormProps) {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const { setIsOpen } = useDialogStore(["setIsOpen"])

  const isCreate = id === "add" || !contact

  const accountsOptions = useMemo(() => {
    if (!accounts) return []
    return accounts.map((account) => ({ label: account.name, value: account.id }))
  }, [JSON.stringify(accounts)])

  const leadsOptions = useMemo(() => {
    if (!leads) return []
    return leads.map((lead) => ({ label: lead.name, value: lead.id }))
  }, [JSON.stringify(leads)])

  const values = useMemo(() => {
    if (contact) return contact

    if (id === "add" || !contact) {
      return {
        id: "add",
        name: "",
        email: "",
        phone: "",
        title: null,
        isActive: true,
        relatedAccounts: [],
        relatedLeads: [],
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
  }, [JSON.stringify(contact)])

  const form = useForm<ContactForm>({
    mode: "onChange",
    values,
    resolver: zodResolver(contactFormSchema),
  })

  const { executeAsync, isExecuting } = useAction(upsertContact)

  const onSubmit = async (formData: ContactForm) => {
    try {
      const response = await executeAsync(formData)
      const result = response?.data

      if (result?.error) {
        toast.error(result.message)
        return
      }

      toast.success(result?.message)

      if (result?.data && result?.data?.contact && "id" in result?.data?.contact) {
        if (isModal) {
          setIsOpen(false)

          setTimeout(() => {
            router.refresh()
          }, 1500)
          return
        }

        router.refresh()

        setTimeout(() => {
          router.push(`/dashboard/crm/contacts/${result.data.contact.id}`)
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

    router.push(`/dashboard/crm/accounts`)
  }

  //* set relatedAccounts if data contact exist
  useEffect(() => {
    if (contact && accountsOptions.length > 0) {
      const relatedAccounts = contact?.accountContacts?.map((c) => c.accountId) || []
      form.setValue("relatedAccounts", relatedAccounts)
    }
  }, [JSON.stringify(contact), JSON.stringify(accountsOptions)])

  //* set relatedLeads if data contact exist
  useEffect(() => {
    if (contact && leadsOptions.length > 0) {
      const relatedLeads = contact?.leadContacts?.map((l) => l.leadId) || []
      form.setValue("relatedLeads", relatedLeads)
    }
  }, [JSON.stringify(contact), JSON.stringify(leadsOptions)])

  //* insert related account if accountId exist
  useEffect(() => {
    if (accountId && accountsOptions.length > 0) {
      const currentRelatedAccounts = form.getValues("relatedAccounts") || []

      if (currentRelatedAccounts.includes(accountId)) return
      form.setValue("relatedAccounts", [...currentRelatedAccounts, accountId])
    }
  }, [accountId, JSON.stringify(accountsOptions)])

  //* insert related lead if leadId exist
  useEffect(() => {
    if (leadId && leadsOptions.length > 0) {
      const currentRelatedLeads = form.getValues("relatedLeads") || []

      if (currentRelatedLeads.includes(leadId)) return
      form.setValue("relatedLeads", [...currentRelatedLeads, leadId])
    }
  }, [leadId, JSON.stringify(leadsOptions)])

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
            <InputField
              control={form.control}
              name='email'
              label='Email'
              extendedProps={{ inputProps: { placeholder: "Enter name" } }}
              isRequired
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='phone'
              label='Phone'
              extendedProps={{ inputProps: { placeholder: "Enter name" } }}
              isRequired
            />
          </div>

          <div className='col-span-12 md:col-span-4 md:mt-5 lg:col-span-3'>
            <SwitchField
              control={form.control}
              layout='default'
              name='isActive'
              label='Active'
              description='Is this contact active?'
              extendedProps={{ switchProps: { disabled: isCreate } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField control={form.control} name='title' label='Title' extendedProps={{ inputProps: { placeholder: "Enter name" } }} />
          </div>

          <div className='col-span-12 mt-2 space-y-4 lg:col-span-12'>
            <Separator />

            <div>
              <h1 className='text-base font-bold'>Connections</h1>
              <p className='text-xs text-muted-foreground'>Contact related records</p>
            </div>
          </div>

          <div className='col-span-12'>
            <MultiSelectField data={accountsOptions} control={form.control} name='relatedAccounts' label='Accounts' />
          </div>

          <div className='col-span-12'>
            <MultiSelectField data={leadsOptions} control={form.control} name='relatedLeads' label='Leads' />
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
