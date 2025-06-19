"use client"

import { useEffect, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "nextjs-toploader/app"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import { useParams } from "next/navigation"

import { CONTACT_PRIORITIES_OPTIONS, CONTACT_TYPES_OPTIONS, type ContactForm, contactFormSchema, INDUSTRY_OPTIONS } from "@/schema/contact"
import { getLeads } from "@/actions/lead"
import { Form } from "@/components/ui/form"
import { PageLayout } from "@/app/(protected)/_components/page-layout"
import { FormDebug } from "@/components/form/form-debug"
import InputField from "@/components/form/input-field"
import { Separator } from "@/components/ui/separator"
import { ComboboxField } from "@/components/form/combobox-field"
import MultiSelectField from "@/components/form/multi-select-field"
import TextAreaField from "@/components/form/textarea-field"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"
import { getContactById, upsertContact } from "@/actions/contacts"
import SwitchField from "@/components/form/switch-field"

type ContactFormProps = {
  contact?: Awaited<ReturnType<typeof getContactById>>
  leads: Awaited<ReturnType<typeof getLeads>>
}

export default function ContactForm({ contact, leads }: ContactFormProps) {
  const router = useRouter()
  const { id } = useParams()

  const pageMetadata = useMemo(() => {
    if (!contact || !contact?.id || id === "add") return { title: "Add Contact", description: "Fill in the form to create a new contact." }
    return { title: "Edit Contact", description: "Edit the form to update this contacts's information." }
  }, [contact])

  const relatedRecordOptions = useMemo(() => {
    const leadOptions = leads.map((lead) => ({ ...lead, label: lead.name, value: lead.id, contactType: "lead" }))

    return [...leadOptions]
  }, [])

  const values = useMemo(() => {
    if (contact) return contact

    if (id === "add" && !contact) {
      return {
        id: "add",
        name: "",
        email: "",
        phone: "",
        isActive: true,
        contactId: "",
        title: "",
        company: "",
        type: "lead",
        priority: "low",
        comments: "",
        industry: [],
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

  const contactId = useWatch({ control: form.control, name: "contactId" })

  const onSubmit = async (formData: ContactForm) => {
    try {
      const response = await executeAsync(formData)
      const result = response?.data

      if (result?.error) {
        if (result.status === 401) {
          form.setError("contactId", { type: "custom", message: result.message })
        }

        toast.error(result.message)
        return
      }

      toast.success(result?.message)

      if (result?.data && result?.data?.contact && "id" in result?.data?.contact) {
        router.refresh()

        setTimeout(() => {
          router.push(`/dashboard/admin/crm/contacts/${result.data.contact.id}`)
        }, 1500)
      }
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong! Please try again later.")
    }
  }

  useEffect(() => {
    if (contactId && relatedRecordOptions.length > 0 && (id === "add" || contact?.contactId !== contactId)) {
      const relatedRecord = relatedRecordOptions.find((option) => option.value === contactId)
      const type = relatedRecord?.contactType

      if (type) {
        form.setValue("name", relatedRecord.name)
        form.setValue("email", relatedRecord.email)
        form.setValue("phone", relatedRecord.phone)
        form.setValue("title", relatedRecord.title)
        form.setValue("company", relatedRecord.company)
        form.setValue("type", type)
      }
    }
  }, [contactId, JSON.stringify(relatedRecordOptions)])

  return (
    <>
      {/* <FormDebug form={form} /> */}

      <PageLayout title={pageMetadata.title} description={pageMetadata.description}>
        <Form {...form}>
          <form className='grid grid-cols-12 gap-4' onSubmit={form.handleSubmit(onSubmit)}>
            <div className='col-span-12 grid grid-cols-12 gap-4'>
              <div className='col-span-12 grid grid-cols-12 gap-4'>
                <div className='col-span-12 gap-4 lg:col-span-4'>
                  <ComboboxField data={relatedRecordOptions} control={form.control} name='contactId' label='Contact Person' isRequired />
                </div>

                <div className='col-span-12 gap-4 lg:col-span-4'>
                  <ComboboxField
                    data={CONTACT_TYPES_OPTIONS}
                    control={form.control}
                    name='type'
                    label='Contact Type'
                    isRequired
                    extendedProps={{ buttonProps: { disabled: true } }}
                  />
                </div>
                <div className='col-span-12 mt-5 gap-4 lg:col-span-4'>
                  <SwitchField
                    control={form.control}
                    layout='default'
                    name='isActive'
                    label='Active'
                    description='Is this contact person active?'
                  />
                </div>
              </div>

              <div className='col-span-12 mt-2 space-y-4'>
                <Separator />
              </div>

              <div className='col-span-12 md:col-span-4 lg:col-span-3'>
                <InputField
                  control={form.control}
                  name='name'
                  label='Name'
                  isRequired
                  extendedProps={{ inputProps: { placeholder: "Enter name" } }}
                />
              </div>

              <div className='col-span-12 md:col-span-4 lg:col-span-3'>
                <InputField
                  control={form.control}
                  name='email'
                  label='Email'
                  isRequired
                  extendedProps={{ inputProps: { placeholder: "Enter email" } }}
                />
              </div>

              <div className='col-span-12 md:col-span-4 lg:col-span-3'>
                <InputField
                  control={form.control}
                  name='phone'
                  label='Phone'
                  isRequired
                  extendedProps={{ inputProps: { placeholder: "Enter phone" } }}
                />
              </div>

              <div className='col-span-12 md:col-span-4 lg:col-span-3'>
                <InputField
                  control={form.control}
                  name='title'
                  label='Title'
                  extendedProps={{ inputProps: { placeholder: "Enter title" } }}
                />
              </div>

              <div className='col-span-12 md:col-span-4 lg:col-span-3'>
                <InputField
                  control={form.control}
                  name='company'
                  label='Company'
                  extendedProps={{ inputProps: { placeholder: "Enter company" } }}
                />
              </div>

              <div className='col-span-12 lg:col-span-3'>
                <ComboboxField data={CONTACT_PRIORITIES_OPTIONS} control={form.control} name='priority' label='Priority' isRequired />
              </div>

              <div className='col-span-12 lg:col-span-6'>
                <MultiSelectField data={INDUSTRY_OPTIONS} control={form.control} name='industry' label='Industry' isRequired />
              </div>

              <div className='col-span-12'>
                <TextAreaField control={form.control} name='comments' label='Comments' />
              </div>
            </div>

            <div className='col-span-12 mt-2 flex items-center justify-end gap-2'>
              <Button type='button' variant='secondary' onClick={() => router.push(`/dashboard/admin/crm/contacts`)}>
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
