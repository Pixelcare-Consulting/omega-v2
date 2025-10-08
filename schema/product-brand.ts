import { z } from "zod"

//* Zod Schema
export const productBrandFormSchema = z.object({
  id: z.string().min(1, { message: "ID is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  alias: z.string().min(1, { message: "Alias is required" }),
  sourcingHints: z.string().nullish(),
})

//* Type
export type ProductBrandForm = z.infer<typeof productBrandFormSchema>
