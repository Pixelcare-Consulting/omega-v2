"use client"

import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useParams } from "next/navigation"
import { useRouter } from "nextjs-toploader/app"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"

import { getProductCommodityByCode, upsertProductCommodity } from "@/actions/product-commodity"
import { type ProductCommodityForm, productCommodityFormSchema } from "@/schema/product-commodity"
import { Form } from "@/components/ui/form"
import InputField from "@/components/form/input-field"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"

type ProductCommodityFormProps = {
  productCommodity?: Awaited<ReturnType<typeof getProductCommodityByCode>>
}

export default function ProductCommodityForm({ productCommodity }: ProductCommodityFormProps) {
  const router = useRouter()
  const { code } = useParams() as { code: string }

  const values = useMemo(() => {
    if (productCommodity) return productCommodity

    if (code === "add" || !productCommodity) {
      return {
        id: "add",
        name: "",
      }
    }

    return undefined
  }, [JSON.stringify(productCommodity)])

  const form = useForm({
    mode: "onChange",
    values,
    resolver: zodResolver(productCommodityFormSchema),
  })

  const { executeAsync, isExecuting } = useAction(upsertProductCommodity)

  const onSubmit = async (formData: ProductCommodityForm) => {
    try {
      const response = await executeAsync(formData)
      const result = response?.data

      if (result?.error) {
        toast.error(result.message)
        return
      }

      toast.success(result?.message)

      if (result?.data && result?.data?.productCommodity && "code" in result?.data?.productCommodity) {
        router.refresh()

        setTimeout(() => {
          router.push(`/dashboard/crm/product-commodities/${result.data.productCommodity.code}`)
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

        <div className='col-span-12 mt-2 flex items-center justify-end gap-2'>
          <Button
            type='button'
            variant='secondary'
            disabled={isExecuting}
            onClick={() => router.push(`/dashboard/crm/product-commodities`)}
          >
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
