"use client"

import { useParams } from "next/navigation"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { getBpMasterByCardCode } from "@/actions/master-bp"
import { useDialogStore } from "@/hooks/use-dialog"
import { format } from "date-fns"
import { useMemo } from "react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { useRouter } from "nextjs-toploader/app"
import { Form, FormControl, FormItem, FormLabel } from "@/components/ui/form"
import InputField from "@/components/form/input-field"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"
import { Input } from "@/components/ui/input"
import { ContactMasterForm, contactMasterFormSchema } from "@/schema/master-contact"
import { upsertContactMaster } from "@/actions/master-contact"

type ContactFormProps = {
  contact: NonNullable<Awaited<ReturnType<typeof getBpMasterByCardCode>>>["contacts"][number]
}

export default function ContactForm({ contact }: ContactFormProps) {
  const router = useRouter()
  const { code } = useParams() as { code: string }

  const { setIsOpen, setData } = useDialogStore(["setIsOpen", "setData"])

  const values = useMemo(() => {
    if (contact) return contact

    return {
      id: "add",
      CardCode: code,
      FirstName: "",
      LastName: "",
      Title: "",
      Position: "",
      Cellolar: "",
      E_MailL: "",
      CreateDate: format(new Date(), "yyyyMMdd"),
      UpdateDate: format(new Date(), "yyyyMMdd"),
      source: "portal",
      syncStatus: "pending",
    }
  }, [JSON.stringify(contact)])

  const form = useForm({
    mode: "onChange",
    values,
    resolver: zodResolver(contactMasterFormSchema),
  })

  const cardCode = useWatch({ control: form.control, name: "CardCode" })

  const { executeAsync, isExecuting } = useAction(upsertContactMaster)

  const handleClose = () => {
    setIsOpen(false)
    setData(null)
    form.reset()
  }

  const onSubmit = async (formData: ContactMasterForm) => {
    try {
      const response = await executeAsync(formData)
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
  }

  return (
    <>
      <Form {...form}>
        <form className='grid grid-cols-12 gap-4' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='col-span-12 md:col-span-3'>
            <FormItem className='space-y-2'>
              <FormLabel className='space-x-1'>Code</FormLabel>
              <FormControl>
                <Input disabled value={cardCode || ""} />
              </FormControl>
            </FormItem>
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='FirstName'
              label='First Name'
              extendedProps={{ inputProps: { placeholder: "Enter first name" } }}
              isRequired
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='LastName'
              label='Last Name'
              extendedProps={{ inputProps: { placeholder: "Enter last name" } }}
              isRequired
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField control={form.control} name='Title' label='Title' extendedProps={{ inputProps: { placeholder: "Enter title" } }} />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='Position'
              label='Position'
              extendedProps={{ inputProps: { placeholder: "Enter position" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='E_MailL'
              label='Email'
              extendedProps={{ inputProps: { placeholder: "Enter email" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='Cellolar'
              label='Phone'
              extendedProps={{ inputProps: { placeholder: "Enter phone" } }}
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
    </>
  )
}
