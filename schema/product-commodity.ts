import { z } from "zod"

//* Zod Schema
export const productCommodityFormSchema = z.object({
  id: z.string().min(1, { message: "ID is required" }),
  name: z.string().min(1, { message: "Name is required" }),
})

//* Type
export type ProductCommodityForm = z.infer<typeof productCommodityFormSchema>
