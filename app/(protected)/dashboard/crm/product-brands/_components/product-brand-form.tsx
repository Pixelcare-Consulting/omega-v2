"use client"

import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useParams } from "next/navigation"
import { useRouter } from "nextjs-toploader/app"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"

import { getProductBrandByCode, upsertProductBrand } from "@/actions/product-brand"
import { type ProductBrandForm, productBrandFormSchema } from "@/schema/product-brand"
import { Form } from "@/components/ui/form"
import InputField from "@/components/form/input-field"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"

type ProductBrandFormProps = {
  productBrand?: Awaited<ReturnType<typeof getProductBrandByCode>>
}

export default function ProductBrandForm({ productBrand }: ProductBrandFormProps) {
  const router = useRouter()
  const { code } = useParams() as { code: string }

  const values = useMemo(() => {
    if (productBrand) return productBrand

    if (code === "add" || !productBrand) {
      return {
        id: "add",
        name: "",
        alias: "",
        sourcingHints: "",
      }
    }

    return undefined
  }, [JSON.stringify(productBrand)])

  const form = useForm({
    mode: "onChange",
    values,
    resolver: zodResolver(productBrandFormSchema),
  })

  const { executeAsync, isExecuting } = useAction(upsertProductBrand)

  const onSubmit = async (formData: ProductBrandForm) => {
    try {
      const response = await executeAsync(formData)
      const result = response?.data

      if (result?.error) {
        toast.error(result.message)
        return
      }

      toast.success(result?.message)

      if (result?.data && result?.data?.productBrand && "code" in result?.data?.productBrand) {
        router.refresh()

        setTimeout(() => {
          router.push(`/dashboard/crm/product-brands/${result.data.productBrand.code}`)
        }, 1500)
      }
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong! Please try again later.")
    }
  }

  return (
    <Form {...form}>
      <form className='grid grid-cols-12 gap-4' onSubmit={form.handleSubmit(onSubmit)}>
        <div className='col-span-12 md:col-span-6 lg:col-span-4'>
          <InputField
            control={form.control}
            name='name'
            label='Name'
            extendedProps={{ inputProps: { placeholder: "Enter name" } }}
            isRequired
          />
        </div>

        <div className='col-span-12 md:col-span-6 lg:col-span-4'>
          <InputField
            control={form.control}
            name='alias'
            label='Alias'
            extendedProps={{ inputProps: { placeholder: "Enter alias" } }}
            isRequired
          />
        </div>

        <div className='col-span-12 md:col-span-6 lg:col-span-4'>
          <InputField
            control={form.control}
            name='sourcingHints'
            label='Sourcing Hints'
            extendedProps={{ inputProps: { placeholder: "Enter sourcing hints" } }}
          />
        </div>

        <div className='col-span-12 mt-2 flex items-center justify-end gap-2'>
          <Button type='button' variant='secondary' disabled={isExecuting} onClick={() => router.push(`/dashboard/crm/product-brands`)}>
            Cancel
          </Button>
          <LoadingButton isLoading={isExecuting} type='submit'>
            Save
          </LoadingButton>
        </div>
      </form>
    </Form>
  )
}
